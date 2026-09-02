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
hell + dunkel. Richtung vom Nutzer gepinnt (Apple-lastig, Hauch Snapchat) —
kein Seed-Roll, Brief schlägt Würfel.

## Direction contract

THESIS: Ein Messenger, der sich wie eine native Apple-App anfühlt — die
Übersetzung verschwindet in Selbstverständlichkeit. Verweigert wird der
WhatsApp-Klon in Grün wie jede Web-App-Anmutung mit dekorativen Karten.

OWN-WORLD: SF-Systemstack; iOS-Systempalette (systemBlue #007AFF/#0A84FF als
einziger Akzent, systemGray6-Gründe, Hairlines rgba(60,60,67,.29)); iMessage-
Bubbles 18px, Blau aus/Grau ein; translucente Bars (blur+saturate); stroked
SVG-Icons in SF-Symbols-Anmutung; Avatare mit personengebundenem Farbverlauf
(Snapchat-Hauch); Light + Dark.

STORY: Öffnen → „Chats" als Large Title → schreiben in eigener Sprache, lesen
in eigener Sprache; unter der letzten eigenen Nachricht „Zugestellt/Gelesen";
Kontakt entsteht nur über die teilbare User-ID in den Einstellungen.

FIRST VIEWPORT: Links Chatliste mit Large Title „Chats", Compose-Icon oben
rechts; rechts Konversation: zentrierter translucenter Header (Name + Status),
Bubble-Verlauf, unten Eingabe-Pille mit blauem Pfeil-Kreis. Mobil: Liste
vollflächig, Konversation schiebt sich darüber.

FORM: iOS-native App-Grammatik (brief-pinned; Platz 1 ohne Roll — Nutzer hat
die Richtung festgelegt; kein Seed-Key, Substitution wegen autonomer Session).

SIGNATURE INTERACTION: Senden — die Bubble löst sich mit Feder-Ease aus der
Eingabe-Pille nach oben; Sheets gleiten iOS-typisch von unten auf.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance
