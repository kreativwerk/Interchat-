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

- **Apple-lastige Designsprache**: native iOS-Anmutung (SF-Systemschrift,
  iMessage-Bubble-Grammatik, translucente Bars, Hairline-Separatoren,
  System-Blau als einziger Akzent, helles und dunkles Erscheinungsbild).
- **Ein Hauch Snapchat**: die User-ID als spielerisches, teilbares
  Identitätsobjekt in den Einstellungen; Avatare mit persönlicher Farbe.
- UI-Sprache: Deutsch.

## Nicht verhandelbar

- Keine Nachricht geht verloren: schlägt Übersetzung fehl, wird das Original
  mit Hinweis zugestellt.
- Originaltext bleibt immer abrufbar.
- Zustell-/Lesestatus wie gewohnt (in Gruppen: alle Mitglieder).

## Technische Constraints

- Frontend ohne Build-Schritt (statisches HTML/CSS/JS), Node.js-Backend,
  SQLite. Übersetzungs-Provider austauschbar (DeepL/LibreTranslate/MyMemory).
