'use strict';

// ------------------------------------------------------------------ Sprachen

const LANGUAGES = {
  ar: 'Arabisch', cs: 'Tschechisch', da: 'Dänisch', de: 'Deutsch',
  el: 'Griechisch', en: 'Englisch', es: 'Spanisch', fi: 'Finnisch',
  fr: 'Französisch', hi: 'Hindi', hu: 'Ungarisch', id: 'Indonesisch',
  it: 'Italienisch', ja: 'Japanisch', ko: 'Koreanisch', nl: 'Niederländisch',
  no: 'Norwegisch', pl: 'Polnisch', pt: 'Portugiesisch', ro: 'Rumänisch',
  ru: 'Russisch', sv: 'Schwedisch', th: 'Thailändisch', tr: 'Türkisch',
  uk: 'Ukrainisch', vi: 'Vietnamesisch', zh: 'Chinesisch',
};

const langLabel = (code) => LANGUAGES[code] || code;

// --------------------------------------------------------------------- State

const state = {
  token: localStorage.getItem('interchat.token') || null,
  me: null,
  socket: null,
  chats: [],                    // Konversations-Zusammenfassungen
  activeConv: null,             // aktive Konversation (Summary)
  messages: [],
  typing: new Map(),            // convId -> Map(userId -> name)
  typingTimer: null,
  isTypingSent: false,
  groupDraft: [],               // Mitglieder beim Gruppen-Anlegen
  directPeer: null,             // aufgelöster Kontakt im Direkt-Tab
};

const $ = (id) => document.getElementById(id);
const authView = $('auth-view');
const appView = $('app-view');
const chatListEl = $('chat-list');
const chatListEmptyEl = $('chat-list-empty');
const messagesEl = $('messages');

// ----------------------------------------------------------------------- API

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error || 'request_failed'), {
      code: data.error,
      status: res.status,
    });
  }
  return data;
}

// -------------------------------------------------------------------- Avatare

function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('');
}

function hashHue(seed) {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.codePointAt(0)) % 360;
  return h;
}

function paintAvatar(el, name, seed) {
  const hue = hashHue(seed ?? name);
  el.textContent = initials(name);
  // Supabase-Material: dunkle, leicht getönte Fläche; der persönliche Farbton
  // (Snapchat-Hauch) lebt in Initialen und Ring, nicht in einer bunten Fläche.
  el.style.background = `hsl(${hue} 28% 16%)`;
  el.style.borderColor = `hsl(${hue} 45% 34%)`;
  el.style.color = `hsl(${hue} 75% 72%)`;
}

function paintChatAvatar(el, chat) {
  if (chat.type === 'group') {
    paintAvatar(el, chat.title, `group:${chat.id}`);
  } else {
    paintAvatar(el, chat.title, `user:${chat.peerId}`);
  }
}

// ---------------------------------------------------------------------- Auth

let authMode = 'login';

function fillLanguageSelect(select, selected) {
  select.innerHTML = '';
  for (const [code, label] of Object.entries(LANGUAGES)) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = label;
    if (code === selected) opt.selected = true;
    select.appendChild(opt);
  }
}

function setAuthMode(mode) {
  authMode = mode;
  $('tab-login').classList.toggle('active', mode === 'login');
  $('tab-register').classList.toggle('active', mode === 'register');
  $('tab-login').setAttribute('aria-selected', String(mode === 'login'));
  $('tab-register').setAttribute('aria-selected', String(mode === 'register'));
  $('register-fields').classList.toggle('hidden', mode !== 'register');
  $('auth-submit').textContent = mode === 'login' ? 'Anmelden' : 'Konto erstellen';
  $('auth-password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('auth-error').textContent = '';
}

const AUTH_ERRORS = {
  invalid_username: 'Benutzername: 3–24 Zeichen, nur Kleinbuchstaben, Zahlen, Punkt, Unterstrich.',
  weak_password: 'Das Passwort braucht mindestens 6 Zeichen.',
  username_taken: 'Dieser Benutzername ist bereits vergeben.',
  invalid_credentials: 'Benutzername oder Passwort ist falsch.',
  invalid_language: 'Bitte eine gültige Sprache wählen.',
};

$('tab-login').addEventListener('click', () => setAuthMode('login'));
$('tab-register').addEventListener('click', () => setAuthMode('register'));

$('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('auth-error').textContent = '';
  const username = $('auth-username').value.trim();
  const password = $('auth-password').value;
  try {
    let data;
    if (authMode === 'login') {
      data = await api('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    } else {
      data = await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          displayName: $('auth-displayname').value.trim(),
          language: $('auth-language').value,
        }),
      });
    }
    state.token = data.token;
    localStorage.setItem('interchat.token', data.token);
    state.me = data.user;
    enterApp();
  } catch (err) {
    $('auth-error').textContent =
      AUTH_ERRORS[err.code] || 'Das hat nicht geklappt. Bitte erneut versuchen.';
  }
});

// ----------------------------------------------------------------- App-Start

function showAuth() {
  authView.classList.remove('hidden');
  appView.classList.add('hidden');
  fillLanguageSelect($('auth-language'), (navigator.language || 'de').slice(0, 2));
}

async function enterApp() {
  authView.classList.add('hidden');
  appView.classList.remove('hidden');
  renderMe();
  connectSocket();
  await loadChats();
}

function renderMe() {
  paintAvatar($('me-avatar'), state.me.displayName, `user:${state.me.id}`);
}

function logout() {
  localStorage.removeItem('interchat.token');
  if (state.socket) state.socket.disconnect();
  location.reload();
}

// ------------------------------------------------------------------ Chatliste

async function loadChats() {
  const data = await api('/api/chats');
  state.chats = data.chats;
  if (state.activeConv) {
    const fresh = state.chats.find((c) => c.id === state.activeConv.id);
    if (fresh) {
      state.activeConv = fresh;
      renderPeerHeader();
    }
  }
  renderChatList();
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Heute';
  if (d.toDateString() === yesterday.toDateString()) return 'Gestern';
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function typingNames(convId) {
  const byUser = state.typing.get(convId);
  return byUser && byUser.size ? [...byUser.values()] : [];
}

function previewText(chat) {
  const names = typingNames(chat.id);
  if (names.length) return { text: 'schreibt …', typing: true };
  const m = chat.lastMessage;
  if (!m) return { text: 'Sag Hallo!', typing: false };
  const text = m.translation && m.translation.translated ? m.translation.text : m.original.text;
  const prefix = m.outgoing ? 'Du: ' : chat.type === 'group' && m.senderName ? `${m.senderName}: ` : '';
  return { text: prefix + text, typing: false };
}

function renderChatList() {
  chatListEl.innerHTML = '';
  chatListEmptyEl.classList.toggle('hidden', state.chats.length > 0);

  for (const chat of state.chats) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'chat-item' + (state.activeConv?.id === chat.id ? ' active' : '');

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'avatar-wrap';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    paintChatAvatar(avatar, chat);
    avatarWrap.appendChild(avatar);
    if (chat.online) {
      const dot = document.createElement('div');
      dot.className = 'online-dot';
      avatarWrap.appendChild(dot);
    }

    const main = document.createElement('div');
    main.className = 'chat-item-main';

    const top = document.createElement('div');
    top.className = 'chat-item-top';
    const name = document.createElement('div');
    name.className = 'chat-item-name';
    name.textContent = chat.title;
    const time = document.createElement('div');
    time.className = 'chat-item-time';
    time.textContent = chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : '';
    top.append(name, time);

    const bottom = document.createElement('div');
    bottom.className = 'chat-item-bottom';
    const preview = document.createElement('div');
    const pv = previewText(chat);
    preview.className = 'chat-item-preview' + (pv.typing ? ' typing' : '');
    preview.textContent = pv.text;
    bottom.appendChild(preview);
    if (chat.unread > 0) {
      const badge = document.createElement('div');
      badge.className = 'unread-badge';
      badge.textContent = chat.unread;
      bottom.appendChild(badge);
    }

    main.append(top, bottom);
    item.append(avatarWrap, main);
    item.addEventListener('click', () => openChat(chat.id));
    chatListEl.appendChild(item);
  }
}

// ---------------------------------------------------------------- Konversation

let openChatSeq = 0;

async function openChat(conversationId) {
  const seq = ++openChatSeq;

  // Ladezustand sofort zeigen, statt stumm aufs Netz zu warten.
  $('chat-placeholder').classList.add('hidden');
  $('chat-active').classList.remove('hidden');
  appView.classList.add('mobile-chat-open');
  messagesEl.innerHTML = '<div class="messages-loading" role="status" aria-label="Lädt"></div>';

  // Konversation sofort aktiv setzen (Header aus der Chatliste, sofern
  // bekannt), damit Live-Events während des Ladens richtig zugeordnet werden.
  const summary = state.chats.find((c) => c.id === conversationId);
  state.activeConv = summary || { id: conversationId, type: 'direct', title: '', members: [] };
  state.messages = [];
  if (summary) renderPeerHeader();

  const data = await api(`/api/conversations/${conversationId}/messages`);
  // Inzwischen wurde ein anderer Chat geöffnet? Dann diese Antwort verwerfen.
  if (seq !== openChatSeq) return;

  // Nachrichten, die während des Ladens live eintrafen, nicht verlieren.
  const local = state.messages.filter((m) => !data.messages.some((f) => f.id === m.id));
  state.activeConv = data.conversation;
  state.messages = data.messages.concat(local).sort((a, b) => a.id - b.id);

  renderPeerHeader();
  renderMessages();
  markRead();
  renderChatList();
  $('message-input').focus();
}

function closeChat() {
  state.activeConv = null;
  state.messages = [];
  appView.classList.remove('mobile-chat-open');
  $('chat-active').classList.add('hidden');
  $('chat-placeholder').classList.remove('hidden');
  renderChatList();
}

function renderPeerHeader() {
  const conv = state.activeConv;
  if (!conv) return;
  paintChatAvatar($('peer-avatar'), conv);
  $('peer-name').textContent = conv.title;
  $('btn-add-member').classList.toggle('hidden', conv.type !== 'group');
  updatePeerStatus();
}

function updatePeerStatus() {
  const conv = state.activeConv;
  if (!conv) return;
  const el = $('peer-status');
  const names = typingNames(conv.id);
  if (names.length) {
    el.textContent = conv.type === 'group' ? `${names.join(', ')} schreibt …` : 'schreibt …';
    el.className = 'peer-status typing';
  } else if (conv.type === 'group') {
    const others = conv.members.filter((m) => m.id !== state.me.id);
    el.textContent = ['Du', ...others.map((m) => m.displayName)].join(', ');
    el.className = 'peer-status';
  } else if (conv.online) {
    el.textContent = 'online';
    el.className = 'peer-status online';
  } else {
    const peer = conv.members.find((m) => m.id !== state.me.id);
    el.textContent = peer ? langLabel(peer.language) : '';
    el.className = 'peer-status';
  }
}

const STATUS_LABEL = { sent: 'Gesendet', delivered: 'Zugestellt', read: 'Gelesen' };

function buildBubble(msg, opts = {}) {
  const fragment = document.createDocumentFragment();

  if (state.activeConv?.type === 'group' && !msg.outgoing && msg.senderName && opts.showSender) {
    const sender = document.createElement('div');
    sender.className = 'sender-name';
    sender.textContent = msg.senderName;
    fragment.appendChild(sender);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + (msg.outgoing ? 'out' : 'in');
  if (opts.animate) bubble.classList.add(msg.outgoing ? 'anim-out' : 'anim-in');
  bubble.dataset.messageId = msg.id;

  const showTranslation = !msg.outgoing && msg.translation && msg.translation.translated;
  const mainText = document.createElement('span');
  mainText.textContent = showTranslation ? msg.translation.text : msg.original.text;
  bubble.appendChild(mainText);

  if (showTranslation) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'original-toggle';
    toggle.innerHTML =
      '<svg width="13" height="13" aria-hidden="true"><use href="#i-globe"/></svg>' +
      `<span>Original (${langLabel(msg.original.lang)})</span>`;
    const original = document.createElement('div');
    original.className = 'original-text hidden';
    original.textContent = msg.original.text;
    toggle.addEventListener('click', () => {
      const nowHidden = original.classList.toggle('hidden');
      toggle.querySelector('span').textContent = nowHidden
        ? `Original (${langLabel(msg.original.lang)})`
        : 'Original ausblenden';
    });
    bubble.append(toggle, original);
  } else if (!msg.outgoing && msg.translation && msg.translation.failed) {
    const note = document.createElement('span');
    note.className = 'translate-failed';
    note.textContent = 'Übersetzung derzeit nicht möglich – Originaltext angezeigt.';
    bubble.appendChild(note);
  }

  fragment.appendChild(bubble);
  return fragment;
}

// Zeit-Divider wie in Apples Nachrichten-App: „Heute 20:04" bei Tageswechsel
// oder nach längerer Pause – die Bubbles selbst tragen keine Uhrzeit.
const DIVIDER_GAP_MS = 60 * 60 * 1000;

function dividerLabel(prevMsg, msg) {
  if (prevMsg && formatDay(prevMsg.createdAt) === formatDay(msg.createdAt)
    && msg.createdAt - prevMsg.createdAt < DIVIDER_GAP_MS) return null;
  return `${formatDay(msg.createdAt)} ${formatTime(msg.createdAt)}`;
}

function appendDivider(label) {
  const divider = document.createElement('div');
  divider.className = 'day-divider';
  divider.textContent = label;
  messagesEl.appendChild(divider);
}

// Status („Zugestellt" / „Gelesen") nur unter der letzten eigenen Nachricht,
// wie in Apples Nachrichten-App.
function renderMessages() {
  messagesEl.innerHTML = '';
  let prevMsg = null;
  for (const msg of state.messages) {
    const label = dividerLabel(prevMsg, msg);
    if (label) appendDivider(label);
    messagesEl.appendChild(buildBubble(msg, {
      showSender: label !== null || !prevMsg || msg.senderId !== prevMsg.senderId,
    }));
    prevMsg = msg;
  }
  appendStatusRow();
  renderTypingRow();
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendStatusRow() {
  messagesEl.querySelector('.message-status')?.remove();
  const lastOut = [...state.messages].reverse().find((m) => m.outgoing);
  if (!lastOut || !lastOut.status) return;
  const lastMsg = state.messages[state.messages.length - 1];
  if (lastMsg.id !== lastOut.id) return;
  const el = document.createElement('div');
  el.className = 'message-status';
  el.textContent = STATUS_LABEL[lastOut.status] || '';
  messagesEl.appendChild(el);
}

function renderTypingRow() {
  messagesEl.querySelector('.typing-row')?.remove();
  if (!state.activeConv || typingNames(state.activeConv.id).length === 0) return;
  const row = document.createElement('div');
  row.className = 'typing-row';
  row.setAttribute('aria-label', 'schreibt gerade');
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    row.appendChild(dot);
  }
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Beim Live-Anhängen sicherstellen, dass der Zeit-Divider existiert.
// Erwartet, dass msg bereits als letztes Element in state.messages steht.
function ensureDivider(msg) {
  const prevMsg = state.messages[state.messages.length - 2] || null;
  const label = dividerLabel(prevMsg, msg);
  if (label) appendDivider(label);
}

function markRead() {
  if (!state.activeConv || !state.socket) return;
  state.socket.emit('messages:read', { conversationId: state.activeConv.id });
  const chat = state.chats.find((c) => c.id === state.activeConv.id);
  if (chat) chat.unread = 0;
}

// -------------------------------------------------------------------- Senden

$('message-input').addEventListener('input', () => {
  $('send-btn').disabled = $('message-input').value.trim() === '';
  if (!state.activeConv || !state.socket) return;
  if (!state.isTypingSent) {
    state.socket.emit('typing', { conversationId: state.activeConv.id, isTyping: true });
    state.isTypingSent = true;
  }
  clearTimeout(state.typingTimer);
  state.typingTimer = setTimeout(stopTyping, 2500);
});

function stopTyping() {
  clearTimeout(state.typingTimer);
  if (state.isTypingSent && state.activeConv && state.socket) {
    state.socket.emit('typing', { conversationId: state.activeConv.id, isTyping: false });
  }
  state.isTypingSent = false;
}

function showComposerError(text) {
  document.querySelector('.composer-error')?.remove();
  if (!text) return;
  const el = document.createElement('div');
  el.className = 'composer-error';
  el.setAttribute('role', 'alert');
  el.textContent = text;
  $('composer').before(el);
  setTimeout(() => el.remove(), 4000);
}

// Signature-Moment: die neue Bubble startet per FLIP an der Eingabe-Pille.
function animateFromComposer(bubble) {
  const inputRect = $('message-input').getBoundingClientRect();
  const bubbleRect = bubble.getBoundingClientRect();
  bubble.style.setProperty('--send-dx', `${inputRect.right - bubbleRect.right}px`);
  bubble.style.setProperty('--send-dy', `${inputRect.top - bubbleRect.top}px`);
}

$('composer').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('message-input');
  const text = input.value.trim();
  if (!text || !state.activeConv || !state.socket) return;
  input.value = '';
  $('send-btn').disabled = true;
  stopTyping();
  showComposerError('');

  state.socket.emit('message:send', { conversationId: state.activeConv.id, text }, (res) => {
    if (res?.error || !res?.message) {
      // Nichts verlieren: Text zurück in die Eingabe, Fehler benennen.
      input.value = input.value || text;
      $('send-btn').disabled = input.value.trim() === '';
      showComposerError('Senden fehlgeschlagen. Bitte erneut versuchen.');
      return;
    }
    state.messages.push(res.message);
    messagesEl.querySelector('.message-status')?.remove();
    ensureDivider(res.message);
    const fragment = buildBubble(res.message, { animate: true });
    messagesEl.appendChild(fragment);
    const bubble = messagesEl.querySelector(`[data-message-id="${res.message.id}"]`);
    if (bubble) animateFromComposer(bubble);
    appendStatusRow();
    messagesEl.scrollTop = messagesEl.scrollHeight;
    loadChats();
  });
});

// ------------------------------------------------------------------ Socket.IO

function connectSocket() {
  state.socket = io({ auth: { token: state.token } });

  state.socket.on('message:new', ({ message }) => {
    if (state.activeConv && message.conversationId === state.activeConv.id) {
      // Race zwischen Verlauf-Laden und Live-Event: nie doppelt rendern.
      if (state.messages.some((m) => m.id === message.id)) return;
      state.messages.push(message);
      const prev = state.messages[state.messages.length - 2];
      messagesEl.querySelector('.message-status')?.remove();
      messagesEl.querySelector('.typing-row')?.remove();
      // Live-Nachricht während des Ladens: Spinner weicht dem Inhalt.
      messagesEl.querySelector('.messages-loading')?.remove();
      ensureDivider(message);
      messagesEl.appendChild(buildBubble(message, {
        animate: true,
        showSender: !prev || prev.senderId !== message.senderId,
      }));
      appendStatusRow();
      renderTypingRow();
      messagesEl.scrollTop = messagesEl.scrollHeight;
      if (!message.outgoing) markRead();
    }
    loadChats();
  });

  state.socket.on('conversation:status', ({ conversationId, deliveredUpTo, readUpTo }) => {
    if (!state.activeConv || conversationId !== state.activeConv.id) return;
    let changed = false;
    for (const msg of state.messages) {
      if (!msg.outgoing) continue;
      const next = readUpTo >= msg.id ? 'read' : deliveredUpTo >= msg.id ? 'delivered' : 'sent';
      if (next !== msg.status) {
        msg.status = next;
        changed = true;
      }
    }
    if (changed) appendStatusRow();
  });

  state.socket.on('typing', ({ conversationId, userId, name, isTyping }) => {
    let byUser = state.typing.get(conversationId);
    if (!byUser) state.typing.set(conversationId, (byUser = new Map()));
    if (isTyping) byUser.set(userId, name);
    else byUser.delete(userId);
    if (state.activeConv && conversationId === state.activeConv.id) {
      updatePeerStatus();
      renderTypingRow();
    }
    renderChatList();
  });

  state.socket.on('presence', ({ userId, online }) => {
    for (const chat of state.chats) {
      if (chat.type === 'direct' && chat.peerId === userId) chat.online = online;
    }
    if (!online) {
      for (const byUser of state.typing.values()) byUser.delete(userId);
    }
    if (state.activeConv) {
      const fresh = state.chats.find((c) => c.id === state.activeConv.id);
      if (fresh) state.activeConv.online = fresh.online;
      updatePeerStatus();
    }
    renderChatList();
  });

  state.socket.on('conversation:new', () => loadChats());
  state.socket.on('conversation:changed', async ({ conversationId }) => {
    await loadChats();
    if (state.activeConv && conversationId === state.activeConv.id) openChat(conversationId);
  });

  state.socket.on('connect_error', (err) => {
    if (String(err.message).includes('unauthorized')) logout();
  });
}

// ----------------------------------------------------------------- Sheets

function openSheet(id) { $(id).classList.remove('hidden'); }
function closeSheet(id) { $(id).classList.add('hidden'); }

for (const backdrop of document.querySelectorAll('.sheet-backdrop')) {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.closest('.sheet-close')) {
      backdrop.classList.add('hidden');
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    for (const b of document.querySelectorAll('.sheet-backdrop')) b.classList.add('hidden');
  }
});

$('btn-back').addEventListener('click', closeChat);
$('btn-logout').addEventListener('click', logout);

// --- Neuer Chat ---

function resetNewChatSheet() {
  $('direct-code').value = '';
  $('direct-error').textContent = '';
  $('direct-result').classList.add('hidden');
  $('btn-start-direct').disabled = true;
  state.directPeer = null;
  $('group-name').value = '';
  $('group-code').value = '';
  $('group-error').textContent = '';
  state.groupDraft = [];
  renderGroupDraft();
  updateGroupButton();
}

function showNewChat() {
  resetNewChatSheet();
  openSheet('sheet-new-chat');
  $('direct-code').focus();
}

$('btn-new-chat').addEventListener('click', showNewChat);
$('btn-empty-new').addEventListener('click', showNewChat);

$('tab-direct').addEventListener('click', () => setNewChatTab('direct'));
$('tab-group').addEventListener('click', () => setNewChatTab('group'));

function setNewChatTab(tab) {
  $('tab-direct').classList.toggle('active', tab === 'direct');
  $('tab-group').classList.toggle('active', tab === 'group');
  $('new-direct').classList.toggle('hidden', tab !== 'direct');
  $('new-group').classList.toggle('hidden', tab !== 'group');
  ($(tab === 'direct' ? 'direct-code' : 'group-name')).focus();
}

function formatCodeInput(input) {
  const raw = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  input.value = raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
  return raw.length === 8;
}

async function lookupCode(code) {
  const data = await api('/api/contacts/lookup', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return data.user;
}

let directLookupTimer = null;
$('direct-code').addEventListener('input', () => {
  const complete = formatCodeInput($('direct-code'));
  $('direct-error').textContent = '';
  $('direct-result').classList.add('hidden');
  $('btn-start-direct').disabled = true;
  state.directPeer = null;
  clearTimeout(directLookupTimer);
  if (!complete) return;
  directLookupTimer = setTimeout(async () => {
    try {
      const user = await lookupCode($('direct-code').value);
      state.directPeer = user;
      const box = $('direct-result');
      box.innerHTML = '';
      const avatar = document.createElement('span');
      avatar.className = 'avatar';
      paintAvatar(avatar, user.displayName, `user:${user.id}`);
      const info = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'lookup-name';
      name.textContent = user.displayName;
      const sub = document.createElement('div');
      sub.className = 'lookup-sub';
      sub.textContent = `@${user.username} · ${langLabel(user.language)}`;
      info.append(name, sub);
      box.append(avatar, info);
      box.classList.remove('hidden');
      $('btn-start-direct').disabled = false;
    } catch {
      $('direct-error').textContent = 'Keine Person mit dieser ID gefunden.';
    }
  }, 250);
});

$('btn-start-direct').addEventListener('click', async () => {
  if (!state.directPeer) return;
  const data = await api('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ type: 'direct', code: $('direct-code').value }),
  });
  closeSheet('sheet-new-chat');
  await loadChats();
  openChat(data.conversation.id);
});

// --- Gruppe ---

function renderGroupDraft() {
  const wrap = $('group-members');
  wrap.innerHTML = '';
  for (const member of state.groupDraft) {
    const chip = document.createElement('span');
    chip.className = 'member-chip';
    const label = document.createElement('span');
    label.textContent = member.displayName;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.title = `${member.displayName} entfernen`;
    remove.innerHTML = '<svg width="14" height="14" aria-hidden="true"><use href="#i-xmark"/></svg>';
    remove.addEventListener('click', () => {
      state.groupDraft = state.groupDraft.filter((m) => m.id !== member.id);
      renderGroupDraft();
      updateGroupButton();
    });
    chip.append(label, remove);
    wrap.appendChild(chip);
  }
}

function updateGroupButton() {
  $('btn-create-group').disabled =
    $('group-name').value.trim() === '' || state.groupDraft.length === 0;
}

$('group-name').addEventListener('input', updateGroupButton);
$('group-code').addEventListener('input', () => {
  formatCodeInput($('group-code'));
  $('group-error').textContent = '';
});

async function addGroupMember() {
  const input = $('group-code');
  if (input.value.replace(/-/g, '').length !== 8) {
    $('group-error').textContent = 'Bitte eine vollständige ID eingeben.';
    return;
  }
  try {
    const user = await lookupCode(input.value);
    if (!state.groupDraft.some((m) => m.id === user.id)) {
      state.groupDraft.push({ ...user, code: input.value });
    }
    input.value = '';
    renderGroupDraft();
    updateGroupButton();
    input.focus();
  } catch {
    $('group-error').textContent = 'Keine Person mit dieser ID gefunden.';
  }
}

$('btn-add-group-member').addEventListener('click', addGroupMember);
$('group-code').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addGroupMember();
  }
});

$('btn-create-group').addEventListener('click', async () => {
  try {
    const data = await api('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({
        type: 'group',
        name: $('group-name').value.trim(),
        codes: state.groupDraft.map((m) => m.code),
      }),
    });
    closeSheet('sheet-new-chat');
    await loadChats();
    openChat(data.conversation.id);
  } catch {
    $('group-error').textContent = 'Gruppe konnte nicht erstellt werden.';
  }
});

// --- Mitglied zur Gruppe hinzufügen ---

$('btn-add-member').addEventListener('click', () => {
  $('add-member-code').value = '';
  $('add-member-error').textContent = '';
  $('btn-confirm-add-member').disabled = true;
  openSheet('sheet-add-member');
  $('add-member-code').focus();
});

$('add-member-code').addEventListener('input', () => {
  const complete = formatCodeInput($('add-member-code'));
  $('add-member-error').textContent = '';
  $('btn-confirm-add-member').disabled = !complete;
});

$('btn-confirm-add-member').addEventListener('click', async () => {
  try {
    await api(`/api/conversations/${state.activeConv.id}/members`, {
      method: 'POST',
      body: JSON.stringify({ code: $('add-member-code').value }),
    });
    closeSheet('sheet-add-member');
    await loadChats();
    openChat(state.activeConv.id);
  } catch {
    $('add-member-error').textContent = 'Keine Person mit dieser ID gefunden.';
  }
});

// --- Einstellungen ---

$('btn-settings').addEventListener('click', () => {
  paintAvatar($('settings-avatar'), state.me.displayName, `user:${state.me.id}`);
  $('settings-name-preview').textContent = state.me.displayName;
  $('settings-username').textContent = `@${state.me.username}`;
  $('settings-code').textContent = state.me.userCode || '';
  $('settings-displayname').value = state.me.displayName;
  fillLanguageSelect($('settings-language'), state.me.language);
  $('copy-label').textContent = 'Kopieren';
  openSheet('sheet-settings');
});

$('btn-copy-code').addEventListener('click', async () => {
  const code = state.me.userCode || '';
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const range = document.createRange();
    range.selectNodeContents($('settings-code'));
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }
  $('copy-label').textContent = 'Kopiert';
  setTimeout(() => { $('copy-label').textContent = 'Kopieren'; }, 1600);
});

$('settings-save').addEventListener('click', async () => {
  const data = await api('/api/me', {
    method: 'PATCH',
    body: JSON.stringify({
      displayName: $('settings-displayname').value.trim(),
      language: $('settings-language').value,
    }),
  });
  state.me = data.user;
  renderMe();
  closeSheet('sheet-settings');
  // Chatliste und offene Konversation in der neuen Sprache neu laden.
  await loadChats();
  if (state.activeConv) openChat(state.activeConv.id);
});

// ----------------------------------------------------------------------- Init

(async function init() {
  fillLanguageSelect($('auth-language'), (navigator.language || 'de').slice(0, 2));
  if (!state.token) return showAuth();
  try {
    const data = await api('/api/me');
    state.me = data.user;
    enterApp();
  } catch {
    localStorage.removeItem('interchat.token');
    state.token = null;
    showAuth();
  }
})();
