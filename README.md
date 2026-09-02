# InterChat 💬🌍

Ein Messenger im WhatsApp-Stil – mit **automatischer Übersetzung**.

Jeder Nutzer stellt einmal seine Sprache ein und schreibt einfach in seiner
eigenen Sprache. Der Empfänger bekommt jede Nachricht **automatisch in seine
Sprache übersetzt** – und kann jederzeit per Klick den Originaltext einblenden.

## Funktionen

- 💬 **Echtzeit-Chat** (1:1) über WebSockets (Socket.IO)
- 🌍 **Automatische Übersetzung** jeder Nachricht in die Sprache des Empfängers
  (27 Sprachen, u. a. Deutsch, Englisch, Türkisch, Polnisch, Arabisch, Ukrainisch …)
- 🔎 **„Original anzeigen“** – Umschalter in jeder übersetzten Nachricht
- ✓ / ✓✓ / ✓✓ (blau) – **Gesendet-, Zugestellt- und Gelesen-Häkchen** wie bei WhatsApp
- ✍️ **Tipp-Anzeige** („schreibt…“) und **Online-Status**
- 🔔 **Ungelesen-Zähler** in der Chatliste
- 👤 Registrierung/Login (Passwort-Hash mit bcrypt, JWT-Sessions)
- 🔁 Sprache jederzeit in den Einstellungen änderbar
- 📱 Responsives, mobilfreundliches WhatsApp-ähnliches Design
- 💾 Persistenz per SQLite (in Node.js eingebaut, keine extra Datenbank nötig)

## Schnellstart

Voraussetzung: **Node.js ≥ 22.5**

```bash
npm install
npm start
```

Dann im Browser öffnen: **http://localhost:3000**

Zum Ausprobieren einfach zwei Konten in zwei Browsern/Tabs anlegen
(z. B. einmal mit Sprache *Deutsch*, einmal mit *Englisch*), per ✏️ einen
Chat starten und losschreiben – jede Seite liest in ihrer eigenen Sprache.

## Übersetzungs-Provider

Es funktioniert **ohne Konfiguration** sofort: Standardmäßig wird die
kostenlose [MyMemory-API](https://mymemory.translated.net/) genutzt
(ohne API-Key, mit Tageslimit – ausreichend zum Testen).

Für Produktivbetrieb/bessere Qualität per Umgebungsvariable umschaltbar:

| Variable | Wirkung |
|---|---|
| `DEEPL_API_KEY` | Nutzt [DeepL](https://www.deepl.com/pro-api) (beste Qualität; Free- und Pro-Keys werden erkannt) |
| `LIBRETRANSLATE_URL` (+ optional `LIBRETRANSLATE_API_KEY`) | Nutzt eine eigene [LibreTranslate](https://libretranslate.com/)-Instanz (selbst gehostet, keine Datenweitergabe) |

Reihenfolge: DeepL → LibreTranslate → MyMemory (automatischer Fallback).
Übersetzungen werden pro Nachricht und Zielsprache in der Datenbank
gecacht – jede Übersetzung wird nur einmal bezahlt/angefragt.

Schlägt die Übersetzung fehl, geht nie etwas verloren: Der Empfänger sieht
dann den Originaltext mit einem Hinweis.

## Weitere Umgebungsvariablen

| Variable | Standard | Beschreibung |
|---|---|---|
| `PORT` | `3000` | HTTP-Port |
| `DATA_DIR` | `./data` | Ablageort für SQLite-DB und JWT-Secret |
| `JWT_SECRET` | automatisch erzeugt | Secret für Login-Tokens |

## Architektur

```
server/
  index.js      Express + Socket.IO: API, Auth, Echtzeit-Events
  db.js         SQLite-Schema (Nutzer, Nachrichten, Übersetzungs-Cache)
  translate.js  Übersetzungs-Service mit Provider-Kette und Cache
public/
  index.html    Single-Page-App (ohne Build-Schritt)
  app.js        Client-Logik (Chats, Nachrichten, Socket.IO)
  style.css     WhatsApp-ähnliches, responsives Design
```

**Kernprinzip:** Jede Nachricht wird **einmal im Original** gespeichert
(Text + Sprache des Absenders). Übersetzt wird erst bei der Zustellung –
in die aktuell eingestellte Sprache des jeweiligen Empfängers. Ändert ein
Nutzer seine Sprache, wird der Verlauf beim nächsten Öffnen automatisch in
die neue Sprache übersetzt.

## Roadmap-Ideen

- Gruppenchats (das Datenmodell „Original speichern, pro Leser übersetzen“ trägt das bereits)
- Bilder/Sprachnachrichten, Sprachnachrichten-Transkription + Übersetzung
- Push-Benachrichtigungen (PWA)
- Ende-zu-Ende-Verschlüsselung (erfordert Übersetzung auf dem Endgerät)
