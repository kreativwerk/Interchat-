'use strict';

const { db } = require('./db');

// Übersetzungs-Provider in Prioritätsreihenfolge:
//   1. DeepL          – wenn DEEPL_API_KEY gesetzt ist (beste Qualität)
//   2. LibreTranslate – wenn LIBRETRANSLATE_URL gesetzt ist (selbst gehostet)
//   3. MyMemory       – kostenlos, ohne API-Key (Standard / Fallback)

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || '';
const LIBRETRANSLATE_URL = (process.env.LIBRETRANSLATE_URL || '').replace(/\/+$/, '');
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY || '';

// In-Memory-Cache für Übersetzungen, die (noch) keiner Nachricht zugeordnet sind.
const memoryCache = new Map();
const MEMORY_CACHE_MAX = 5000;

function cacheKey(text, from, to) {
  return `${from}|${to}|${text}`;
}

async function deeplTranslate(text, from, to) {
  const host = DEEPL_API_KEY.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
  const res = await fetch(`https://${host}/v2/translate`, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: from.toUpperCase(),
      target_lang: to.toUpperCase(),
    }),
  });
  if (!res.ok) throw new Error(`DeepL HTTP ${res.status}`);
  const data = await res.json();
  const out = data?.translations?.[0]?.text;
  if (!out) throw new Error('DeepL: leere Antwort');
  return out;
}

async function libreTranslate(text, from, to) {
  const res = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: from,
      target: to,
      format: 'text',
      ...(LIBRETRANSLATE_API_KEY ? { api_key: LIBRETRANSLATE_API_KEY } : {}),
    }),
  });
  if (!res.ok) throw new Error(`LibreTranslate HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.translatedText) throw new Error('LibreTranslate: leere Antwort');
  return data.translatedText;
}

// MyMemory erlaubt max. ~500 Zeichen pro Anfrage – lange Texte werden
// an Satzgrenzen aufgeteilt und stückweise übersetzt.
const MYMEMORY_CHUNK = 450;

// Erwartete Schrift pro Zielsprache – schützt vor fehlerhaften
// Translation-Memory-Einträgen in falscher Sprache/Schrift.
const SCRIPT_RANGES = {
  arabic: /[؀-ۿ]/,
  cyrillic: /[Ѐ-ӿ]/,
  greek: /[Ͱ-Ͽ]/,
  devanagari: /[ऀ-ॿ]/,
  cjk: /[぀-ヿ一-鿿]/,
  hangul: /[가-힯ᄀ-ᇿ]/,
  thai: /[฀-๿]/,
  latin: /[A-Za-zÀ-ɏ]/,
};

const LANG_SCRIPT = {
  ar: 'arabic', ru: 'cyrillic', uk: 'cyrillic', el: 'greek', hi: 'devanagari',
  ja: 'cjk', zh: 'cjk', ko: 'hangul', th: 'thai',
};

function scriptPlausible(text, lang) {
  const letters = text.match(/\p{L}/gu);
  if (!letters || letters.length === 0) return true;
  const expected = SCRIPT_RANGES[LANG_SCRIPT[lang] || 'latin'];
  const hits = letters.filter((ch) => expected.test(ch)).length;
  return hits / letters.length >= 0.5;
}

function splitChunks(text, max) {
  if (text.length <= max) return [text];
  const parts = [];
  let rest = text;
  while (rest.length > max) {
    let cut = -1;
    for (const re of [/[.!?…]\s/g, /[,;:]\s/g, /\s/g]) {
      let m;
      while ((m = re.exec(rest)) && m.index + m[0].length <= max) cut = m.index + m[0].length;
      if (cut > 0) break;
    }
    if (cut <= 0) cut = max;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest) parts.push(rest);
  return parts;
}

async function myMemoryTranslate(text, from, to) {
  const chunks = splitChunks(text, MYMEMORY_CHUNK);
  const results = [];
  for (const chunk of chunks) {
    const url =
      'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(chunk) +
      '&langpair=' +
      encodeURIComponent(`${from}|${to}`);
    // Rate-Limit (429) mit kurzem Backoff abfangen, statt sofort aufzugeben.
    let res;
    for (let attempt = 0; ; attempt++) {
      res = await fetch(url);
      if (res.status !== 429 || attempt >= 2) break;
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    }
    if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
    const data = await res.json();
    let out = data?.responseData?.translatedText;
    if (data?.responseStatus !== 200 || !out) {
      throw new Error(`MyMemory: ${data?.responseDetails || 'leere Antwort'}`);
    }
    // Fehlerhafte Translation-Memory-Treffer (falsche Sprache/Schrift)
    // aussortieren und stattdessen den Maschinenübersetzungs-Match nehmen.
    if (!scriptPlausible(out, to) && Array.isArray(data.matches)) {
      const alt = data.matches
        .filter((m) => m?.translation && scriptPlausible(m.translation, to))
        .sort((a, b) => (b['created-by'] === 'MT!') - (a['created-by'] === 'MT!'))[0];
      if (alt) out = alt.translation;
    }
    if (!scriptPlausible(out, to)) {
      throw new Error('MyMemory: Ergebnis passt nicht zur Zielsprache');
    }
    results.push(out);
  }
  return results.join(' ').replace(/\s+/g, ' ').trim();
}

async function translateRaw(text, from, to) {
  if (DEEPL_API_KEY) {
    try {
      return { text: await deeplTranslate(text, from, to), provider: 'deepl' };
    } catch (err) {
      console.warn('DeepL fehlgeschlagen, Fallback:', err.message);
    }
  }
  if (LIBRETRANSLATE_URL) {
    try {
      return { text: await libreTranslate(text, from, to), provider: 'libretranslate' };
    } catch (err) {
      console.warn('LibreTranslate fehlgeschlagen, Fallback:', err.message);
    }
  }
  return { text: await myMemoryTranslate(text, from, to), provider: 'mymemory' };
}

// Persistenter Text-Cache: identische Phrasen (z. B. „Hallo", „Danke") werden
// pro Sprachpaar nur ein einziges Mal beim Provider angefragt.
db.exec(`
  CREATE TABLE IF NOT EXISTS translation_cache (
    src_lang   TEXT NOT NULL,
    dst_lang   TEXT NOT NULL,
    text       TEXT NOT NULL,
    translated TEXT NOT NULL,
    provider   TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (src_lang, dst_lang, text)
  )
`);
const getCachedText = db.prepare(
  'SELECT translated, provider FROM translation_cache WHERE src_lang = ? AND dst_lang = ? AND text = ?'
);
const storeCachedText = db.prepare(
  'INSERT OR IGNORE INTO translation_cache (src_lang, dst_lang, text, translated, provider, created_at) VALUES (?, ?, ?, ?, ?, ?)'
);

const getStoredTranslation = db.prepare(
  'SELECT text FROM translations WHERE message_id = ? AND lang = ?'
);
const storeTranslation = db.prepare(
  'INSERT OR IGNORE INTO translations (message_id, lang, text, provider) VALUES (?, ?, ?, ?)'
);

/**
 * Übersetzt einen Nachrichtentext in die Zielsprache.
 * Gibt { text, translated, failed } zurück. Bei gleicher Sprache oder
 * Fehler kommt der Originaltext zurück, damit nie eine Nachricht verloren geht.
 * Mit messageId werden Übersetzungen dauerhaft in der DB gecacht.
 */
async function translateMessage({ messageId = null, text, from, to }) {
  const src = String(from || '').toLowerCase();
  const dst = String(to || '').toLowerCase();
  if (!text.trim() || !src || !dst || src === dst) {
    return { text, translated: false, failed: false };
  }

  if (messageId != null) {
    const row = getStoredTranslation.get(messageId, dst);
    if (row) return { text: row.text, translated: true, failed: false };
  }
  const key = cacheKey(text, src, dst);
  if (memoryCache.has(key)) {
    const cached = memoryCache.get(key);
    if (messageId != null) storeTranslation.run(messageId, dst, cached.text, cached.provider);
    return { text: cached.text, translated: true, failed: false };
  }
  const persisted = getCachedText.get(src, dst, text);
  if (persisted) {
    memoryCache.set(key, { text: persisted.translated, provider: persisted.provider });
    if (messageId != null) storeTranslation.run(messageId, dst, persisted.translated, persisted.provider);
    return { text: persisted.translated, translated: true, failed: false };
  }

  try {
    const result = await translateRaw(text, src, dst);
    if (memoryCache.size >= MEMORY_CACHE_MAX) {
      memoryCache.delete(memoryCache.keys().next().value);
    }
    memoryCache.set(key, result);
    storeCachedText.run(src, dst, text, result.text, result.provider, Date.now());
    if (messageId != null) storeTranslation.run(messageId, dst, result.text, result.provider);
    return { text: result.text, translated: true, failed: false };
  } catch (err) {
    console.warn(`Übersetzung ${src}->${dst} fehlgeschlagen:`, err.message);
    return { text, translated: false, failed: true };
  }
}

module.exports = { translateMessage };
