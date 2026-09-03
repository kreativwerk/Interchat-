# PRODUCT.md — InterChat

## Was das Produkt ist

InterChat ist ein Messenger, dessen einziger Mechanismus zählt: **jeder schreibt
und liest in seiner eigenen Sprache**. Nachrichten werden im Original gespeichert
und bei Zustellung automatisch in die eingestellte Sprache jedes Empfängers
übersetzt; das Original bleibt per Fingertipp erreichbar.

## Zielgruppe & Szene

Privatpersonen mit Kontakten über Sprachgrenzen hinweg (internationale
Familien, Freundschaften, Logistik-/Arbeitskontakte). Genutzt unterwegs am
Telefon und nebenbei am Desktop, bei jedem Umgebungslicht — hell wie dunkel.

## Kernaufgaben (Operate)

1. Chats lesen und beantworten, ohne über Sprache nachzudenken.
2. Kontakte hinzufügen — **nur über die persönliche User-ID** (in den
   Einstellungen sichtbar und teilbar, wie ein Snapcode). Keine öffentliche
   Nutzersuche: Erreichbarkeit ist eine bewusste Entscheidung.
3. Gruppen anlegen und führen; jedes Mitglied liest in seiner Sprache.
4. Eigene Sprache jederzeit umstellen; der Verlauf folgt.

## Brand Commitments (vom Nutzer gepinnt)

- **Supabase-Designsprache, durchgehend dunkel**: tiefdunkle Gründe
  (#121212/#181818), Supabase-Grün #3ECF8E als einziger Akzent, Hairline-
  Borders aus Weiß-Transparenz, **Transparenzen als Material** (Glas-Bars mit
  Blur, grün getönte Flächen, weiche grüne Glows). Kein heller Modus.
- **Ein Hauch Snapchat**: die User-ID als teilbares Identitätsobjekt in den
  Einstellungen; Avatare mit personengebundenem Farbton, in Supabase-Material
  (dunkle Fläche, getönte Initialen) übersetzt.
- UI-Sprache: Deutsch.

Historie: v1 war Apple-lastig (iOS-Systempalette, Light/Dark). Der Nutzer hat
die Welt am 2026-09-03 auf Supabase-Dunkel gewechselt.

## Nicht verhandelbar

- Keine Nachricht geht verloren: schlägt Übersetzung fehl, wird das Original
  mit Hinweis zugestellt.
- Originaltext bleibt immer abrufbar.
- Zustell-/Lesestatus wie gewohnt (in Gruppen: alle Mitglieder).

## Technische Constraints

- Frontend ohne Build-Schritt (statisches HTML/CSS/JS), Node.js-Backend,
  SQLite. Übersetzungs-Provider austauschbar (DeepL/LibreTranslate/MyMemory).
