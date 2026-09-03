---
version: 1
slug: "public-index-html"
primary_target: "public/index.html"
related_targets: ["public/app.js","public/style.css"]
---

# Surface: InterChat App-Shell (public/index.html)

Scope: gesamte SPA (Auth, Chatliste, Konversation, Sheets). Mode: Operate.
Audience: private Nutzer über Sprachgrenzen; Job: lesen/antworten/Kontakte per
User-ID hinzufügen/Gruppen führen. Constraints: kein Build-Schritt, Deutsch,
nur dunkel. Richtung vom Nutzer gepinnt („Supabase-Design, dunkel, Supabase-
Grün-Akzent mit Transparenzen") — Brief schlägt Würfel, kein Seed-Roll.
Ersetzt die Apple-Welt v1 (Redesign: Produktwahrheit, Funktion, Copy bleiben).

## Direction contract

THESIS: Ein Messenger, der wie ein Supabase-Dashboard aussieht — Entwickler-
Werkzeug-Ruhe in Dunkel, ein einziger grüner Akzent, Glas statt Farbe.
Verweigert werden iMessage-Blau, bunte Bubbles und jede helle Variante.

OWN-WORLD: Gründe #121212/#181818/#1f1f1f; Borders rgba(255,255,255,.09/.14);
Akzent #3ECF8E (Hover #2fb87a), dunkler Text auf Grün; eigene Bubbles als
grün getöntes Glas (rgba(62,207,142,.14) + grüne Hairline), fremde als Weiß-
Glas (.05 + Hairline); Bars translucent (blur+saturate); Radien 6/8/12px;
SF/Inter-Systemstack, kompakt (14/15px); stroked SVG-Icons; Avatare als
dunkle Fläche mit personengebundenem Farbton; grüne Glows als Tiefe.

STORY: Öffnen → dunkle Shell mit grünem Glow → schreiben in eigener Sprache,
lesen in eigener; „Zugestellt/Gelesen" unter der letzten eigenen Nachricht;
Kontakt nur über die grüne ID-Karte in den Einstellungen.

FIRST VIEWPORT: Links Chatliste, Titel „Chats" mit grünem Compose-Icon;
rechts Konversation: zentrierter Glas-Header, Bubble-Verlauf auf #121212,
Eingabe-Pille mit Hairline, grüner Sende-Kreis. Mobil: Liste vollflächig,
Konversation darüber.

FORM: Supabase-Dashboard-Grammatik (brief-pinned; kein Seed-Key, autonome
Session).

SIGNATURE INTERACTION: Senden — Bubble löst sich per FLIP aus der Pille und
trägt kurz einen grünen Glow; Sheets gleiten von unten auf.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance
