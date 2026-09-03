---
name: InterChat
description: Messenger in Supabase-Designsprache – durchgehend dunkel, ein grüner Akzent, Glas statt Farbe.
colors:
  brand: "#3ecf8e"
  brand-hover: "#2fb87a"
  brand-deep: "#1f8a5b"
  on-brand: "#0b1f16"
  brand-tint: "rgba(62, 207, 142, 0.14)"
  brand-tint-strong: "rgba(62, 207, 142, 0.24)"
  brand-line: "rgba(62, 207, 142, 0.38)"
  brand-glow: "rgba(62, 207, 142, 0.28)"
  destructive: "#ff6b6b"
  bg: "#121212"
  panel: "#181818"
  panel-2: "#1f1f1f"
  panel-translucent: "rgba(24, 24, 24, 0.72)"
  glass: "rgba(255, 255, 255, 0.05)"
  glass-strong: "rgba(255, 255, 255, 0.09)"
  label: "#fafafa"
  secondary: "#a3a3a3"
  tertiary: "#939393"
  border: "rgba(255, 255, 255, 0.09)"
  border-strong: "rgba(255, 255, 255, 0.16)"
typography:
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "22px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  name:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
  ui:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "14px"
    fontWeight: 500
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "12px"
    fontWeight: 500
    fontVariation: "tabular-nums"
  mono:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "24px"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  badge: "10px"
  input-pill: "20px"
  pill: "999px"
  full: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  button-primary-disabled:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.tertiary}"
  button-tinted:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-tinted-hover:
    backgroundColor: "{colors.brand-tint-strong}"
  button-plain-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.destructive}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.sm}"
    padding: "7px"
  button-icon-hover:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.label}"
  button-icon-accent:
    textColor: "{colors.brand}"
  button-send:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.full}"
    size: "36px"
  input-grouped:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.label}"
    rounded: "{rounded.md}"
    padding: "11px 14px"
  input-grouped-focus:
    backgroundColor: "{colors.brand-tint}"
  input-composer:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.label}"
    typography: "{typography.body}"
    rounded: "{rounded.input-pill}"
    padding: "10px 16px"
  segmented:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.md}"
    padding: "3px"
  segment-active:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.label}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
  chat-item:
    backgroundColor: "transparent"
    rounded: "{rounded.md}"
    padding: "9px 10px"
  chat-item-hover:
    backgroundColor: "{colors.glass}"
  chat-item-active:
    backgroundColor: "{colors.brand-tint}"
  bubble-in:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.label}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "9px 13px"
  bubble-out:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.label}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "9px 13px"
  chip-member:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand}"
    rounded: "{rounded.pill}"
    padding: "4px 6px 4px 12px"
  badge-unread:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.badge}"
    height: "20px"
  avatar:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.brand}"
    rounded: "{rounded.full}"
    size: "40px"
  card-auth:
    backgroundColor: "{colors.panel-translucent}"
    rounded: "{rounded.lg}"
    padding: "32px 28px 28px"
  card-id:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.label}"
    rounded: "{rounded.lg}"
    padding: "16px"
  lookup-result:
    backgroundColor: "{colors.brand-tint}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  sheet:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.lg}"
    padding: "8px 20px 22px"
---

# Design System: InterChat

## Overview

**Creative North Star: "Das Dashboard, das flüstert"**

InterChat sieht aus wie ein Supabase-Dashboard, in dem zufällig Menschen miteinander reden: Entwickler-Werkzeug-Ruhe in Dunkel, eine einzige grüne Stimme, und Glas statt Farbe. Die Welt gibt es nur in einer Ausführung – `color-scheme: dark`, ohne hellen Modus –, und sie baut ihre gesamte Tiefe aus drei Graustufen (#121212 / #181818 / #1f1f1f) plus Transparenzen: Hairlines sind Weiß mit 9 % Deckung, Flächen sind Weiß mit 5 %, Bars sind 72 % Panel mit Blur und Sättigung. Nichts wird bemalt; alles wird getönt.

Supabase-Grün (#3ecf8e) ist der einzige Akzent und trägt drei Rollen zugleich: Handlung (Primär-Button, Sende-Kreis, Compose-Icon), Zugehörigkeit (eigene Bubbles als grün getöntes Glas, aktiver Listeneintrag, ID-Karte) und Signal (Präsenz-Dot, Tipp-Indikator, Fokus-Ring). Auf Grün steht immer dunkler Text (#0b1f16), nie Weiß. Tiefe entsteht nicht durch Schatten in der Shell, sondern durch weiche grüne Glows und radiale Grün-Schleier an den Rändern.

Ein Hauch Snapchat bleibt in der Identität: Die User-ID ist ein Objekt (Monospace, grüne Glas-Karte mit Glow) und Avatare tragen einen persönlichen, aus der ID gehashten Farbton – aber nur in Initialen und Ring, auf dunkler Fläche, nie als bunte Scheibe. Abgelehnt sind: iMessage-Blau, bunte Bubbles, jede helle Variante, gefüllte Glyph-Icons.

**Key Characteristics:**
- Nur dunkel, drei Gründe, Rest ist Transparenz (Hairline .09, Glas .05, Bar .72 + Blur).
- Ein Akzent (#3ecf8e) mit dunklem Text darauf; Rot (#ff6b6b) nur für Fehler und Abmelden.
- Glas-Bars (Header, Composer) schweben über dem einzigen Scroller, dem Nachrichtenstrom.
- Kompakter Inter-Satz (14 px UI, 15 px Nachrichten), negatives Tracking auf Titeln, Tabellenziffern auf Zeiten.
- Radien 6 / 8 / 12; runde Objekte (Avatar, Sende-Kreis, Dot) sind Kreise; Chips sind Pillen.
- Stroked SVG-Icon-Sprite (1.6–2.4 px Strich, `currentColor`), keine Glyphen, keine Emoji.
- Signatur-Bewegung: die Bubble löst sich per FLIP aus der Eingabe-Pille und glüht kurz grün; Sheets fahren von unten auf (mobil) oder poppen (Desktop); `prefers-reduced-motion` schaltet alles ab.

## Colors

Drei Graustufen als Boden, Weiß-Alpha als Material, ein Grün als Stimme, ein Rot als Warnung.

### Primary
- **Supabase-Grün** (`brand`): Die einzige Handlungsfarbe. Füllung von Primär-Button, Sende-Kreis, Unread-Badge und Präsenz-Dot; Textfarbe von Compose-Icon, Sprach-Select, „Original anzeigen“-Toggle, Tipp-Indikator und Avatar-Standardinitialen; Fokus-Outline und Caret.
- **Grün-Hover** (`brand-hover`): Hover-Füllung von Primär-Button und Sende-Kreis; Hover-Textfarbe des Original-Toggles.
- **Tiefgrün** (`brand-deep`): Randlinie (1 px) unter der grünen Füllung von Primär-Button und Sende-Kreis – gibt der Fläche eine Kante ohne Schatten.
- **Auf-Grün** (`on-brand`): Der dunkle Text auf jeder Grün-Fläche (Buttons, Badge). Weiß auf Grün kommt nicht vor.
- **Grün-Glas** (`brand-tint`): Eigene Bubbles, aktiver Listeneintrag, sekundärer Button, Member-Chip, Lookup-Treffer, ID-Karte, Fokus-Hintergrund gruppierter Inputs, Fokus-Halo des Composers (3 px). Das „Meins“ der Welt.
- **Grün-Glas stark** (`brand-tint-strong`): Hover der getönten Flächen und Textauswahl (`::selection`).
- **Grün-Hairline** (`brand-line`): Border aller grün getönten Flächen und des App-Icons.
- **Grün-Glow** (`brand-glow`): Weicher Schein hinter dem App-Icon (40 px), auf gehoverten Primär-Buttons (24 px) und Sende-Kreis (20 px), um den Präsenz-Dot (8 px) und im Sende-Höhepunkt der Bubble (28 px).

### Neutral
- **Grund** (`bg`): Body, App-Shell, Konversationsfläche. Der Nachrichtenstrom liegt direkt darauf.
- **Panel** (`panel`): Seitenleiste, Sheets, gruppierte Inputs, Composer-Pille, Ring des Präsenz-Dots.
- **Panel 2** (`panel-2`): Aktives Segment der Tab-Pille, Select-Optionen – eine Stufe heller als Panel, nie mehr.
- **Panel-Glas** (`panel-translucent`): Chat-Header, Composer, Auth-Karte und Composer-Fehler – immer mit `backdrop-filter: blur() saturate()`.
- **Glas** (`glass`): Fremde Bubbles, Tab-Pillen-Hintergrund, Hover von Listeneinträgen und Icon-Buttons, deaktivierte Buttons.
- **Glas stark** (`glass-strong`): Avatar-Standardfläche (wird per Skript vom persönlichen Farbton überschrieben).
- **Label** (`label`): Primärtext, Titel, Bubble-Text, ID-Code.
- **Sekundär** (`secondary`): Tagline, Vorschau, Hinweise, Status, Sender-Name, Divider-Label, Placeholder, Icon-Buttons im Ruhezustand, Original-Text.
- **Tertiär** (`tertiary`): Zeitstempel in der Liste, Select-Chevron, Empty-State-Icon, deaktivierter Button-Text. Nur eine Nuance unter Sekundär – für Elemente, die zurücktreten, aber nicht verschwinden.
- **Hairline** (`border`): Standard-Border von Karten, Bars, Bubbles, Divider-Linien, Trenner in gruppierten Inputs, Scrollbar-Thumb-Umfeld.
- **Hairline stark** (`border-strong`): Composer-Pille, Sheet-Rand, Avatar-Standardring, Segment-Aktiv-Ring, Sheet-Handle, Scrollbar-Thumb, Spinner-Bahn.
- **Destruktiv** (`destructive`): Fehlertexte, Composer-Fehler-Border (40 %), „Abmelden“-Button und dessen Hover (12 %).

### Named Rules
**Die Eine-Stimme-Regel.** Grün ist der einzige Akzent. Es gibt keinen zweiten Farbton für Info, Warnung oder Sekundärhandlungen; Rot erscheint nur für Fehler und Abmelden. Was nicht grün ist, ist grau oder Glas.

**Die Dunkel-auf-Grün-Regel.** Auf gefülltem Grün steht immer `on-brand` (#0b1f16), nie Weiß. Grüner Text steht nur auf dunklem Grund oder grünem Glas.

**Die Hairline-Regel.** Kanten entstehen aus Weiß-Alpha (.09 Standard, .16 betont), nie aus einer opaken Graustufe. Grün getönte Flächen bekommen die grüne Hairline (.38).

**Die Grün-ist-Signal-Regel.** Präsenz-Dot, Tipp-Punkte, „tippt …“-Status und die tippende Listenvorschau sind grün. Grün als Zustand bedeutet: hier passiert gerade etwas.

## Typography

**Display/Body Font:** Inter (selbst gehostet, variable woff2 400–700, OFL) mit Systemstack-Fallback (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif)
**Label/Mono Font:** ui-monospace, SF Mono, Menlo, Consolas – nur für den ID-Code

**Character:** Kompakter Werkzeug-Satz. Eine Familie, eine Achse (Gewicht 400–600), Titel mit leicht negativem Tracking, alles knapp gesetzt; der Monospace-Code ist der einzige typografische Fremdkörper und genau deshalb das Identitätsobjekt.

### Hierarchy
- **Headline** (600, 22 px, −0.02 em): Listentitel „Chats“ (Klasse `.large-title` – Apple-Name, Supabase-Maß). Verwandte: Auth-Titel (24 px), Placeholder-Titel (20 px, −0.01 em).
- **Title** (600, 17 px, −0.01 em): Sheet-Überschriften, Profilname in den Einstellungen.
- **Name** (600, 15 px, −0.01 em): Peer-Name im Header; Listen-Name 14.5 px; Lookup-Name 14.5 px.
- **Body** (400, 15 px, 1.4): Nachrichtentext in Bubbles und Composer-Eingabe. Bubbles laufen maximal `min(72%, 520px)` breit (mobil 84 %).
- **UI** (500, 14 px): Grundgröße von `html` (14 px); Buttons, Inputs, Segment-Labels (13 px), Vorschau (13 px), Hinweise (13 px), Tagline.
- **Label** (500, 12 px, `tabular-nums`): Zeit-Divider, Listen-Zeitstempel, Status „Zugestellt/Gelesen“, Sender-Name, Original-Toggle, Peer-Status (12.5 px), Unread-Badge (11.5 px, 600).
- **Mono** (600, 24 px, +0.08 em): ausschließlich der InterChat-ID-Code, `user-select: all`.

### Named Rules
**Die Kompakt-Regel.** 14 px ist die Grundgröße, 15 px ist für das, was gelesen wird (Nachrichten, Eingabe). Nichts in der Shell wird größer als 24 px.

**Die Tabellenziffern-Regel.** Jede Zeit- und Zahlenangabe (Divider, Listen-Zeit, Badge) trägt `font-variant-numeric: tabular-nums`.

**Die Ein-Fremdkörper-Regel.** Monospace erscheint nur für die ID. Kein zweiter Code-Kontext, kein Monospace für Zeiten oder Status.

## Layout

Zwei-Spalten-Shell auf `100dvh`, maximal 1440 px breit, zentriert, `overflow: hidden` – die Shell scrollt nie. Links die Seitenleiste (360 px, min. 300 px, Panel-Grund, Hairline rechts), rechts die Konversation (flex 1, Grund #121212). Innerhalb der Konversation gibt es genau einen Scroller: der Nachrichtenstrom (`.messages`), mit `padding: 72px 16px calc(84px + safe-area)` – Platz für die absolut positionierten Glas-Bars oben (Header, min. 56 px) und unten (Composer). Bubbles und Glow laufen unter beiden Bars hindurch.

Rhythmus auf 4-px-Basis mit den beobachteten Stufen 4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 28 / 32. Listen-Einträge sind 9 × 10 px gepolstert mit 12 px Lücke zum Avatar; Bubbles stehen 3 px auseinander (2 px innerhalb einer Serie, 10 px beim Sprecherwechsel); Sheets stapeln ihre Kinder mit 14 px; Formulare mit 14 px. Der Composer sitzt auf `env(safe-area-inset-bottom)`.

**Breakpoint 760 px.** Darunter stapelt die Shell: Seitenleiste vollflächig, Konversation ausgeblendet; `.app.mobile-chat-open` tauscht beides, der Zurück-Button (Chevron, grün) erscheint links im Header, der Placeholder verschwindet, Bubbles dürfen 84 % breit werden. Ab 761 px ist die Konversation immer sichtbar und Sheets werden zu zentrierten Dialogen (max. 430 px, 24 px Rand zum Viewport).

Sheets sind auf beiden Größen 430 px breit und höchstens 86 dvh hoch (intern scrollend); die Auth-Karte 380 px.

## Elevation & Depth

Hybrid aus tonaler Schichtung und Glas. In der Shell selbst gibt es keine Schatten: Tiefe entsteht durch die drei Gründe (#121212 → #181818 → #1f1f1f), durch Weiß-Alpha-Flächen und durch Glas-Bars, die den Nachrichtenstrom mit `blur(18px) saturate(1.4)` unter sich hindurchscheinen lassen. Grün ist die zweite Tiefenquelle: radiale Grün-Schleier sitzen am oberen Rand der Auth-Ansicht (18 %), in der Ecke des Listen-Headers (8 %), hinter dem Placeholder (8 %) und am unteren Rand des Nachrichtenstroms (6 %) – die Welt hat Licht, und das Licht ist grün.

Klassische Schatten tragen nur Objekte, die die Ebene verlassen: Sheets, Pop-Dialoge, die Auth-Karte. Glows tragen Objekte, die Aufmerksamkeit erhalten: App-Icon, gehoverte Grün-Buttons, Präsenz-Dot, ID-Karte, die frisch gesendete Bubble.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.6)`): Bottom-Sheet auf Mobil – Schatten nach oben, weil das Sheet von unten kommt.
- **Pop** (`box-shadow: 0 18px 56px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border)`): Desktop-Dialog; die 1-px-Hairline im Schatten ersetzt eine sichtbare Kante.
- **Auth-Karte** (`box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5)`): Einzige schwebende Karte außerhalb der Shell.
- **Glow** (`box-shadow: 0 0 40px var(--brand-glow)`, 20–28 px für Buttons/Bubble, 8 px für den Dot): Grünes Leuchten als Tiefe – nie ein Versatz, immer zentriert.
- **ID-Karte** (`box-shadow: 0 0 40px rgba(62, 207, 142, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.06)`): Leiser Glow plus Glas-Kante innen.

### Named Rules
**Die Glas-über-Strom-Regel.** Header und Composer sind translucente Bars (`panel-translucent` + `blur(18px) saturate(1.4)`) und liegen absolut über dem einzigen Scroller. Der Inhalt scheint hindurch; die Bars werfen keinen Schatten.

**Die Kein-Versatz-Regel.** Schatten mit Versatz gibt es nur bei Sheets, Pop-Dialogen und der Auth-Karte. Alles innerhalb der Shell ist flach oder glüht.

**Die Grünes-Licht-Regel.** Radiale Grün-Schleier (6–18 %) sind das Umgebungslicht der Welt. Sie sitzen an Rändern und Ecken, nie in der Mitte einer Lesefläche.

## Shapes

Drei Arbeitsradien, klar nach Größe verteilt: **6 px** für alles Interaktive (Buttons, Icon-Buttons, Segment-Aktiv), **8 px** für Container, die Inhalte gruppieren (gruppierte Inputs, Tab-Pille, Listeneintrag, Lookup-Treffer, Composer-Fehler), **12 px** für Flächen, die Raum sind (Bubbles, Sheets, Auth-Karte, ID-Karte, App-Icon). Runde Objekte sind echte Kreise (Avatare, Sende-Kreis, Präsenz-Dot, Tipp-Punkte, Chip-Schließen), Chips sind 999-px-Pillen, die Composer-Eingabe ist eine 20-px-Pille, das Unread-Badge eine 10-px-Kapsel.

Bubbles haben eine 4-px-Ecke an der Seite, aus der sie kommen (unten links für fremde, unten rechts für eigene) – der einzige asymmetrische Radius im System. Kanten sind immer 1-px-Hairlines aus Alpha, nie stärker; Bottom-Sheets lassen die untere Kante weg und tragen oben einen 36 × 4 px Handle. Icons sind stroked, 1.6–2.4 px Strich, runde Kappen, 24-Grid, `currentColor`.

**Die 6/8/12-Regel.** Interaktiv 6, gruppierend 8, raumgebend 12. Kein Wert dazwischen, kein Wert darüber außer Kreisen und Pillen.

## Components

### Buttons
Ruhig, flächig, mit Kante statt Schatten. Alle Buttons teilen Inter 500 / 14 px, `padding: 10px 14px`, 1-px-Border und 6-px-Radius; Zustandswechsel in 0.15 s ease-out.
- **Primär** (`btn-filled`): Grün-Füllung, dunkler Text, Tiefgrün-Border. Hover: Grün-Hover-Füllung + 24-px-Glow. Active: `scale(0.985)`. Disabled: Glas-Fläche, tertiärer Text, Hairline.
- **Getönt** (`btn-tinted`): Grün-Glas mit grünem Text und grüner Hairline; Hover Grün-Glas stark. Sekundäre Handlung (Empty-State, „Kopieren“). Kompakt-Variante `btn-compact`: `padding: 6px 10px`, 13 px, auto-breit.
- **Plain destruktiv** (`btn-plain.destructive`): Kein Hintergrund, roter Text; Hover 12 % Rot-Glas. Nur „Abmelden“.
- **Icon-Button** (`icon-btn`): 7 px Polster, transparent, sekundärer Icon-Ton; Hover Glas + Hairline + Label-Ton. `.accent`: grünes Icon, Hover Grün-Glas + Grün-Hairline (Compose, Zurück, Mitglied hinzufügen, Plus).
- **Sende-Kreis** (`send-btn`): 36 px Kreis, Grün-Füllung, Tiefgrün-Border, Pfeil-nach-oben 18 px. Hover Glow 20 px, Active `scale(0.92)`, Disabled Glas.
- **Fokus:** systemweit `outline: 2px solid var(--brand)`, Offset 2 px, Radius 4 px; Listeneinträge ziehen den Ring nach innen (−2 px).

### Segmented Control
Supabase-Tab-Pille: Glas-Fläche mit Hairline, 8-px-Radius, 3 px Innenabstand. Segmente sind 6-px-Radius, 13 px / 500, sekundärer Text; Hover Label-Ton; Aktiv Panel-2-Füllung mit 1-px-Ring aus Hairline stark. Rolle: Anmelden/Registrieren, Direkt/Gruppe.

### Inputs / Fields
- **Gruppierte Inputs** (`grouped`): Panel-Fläche, Hairline, 8-px-Radius, `overflow: hidden`; Felder ohne eigenen Rand, `padding: 11px 14px`, 14 px, durch Hairlines getrennt. Fokus: kein Outline, stattdessen Grün-Glas-Hintergrund. Placeholder sekundär. Zeilen mit Select (`select-row`): Label links, Select rechtsbündig in Grün mit tertiärem Chevron.
- **Composer-Pille** (`#message-input`): Panel-Fläche, Hairline stark, 20-px-Radius, 15 px, `padding: 10px 16px`. Fokus: Grün-Border + 3-px-Halo aus Grün-Glas.
- **Fehler:** 13 px Rot unter dem Feld, `min-height: 18px` reserviert (kein Springen). Composer-Fehler als schwebende Glas-Pille über dem Composer (Rot 40 % Border, 8-px-Radius, 4 s sichtbar).
- **Caret und Auswahl** sind grün.

### Cards / Containers
- **Auth-Karte:** 380 px, Panel-Glas mit `blur(16px) saturate(1.3)`, Hairline, 12-px-Radius, `padding: 32px 28px 28px`, tiefer Schatten. Darüber das App-Icon (64 px, Grün-Glas, Grün-Hairline, 40-px-Glow, Bubbles-Icon 42 px).
- **ID-Karte** (`id-card`): Das Identitätsobjekt. Grün-Glas mit radialem Grün-Schleier (22 %) in der linken oberen Ecke, Grün-Hairline, 12-px-Radius, 16 px Polster, leiser Glow + innere Glas-Kante. Kopfzeile 11.5 px / 600 / Versalien / +0.08 em in Grün (nur hier), Code in Mono 24 px, „Kopieren“ als kompakter getönter Button, Hinweis in Grün-zu-Label-Mischung (55 %).
- **Lookup-Treffer** (`lookup-result`): Grün-Glas, Grün-Hairline, 8-px-Radius, Avatar + Name (14.5 / 600) + Sub (12.5, sekundär).
- **Sheets** (`sheet`): Panel-Fläche, Hairline stark, 430 px, Kinder mit 14 px Abstand, Kopfzeile Title 17 px + Icon-Schließen. Mobil: von unten, `border-radius: 12px 12px 0 0`, Handle, Sheet-Schatten, `sheet-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)`. Desktop (≥ 761 px): zentriert, 12 px rundum, Pop-Schatten, `sheet-pop 0.28s` (28 px hoch + `scale(0.98)` + Fade). Backdrop: 55 % Schwarz mit `blur(4px)`, 0.3 s eingeblendet.

### Chips
- **Member-Chip:** Grün-Glas, grüner Text, Grün-Hairline, 999-px-Pille, `padding: 4px 6px 4px 12px`, 13 px / 500; Schließen-Kreuz als runder Button, Hover Grün-Glas stark.
- **Unread-Badge:** Grün-Füllung, dunkler Text, 11.5 px / 600, 20 px hoch, min. 20 px breit, 10-px-Radius, Tabellenziffern.

### Navigation
- **Listen-Header:** Panel mit Grün-Schleier (8 %) in der linken oberen Ecke, Hairline unten, `padding: 12px 16px 8px`. Zeile: eigener Avatar (32 px, öffnet Einstellungen) links, Compose-Icon grün rechts; darunter Headline „Chats“.
- **Listeneintrag** (`chat-item`): Volle Breite, 8-px-Radius, transparente Border, `padding: 9px 10px`, Avatar 40 px + Name (14.5 / 600) + Vorschau (13, sekundär) + Zeit (12, tertiär, tabular). Hover: Glas + Hairline. Aktiv: Grün-Glas + Grün-Hairline, Zeit in Grün-Label-Mischung. Tippende Vorschau grün.
- **Chat-Header:** Absolut, Panel-Glas + Blur, Hairline unten, min. 56 px, `padding: 8px 52px`. Peer-Avatar 36 px, Name (15 / 600) und Status (12.5, sekundär; „tippt …“ grün) zentriert. Zurück (mobil) links, Mitglied hinzufügen (Gruppen) rechts, jeweils grüne Icon-Buttons.
- **Empty-State:** Bubbles-Icon 44 px tertiär, Text sekundär, getönter Button; sitzt 12 vh unter dem Header.

### Avatare
Dunkle Fläche, persönlicher Farbton in Initialen und Ring. Kreis, Inter 600, Versalien, `letter-spacing: 0.01em`; 32 / 40 / 56 px (Header-Peer 36 px). Standard: Glas stark + Hairline stark + grüne Initialen. Das Skript hasht `user:<id>` bzw. `group:<id>` auf einen Hue (0–359) und setzt `hsl(h 28% 16%)` als Fläche, `hsl(h 45% 34%)` als Ring, `hsl(h 75% 72%)` als Initialen – Sättigung und Helligkeit sind fix, nur der Farbton wandert. Präsenz-Dot: 11 px Grün, 2-px-Ring in Panel, 8-px-Glow, unten rechts.

### Bubbles (Signature)
Glas statt Farbe. Beide Richtungen: 12-px-Radius mit 4-px-Ecke am Ursprung, `padding: 9px 13px`, 15 px / 1.4, `backdrop-filter: blur(6px)`, `pre-wrap`.
- **Fremd** (`bubble.in`): Glas (Weiß 5 %) + Hairline, linksbündig. Darüber in Gruppen der Sender-Name (12, sekundär, 12 px eingerückt).
- **Eigen** (`bubble.out`): Grün-Glas + Grün-Hairline, rechtsbündig.
- **Original-Toggle:** grüner Textbutton 12 px mit Globus-Icon 13 px; ausgeklappter Originaltext 13.5 px sekundär hinter einer Hairline. Übersetzungs-Fehlhinweis 12 px sekundär.
- **Status:** „Gesendet/Zugestellt/Gelesen“ 12 px / 500 sekundär, rechtsbündig, nur unter der letzten eigenen Nachricht.
- **Zeit-Divider:** Hairline – Label (12 / 500, sekundär, tabular) – Hairline, `margin: 12px 0 6px`; erscheint bei Tageswechsel oder > 60 min Pause. Bubbles tragen keine Uhrzeit.
- **Tipp-Indikator:** drei 7-px-Grün-Punkte, `typing-pulse` 1.2 s, Versatz 0.15 s.
- **Laden:** 26-px-Ring, Bahn Hairline stark, Kopf Grün, 0.8 s.
- **Senden (FLIP):** Das Skript misst Eingabe-Pille und neue Bubble und setzt `--send-dx/--send-dy`; `bubble-send` (0.42 s, `cubic-bezier(0.16, 1, 0.3, 1)`, Origin unten rechts) fährt von dort mit `scale(0.9)` / 50 % Deckung ein, glüht bei 55 % mit 28 px Grün und überschwingt bei 70 % um 2 px. **Empfangen:** `bubble-receive` 0.28 s, 8 px hoch + `scale(0.94)` + Fade, Origin unten links.
- **Reduced Motion:** Bubble-Animationen, Sheet-Auffahrt und Backdrop-Dim sind unter `prefers-reduced-motion: reduce` abgeschaltet.

### Motion-Grammatik
Zustandswechsel (Farbe, Border, Glow): 0.12–0.2 s `ease-out`. Räumliche Bewegung (Bubble, Sheet, Pop): `cubic-bezier(0.16, 1, 0.3, 1)` – schneller Start, langer weicher Auslauf. Druck: `scale(0.985)` (Buttons) bzw. `scale(0.92)` (Sende-Kreis).

## Do's and Don'ts

### Do:
- **Do** jede neue Fläche aus den drei Gründen (#121212 / #181818 / #1f1f1f) oder aus Weiß-Alpha (`glass` .05, `glass-strong` .09) bauen und mit einer 1-px-Hairline (.09 / .16) begrenzen.
- **Do** Grün-Glas (`brand-tint` + `brand-line`) für alles verwenden, das „meins“ oder „ausgewählt“ ist: eigene Bubbles, aktiver Eintrag, Chips, ID-Karte.
- **Do** auf jede Grün-Füllung `on-brand` (#0b1f16) als Text setzen und die Füllung mit `brand-deep` einfassen.
- **Do** schwebende Bars als `panel-translucent` mit `blur(18px) saturate(1.4)` über den Scroller legen; der Inhalt darf durchscheinen.
- **Do** die 6/8/12-Regel halten: interaktiv 6, gruppierend 8, raumgebend 12; Kreise für Avatare/Dots/Sende-Kreis, 999 px für Chips.
- **Do** Icons aus dem stroked Sprite (`<use href="#i-…">`) ziehen, in `currentColor`, 1.6–2.4 px Strich.
- **Do** Tiefe über Grün-Glow (`0 0 20–40px var(--brand-glow)`) und radiale Grün-Schleier (6–18 %) erzeugen, Versatz-Schatten nur für Sheets, Dialoge und die Auth-Karte.
- **Do** räumliche Bewegung mit `cubic-bezier(0.16, 1, 0.3, 1)` und jede Animation hinter `prefers-reduced-motion` absichern.
- **Do** Zeiten und Zahlen in `tabular-nums` setzen; Fehlerzeilen mit `min-height: 18px` reservieren.

### Don't:
- **Don't** einen hellen Modus, `prefers-color-scheme: light` oder helle Flächen einführen – die Welt ist `color-scheme: dark`, ohne Ausnahme.
- **Don't** einen zweiten Akzent (Blau, Orange, Violett) für Info, Warnung oder Sekundärhandlungen anlegen; Rot (#ff6b6b) bleibt Fehler und Abmelden.
- **Don't** Weiß auf gefülltem Grün setzen.
- **Don't** Avatare als bunte Scheiben füllen – der persönliche Hue lebt nur in Initialen (`hsl(h 75% 72%)`) und Ring (`hsl(h 45% 34%)`) auf dunkler Fläche (`hsl(h 28% 16%)`).
- **Don't** Bubbles mit Uhrzeit versehen oder deckend einfärben; Zeit gehört in den Divider, Bubbles sind Glas.
- **Don't** opake Graustufen als Kante, Versatz-Schatten in der Shell oder Schatten unter Bars verwenden.
- **Don't** gefüllte Glyph-Icons, Emoji-Icons oder Icon-Fonts einsetzen.
- **Don't** Monospace außerhalb des ID-Codes oder Schriftgrößen über 24 px in der Shell verwenden.
- **Don't** einen zweiten Scroller in der Konversation anlegen – nur der Nachrichtenstrom scrollt.
