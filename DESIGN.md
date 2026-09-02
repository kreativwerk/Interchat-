---
name: InterChat
description: Messenger mit unsichtbarer Übersetzung in nativer Apple-Anmutung — jeder liest in seiner Sprache.
colors:
  system-blue: "#007aff"
  system-blue-pressed: "#0062cc"
  bubble-out-deep: "#0f6fe0"
  system-green-presence: "#34c759"
  destructive: "#e5271c"
  ground: "#f2f2f7"
  panel: "#ffffff"
  panel-translucent: "rgba(249, 249, 249, 0.82)"
  label: "#000000"
  secondary-label: "#59595e"
  tertiary-label: "#86868b"
  separator: "rgba(60, 60, 67, 0.29)"
  fill: "rgba(120, 120, 128, 0.12)"
  fill-strong: "rgba(120, 120, 128, 0.2)"
  bubble-in: "#e9e9eb"
  tint: "rgba(0, 122, 255, 0.12)"
typography:
  large-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "34px"
    fontWeight: 700
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.35
  subhead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
  footnote:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "13px"
    fontWeight: 400
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "12px"
    fontWeight: 600
rounded:
  control-sm: "9px"
  control: "12px"
  sheet: "16px"
  bubble: "18px"
  pill: "19px"
  circle: "50%"
spacing:
  stack: "2px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-filled:
    backgroundColor: "{colors.system-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "13px"
    typography: "{typography.body}"
  button-filled-hover:
    backgroundColor: "{colors.system-blue-pressed}"
  button-tinted:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.system-blue}"
    rounded: "{rounded.control}"
    padding: "13px"
  button-plain-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.destructive}"
    rounded: "{rounded.control}"
    padding: "13px"
  bubble-in:
    backgroundColor: "{colors.bubble-in}"
    textColor: "{colors.label}"
    rounded: "{rounded.bubble}"
    padding: "8px 13px"
    typography: "{typography.body}"
  bubble-out:
    backgroundColor: "{colors.system-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.bubble}"
    padding: "8px 13px"
    typography: "{typography.body}"
  send-button:
    backgroundColor: "{colors.system-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.circle}"
    size: "34px"
  composer-input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.label}"
    rounded: "{rounded.pill}"
    padding: "9px 16px"
  unread-badge:
    backgroundColor: "{colors.system-blue}"
    textColor: "#ffffff"
    rounded: "11px"
    height: "21px"
  chat-item-active:
    backgroundColor: "{colors.tint}"
---

# Design System: InterChat

## Overview

**Creative North Star: "Die native Selbstverständlichkeit"**

InterChat sieht nicht aus wie eine Web-App, die einen Messenger nachbaut — es
verhält sich wie eine native Apple-App, in der die Übersetzung als Feature
verschwindet. Die gesamte Oberfläche spricht die iOS-Systemsprache: SF-Stack,
iOS-Systempalette mit systemBlue als einzigem Akzent, iMessage-Bubble-Grammatik,
translucente Bars mit Blur, Hairline-Separatoren statt Karten und Schatten.
Nichts ist dekoriert; jede Farbe und jede Bewegung hat eine Systembedeutung.

Der einzige bewusst fremde Einschlag ist ein Hauch Snapchat: Avatare tragen
einen personengebundenen Farbverlauf (Hue aus dem Namens-Hash), und die
InterChat-ID lebt als spielerisch teilbare Identitätskarte in den
Einstellungen. Beides bleibt innerhalb der Apple-Grammatik — Verlauf statt
Sticker, Karte statt Konfetti.

Verweigert wird der WhatsApp-Klon in Grün ebenso wie jede generische
Web-App-Anmutung mit dekorativen Karten, Border-Boxen oder Icon-Fonts.

**Key Characteristics:**
- Ein Akzent (systemBlue), sonst ausschließlich Graustufen-Systemrollen
- Vollständige Light/Dark-Symmetrie über CSS-Custom-Properties auf `:root`
- Hairlines (0.5px) statt Kästen; Tiefe nur an Overlays und Zustandswechseln
- Feder-Ease `cubic-bezier(0.16, 1, 0.3, 1)` als einzige expressive Bewegungskurve
- Stroked-SVG-Icons in SF-Symbols-Anmutung aus einem Inline-Sprite

## Colors

Reine iOS-Systempalette: ein blauer Akzent, semantisches Grün und Rot, dazu
Graustufen-Rollen, die in Light und Dark spiegelbildlich definiert sind. Die
Frontmatter trägt die Light-Werte; die Dark-Werte stehen als Overrides im
`prefers-color-scheme: dark`-Block auf `:root` und hier in Klammern.

### Primary
- **System-Blau** (`--accent`, Dark: #0a84ff): der einzige Akzent der Welt.
  Trägt alles Interaktive: gefüllte Buttons, Send-Kreis, ausgehende Bubbles,
  Links-Farbe der Selects, Unread-Badge, aktiven Chat (als `--tint`),
  Caret, Fokus-Ring und den „tippt…"-Zustand.
- **System-Blau gedrückt** (`--accent-pressed`, Dark: #3395ff): Hover/Pressed
  gefüllter Flächen. Im Dark Mode heller statt dunkler — Licht kommt hinzu.
- **Bubble-Tiefblau** (`--bubble-out-deep`, Dark: #0967c8): unterer Stop des
  178deg-Verlaufs ausgehender Bubbles; nie eigenständig verwendet.
- **Akzent-Tinte** (`--tint`, Dark: rgba(10,132,255,0.22)): 12%-Blau als
  Flächenfarbe für getönte Buttons, aktive Listenzeile, Member-Chips,
  Input-Fokus und `::selection`.

### Neutral
- **Grund** (`--bg`, Dark: #000000): systemGray6 als App-Grund von Auth-View,
  Seitenleiste und Sheets; im Dark Mode echtes Schwarz.
- **Panel** (`--panel`, Dark: #1c1c1e): Weiß für Konversationsfläche,
  gruppierte Eingaben, Eingabe-Pille, aktives Segment.
- **Panel transluzent** (`--panel-translucent`, Dark: rgba(22,22,24,0.8)):
  Material der Bars (Chat-Header, Composer) — immer zusammen mit
  `backdrop-filter: blur(18px) saturate(1.6)`.
- **Label** (`--label`, Dark: #ffffff) / **Sekundär** (`--secondary`, Dark:
  #aeaeb5) / **Tertiär** (`--tertiary`, Dark: #8e8e93): dreistufige
  Text-Hierarchie — Inhalt, Metadaten/Platzhalter, Leerzustände/Chevrons.
- **Separator** (`--separator`, Dark: rgba(84,84,88,0.65)): die Hairline.
  Immer 0.5px, nie 1px (Ausnahme: der 1px-Rand der Eingabe-Pille).
- **Fill / Fill stark** (`--fill`, `--fill-strong`; Dark: rgba(120,120,128,
  0.24/0.36)): neutrale Zustandsflächen — Segmented-Hintergrund, Hover auf
  Listenzeilen und Icon-Buttons, Disabled-Buttons, Scrollbar-Daumen,
  Sheet-Handle.
- **Empfangene Bubble** (`--bubble-in`, Dark: #26262a): das iMessage-Grau
  eingehender Nachrichten.

### Semantisch (kein Akzent)
- **Präsenz-Grün** (#34c759, Dark: #30d158): ausschließlich der 12px-Online-Dot
  am Avatar (mit 2.5px `--bg`-Rand). Rein semantisches Signal — nie als
  Akzent, Button- oder Flächenfarbe.
- **Destruktiv-Rot** (`--destructive`, Dark: #ff453a): Fehlertexte und der
  „Abmelden"-Plain-Button. Keine gefüllten roten Flächen.

### Named Rules
**Die Ein-Akzent-Regel.** systemBlue ist die einzige Akzentfarbe der Welt.
Grün existiert nur als Präsenz-Dot, Rot nur als Fehler/Destruktiv-Text. Eine
zweite Akzentfarbe einzuführen bricht die Welt.

**Die Avatar-Hue-Regel.** Avatare sind der einzige Ort freier Farbe: Der Hue
wird deterministisch aus dem Namen gehasht und als Verlauf
`linear-gradient(150deg, hsl(H 72% 58%), hsl(H+42 72% 42%))` gemalt — pro
Person stabil, nie manuell gewählt, nie außerhalb von Avataren verwendet.

## Typography

**Display/Body Font:** SF-Systemstack (`-apple-system, BlinkMacSystemFont,
"SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif`) — eine
einzige Familie für alles, mit `-webkit-font-smoothing: antialiased`.

**Character:** Die native Systemschrift der Plattform; Persönlichkeit entsteht
über Gewicht und negatives Tracking der Titel, nicht über eine zweite Familie.

### Hierarchy
- **Large Title** (700, 34px, letter-spacing -0.02em): genau einmal pro
  Screen — „Chats" über der Liste; „InterChat" auf der Auth-Karte (28px).
- **Title** (700, 20px, -0.01em): Sheet-Überschriften.
- **Headline** (600, 17px, -0.01em): Chat-Namen in der Liste; verwandt:
  Peer-Name im Header (16.5px/600), Profilname (19px/600).
- **Body** (400, 16px, lh 1.35): Nachrichtentext, Eingaben, Buttons (dort 600).
- **Subhead** (400, 15px): Nachrichten-Vorschau, Taglines, Platzhaltertexte.
- **Footnote** (400, 13–14px, `--secondary`): Peer-Status, Zeitstempel,
  Sheet-Hinweise, Fehlertexte.
- **Caption** (600, 12px): Zeit-Divider, Absendername in Gruppen,
  Statuszeile („Zugestellt"/„Gelesen"); die ID-Karten-Beschriftung zusätzlich
  uppercase mit +0.06em.

### Named Rules
**Die Tabular-Regel.** Alles Zählbare — Zeiten, Unread-Badges, die
InterChat-ID — läuft in `font-variant-numeric: tabular-nums`.

**Die Ein-Familien-Regel.** Es gibt keine zweite Schriftfamilie, keinen
Webfont, kein Mono-Display. Hierarchie entsteht aus 400/500/600/700 und
negativem Tracking ab 17px.

## Layout

Zweispaltige Master-Detail-Anordnung in einem zentrierten Rahmen von maximal
1440px bei `height: 100dvh`: links die Seitenleiste (375px, min. 300px) auf
`--bg` mit Hairline rechts, rechts die Konversation auf `--panel`. Bars
(Chat-Header, Composer) sind transluzent und kleben an den Rändern; nur die
Nachrichtenfläche und Listen scrollen.

Unter 761px kollabiert das Layout: Die Liste füllt den Screen, die Konversation
schiebt sich als eigener Screen darüber (`.mobile-chat-open` blendet die
Seitenleiste aus, Back-Chevron erscheint links im Header). `env(safe-area-inset-bottom)`
polstert Composer und Sheets; Sheets docken mobil unten an und werden ab 761px
zu zentrierten Dialogen (max. 430px).

Spacing-Rhythmus: 16px Außenpolster (Listenzeilen, Nachrichtenfläche
horizontal 14px), 12px Element-Gaps (Avatar zu Text, Sheet-Innenleben 14px),
8px kleine Gaps, 2px Bubble-Stapel — 10px erst beim Sprecherwechsel.
Listenzeilen sind 44px-Avatar-hoch mit Hairline nur unter dem Textteil
(iOS inset), die letzte Zeile ohne Linie.

## Elevation & Depth

Flach per Default: Die Grundfläche kennt keine Schatten, Tiefe entsteht aus
den zwei Flächentönen (`--bg` gegen `--panel`), Hairlines und dem
Blur-Material der Bars. Schatten existieren nur an drei Stellen mit klarer
Rolle: unter Overlays, unter dem aktiven Segment und unter dem App-Icon.
Im Dark Mode werden die Schatten deutlich dichter (0.55–0.6 Alpha) statt
farbiger.

### Shadow Vocabulary
- **Sheet** (`--shadow-sheet: 0 -8px 40px rgba(0,0,0,0.18)`, Dark 0.6): nach
  oben geworfen unter mobilen Bottom-Sheets.
- **Pop** (`--shadow-pop: 0 10px 34px rgba(0,0,0,0.16)`, Dark 0.55):
  Desktop-Dialoge.
- **Segment aktiv** (`0 1px 4px rgba(0,0,0,0.12)`): das gehobene weiße
  Segment im Segmented Control.
- **App-Icon** (`0 6px 18px rgba(10,95,215,0.35)`): einziger farbiger
  Schatten, nur unter dem Marken-Icon.

### Named Rules
**Die Hairline-Regel.** Flächen werden durch 0.5px-Separatoren und Tonwechsel
getrennt, nie durch Rahmen-Boxen oder Ruhe-Schatten. Schatten sind Overlays
und gehobenen Zuständen vorbehalten.

**Die Material-Regel.** Bars (Header, Composer) sind immer
`--panel-translucent` + `backdrop-filter: blur(18px) saturate(1.6)` + Hairline
an der Innenkante — nie opak, nie mit Schatten.

## Shapes

Durchgehende iOS-Superellipsen-Anmutung über gestufte Radien: 9px für kleine
Controls (Segmented, Kompakt-Buttons; Segmente innen 7px), 12px für gruppierte
Eingaben, Buttons und Lookup-Karten, 14px für die ID-Karte, 16px für Sheets
(mobil nur oben gerundet), 18px für Bubbles und das App-Icon, 19px für die
Eingabe-Pille. Avatare, Icon-Buttons, Send-Button, Online-Dot und
Typing-Punkte sind Vollkreise.

Die Bubble-Grammatik schärft die stapelnahe Ecke: ausgehende Bubbles rechts
unten, eingehende links unten auf 5px reduziert — der iMessage-„Schwanz" als
Radius statt Anhängsel. Der Sheet-Handle (38×5px, 3px-Radius) markiert
Bottom-Sheets. Keine spitzen Ecken irgendwo in der UI; Borders existieren nur
als Hairline oder als 1px-Rand der Eingabe-Pille.

## Components

### Buttons
- **Shape:** weiche Rechtecke (12px; kompakt 9px), volle Breite in Formularen.
- **Filled:** `--accent` auf Weiß, 600, 13px Padding; Hover `--accent-pressed`,
  Active `scale(0.98)`, Disabled `--fill-strong` mit `--secondary`-Text.
- **Tinted:** `--tint`-Fläche mit `--accent`-Text; Hover `--fill-strong`.
  Auf der blauen ID-Karte als Weiß-Alpha-Variante (0.22/0.34).
- **Plain/Destructive:** ohne Fläche; destruktiv in `--destructive` mit
  rotem 10%-Hover.
- **Icon-Button:** 22px-Icon in Kreis-Hover (`--fill`), Akzentvariante
  in `--accent`.
- **Send-Button:** 34px-Kreis in `--accent` mit weißem Pfeil; Active
  `scale(0.92)`, Disabled neutral.

### Segmented Control
- **Style:** `--fill`-Wanne (9px, 2px Padding), Segmente 14px/500; das aktive
  Segment liegt als `--panel`-Fläche (7px) mit Segment-Schatten oben und
  wechselt auf 600.

### Message Bubbles (Signature)
- **Geometrie:** max. `min(72%, 520px)` (mobil 82%), 8px/13px Padding, 18px
  Radius mit 5px-Stapelecke, `white-space: pre-wrap`.
- **Ausgehend:** 178deg-Verlauf `--bubble-out` → `--bubble-out-deep`, weißer
  Text, rechtsbündig.
- **Eingehend:** `--bubble-in` mit `--label`-Text, linksbündig.
- **Rhythmus:** 2px zwischen gleichen Sprechern, 10px beim Wechsel; in
  Gruppen 12px-Absendername über fremden Bubbles.
- **Übersetzung:** „Original anzeigen"-Toggle (12px, 75% Opazität) klappt den
  Originaltext hinter einer currentColor-Hairline (`color-mix` 30%) auf —
  funktioniert dadurch in beiden Bubble-Farben und beiden Themes.
- **Bubbles sind stumm:** keine Uhrzeit in der Bubble. Zeit erscheint als
  zentrierter Divider (12px/600, tabular) bei Tageswechsel oder >1h Pause;
  „Zugestellt"/„Gelesen" steht nur unter der letzten eigenen Nachricht.

### Composer
- **Style:** transluzente Bar mit Hairline oben; Eingabe-Pille (19px, 1px
  `--separator`-Rand auf `--panel`), Fokus färbt den Rand `--accent` —
  kein Glow. Rechts der Send-Kreis.

### Chat List Item
- **Style:** 44px-Avatar mit Verlauf (+ ggf. Online-Dot), Name 17px/600 gegen
  14px-Zeit in `--secondary`, darunter 15px-Vorschau (einzeilig, Ellipsis)
  gegen blauen Unread-Badge (21px, 11px-Radius). Hover `--fill`, aktiv
  `--tint`; „tippt…" färbt die Vorschau `--accent`.

### Inputs / Fields
- **Style:** iOS inset-grouped — randlose 16px-Inputs in einer `--panel`-Gruppe
  (12px), getrennt durch Hairlines; Fokus hinterlegt die Zeile mit `--tint`
  statt Ring. Select-Zeilen: Label links, `--accent`-Wert rechts mit
  `--tertiary`-Chevron.
- **Fehler:** 13–14px-Text in `--destructive` unter der Gruppe, per
  `role="alert"`.

### Sheets
- **Style:** `--bg`-Fläche, 16px-Radius, Handle, Titelzeile mit X-Icon-Button,
  14px-Stack. Mobil als Bottom-Sheet (max-height 86dvh, Sheet-Schatten) über
  40%-Schwarz-Backdrop; ab 761px zentrierter Dialog mit Pop-Schatten.

### ID-Karte (Signature, Snapchat-Hauch)
- Blauer Marken-Verlauf `linear-gradient(150deg, #1e6fe0, #0a4fae)` (14px,
  weißer Text): Uppercase-Caption, die ID in 25px/700 mit +0.08em und
  `user-select: all`, Weiß-Alpha-Kopierbutton, Hinweiszeile. Der einzige Ort
  neben App-Icon und Avataren, an dem ein Verlauf Fläche trägt.

### Icons
- Ein Inline-SVG-Sprite (`<symbol>`/`<use>`), 24er-ViewBox, stroked in
  `currentColor` mit 1.6–2.4 Strichstärke, runde Kappen — SF-Symbols-Anmutung.
  Verwendungsgrößen 16–24px (Empty-State 44px). Keine Füllflächen, keine
  Icon-Fonts, keine Emoji als UI-Glyphen.

### Motion
- **Feder-Ease:** `cubic-bezier(0.16, 1, 0.3, 1)` für alles Expressive;
  Zustandswechsel (Hover, Fokus) laufen in 0.12–0.15s `ease-out`.
- **Senden (Signature):** die neue Bubble startet per FLIP an der realen
  Position der Eingabe-Pille (`--send-dx`/`--send-dy` aus
  `getBoundingClientRect`) und federt in 0.38s an ihren Platz
  (leichter Overshoot bei 70%). Empfangen: 0.28s aus 8px/scale 0.94.
- **Sheets:** mobil 0.4s von unten (`sheet-up`), Desktop 0.28s Pop; Backdrop
  dimmt in 0.3s auf 40%.
- **Ambient:** Typing-Punkte pulsieren 1.2s versetzt; Lade-Spinner 0.8s linear.
- **`prefers-reduced-motion: reduce`** schaltet Bubble- und Sheet-Animationen
  vollständig ab.

**Die Feder-Regel.** Expressive Bewegung nutzt ausschließlich
`cubic-bezier(0.16, 1, 0.3, 1)` und respektiert `prefers-reduced-motion`.
Nichts bounct mit anderen Kurven.

## Do's and Don'ts

### Do:
- **Do** jede Farbe über die `:root`-Custom-Properties beziehen — jeder Token
  hat einen Dark-Zwilling; neue Werte brauchen beide Definitionen.
- **Do** Hairlines mit 0.5px und `--separator` ziehen und Listen im
  inset-Stil führen (Linie nur unter dem Textteil, letzte Zeile ohne).
- **Do** neue Icons als stroked `<symbol>` im Sprite anlegen (24er-ViewBox,
  1.6–2.4 Strich, `currentColor`, runde Kappen).
- **Do** Interaktives blau markieren: Flächen `--accent`, Nebenaktionen
  `--tint`, Zustände über `--fill`/`--fill-strong`.
- **Do** Zeiten, IDs und Zähler in `tabular-nums` setzen.
- **Do** neue Overlays als Sheet bauen: Handle, Titelzeile mit X, mobil von
  unten, ab 761px als zentrierter Pop.

### Don't:
- **Don't** eine zweite Akzentfarbe einführen — Grün bleibt Präsenz-Dot,
  Rot bleibt Fehler/Destruktiv.
- **Don't** Karten mit Ruhe-Schatten oder sichtbaren Rahmen bauen; Tiefe
  gehört Overlays und gehobenen Zuständen.
- **Don't** Uhrzeiten in Bubbles schreiben oder Status unter jede Nachricht
  setzen — Zeit-Divider und einmaliger Status sind die Grammatik.
- **Don't** Verläufe als Flächenfarbe streuen: Verlauf gibt es nur an
  Avataren (Hue-Hash), ausgehenden Bubbles, App-Icon und ID-Karte.
- **Don't** Webfonts, Icon-Fonts oder gefüllte Glyphen laden — SF-Stack und
  das stroked Sprite sind die einzige Schrift- und Zeichensprache.
- **Don't** Animationen ohne `prefers-reduced-motion`-Fallback ausliefern.
