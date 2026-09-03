'use strict';
// End-to-End-Test: startet einen eigenen Server auf einem Testport mit
// frischer Datenbank und prüft Kontakt per User-ID, Direkt- und Gruppenchat,
// Übersetzung sowie Zugestellt-/Gelesen-Status.
//
//   npm run test:e2e
//
// Hinweis: nutzt die kostenlose MyMemory-API, braucht also Internetzugang.

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { io } = require('socket.io-client');

const PORT = Number(process.env.E2E_PORT || 3100);
const BASE = `http://localhost:${PORT}`;

async function api(p, opts = {}, token) {
  const res = await fetch(BASE + p, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${p}: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

const connect = (token) => new Promise((resolve, reject) => {
  const s = io(BASE, { auth: { token } });
  s.on('connect', () => resolve(s));
  s.on('connect_error', reject);
});

const send = (socket, conversationId, text) =>
  new Promise((resolve) => socket.emit('message:send', { conversationId, text }, resolve));

const once = (socket, event, filter = () => true) =>
  new Promise((resolve) => {
    const handler = (payload) => {
      if (!filter(payload)) return;
      socket.off(event, handler);
      resolve(payload);
    };
    socket.on(event, handler);
  });

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return;
    } catch { /* Server startet noch */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Server nicht erreichbar');
}

async function run() {
  const suffix = Date.now().toString(36);
  // Sätze pro Lauf variieren – MyMemory drosselt wiederholte identische Segmente.
  const n = 10 + (Date.now() % 50);
  const reg = (u, lang, name) => api('/api/register', {
    method: 'POST',
    body: JSON.stringify({ username: `${u}_${suffix}`, password: 'geheim123', displayName: name, language: lang }),
  });

  const anna = await reg('anna', 'de', 'Anna');
  const bob = await reg('bob', 'en', 'Bob');
  const carla = await reg('carla', 'es', 'Carla');
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(anna.user.userCode)) throw new Error('User-Code-Format: ' + anna.user.userCode);
  console.log('✔ Registrierung mit User-IDs');

  const searchGone = await fetch(`${BASE}/api/users?q=anna`, { headers: { Authorization: `Bearer ${anna.token}` } });
  if (searchGone.status !== 404) throw new Error('Öffentliche Nutzersuche existiert noch');
  console.log('✔ Keine öffentliche Nutzersuche (Kontakt nur per ID)');

  const messy = bob.user.userCode.toLowerCase().replace('-', '');
  const lookup = await api('/api/contacts/lookup', { method: 'POST', body: JSON.stringify({ code: messy }) }, anna.token);
  if (lookup.user.id !== bob.user.id) throw new Error('Lookup liefert falschen Nutzer');
  console.log('✔ Kontakt per ID auflösbar (format-tolerant)');

  const sAnna = await connect(anna.token);
  const sBob = await connect(bob.token);
  const sCarla = await connect(carla.token);

  // Direktchat
  const direct = (await api('/api/conversations', {
    method: 'POST', body: JSON.stringify({ type: 'direct', code: bob.user.userCode }),
  }, anna.token)).conversation;

  const bobGets = once(sBob, 'message:new');
  const ack = await send(sAnna, direct.id, `Hallo Bob, wie geht es dir heute um ${n} Uhr?`);
  if (ack.error) throw new Error('send: ' + ack.error);
  const bobMsg = (await bobGets).message;
  if (!bobMsg.translation?.translated) throw new Error('Direktnachricht nicht übersetzt');
  console.log('✔ Direkt: automatisch übersetzt →', bobMsg.translation.text);

  const readEvt = once(sAnna, 'conversation:status', (p) => p.conversationId === direct.id && p.readUpTo >= bobMsg.id);
  sBob.emit('messages:read', { conversationId: direct.id });
  await readEvt;
  const histA = await api(`/api/conversations/${direct.id}/messages`, {}, anna.token);
  if (histA.messages.at(-1).status !== 'read') throw new Error('Status nicht read');
  console.log('✔ Direkt: Gesendet → Zugestellt → Gelesen');

  const again = (await api('/api/conversations', {
    method: 'POST', body: JSON.stringify({ type: 'direct', code: bob.user.userCode }),
  }, anna.token)).conversation;
  if (again.id !== direct.id) throw new Error('Direktchat dupliziert');
  console.log('✔ Direktchat idempotent');

  // Gruppenchat
  const group = (await api('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ type: 'group', name: 'Urlaubsplanung', codes: [bob.user.userCode, carla.user.userCode] }),
  }, anna.token)).conversation;
  if (group.members.length !== 3) throw new Error('Mitgliederzahl falsch');

  const bobGroup = once(sBob, 'message:new', (p) => p.message.conversationId === group.id);
  const carlaGroup = once(sCarla, 'message:new', (p) => p.message.conversationId === group.id);
  await send(sAnna, group.id, `Lasst uns in ${n} Tagen ans Meer fahren!`);
  const [bg, cg] = await Promise.all([bobGroup, carlaGroup]);
  if (!bg.message.translation?.translated || !cg.message.translation?.translated) throw new Error('Gruppen-Übersetzung fehlt');
  if (bg.message.senderName !== 'Anna') throw new Error('senderName fehlt');
  console.log('✔ Gruppe: en →', bg.message.translation.text);
  console.log('✔ Gruppe: es →', cg.message.translation.text);

  sBob.emit('messages:read', { conversationId: group.id });
  await new Promise((r) => setTimeout(r, 300));
  let hist = await api(`/api/conversations/${group.id}/messages`, {}, anna.token);
  if (hist.messages.at(-1).status === 'read') throw new Error('read zu früh (nicht alle haben gelesen)');
  const allRead = once(sAnna, 'conversation:status', (p) => p.conversationId === group.id && p.readUpTo >= bg.message.id);
  sCarla.emit('messages:read', { conversationId: group.id });
  await allRead;
  hist = await api(`/api/conversations/${group.id}/messages`, {}, anna.token);
  if (hist.messages.at(-1).status !== 'read') throw new Error('read fehlt, obwohl alle gelesen haben');
  console.log('✔ Gruppe: „Gelesen" erst, wenn alle gelesen haben');

  // Mitglied nachträglich per ID hinzufügen
  const dora = await reg('dora', 'fr', 'Dora');
  await api(`/api/conversations/${group.id}/members`, {
    method: 'POST', body: JSON.stringify({ code: dora.user.userCode }),
  }, anna.token);
  const histD = await api(`/api/conversations/${group.id}/messages`, {}, dora.token);
  if (!histD.messages.at(-1)) throw new Error('Neues Mitglied sieht keinen Verlauf');
  console.log('✔ Mitglied per ID hinzugefügt, liest Verlauf übersetzt →', histD.messages[0].translation?.text);

  const chats = await api('/api/chats', {}, anna.token);
  if (chats.chats.length !== 2) throw new Error('Chatliste falsch');
  console.log('✔ Chatliste: ' + chats.chats.map((c) => c.title).join(' | '));

  sAnna.close(); sBob.close(); sCarla.close();
}

(async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'interchat-e2e-'));
  const serverProcess = spawn(process.execPath, [path.join(__dirname, '..', 'server', 'index.js')], {
    env: { ...process.env, PORT: String(PORT), DATA_DIR: dataDir },
    stdio: 'inherit',
  });
  try {
    await waitForServer();
    await run();
    console.log('\nALLE TESTS BESTANDEN ✅');
  } finally {
    serverProcess.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error('❌ TEST FEHLGESCHLAGEN:', err.message);
  process.exit(1);
});
