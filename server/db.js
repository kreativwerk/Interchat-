'use strict';

const { DatabaseSync } = require('node:sqlite');
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
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id    INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    text         TEXT NOT NULL,
    lang         TEXT NOT NULL,
    created_at   INTEGER NOT NULL,
    delivered_at INTEGER,
    read_at      INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_messages_pair
    ON messages (sender_id, recipient_id, id);
  CREATE INDEX IF NOT EXISTS idx_messages_recipient
    ON messages (recipient_id, read_at);

  CREATE TABLE IF NOT EXISTS translations (
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    lang       TEXT NOT NULL,
    text       TEXT NOT NULL,
    provider   TEXT NOT NULL,
    PRIMARY KEY (message_id, lang)
  );
`);

module.exports = { db, dataDir };
