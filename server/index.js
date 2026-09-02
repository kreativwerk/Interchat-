'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const { db, dataDir } = require('./db');
const { translateMessage } = require('./translate');

const PORT = Number(process.env.PORT || 3000);

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
    'INSERT INTO users (username, password_hash, display_name, language, created_at) VALUES (?, ?, ?, ?, ?)'
  ),
  userByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  userById: db.prepare('SELECT * FROM users WHERE id = ?'),
  updateProfile: db.prepare('UPDATE users SET display_name = ?, language = ? WHERE id = ?'),
  searchUsers: db.prepare(
    `SELECT id, username, display_name, language FROM users
     WHERE (username LIKE ? ESCAPE '\\' OR display_name LIKE ? ESCAPE '\\') AND id != ?
     ORDER BY username LIMIT 20`
  ),
  insertMessage: db.prepare(
    'INSERT INTO messages (sender_id, recipient_id, text, lang, created_at) VALUES (?, ?, ?, ?, ?)'
  ),
  messageById: db.prepare('SELECT * FROM messages WHERE id = ?'),
  markDelivered: db.prepare(
    'UPDATE messages SET delivered_at = ? WHERE id = ? AND delivered_at IS NULL'
  ),
  markPairDelivered: db.prepare(
    `UPDATE messages SET delivered_at = ?
     WHERE recipient_id = ? AND delivered_at IS NULL`
  ),
  markPairRead: db.prepare(
    `UPDATE messages SET read_at = ?, delivered_at = COALESCE(delivered_at, ?)
     WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL`
  ),
  pairHistory: db.prepare(
    `SELECT * FROM messages
     WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
     ORDER BY id DESC LIMIT ?`
  ),
  chatList: db.prepare(
    `SELECT peer_id, MAX(id) AS last_id,
            SUM(CASE WHEN direction = 'in' AND read_at IS NULL THEN 1 ELSE 0 END) AS unread
     FROM (
       SELECT id, recipient_id AS peer_id, 'out' AS direction, read_at
         FROM messages WHERE sender_id = ?
       UNION ALL
       SELECT id, sender_id AS peer_id, 'in' AS direction, read_at
         FROM messages WHERE recipient_id = ?
     )
     GROUP BY peer_id ORDER BY last_id DESC`
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

// Nachricht aus Sicht eines bestimmten Nutzers aufbereiten:
// eigene Nachrichten bleiben im Original, fremde werden übersetzt.
async function viewMessage(msg, viewer) {
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
  return {
    id: msg.id,
    senderId: msg.sender_id,
    recipientId: msg.recipient_id,
    outgoing,
    original: { text: msg.text, lang: msg.lang },
    translation,
    createdAt: msg.created_at,
    deliveredAt: msg.delivered_at,
    readAt: msg.read_at,
  };
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
  const result = stmt.insertUser.run(name, hash, display, language.toLowerCase(), Date.now());
  const user = stmt.userById.get(result.lastInsertRowid);
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = stmt.userByUsername.get(String(username || '').trim().toLowerCase());
  if (!user || !(await bcrypt.compare(String(password || ''), user.password_hash))) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.patch('/api/me', requireAuth, (req, res) => {
  const { displayName, language } = req.body || {};
  const display =
    String(displayName ?? req.user.display_name).trim().slice(0, 48) || req.user.display_name;
  const lang = language != null ? String(language).toLowerCase() : req.user.language;
  if (!validLanguage(lang)) return res.status(400).json({ error: 'invalid_language' });
  stmt.updateProfile.run(display, lang, req.user.id);
  res.json({ user: publicUser(stmt.userById.get(req.user.id)) });
});

app.get('/api/users', requireAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ users: [] });
  const like = `%${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
  const rows = stmt.searchUsers.all(like, like, req.user.id);
  res.json({ users: rows.map((u) => ({ id: u.id, username: u.username, displayName: u.display_name, language: u.language })) });
});

app.get('/api/chats', requireAuth, async (req, res) => {
  const rows = stmt.chatList.all(req.user.id, req.user.id);
  const chats = [];
  for (const row of rows) {
    const peer = stmt.userById.get(row.peer_id);
    if (!peer) continue;
    const last = stmt.messageById.get(row.last_id);
    chats.push({
      peer: publicUser(peer),
      online: isOnline(peer.id),
      unread: row.unread,
      lastMessage: last ? await viewMessage(last, req.user) : null,
    });
  }
  res.json({ chats });
});

app.get('/api/messages/:peerId', requireAuth, async (req, res) => {
  const peerId = Number(req.params.peerId);
  const peer = stmt.userById.get(peerId);
  if (!peer) return res.status(404).json({ error: 'not_found' });
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const rows = stmt.pairHistory.all(req.user.id, peerId, peerId, req.user.id, limit).reverse();
  const messages = [];
  for (const row of rows) messages.push(await viewMessage(row, req.user));
  res.json({ peer: publicUser(peer), online: isOnline(peerId), messages });
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

  // Alles, was offline ankam, ist jetzt zugestellt – Absender informieren.
  const pendingSenders = db
    .prepare('SELECT DISTINCT sender_id FROM messages WHERE recipient_id = ? AND delivered_at IS NULL')
    .all(userId);
  stmt.markPairDelivered.run(Date.now(), userId);
  for (const row of pendingSenders) {
    emitToUser(row.sender_id, 'message:status', { peerId: userId, status: 'delivered' });
  }

  socket.on('message:send', async (payload, ack) => {
    try {
      const sender = stmt.userById.get(userId);
      const recipient = stmt.userById.get(Number(payload?.to));
      const text = String(payload?.text || '').trim().slice(0, 4000);
      if (!sender || !recipient || !text || recipient.id === sender.id) {
        return ack?.({ error: 'invalid_message' });
      }

      const createdAt = Date.now();
      const result = stmt.insertMessage.run(
        sender.id, recipient.id, text, sender.language, createdAt
      );
      const msg = stmt.messageById.get(result.lastInsertRowid);

      // Für den Empfänger in dessen Sprache übersetzen.
      const recipientView = await viewMessage(msg, recipient);

      if (isOnline(recipient.id)) {
        stmt.markDelivered.run(Date.now(), msg.id);
        recipientView.deliveredAt = Date.now();
        emitToUser(recipient.id, 'message:new', {
          message: recipientView,
          from: publicUser(sender),
        });
        emitToUser(sender.id, 'message:status', {
          ids: [msg.id], peerId: recipient.id, status: 'delivered',
        });
      }

      const senderView = await viewMessage(stmt.messageById.get(msg.id), sender);
      // Weitere eigene Geräte/Tabs synchron halten.
      for (const socketId of onlineSockets.get(sender.id) || []) {
        if (socketId !== socket.id) {
          io.to(socketId).emit('message:new', {
            message: senderView, from: publicUser(sender),
          });
        }
      }
      ack?.({ message: senderView });
    } catch (err) {
      console.error('message:send fehlgeschlagen:', err);
      ack?.({ error: 'internal' });
    }
  });

  socket.on('messages:read', (payload) => {
    const peerId = Number(payload?.peerId);
    if (!peerId) return;
    stmt.markPairRead.run(Date.now(), Date.now(), peerId, userId);
    emitToUser(peerId, 'message:status', { peerId: userId, status: 'read' });
  });

  socket.on('typing', (payload) => {
    const peerId = Number(payload?.to);
    if (!peerId) return;
    emitToUser(peerId, 'typing', { from: userId, isTyping: !!payload?.isTyping });
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
