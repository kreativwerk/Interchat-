'use strict';

const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'interchat.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    display_name  TEXT NOT NULL,
    language      TEXT NOT NULL DEFAULT 'en',
    user_code     TEXT UNIQUE,
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    name       TEXT,
    owner_id   INTEGER REFERENCES users(id),
    direct_key TEXT UNIQUE,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id   INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id           INTEGER NOT NULL REFERENCES users(id),
    joined_at         INTEGER NOT NULL,
    last_read_id      INTEGER NOT NULL DEFAULT 0,
    last_delivered_id INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (conversation_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_members_user ON conversation_members (user_id);

  CREATE TABLE IF NOT EXISTS messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       INTEGER NOT NULL REFERENCES users(id),
    text            TEXT NOT NULL,
    lang            TEXT NOT NULL,
    created_at      INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS translations (
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    lang       TEXT NOT NULL,
    text       TEXT NOT NULL,
    provider   TEXT NOT NULL,
    PRIMARY KEY (message_id, lang)
  );
`);

// User-Codes: kurz, gut vorlesbar, ohne verwechselbare Zeichen (0/O, 1/I/L).
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

function randomUserCode() {
  const bytes = crypto.randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    if (i === 3) out += '-';
  }
  return out;
}

function generateUniqueUserCode() {
  const check = db.prepare('SELECT 1 FROM users WHERE user_code = ?');
  for (;;) {
    const code = randomUserCode();
    if (!check.get(code)) return code;
  }
}

function directKey(a, b) {
  return `${Math.min(a, b)}:${Math.max(a, b)}`;
}

function tableColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
}

// Migration von Schema v1 (messages mit sender_id/recipient_id, Nutzer ohne
// user_code): 1:1-Verläufe werden in direct-Konversationen überführt.
function migrateLegacy() {
  if (!tableColumns('users').includes('user_code')) {
    db.exec('ALTER TABLE users ADD COLUMN user_code TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_code ON users (user_code)');
  }
  for (const user of db.prepare('SELECT id FROM users WHERE user_code IS NULL').all()) {
    db.prepare('UPDATE users SET user_code = ? WHERE id = ?')
      .run(generateUniqueUserCode(), user.id);
  }

  const legacyName = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'messages'")
    .get() && tableColumns('messages').includes('recipient_id') ? 'messages' : null;
  if (!legacyName) return;

  db.exec('BEGIN');
  try {
    db.exec('ALTER TABLE messages RENAME TO messages_v1');
    db.exec(`
      CREATE TABLE messages (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id       INTEGER NOT NULL REFERENCES users(id),
        text            TEXT NOT NULL,
        lang            TEXT NOT NULL,
        created_at      INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, id);
    `);

    const pairs = db.prepare(`
      SELECT DISTINCT MIN(sender_id, recipient_id) AS a, MAX(sender_id, recipient_id) AS b
      FROM messages_v1
    `).all();
    const insertConv = db.prepare(
      "INSERT INTO conversations (type, direct_key, created_at) VALUES ('direct', ?, ?)"
    );
    const insertMember = db.prepare(
      'INSERT INTO conversation_members (conversation_id, user_id, joined_at) VALUES (?, ?, ?)'
    );
    const copyMessages = db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, text, lang, created_at)
      SELECT id, ?, sender_id, text, lang, created_at FROM messages_v1
      WHERE MIN(sender_id, recipient_id) = ? AND MAX(sender_id, recipient_id) = ?
    `);
    const now = Date.now();
    for (const { a, b } of pairs) {
      const convId = insertConv.run(directKey(a, b), now).lastInsertRowid;
      insertMember.run(convId, a, now);
      insertMember.run(convId, b, now);
      copyMessages.run(convId, a, b);
      // Zustell-/Lesestand konservativ aus v1 übernehmen: alles vor der
      // Migration gilt als zugestellt; gelesen bis zur letzten gelesenen.
      for (const [me, peer] of [[a, b], [b, a]]) {
        const read = db.prepare(`
          SELECT COALESCE(MAX(id), 0) AS m FROM messages_v1
          WHERE sender_id = ? AND recipient_id = ? AND read_at IS NOT NULL
        `).get(peer, me).m;
        const delivered = db.prepare(`
          SELECT COALESCE(MAX(id), 0) AS m FROM messages_v1
          WHERE sender_id = ? AND recipient_id = ? AND delivered_at IS NOT NULL
        `).get(peer, me).m;
        db.prepare(`
          UPDATE conversation_members SET last_read_id = ?, last_delivered_id = ?
          WHERE conversation_id = ? AND user_id = ?
        `).run(read, Math.max(read, delivered), convId, me);
      }
    }
    db.exec('DROP TABLE messages_v1');
    db.exec('COMMIT');
    console.log(`Migration: ${pairs.length} Verlauf/Verläufe nach Schema v2 überführt.`);
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

migrateLegacy();

// Erst nach der Migration anlegen – die v1-Tabelle kannte conversation_id nicht.
db.exec('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, id)');

module.exports = { db, dataDir, generateUniqueUserCode, directKey };
