'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const { db, dataDir, generateUniqueUserCode, directKey } = require('./db');
const { translateMessage } = require('./translate');

const PORT = Number(process.env.PORT || 3000);
const MAX_GROUP_MEMBERS = 64;

// JWT-Secret: aus der Umgebung, sonst einmalig erzeugen und lokal ablegen.
const secretFile = path.join(dataDir, '.jwt-secret');
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (!fs.existsSync(secretFile)) {
    fs.writeFileSync(secretFile, crypto.randomBytes(48).toString('hex'), { mode: 0o600 });
  }
  JWT_SECRET = fs.readFileSync(secretFile, 'utf8').trim();
}

const SUPPORTED_LANGUAGES = [
  'ar', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'hi', 'hu', 'id',
  'it', 'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sv', 'th', 'tr',
  'uk', 'vi', 'zh',
];

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------------------------------------------------------------- Statements

const stmt = {
  insertUser: db.prepare(
    'INSERT INTO users (username, password_hash, display_name, language, user_code, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ),
  userByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  userById: db.prepare('SELECT * FROM users WHERE id = ?'),
  userByCode: db.prepare('SELECT * FROM users WHERE user_code = ?'),
  updateProfile: db.prepare('UPDATE users SET display_name = ?, language = ? WHERE id = ?'),

  conversationById: db.prepare('SELECT * FROM conversations WHERE id = ?'),
  conversationByDirectKey: db.prepare('SELECT * FROM conversations WHERE direct_key = ?'),
  insertDirect: db.prepare(
    "INSERT INTO conversations (type, direct_key, created_at) VALUES ('direct', ?, ?)"
  ),
  insertGroup: db.prepare(
    "INSERT INTO conversations (type, name, owner_id, created_at) VALUES ('group', ?, ?, ?)"
  ),
  renameGroup: db.prepare('UPDATE conversations SET name = ? WHERE id = ?'),

  members: db.prepare(
    `SELECT m.*, u.username, u.display_name, u.language, u.user_code
     FROM conversation_members m JOIN users u ON u.id = m.user_id
     WHERE m.conversation_id = ? ORDER BY m.joined_at`
  ),
  membership: db.prepare(
    'SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?'
  ),
  insertMember: db.prepare(
    'INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, joined_at) VALUES (?, ?, ?)'
  ),
  removeMember: db.prepare(
    'DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?'
  ),
  memberCount: db.prepare(
    'SELECT COUNT(*) AS n FROM conversation_members WHERE conversation_id = ?'
  ),
  conversationsOf: db.prepare(
    `SELECT c.* FROM conversations c
     JOIN conversation_members m ON m.conversation_id = c.id
     WHERE m.user_id = ?`
  ),

  insertMessage: db.prepare(
    'INSERT INTO messages (conversation_id, sender_id, text, lang, created_at) VALUES (?, ?, ?, ?, ?)'
  ),
  messageById: db.prepare('SELECT * FROM messages WHERE id = ?'),
  lastMessage: db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1'
  ),
  history: db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?'
  ),
  unreadCount: db.prepare(
    'SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ? AND id > ? AND sender_id != ?'
  ),
  advanceDelivered: db.prepare(
    `UPDATE conversation_members SET last_delivered_id = MAX(last_delivered_id, ?)
     WHERE conversation_id = ? AND user_id = ?`
  ),
  advanceRead: db.prepare(
    `UPDATE conversation_members
     SET last_read_id = MAX(last_read_id, ?), last_delivered_id = MAX(last_delivered_id, ?)
     WHERE conversation_id = ? AND user_id = ?`
  ),
};

// --------------------------------------------------------------------- Hilfen

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    language: user.language,
  };
}

function selfUser(user) {
  return { ...publicUser(user), userCode: user.user_code };
}

function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = stmt.userById.get(payload.sub);
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

function validLanguage(lang) {
  return SUPPORTED_LANGUAGES.includes(String(lang || '').toLowerCase());
}

function normalizeCode(raw) {
  const cleaned = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length !== 8) return null;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
}

// Status einer eigenen Nachricht: zugestellt/gelesen erst, wenn ALLE anderen
// Mitglieder so weit sind (WhatsApp-Verhalten, auch in Gruppen).
function statusBounds(members, senderId) {
  let delivered = Infinity;
  let read = Infinity;
  for (const m of members) {
    if (m.user_id === senderId) continue;
    delivered = Math.min(delivered, m.last_delivered_id);
    read = Math.min(read, m.last_read_id);
  }
  if (delivered === Infinity) delivered = 0;
  if (read === Infinity) read = 0;
  return { delivered, read };
}

// Nachricht aus Sicht eines Nutzers: eigene bleiben Original, fremde werden
// in dessen Sprache übersetzt.
async function viewMessage(msg, viewer, members) {
  const outgoing = msg.sender_id === viewer.id;
  let translation = null;
  if (!outgoing && msg.lang !== viewer.language) {
    const t = await translateMessage({
      messageId: msg.id,
      text: msg.text,
      from: msg.lang,
      to: viewer.language,
    });
    translation = { text: t.text, lang: viewer.language, translated: t.translated, failed: t.failed };
  }
  let status = null;
  if (outgoing && members) {
    const bounds = statusBounds(members, viewer.id);
    status = bounds.read >= msg.id ? 'read' : bounds.delivered >= msg.id ? 'delivered' : 'sent';
  }
  const sender = members?.find((m) => m.user_id === msg.sender_id);
  return {
    id: msg.id,
    conversationId: msg.conversation_id,
    senderId: msg.sender_id,
    senderName: sender ? sender.display_name : null,
    outgoing,
    original: { text: msg.text, lang: msg.lang },
    translation,
    status,
    createdAt: msg.created_at,
  };
}

function conversationTitle(conv, members, viewerId) {
  if (conv.type === 'group') return conv.name || 'Gruppe';
  const peer = members.find((m) => m.user_id !== viewerId);
  return peer ? peer.display_name : 'Chat';
}

async function conversationSummary(conv, viewer) {
  const members = stmt.members.all(conv.id);
  const me = members.find((m) => m.user_id === viewer.id);
  const last = stmt.lastMessage.get(conv.id);
  const peer = conv.type === 'direct' ? members.find((m) => m.user_id !== viewer.id) : null;
  return {
    id: conv.id,
    type: conv.type,
    title: conversationTitle(conv, members, viewer.id),
    members: members.map((m) => ({
      id: m.user_id,
      displayName: m.display_name,
      language: m.language,
    })),
    peerId: peer ? peer.user_id : null,
    online: peer
      ? isOnline(peer.user_id)
      : members.some((m) => m.user_id !== viewer.id && isOnline(m.user_id)),
    unread: last ? stmt.unreadCount.get(conv.id, me ? me.last_read_id : 0, viewer.id).n : 0,
    lastMessage: last ? await viewMessage(last, viewer, members) : null,
  };
}

function assertMembership(conversationId, userId) {
  const conv = stmt.conversationById.get(Number(conversationId));
  if (!conv) return null;
  if (!stmt.membership.get(conv.id, userId)) return null;
  return conv;
}

// ----------------------------------------------------------------------- API

app.get('/api/languages', (req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

app.post('/api/register', async (req, res) => {
  const { username, password, displayName, language } = req.body || {};
  const name = String(username || '').trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,24}$/.test(name)) {
    return res.status(400).json({ error: 'invalid_username' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'weak_password' });
  }
  if (!validLanguage(language)) {
    return res.status(400).json({ error: 'invalid_language' });
  }
  const display = String(displayName || '').trim().slice(0, 48) || name;
  if (stmt.userByUsername.get(name)) {
    return res.status(409).json({ error: 'username_taken' });
  }
  const hash = await bcrypt.hash(password, 10);
  const result = stmt.insertUser.run(
    name, hash, display, language.toLowerCase(), generateUniqueUserCode(), Date.now()
  );
  const user = stmt.userById.get(result.lastInsertRowid);
  res.json({ token: signToken(user), user: selfUser(user) });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = stmt.userByUsername.get(String(username || '').trim().toLowerCase());
  if (!user || !(await bcrypt.compare(String(password || ''), user.password_hash))) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  res.json({ token: signToken(user), user: selfUser(user) });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: selfUser(req.user) });
});

app.patch('/api/me', requireAuth, (req, res) => {
  const { displayName, language } = req.body || {};
  const display =
    String(displayName ?? req.user.display_name).trim().slice(0, 48) || req.user.display_name;
  const lang = language != null ? String(language).toLowerCase() : req.user.language;
  if (!validLanguage(lang)) return res.status(400).json({ error: 'invalid_language' });
  stmt.updateProfile.run(display, lang, req.user.id);
  res.json({ user: selfUser(stmt.userById.get(req.user.id)) });
});

// Kontaktaufnahme ausschließlich über die User-ID (keine öffentliche Suche).
app.post('/api/contacts/lookup', requireAuth, (req, res) => {
  const code = normalizeCode(req.body?.code);
  if (!code) return res.status(400).json({ error: 'invalid_code' });
  const user = stmt.userByCode.get(code);
  if (!user || user.id === req.user.id) return res.status(404).json({ error: 'not_found' });
  res.json({ user: publicUser(user) });
});

function resolveCodes(codes, self) {
  const users = [];
  for (const raw of Array.isArray(codes) ? codes.slice(0, MAX_GROUP_MEMBERS) : []) {
    const code = normalizeCode(raw);
    const user = code ? stmt.userByCode.get(code) : null;
    if (!user) return { error: raw };
    if (user.id !== self.id && !users.some((u) => u.id === user.id)) users.push(user);
  }
  return { users };
}

app.post('/api/conversations', requireAuth, async (req, res) => {
  const { type } = req.body || {};
  const now = Date.now();

  if (type === 'direct') {
    const code = normalizeCode(req.body?.code);
    const peer = code ? stmt.userByCode.get(code) : null;
    if (!peer || peer.id === req.user.id) return res.status(404).json({ error: 'not_found' });
    const key = directKey(req.user.id, peer.id);
    let conv = stmt.conversationByDirectKey.get(key);
    if (!conv) {
      const id = stmt.insertDirect.run(key, now).lastInsertRowid;
      stmt.insertMember.run(id, req.user.id, now);
      stmt.insertMember.run(id, peer.id, now);
      conv = stmt.conversationById.get(id);
      notifyNewConversation(conv, req.user.id);
    }
    return res.json({ conversation: await conversationSummary(conv, req.user) });
  }

  if (type === 'group') {
    const name = String(req.body?.name || '').trim().slice(0, 64);
    if (!name) return res.status(400).json({ error: 'invalid_name' });
    const { users, error } = resolveCodes(req.body?.codes, req.user);
    if (error !== undefined) return res.status(404).json({ error: 'member_not_found', code: error });
    if (users.length === 0) return res.status(400).json({ error: 'no_members' });
    const id = stmt.insertGroup.run(name, req.user.id, now).lastInsertRowid;
    stmt.insertMember.run(id, req.user.id, now);
    for (const user of users) stmt.insertMember.run(id, user.id, now);
    const conv = stmt.conversationById.get(id);
    notifyNewConversation(conv, req.user.id);
    return res.json({ conversation: await conversationSummary(conv, req.user) });
  }

  res.status(400).json({ error: 'invalid_type' });
});

app.post('/api/conversations/:id/members', requireAuth, async (req, res) => {
  const conv = assertMembership(req.params.id, req.user.id);
  if (!conv || conv.type !== 'group') return res.status(404).json({ error: 'not_found' });
  if (stmt.memberCount.get(conv.id).n >= MAX_GROUP_MEMBERS) {
    return res.status(400).json({ error: 'group_full' });
  }
  const code = normalizeCode(req.body?.code);
  const user = code ? stmt.userByCode.get(code) : null;
  if (!user) return res.status(404).json({ error: 'not_found' });
  stmt.insertMember.run(conv.id, user.id, Date.now());
  emitToUser(user.id, 'conversation:new', {});
  emitConversationChanged(conv.id);
  res.json({ conversation: await conversationSummary(conv, req.user) });
});

app.post('/api/conversations/:id/leave', requireAuth, (req, res) => {
  const conv = assertMembership(req.params.id, req.user.id);
  if (!conv || conv.type !== 'group') return res.status(404).json({ error: 'not_found' });
  stmt.removeMember.run(conv.id, req.user.id);
  emitConversationChanged(conv.id);
  broadcastStatuses(conv.id);
  res.json({ ok: true });
});

app.get('/api/chats', requireAuth, async (req, res) => {
  const conversations = stmt.conversationsOf.all(req.user.id);
  const chats = [];
  for (const conv of conversations) chats.push(await conversationSummary(conv, req.user));
  chats.sort((x, y) => (y.lastMessage?.createdAt || 0) - (x.lastMessage?.createdAt || 0));
  res.json({ chats });
});

app.get('/api/conversations/:id/messages', requireAuth, async (req, res) => {
  const conv = assertMembership(req.params.id, req.user.id);
  if (!conv) return res.status(404).json({ error: 'not_found' });
  const limit = Math.min(Number(req.query.limit) || 60, 200);
  const members = stmt.members.all(conv.id);
  const rows = stmt.history.all(conv.id, limit).reverse();
  const messages = [];
  for (const row of rows) messages.push(await viewMessage(row, req.user, members));
  res.json({ conversation: await conversationSummary(conv, req.user), messages });
});

app.get('/health', (req, res) => res.json({ ok: true }));

// ------------------------------------------------------------------ Realtime

const onlineSockets = new Map(); // userId -> Set<socketId>

function isOnline(userId) {
  return onlineSockets.has(userId);
}

function emitToUser(userId, event, payload) {
  const sockets = onlineSockets.get(userId);
  if (!sockets) return;
  for (const socketId of sockets) io.to(socketId).emit(event, payload);
}

function notifyNewConversation(conv, exceptUserId) {
  for (const m of stmt.members.all(conv.id)) {
    if (m.user_id !== exceptUserId) emitToUser(m.user_id, 'conversation:new', {});
  }
}

function emitConversationChanged(conversationId) {
  for (const m of stmt.members.all(conversationId)) {
    emitToUser(m.user_id, 'conversation:changed', { conversationId });
  }
}

// Jedem Mitglied den Stand mitteilen, bis zu dem seine EIGENEN Nachrichten
// zugestellt bzw. gelesen sind (Minimum über alle anderen Mitglieder).
function broadcastStatuses(conversationId) {
  const members = stmt.members.all(conversationId);
  for (const m of members) {
    if (!isOnline(m.user_id)) continue;
    const bounds = statusBounds(members, m.user_id);
    emitToUser(m.user_id, 'conversation:status', {
      conversationId,
      deliveredUpTo: bounds.delivered,
      readUpTo: bounds.read,
    });
  }
}

// Beim Verbinden gelten alle wartenden Nachrichten als zugestellt.
function markAllDelivered(userId) {
  const changed = [];
  for (const conv of stmt.conversationsOf.all(userId)) {
    const last = stmt.lastMessage.get(conv.id);
    if (!last) continue;
    const me = stmt.membership.get(conv.id, userId);
    if (me && me.last_delivered_id < last.id) {
      stmt.advanceDelivered.run(last.id, conv.id, userId);
      changed.push(conv.id);
    }
  }
  return changed;
}

io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.auth?.token || '', JWT_SECRET);
    const user = stmt.userById.get(payload.sub);
    if (!user) return next(new Error('unauthorized'));
    socket.data.userId = user.id;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  const firstSocket = !onlineSockets.has(userId);
  if (firstSocket) onlineSockets.set(userId, new Set());
  onlineSockets.get(userId).add(socket.id);
  if (firstSocket) io.emit('presence', { userId, online: true });

  for (const convId of markAllDelivered(userId)) broadcastStatuses(convId);

  socket.on('message:send', async (payload, ack) => {
    try {
      const sender = stmt.userById.get(userId);
      const conv = assertMembership(payload?.conversationId, userId);
      const text = String(payload?.text || '').trim().slice(0, 4000);
      if (!sender || !conv || !text) return ack?.({ error: 'invalid_message' });

      const result = stmt.insertMessage.run(
        conv.id, sender.id, text, sender.language, Date.now()
      );
      const msg = stmt.messageById.get(result.lastInsertRowid);
      const members = stmt.members.all(conv.id);

      // Übersetzen und an alle Online-Mitglieder zustellen.
      for (const member of members) {
        if (member.user_id === sender.id) continue;
        if (!isOnline(member.user_id)) continue;
        stmt.advanceDelivered.run(msg.id, conv.id, member.user_id);
      }
      for (const member of members) {
        if (!isOnline(member.user_id)) continue;
        const viewer = stmt.userById.get(member.user_id);
        const view = await viewMessage(msg, viewer, members);
        if (member.user_id === sender.id) {
          // Eigene weitere Geräte/Tabs synchron halten.
          for (const socketId of onlineSockets.get(sender.id) || []) {
            if (socketId !== socket.id) io.to(socketId).emit('message:new', { message: view });
          }
        } else {
          emitToUser(member.user_id, 'message:new', { message: view });
        }
      }

      const senderView = await viewMessage(msg, sender, stmt.members.all(conv.id));
      ack?.({ message: senderView });
      broadcastStatuses(conv.id);
    } catch (err) {
      console.error('message:send fehlgeschlagen:', err);
      ack?.({ error: 'internal' });
    }
  });

  socket.on('messages:read', (payload) => {
    const conv = assertMembership(payload?.conversationId, userId);
    if (!conv) return;
    const last = stmt.lastMessage.get(conv.id);
    if (!last) return;
    stmt.advanceRead.run(last.id, last.id, conv.id, userId);
    broadcastStatuses(conv.id);
  });

  socket.on('typing', (payload) => {
    const conv = assertMembership(payload?.conversationId, userId);
    if (!conv) return;
    const me = stmt.userById.get(userId);
    for (const member of stmt.members.all(conv.id)) {
      if (member.user_id === userId) continue;
      emitToUser(member.user_id, 'typing', {
        conversationId: conv.id,
        userId,
        name: me.display_name,
        isTyping: !!payload?.isTyping,
      });
    }
  });

  socket.on('disconnect', () => {
    const sockets = onlineSockets.get(userId);
    if (!sockets) return;
    sockets.delete(socket.id);
    if (sockets.size === 0) {
      onlineSockets.delete(userId);
      io.emit('presence', { userId, online: false });
    }
  });
});

server.listen(PORT, () => {
  console.log(`InterChat läuft auf http://localhost:${PORT}`);
});
