# InterChat

Ein Messenger mit **automatischer Übersetzung** – im Apple-lastigen Design.

Jeder Nutzer stellt einmal seine Sprache ein und schreibt einfach in seiner
eigenen Sprache. Jeder Empfänger – auch in Gruppen – bekommt jede Nachricht
**automatisch in seine Sprache übersetzt** und kann jederzeit per Tipp den
Originaltext einblenden.

## Funktionen

- **Echtzeit-Chat** (1:1 und **Gruppen**) über WebSockets (Socket.IO)
- **Automatische Übersetzung** jeder Nachricht in die Sprache des jeweiligen
  Empfängers (27 Sprachen); „Original anzeigen“ in jeder übersetzten Nachricht
- **Kontaktaufnahme nur per InterChat-ID** (à la Snapchat): Jeder findet seine
  teilbare ID in den Einstellungen – es gibt bewusst keine öffentliche
  Nutzersuche. Nur wer deine ID kennt, kann dir schreiben.
- **Gruppenchats**: per ID Mitglieder einladen, jedes Mitglied liest in seiner
  Sprache; „Zugestellt/Gelesen“ erst, wenn *alle* Mitglieder so weit sind
- Status im Stil von Apple Nachrichten („Zugestellt“/„Gelesen“ unter der
  letzten eigenen Nachricht), Tipp-Anzeige, Online-Status, Ungelesen-Zähler
- Registrierung/Login (bcrypt + JWT), Sprache jederzeit änderbar –
  der Verlauf wird beim nächsten Öffnen in die neue Sprache übersetzt
- **Apple-lastige Oberfläche**: iOS-Systempalette, iMessage-Bubbles,
  translucente Bars, Sheets, heller **und** dunkler Modus, responsiv
- Persistenz per SQLite (in Node.js eingebaut, keine extra Datenbank nötig)

## Schnellstart

Voraussetzung: **Node.js ≥ 22.5**

```bash
npm install
npm start
```

Dann im Browser öffnen: **http://localhost:3000**

Zum Ausprobieren zwei Konten in zwei Browsern/Profilen anlegen (z. B. einmal
Sprache *Deutsch*, einmal *Englisch*). Person B öffnet die Einstellungen
(Avatar oben links) und teilt ihre **InterChat-ID**; Person A startet mit ✎
einen neuen Chat und gibt diese ID ein. Für Gruppen: Tab „Gruppe“, Name
vergeben, Mitglieder per ID hinzufügen.

## Tests

```bash
npm run test:e2e
```

Startet einen eigenen Server mit frischer Datenbank und prüft Registrierung,
Kontakt per ID, Direkt- und Gruppenchat, Übersetzung in mehrere Sprachen und
die Zugestellt-/Gelesen-Logik. (Benötigt Internetzugang für die
Übersetzungs-API.)

## Übersetzungs-Provider

Funktioniert **ohne Konfiguration** sofort: Standardmäßig wird die kostenlose
[MyMemory-API](https://mymemory.translated.net/) genutzt (ohne API-Key, mit
Tageslimit – ausreichend zum Testen). Fehlerhafte Community-Treffer werden
über eine Schrift-Plausibilitätsprüfung aussortiert.

Für Produktivbetrieb/bessere Qualität per Umgebungsvariable umschaltbar:

| Variable | Wirkung |
|---|---|
| `DEEPL_API_KEY` | Nutzt [DeepL](https://www.deepl.com/pro-api) (beste Qualität; Free- und Pro-Keys werden erkannt) |
| `LIBRETRANSLATE_URL` (+ optional `LIBRETRANSLATE_API_KEY`) | Nutzt eine eigene [LibreTranslate](https://libretranslate.com/)-Instanz (selbst gehostet) |

Reihenfolge: DeepL → LibreTranslate → MyMemory (automatischer Fallback).
Übersetzungen werden pro Nachricht und Zielsprache in der Datenbank gecacht.
Schlägt die Übersetzung fehl, geht nichts verloren: Der Empfänger sieht den
Originaltext mit einem Hinweis.

## Weitere Umgebungsvariablen

| Variable | Standard | Beschreibung |
|---|---|---|
| `PORT` | `3000` | HTTP-Port |
| `DATA_DIR` | `./data` | Ablageort für SQLite-DB und JWT-Secret |
| `JWT_SECRET` | automatisch erzeugt | Secret für Login-Tokens |

## Architektur

```
server/
  index.js      Express + Socket.IO: API, Auth, Konversationen, Echtzeit
  db.js         SQLite-Schema v2 (Nutzer mit ID-Code, Konversationen,
                Mitglieder mit Zustell-/Lesestand, Übersetzungs-Cache)
                inkl. automatischer Migration von Schema v1
  translate.js  Übersetzungs-Service mit Provider-Kette und Cache
public/
  index.html    Single-Page-App ohne Build-Schritt (SVG-Icon-Sprite)
  app.js        Client-Logik (Chats, Gruppen, Sheets, Socket.IO)
  style.css     iOS-Designsprache, Light/Dark über prefers-color-scheme
scripts/
  e2e.js        End-to-End-Test (npm run test:e2e)
```

**Kernprinzip:** Jede Nachricht wird **einmal im Original** gespeichert
(Text + Sprache des Absenders). Übersetzt wird erst bei der Zustellung – in
die aktuell eingestellte Sprache des jeweiligen Empfängers, pro Zielsprache
genau einmal (Cache). In Gruppen gilt eine eigene Nachricht erst dann als
zugestellt/gelesen, wenn **alle** anderen Mitglieder sie erhalten/gelesen
haben.

Produkt- und Design-Entscheidungen sind in `PRODUCT.md` und
`.impeccable/surfaces/` dokumentiert.

## Roadmap-Ideen

- Bilder/Sprachnachrichten, Transkription + Übersetzung von Sprachnachrichten
- Push-Benachrichtigungen (PWA)
- Gruppen verwalten (umbenennen, verlassen im UI, Admin-Rollen)
- Ende-zu-Ende-Verschlüsselung (erfordert Übersetzung auf dem Endgerät)
