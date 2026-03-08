# Manuelle Plausibilisierung – Teil 1
## Sprint 1a: Kompletter MVP-Durchlauf

**Ziel**: Einen vollständigen Lehrer-Workflow testen – von der Registrierung bis zur abgeschlossenen Benotung, inklusive Vorschlagscharakter und Reflexionspflicht.

**Voraussetzungen**: Alle 3 Terminals laufen (→ [mvp-manual-testing.md](./mvp-manual-testing.md)). Frische Datenbank (kein vorheriger Testlauf).

---

## Setup

1. → MongoDB zurücksetzen (falls nötig): `mongosh rank2rate --eval "db.dropDatabase()"`
2. → Backend neu starten
3. → `http://localhost:5173` im Browser öffnen

---

## Test 1 – Registrierung & Login

### 1.1 Registrierung

1. → `/register` aufrufen (oder auf "Registrieren" klicken)
2. → E-Mail eingeben: `lehrer@test.de`
3. → Passwort eingeben: `sicher123`
4. → "Registrieren" klicken

**✓** Weiterleitung zu `/login` erfolgt
**✓** Kein Fehler sichtbar

### 1.2 Login

1. → E-Mail eingeben: `lehrer@test.de`
2. → Passwort eingeben: `sicher123`
3. → "Anmelden" klicken

**✓** Weiterleitung zu `/dashboard` (oder `/sessions/new`) erfolgt
**✓** Kein Fehler-Banner sichtbar

### 1.3 Falsches Passwort

1. → Ausloggen (Token aus localStorage löschen oder Browser-Tab schließen und neu öffnen)
2. → `/login` aufrufen
3. → E-Mail: `lehrer@test.de`, Passwort: `falsch`
4. → "Anmelden" klicken

**✓** Fehlermeldung erscheint (z.B. "Ungültige Anmeldedaten")
**✓** Keine Weiterleitung

### 1.4 Navigation Guard

1. → Ohne eingeloggt zu sein `/dashboard` aufrufen

**✓** Redirect zu `/login`

---

## Test 2 – Session erstellen (nicht anonymisiert)

1. → Nach Login: `/sessions/new` aufrufen
2. → Schritt 1:
   - Titel: `Webprojekte Klasse ITA22`
   - Gruppenanzahl: `3`
   - Anonymisierung: **aus**
3. → "Weiter: Abgaben eingeben" klicken

**✓** Schritt 2 wird angezeigt
**✓** 3 leere Abgabe-Zeilen sichtbar

4. → Abgaben ausfüllen:
   - Abgabe 1: `Max Mustermann`
   - Abgabe 2: `Erika Musterfrau`
   - Abgabe 3: `Tom Weber`
5. → "+ Abgabe hinzufügen" klicken

**✓** 4. Zeile erscheint

6. → Abgabe 4: `Lisa Müller`
7. → "Session erstellen" klicken

**✓** Weiterleitung zu `/sessions/:id/grouping`
**✓** Alle 4 Namen im Pool sichtbar
**✓** 3 Gruppen-Container sichtbar (Top / Mittelfeld / Untere Gruppe)

---

## Test 3 – Drag & Drop Gruppierung (nicht anonymisiert)

**Ausgangslage**: Pool mit 4 Abgaben, 3 leere Gruppen

1. → Abgabe `Max Mustermann` per Drag in Gruppe **Top** ziehen

**✓** Abgabe verschwindet aus Pool
**✓** Abgabe erscheint in Gruppe Top
**✓** Pool-Zähler sinkt auf 3
**✓** Speichern-Button noch deaktiviert ("noch 3 offen")

2. → `Erika Musterfrau` und `Lisa Müller` in **Mittelfeld** ziehen
3. → `Tom Weber` in **Untere Gruppe** ziehen

**✓** Pool ist leer ("Noch zuzuweisen (0)")
**✓** Speichern-Button aktiv

4. → Abgabe aus Gruppe zurück in Pool ziehen (z.B. `Tom Weber`)

**✓** Abgabe wieder im Pool
**✓** Speichern-Button wieder deaktiviert

5. → `Tom Weber` zurück in **Untere Gruppe**
6. → "Ergebnis speichern" klicken

**✓** Weiterleitung zu `/sessions/:id/results`
**✓** Gruppen-Karten mit korrekter Zuordnung sichtbar

---

## Test 4 – Session erstellen (anonymisiert)

1. → `/sessions/new` aufrufen
2. → Schritt 1:
   - Titel: `Anonymisierter Test`
   - Gruppenanzahl: `3`
   - Anonymisierung: **ein**
3. → Weiter → Abgaben:
   - `Hans Müller`, `Maria Schmidt`, `Tom Weber`
4. → "Session erstellen"

**✓** Weiterleitung zu Drag & Drop
**✓** Abgaben zeigen Fantasy-Namen (z.B. `ClumsyGoldenDragon`), **keine** Klarnamen
**✓** Jede Karte hat 👁-Button

### 4.1 Klarnamen-Toggle

1. → 👁 bei einer Abgabe klicken

**✓** Klarname erscheint unter dem Fantasy-Namen
**✓** Toggle-Klick löst **keinen** Drag aus (Karte bleibt an Ort)

2. → Nochmals 👁 klicken

**✓** Klarname wieder verborgen

3. → Abgabe mit eingeblendetem Klarname in Gruppe ziehen

**✓** Drag funktioniert normal
**✓** Klarname bleibt sichtbar nach dem Drop (State erhalten)

---

## Test 5 – Ergebnisansicht & Notenvorschlag

**Ausgangslage**: Session aus Test 4, alle Abgaben einer Gruppe zugewiesen und gespeichert

### 5.1 Reihungsergebnis (Schritt 1)

**✓** Gruppen-Karten mit zugeordneten Fantasy-Namen
**✓** 👁-Toggle funktioniert auch hier
**✓** Tab "Reihung" aktiv (unterstrichen)
**✓** Zwei Buttons sichtbar: „Reihung abschließen" und „Noten ableiten →"
**✓** Trenner „oder" zwischen den beiden Optionen

### 5.2 Reihung abschließen (ohne Benotung)

1. → "Reihung abschließen" klicken

**✓** Weiterleitung zum Dashboard
**✓** Session-Status im Dashboard: „Reihung abgeschlossen" (blau)

2. → Zurück zur Ergebnisansicht navigieren (Ergebnisse-Link klicken)

### 5.3 Noten ableiten

1. → "Noten ableiten →" klicken

**✓** Tab wechselt zu „Notenvorschlag" (nicht „Benotung")
**✓** Heading zeigt „Notenvorschlag"
**✓** Notensystem-Dropdown sichtbar (Standard: "Schulnoten 1–6")
**✓** Live-Vorschau zeigt „Vorschlag: 1", „Vorschlag: 2", „Vorschlag: 3" (bei 3 Gruppen)
**✓** Alle Noten als „Vorschlag:" gekennzeichnet, keine zeigt „Note:"

### 5.4 Notensystem wechseln

1. → Dropdown auf **"A–F"** wechseln

**✓** Vorschau aktualisiert sich sofort
**✓** Noten zeigen „Vorschlag: A", „Vorschlag: B", „Vorschlag: C"

2. → Zurück auf **"Schulnoten 1–6"**

**✓** Vorschau zeigt wieder „Vorschlag: 1", „Vorschlag: 2", „Vorschlag: 3"

### 5.5 Reflexionspflicht – Speichern ohne Aktion

1. → Ohne etwas zu ändern den „Noten übernehmen"-Button prüfen

**✓** Button ist **deaktiviert** (ausgegraut)
**✓** Hilfstext sichtbar: „Bitte Notenverteilung prüfen: mindestens eine Note anpassen oder Bestätigung anhaken."
**✓** Bestätigungs-Checkbox sichtbar: „Ich habe die vorgeschlagene Notenverteilung geprüft und halte sie für angemessen."

### 5.6 Reflexionspflicht – Checkbox

1. → Checkbox anhaken

**✓** „Noten übernehmen"-Button wird **aktiv** (grün)
**✓** Hilfstext verschwindet

2. → Checkbox wieder abhaken

**✓** Button wird wieder deaktiviert

### 5.7 Manuelle Überschreibung

1. → Bei einer Abgabe das Note-Dropdown öffnen (rechts in jeder Zeile)
2. → Note auf `2` ändern (wenn vorher `1`)

**✓** ✎-Symbol erscheint neben der Abgabe
**✓** Label wechselt von „Vorschlag: 1" zu **„Note: 2"** (kein „Vorschlag:" mehr)
**✓** Bestätigungs-Checkbox **verschwindet** (manuelle Änderung = implizite Reflexion)
**✓** „Noten übernehmen"-Button ist **aktiv** (ohne Checkbox)
**✓** Andere Abgaben zeigen weiterhin „Vorschlag:"

3. → Dropdown auf ursprüngliche Note zurücksetzen

**✓** ✎-Symbol verschwindet
**✓** Label wechselt zurück zu „Vorschlag: 1"
**✓** Checkbox erscheint wieder

### 5.8 Kontextnotiz

1. → Im Textfeld „Notiz zur Benotung (optional)" eingeben: `Klasse insgesamt schwach`

**✓** Textfeld akzeptiert Eingabe
**✓** Placeholder-Text verschwindet

### 5.9 Noten übernehmen (alle unverändert)

1. → Checkbox anhaken (keine Note manuell geändert)
2. → "Noten übernehmen" klicken

**✓** Abschlussansicht erscheint: „Noten festgelegt ✓" (nicht „Benotung abgeschlossen")
**✓** Tabelle zeigt alle Abgaben mit Noten
**✓** **Hinweisbox** sichtbar (blauer Kasten): „Alle Noten entsprechen dem Algorithmus-Vorschlag. Bitte prüfen, ob die Verteilung der Klassenleistung entspricht."
**✓** Kontextnotiz angezeigt: „Notiz: Klasse insgesamt schwach"
**✓** „← Dashboard"-Button sichtbar

### 5.10 Noten übernehmen (mit manueller Änderung)

1. → Neue Session erstellen (3 Abgaben, anonymisiert, 3 Gruppen)
2. → Drag & Drop durchführen, speichern
3. → „Noten ableiten →" klicken
4. → Eine Note manuell ändern
5. → „Noten übernehmen" klicken

**✓** Abschlussansicht: „Noten festgelegt ✓"
**✓** Manuell geänderte Note hat ✎-Markierung
**✓** Zähler „1 manuell angepasst" sichtbar
**✓** **Keine Hinweisbox** (weil ≥1 Änderung)

---

## Test 6 – Dashboard-Statusanzeige

1. → „← Dashboard" klicken

**✓** Session mit Status „Noten festgelegt" sichtbar (grün, nicht „Benotet")
**✓** Ergebnisse-Link sichtbar

---

## Test 7 – API-Direktcheck (Browser-Konsole)

Browser-Konsole auf `http://localhost:5173` öffnen (`F12`):

```js
// Token holen
const token = localStorage.getItem('token')

// Session direkt prüfen – ID aus URL ablesen (:id)
const id = 'HIER_SESSION_ID_EINTRAGEN'
const r = await fetch(`/api/sessions/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
})
const data = await r.json()
console.log(data.session.status)          // 'graded'
console.log(data.session.groupingResult)  // Array mit Gruppen
console.log(data.session.ratingResult)    // { gradeSystem, grades[], note? }
console.log(data.session.ratingResult.note) // 'Klasse insgesamt schwach' (oder undefined)
console.log(data.projects[0].actualName)  // verschlüsselter String (Base64:Base64:Base64)
```

**✓** `status` ist `"graded"`
**✓** `groupingResult` enthält die erwarteten Gruppen
**✓** `ratingResult.grades` enthält `computedGrade` und `finalGrade` pro Abgabe
**✓** `ratingResult.note` enthält die Kontextnotiz (wenn eingegeben)
**✓** `actualName` ist verschlüsselt (sieht aus wie `abc123==:def456==:xyz789==`)

---

## Test 8 – Guard: Weniger als 3 Abgaben

1. → `/sessions/new` aufrufen
2. → Schritt 1 ausfüllen, weiter zu Schritt 2
3. → Nur 2 Abgaben ausfüllen (`Abgabe 1`, `Abgabe 2`, dritte leer lassen)

**✓** "Session erstellen"-Button deaktiviert
**✓** Hinweis "mind. 3 Abgaben erforderlich" sichtbar

---

## Abschluss

| Test | Beschreibung | Ergebnis |
|------|-------------|----------|
| 1.1 | Registrierung | ⬜ |
| 1.2 | Login erfolgreich | ⬜ |
| 1.3 | Login – falsches Passwort | ⬜ |
| 1.4 | Navigation Guard | ⬜ |
| 2 | Session erstellen (nicht anon.) | ⬜ |
| 3 | Drag & Drop Grundfunktion | ⬜ |
| 4 | Session erstellen (anonymisiert) | ⬜ |
| 4.1 | Klarnamen-Toggle | ⬜ |
| 5.1 | Reihungsergebnis + zwei Abschlussoptionen | ⬜ |
| 5.2 | Reihung abschließen (ohne Benotung) | ⬜ |
| 5.3 | Noten ableiten – Vorschlag-Labels | ⬜ |
| 5.4 | Notensystem wechseln | ⬜ |
| 5.5 | Reflexionspflicht – Button disabled | ⬜ |
| 5.6 | Reflexionspflicht – Checkbox | ⬜ |
| 5.7 | Manuelle Überschreibung + Label-Wechsel | ⬜ |
| 5.8 | Kontextnotiz | ⬜ |
| 5.9 | Noten übernehmen (unverändert) + Hinweisbox | ⬜ |
| 5.10 | Noten übernehmen (mit Änderung) | ⬜ |
| 6 | Dashboard-Statusanzeige | ⬜ |
| 7 | API-Direktcheck (inkl. note) | ⬜ |
| 8 | Guard ≥ 3 Abgaben | ⬜ |

⬜ = nicht getestet · 🟢 = bestanden · 🔴 = fehlgeschlagen
