'use strict';

// ------------------------------------------------------------------ Sprachen

const LANGUAGES = {
  ar: '🇸🇦 Arabisch', cs: '🇨🇿 Tschechisch', da: '🇩🇰 Dänisch', de: '🇩🇪 Deutsch',
  el: '🇬🇷 Griechisch', en: '🇬🇧 Englisch', es: '🇪🇸 Spanisch', fi: '🇫🇮 Finnisch',
  fr: '🇫🇷 Französisch', hi: '🇮🇳 Hindi', hu: '🇭🇺 Ungarisch', id: '🇮🇩 Indonesisch',
  it: '🇮🇹 Italienisch', ja: '🇯🇵 Japanisch', ko: '🇰🇷 Koreanisch', nl: '🇳🇱 Niederländisch',
  no: '🇳🇴 Norwegisch', pl: '🇵🇱 Polnisch', pt: '🇵🇹 Portugiesisch', ro: '🇷🇴 Rumänisch',
  ru: '🇷🇺 Russisch', sv: '🇸🇪 Schwedisch', th: '🇹🇭 Thailändisch', tr: '🇹🇷 Türkisch',
  uk: '🇺🇦 Ukrainisch', vi: '🇻🇳 Vietnamesisch', zh: '🇨🇳 Chinesisch',
};

function langLabel(code) {
  return LANGUAGES[code] || code;
}

// --------------------------------------------------------------------- State

const state = {
  token: localStorage.getItem('interchat.token') || null,
  me: null,
  socket: null,
  chats: [],                 // [{peer, online, unread, lastMessage}]
  activePeer: null,          // Nutzerobjekt des offenen Chats
  messages: [],              // Nachrichten des offenen Chats
  typingPeers: new Set(),
  typingTimer: null,
  isTypingSent: false,
};

// ----------------------------------------------------------------------- DOM

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
  if (!res.ok) throw Object.assign(new Error(data.error || 'request_failed'), { code: data.error, status: res.status });
  return data;
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
  $('register-fields').classList.toggle('hidden', mode !== 'register');
  $('auth-submit').textContent = mode === 'login' ? 'Anmelden' : 'Konto erstellen';
  $('auth-password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('auth-error').textContent = '';
}

const AUTH_ERRORS = {
  invalid_username: 'Benutzername: 3–24 Zeichen, nur Kleinbuchstaben, Zahlen, Punkt, Unterstrich.',
  weak_password: 'Das Passwort muss mindestens 6 Zeichen haben.',
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
    $('auth-error').textContent = AUTH_ERRORS[err.code] || 'Das hat leider nicht geklappt. Bitte erneut versuchen.';
  }
});

// ----------------------------------------------------------------- App-Start

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('');
}

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
  $('me-avatar').textContent = initials(state.me.displayName);
  $('me-name').textContent = state.me.displayName;
  $('me-lang').textContent = langLabel(state.me.language);
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

function previewText(chat) {
  const m = chat.lastMessage;
  if (!m) return '';
  const text = m.translation ? m.translation.text : m.original.text;
  return (m.outgoing ? 'Du: ' : '') + text;
}

function renderChatList() {
  chatListEl.innerHTML = '';
  if (state.chats.length === 0) chatListEl.appendChild(chatListEmptyEl);

  for (const chat of state.chats) {
    const item = document.createElement('div');
    item.className = 'chat-item' + (state.activePeer?.id === chat.peer.id ? ' active' : '');
    item.dataset.peerId = chat.peer.id;

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'avatar-wrap';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = initials(chat.peer.displayName);
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
    name.textContent = chat.peer.displayName;
    const time = document.createElement('div');
    time.className = 'chat-item-time';
    time.textContent = chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : '';
    top.append(name, time);

    const bottom = document.createElement('div');
    bottom.className = 'chat-item-bottom';
    const preview = document.createElement('div');
    preview.className = 'chat-item-preview';
    preview.textContent = state.typingPeers.has(chat.peer.id) ? 'schreibt…' : previewText(chat);
    bottom.appendChild(preview);
    if (chat.unread > 0) {
      const badge = document.createElement('div');
      badge.className = 'unread-badge';
      badge.textContent = chat.unread;
      bottom.appendChild(badge);
    }

    main.append(top, bottom);
    item.append(avatarWrap, main);
    item.addEventListener('click', () => openChat(chat.peer));
    chatListEl.appendChild(item);
  }
}

// ---------------------------------------------------------------- Chatansicht

async function openChat(peer) {
  state.activePeer = peer;
  $('chat-placeholder').classList.add('hidden');
  $('chat-active').classList.remove('hidden');
  $('chat-pane').classList.remove('no-chat');
  appView.classList.add('mobile-chat-open');

  const data = await api(`/api/messages/${peer.id}`);
  state.activePeer = data.peer;
  state.messages = data.messages;
  renderPeerHeader(data.online);
  renderMessages();
  markRead();
  renderChatList();
  $('message-input').focus();
}

function closeChat() {
  state.activePeer = null;
  state.messages = [];
  appView.classList.remove('mobile-chat-open');
  $('chat-active').classList.add('hidden');
  $('chat-placeholder').classList.remove('hidden');
  renderChatList();
}

function renderPeerHeader(online) {
  const peer = state.activePeer;
  $('peer-avatar').textContent = initials(peer.displayName);
  $('peer-name').textContent = peer.displayName;
  updatePeerStatus(online);
}

function updatePeerStatus(online) {
  const el = $('peer-status');
  const peer = state.activePeer;
  if (!peer) return;
  if (state.typingPeers.has(peer.id)) {
    el.textContent = 'schreibt…';
    el.className = 'peer-status typing';
  } else if (online) {
    el.textContent = 'online';
    el.className = 'peer-status online';
  } else {
    el.textContent = `@${peer.username} · ${langLabel(peer.language)}`;
    el.className = 'peer-status';
  }
}

function tickState(msg) {
  if (msg.readAt) return { text: '✓✓', cls: 'ticks read' };
  if (msg.deliveredAt) return { text: '✓✓', cls: 'ticks' };
  return { text: '✓', cls: 'ticks' };
}

function buildBubble(msg) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + (msg.outgoing ? 'out' : 'in');
  bubble.dataset.messageId = msg.id;

  const showTranslation = !msg.outgoing && msg.translation && msg.translation.translated;
  const mainText = document.createElement('span');
  mainText.textContent = showTranslation ? msg.translation.text : msg.original.text;
  bubble.appendChild(mainText);

  const meta = document.createElement('span');
  meta.className = 'bubble-meta';
  const time = document.createElement('span');
  time.textContent = formatTime(msg.createdAt);
  meta.appendChild(time);
  if (msg.outgoing) {
    const t = tickState(msg);
    const ticks = document.createElement('span');
    ticks.className = t.cls;
    ticks.textContent = t.text;
    meta.appendChild(ticks);
  }
  bubble.appendChild(meta);

  if (showTranslation) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'original-toggle';
    toggle.textContent = `🌐 Original anzeigen (${langLabel(msg.original.lang)})`;
    const original = document.createElement('div');
    original.className = 'original-text hidden';
    original.textContent = msg.original.text;
    toggle.addEventListener('click', () => {
      const nowHidden = original.classList.toggle('hidden');
      toggle.textContent = nowHidden
        ? `🌐 Original anzeigen (${langLabel(msg.original.lang)})`
        : '🌐 Original ausblenden';
    });
    bubble.append(toggle, original);
  } else if (!msg.outgoing && msg.translation && msg.translation.failed) {
    const note = document.createElement('span');
    note.className = 'translate-failed';
    note.textContent = '⚠️ Übersetzung derzeit nicht möglich – Originaltext angezeigt.';
    bubble.appendChild(note);
  }

  return bubble;
}

function renderMessages() {
  messagesEl.innerHTML = '';
  let lastDay = '';
  for (const msg of state.messages) {
    const day = formatDay(msg.createdAt);
    if (day !== lastDay) {
      const divider = document.createElement('div');
      divider.className = 'day-divider';
      divider.textContent = day;
      messagesEl.appendChild(divider);
      lastDay = day;
    }
    messagesEl.appendChild(buildBubble(msg));
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function updateTicks() {
  for (const msg of state.messages) {
    if (!msg.outgoing) continue;
    const bubble = messagesEl.querySelector(`[data-message-id="${msg.id}"] .ticks`);
    if (!bubble) continue;
    const t = tickState(msg);
    bubble.className = t.cls;
    bubble.textContent = t.text;
  }
}

function markRead() {
  if (!state.activePeer || !state.socket) return;
  state.socket.emit('messages:read', { peerId: state.activePeer.id });
  const chat = state.chats.find((c) => c.peer.id === state.activePeer.id);
  if (chat) chat.unread = 0;
}

// -------------------------------------------------------------------- Senden

$('composer').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('message-input');
  const text = input.value.trim();
  if (!text || !state.activePeer || !state.socket) return;
  input.value = '';
  stopTyping();

  state.socket.emit('message:send', { to: state.activePeer.id, text }, (res) => {
    if (res?.error || !res?.message) return;
    state.messages.push(res.message);
    messagesEl.appendChild(buildBubble(res.message));
    messagesEl.scrollTop = messagesEl.scrollHeight;
    loadChats();
  });
});

function stopTyping() {
  clearTimeout(state.typingTimer);
  if (state.isTypingSent && state.activePeer && state.socket) {
    state.socket.emit('typing', { to: state.activePeer.id, isTyping: false });
  }
  state.isTypingSent = false;
}

$('message-input').addEventListener('input', () => {
  if (!state.activePeer || !state.socket) return;
  if (!state.isTypingSent) {
    state.socket.emit('typing', { to: state.activePeer.id, isTyping: true });
    state.isTypingSent = true;
  }
  clearTimeout(state.typingTimer);
  state.typingTimer = setTimeout(stopTyping, 2500);
});

// ------------------------------------------------------------------ Socket.IO

function connectSocket() {
  state.socket = io({ auth: { token: state.token } });

  state.socket.on('message:new', ({ message }) => {
    const peerId = message.outgoing ? message.recipientId : message.senderId;
    if (state.activePeer && peerId === state.activePeer.id) {
      state.messages.push(message);
      messagesEl.appendChild(buildBubble(message));
      messagesEl.scrollTop = messagesEl.scrollHeight;
      if (!message.outgoing) markRead();
    }
    loadChats();
  });

  state.socket.on('message:status', ({ peerId, status, ids }) => {
    if (!state.activePeer || peerId !== state.activePeer.id) return;
    const now = Date.now();
    for (const msg of state.messages) {
      if (!msg.outgoing) continue;
      if (ids && !ids.includes(msg.id)) continue;
      if (status === 'delivered' && !msg.deliveredAt) msg.deliveredAt = now;
      if (status === 'read') {
        msg.deliveredAt = msg.deliveredAt || now;
        msg.readAt = msg.readAt || now;
      }
    }
    updateTicks();
  });

  state.socket.on('typing', ({ from, isTyping }) => {
    if (isTyping) state.typingPeers.add(from);
    else state.typingPeers.delete(from);
    if (state.activePeer && from === state.activePeer.id) {
      updatePeerStatus(state.chats.find((c) => c.peer.id === from)?.online);
    }
    renderChatList();
  });

  state.socket.on('presence', ({ userId, online }) => {
    const chat = state.chats.find((c) => c.peer.id === userId);
    if (chat) chat.online = online;
    if (!online) state.typingPeers.delete(userId);
    if (state.activePeer && userId === state.activePeer.id) updatePeerStatus(online);
    renderChatList();
  });

  state.socket.on('connect_error', (err) => {
    if (String(err.message).includes('unauthorized')) logout();
  });
}

// ----------------------------------------------------------- Modale & Aktionen

$('btn-back').addEventListener('click', closeChat);
$('btn-logout').addEventListener('click', logout);

for (const backdrop of document.querySelectorAll('.modal-backdrop')) {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.classList.contains('modal-close')) {
      backdrop.classList.add('hidden');
    }
  });
}

$('btn-new-chat').addEventListener('click', () => {
  $('modal-new-chat').classList.remove('hidden');
  $('user-search').value = '';
  $('user-results').innerHTML = '';
  $('user-search').focus();
});

let searchTimer = null;
$('user-search').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const q = $('user-search').value.trim();
    const resultsEl = $('user-results');
    if (q.length < 2) { resultsEl.innerHTML = ''; return; }
    const data = await api(`/api/users?q=${encodeURIComponent(q)}`);
    resultsEl.innerHTML = '';
    if (data.users.length === 0) {
      resultsEl.innerHTML = '<div class="user-result-sub" style="padding:8px">Niemanden gefunden.</div>';
      return;
    }
    for (const user of data.users) {
      const row = document.createElement('div');
      row.className = 'user-result';
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = initials(user.displayName);
      const info = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'user-result-name';
      name.textContent = user.displayName;
      const sub = document.createElement('div');
      sub.className = 'user-result-sub';
      sub.textContent = `@${user.username} · ${langLabel(user.language)}`;
      info.append(name, sub);
      row.append(avatar, info);
      row.addEventListener('click', () => {
        $('modal-new-chat').classList.add('hidden');
        openChat(user);
      });
      resultsEl.appendChild(row);
    }
  }, 250);
});

$('btn-settings').addEventListener('click', () => {
  $('settings-displayname').value = state.me.displayName;
  fillLanguageSelect($('settings-language'), state.me.language);
  $('modal-settings').classList.remove('hidden');
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
  $('modal-settings').classList.add('hidden');
  // Chatliste und offenen Chat in der neuen Sprache neu laden.
  await loadChats();
  if (state.activePeer) openChat(state.activePeer);
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
