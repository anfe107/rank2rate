# rank2rate – UI-Views & Wireframes

Vollständige Wireframe-Dokumentation aller App-Views. Mobile-first (375px Basis).

Methoden-spezifische Views (Paarvergleich, Drag & Drop, Dot Voting, Kategorien, Normalisierung): [`docs/verfahren.md`](verfahren.md)
Triangulations-Views: [`docs/triangulation.md`](triangulation.md)
Frontend-Routen & API: [`docs/routen-api.md`](routen-api.md)

---

## View-Hierarchie & Navigation

```
/login               LoginView
/register            RegisterView
/dashboard           DashboardView           ← nach Login
/sessions/new        SessionCreateView
/sessions/:id        SessionManageView
  └─ startet Verfahren (→ verfahren.md)
  └─ nach letztem Verfahren:
       /sessions/:id/results  SessionResultsView
         ├─ Schritt 1: Reihungsergebnis
         ├─ [bei Triangulation: Triangulations-Ansicht]
         └─ Schritt 2: Benotung
/session/:id         StudentSessionView      ← kein Login (QR-Code)
```

Navigation Guard: Nicht eingeloggte Nutzer werden von Auth-Routen auf `/login` weitergeleitet.

---

## App-Layout (eingeloggt)

```
┌─────────────────────────────────────┐
│  rank2rate          [Abmelden]      │
├─────────────────────────────────────┤
│                                     │
│  [View-Inhalt]                      │
│                                     │
└─────────────────────────────────────┘
```

Keine komplexe Navigation — das Tool hat einen klaren linearen Flow. Der Header zeigt nur den App-Namen und Abmelden.

---

## LoginView `/login`

```
┌─────────────────────────────────────┐
│                                     │
│         rank2rate                   │
│  Reihung → Benotung                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  E-Mail                             │
│  ┌─────────────────────────────┐    │
│  │ daria@berufskolleg.de       │    │
│  └─────────────────────────────┘    │
│                                     │
│  Passwort                           │
│  ┌─────────────────────────────┐    │
│  │ ••••••••                    │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Einloggen]                        │
│                                     │
│  Noch kein Konto?                   │
│  [Registrieren]                     │
│                                     │
└─────────────────────────────────────┘
```

Fehlerzustand (falsche Credentials):
```
│  ┌─────────────────────────────┐    │
│  │ E-Mail oder Passwort        │    │
│  │ ungültig.                   │    │
│  └─────────────────────────────┘    │
```

---

## RegisterView `/register`

```
┌─────────────────────────────────────┐
│                                     │
│         rank2rate                   │
│  Konto erstellen                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  E-Mail                             │
│  ┌─────────────────────────────┐    │
│  └─────────────────────────────┘    │
│                                     │
│  Passwort (mind. 8 Zeichen)         │
│  ┌─────────────────────────────┐    │
│  └─────────────────────────────┘    │
│                                     │
│  [Konto erstellen]                  │
│                                     │
│  Bereits registriert?               │
│  [Zum Login]                        │
│                                     │
└─────────────────────────────────────┘
```

Nach Registrierung: Weiterleitung auf `/login` mit Erfolgsmeldung.

---

## DashboardView `/dashboard`

### Normalzustand (Sessions vorhanden)

```
┌─────────────────────────────────────┐
│  rank2rate          [Abmelden]      │
├─────────────────────────────────────┤
│  Meine Sessions                     │
│                          [+ Neu]    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Präsentationen ITA-Klasse   │    │
│  │ Drag & Drop · 8 Abgaben     │    │
│  │ 06.03.2026                  │    │
│  │ Status: Reihung abgeschlossen│   │
│  │ [Verwalten]  [Ergebnisse]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Abschlussarbeiten Q1        │    │
│  │ Paarvergleich · 12 Abgaben  │    │
│  │ 04.03.2026                  │    │
│  │ Status: Entwurf             │    │
│  │ [Verwalten]                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Referate Klasse 11b         │    │
│  │ D&D + Paarvergleich · 6 Ab. │    │
│  │ 01.03.2026                  │    │
│  │ Status: Noten festgelegt ✓   │    │
│  │ [Verwalten]  [Ergebnisse]   │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

Session-Karte zeigt: Titel, Methode(n), Abgabenanzahl, Datum, Status, kontextabhängige Aktionen.

**Status-Werte** (DB-Enum → UI-Label):
- `draft` → Entwurf
- `active` → Abstimmung läuft (nur bei Peer-Review/Dot Voting)
- `ranked` → Reihung abgeschlossen (kann Endzustand sein)
- `graded` → Noten festgelegt ✓

Solo-Lehrer-Sessions überspringen `active` (kein asynchroner Voting-Prozess).

### Leerzustand

```
┌─────────────────────────────────────┐
│  Meine Sessions                     │
│                          [+ Neu]    │
├─────────────────────────────────────┤
│                                     │
│  Noch keine Sessions.               │
│                                     │
│  [Erste Session erstellen]          │
│                                     │
└─────────────────────────────────────┘
```

---

## SessionCreateView `/sessions/new`

### Schritt 1: Grundeinstellungen

```
┌─────────────────────────────────────┐
│ ← Abbrechen                         │
│  Neue Session                       │
├─────────────────────────────────────┤
│                                     │
│  Titel *                            │
│  ┌─────────────────────────────┐    │
│  │ Präsentationen ITA-Klasse   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Reihungsverfahren *                │
│  (mehrere wählbar für Triangulation)│
│                                     │
│  ☑ Drag & Drop Gruppierung          │
│  ☑ Paarweiser Vergleich             │
│  ☐ Dot Voting (Peer-Review)         │
│                                     │
│  Bei Drag & Drop:                   │
│  Gruppenanzahl  ○ 3   ● 5           │
│                                     │
│  Anonymisierung                     │
│  ☑ Fantasy-Namen verwenden          │
│                                     │
│  [Weiter: Abgaben eingeben →]       │
│                                     │
└─────────────────────────────────────┘
```

Verfahren-Auswahl als Checkboxen — mind. 1 muss gewählt sein. Bei Dot Voting: Hinweis "Schüler nehmen per QR-Code teil".

**Hinweis**: Wireframe zeigt Zielzustand (multi-method ab Sprint 1b). In Sprint 1a ist nur Drag & Drop wählbar — die Datenstruktur (`methods: [String]`) ist aber bereits multi-method-fähig.

### Schritt 2: Abgaben eingeben

```
┌─────────────────────────────────────┐
│ ← Zurück                            │
│  Abgaben eingeben                   │
│  Drag & Drop + Paarvergleich        │
├─────────────────────────────────────┤
│                                     │
│  Abgabe 1                           │
│  ┌─────────────────────────────┐    │
│  │ Titel *  Max Mustermann     │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Link (optional)  https://…  │    │
│  └─────────────────────────────┘    │
│                                     │
│  Abgabe 2                           │
│  ┌─────────────────────────────┐    │
│  │ Titel *  Erika Musterfrau   │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Link (optional)             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Abgabe 3                           │
│  ┌─────────────────────────────┐    │
│  │ Titel *                     │    │
│  └─────────────────────────────┘    │
│                                     │
│  [+ Abgabe hinzufügen]              │
│                                     │
│  ─────────────────────────────      │
│  [Session erstellen →]              │
│  (mind. 3 Abgaben erforderlich)     │
│                                     │
└─────────────────────────────────────┘
```

Jede Abgabe hat Titel (required) + Link (optional). Dynamisch erweiterbar. Guard: Button disabled bis mind. 3 Abgaben ausgefüllt.

Nach Erstellen: Weiterleitung direkt in das erste gewählte Reihungsverfahren.

---

## SessionManageView `/sessions/:id`

```
┌─────────────────────────────────────┐
│ ← Dashboard                         │
│  Präsentationen ITA-Klasse       ⋯  │
├─────────────────────────────────────┤
│                                     │
│  Verfahren                          │
│  Drag & Drop ✓   Paarvergleich ○   │
│                                     │
│  [Drag & Drop starten]              │
│  [Paarvergleich starten]            │
│                                     │
│  ─────────────────────────────      │
│  Abgaben (8)                        │
│                                     │
│  ClumsyGoldenDragon                 │
│  [Link ↗]  [Klarname]  [✎]  [🗑]   │
│                                     │
│  WiseMightyPhoenix                  │
│  [Link ↗]  [Klarname]  [✎]  [🗑]   │
│                                     │
│  GrumpyTinyWizard                   │
│  [Klarname]  [✎]  [🗑]             │
│                                     │
│  · · ·                              │
│                                     │
│  [+ Abgabe hinzufügen]              │
│                                     │
│  ─────────────────────────────      │
│  [Ergebnisse anzeigen]              │
│  (verfügbar nach erstem Verfahren)  │
│                                     │
└─────────────────────────────────────┘
```

Klarnamen-Toggle ist pro Abgabe unabhängig schaltbar und nicht persistent (beim nächsten Laden wieder verborgen). Löschen öffnet Bestätigungsdialog — Guard: weniger als 3 Abgaben → löschen blockiert.

### Abgabe bearbeiten (Inline-Edit)

```
│  ClumsyGoldenDragon                 │
│  ┌─────────────────────────────┐    │
│  │ Titel  Max Mustermann       │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Link   https://…            │    │
│  └─────────────────────────────┘    │
│  [Speichern]  [Abbrechen]           │
```

---

## SessionResultsView `/sessions/:id/results`

### Schritt 1a — Reihungsergebnis: Drag & Drop

```
┌─────────────────────────────────────┐
│ ← Session verwalten                 │
│  Reihungsergebnis                   │
├─────────────────────────────────────┤
│  [Reihung]  [Notenvorschlag]        │
│   ▔▔▔▔▔▔▔                           │
├─────────────────────────────────────┤
│                                     │
│  TOP (Herausragend)                 │
│  ┌─────────────┐ ┌─────────────┐   │
│  │ClumsyGolden-│ │WiseMighty-  │   │
│  │Dragon       │ │Phoenix      │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  MITTELFELD (Gut)                   │
│  ┌─────────────┐ ┌─────────────┐   │
│  │GrumpyTiny-  │ │SleepyBrave- │   │
│  │Wizard       │ │Troll        │   │
│  └─────────────┘ └─────────────┘   │
│  ┌─────────────┐                   │
│  │BoldSilver-  │                   │
│  │Fox          │                   │
│  └─────────────┘                   │
│                                     │
│  UNTERE GRUPPE (Ausreichend)        │
│  ┌─────────────┐ ┌─────────────┐   │
│  │SwiftDark-   │ │LazyCrimson- │   │
│  │Wolf         │ │Bear         │   │
│  └─────────────┘ └─────────────┘   │
│  ┌─────────────┐                   │
│  │CleverTiny-  │                   │
│  │Owl          │                   │
│  └─────────────┘                   │
│                                     │
│  [Klarnamen anzeigen]               │
│                                     │
├─────────────────────────────────────┤
│  [Reihung abschließen]              │
│   Ranking als Ergebnis speichern    │
│                                     │
│  ── oder ──                         │
│                                     │
│  [Noten ableiten →]                 │
│   Ranking in Notenvorschläge        │
│   überführen                        │
└─────────────────────────────────────┘
```

„Reihung abschließen" belässt den Status bei `ranked` — das Ranking ist das Endergebnis. Sinnvoll für formative Bewertung, Feedback-Runden, Präsentationsreihenfolgen.

„Noten ableiten" betont den abgeleiteten, konstruierten Charakter der Notenberechnung.

### Schritt 1b — Reihungsergebnis: Paarweiser Vergleich

```
┌─────────────────────────────────────┐
│ ← Session verwalten                 │
│  Reihungsergebnis                   │
├─────────────────────────────────────┤
│  [Reihung]  [Notenvorschlag]        │
│   ▔▔▔▔▔▔▔                           │
├─────────────────────────────────────┤
│                                     │
│  Rang  Abgabe              Punkte   │
│  ───────────────────────────────    │
│   1    ClumsyGoldenDragon   7,0     │
│   2    WiseMightyPhoenix    5,5     │
│   2    GrumpyTinyWizard     5,5  ←  │ Gleichstand
│   4    SleepyBraveTroll     4,0     │
│   5    BoldSilverFox        3,0     │
│   6    SwiftDarkWolf        2,5     │
│   7    LazyCrimsonBear      2,0     │
│   8    CleverTinyOwl        0,5     │
│                                     │
│  [Klarnamen anzeigen]               │
│                                     │
├─────────────────────────────────────┤
│  [Reihung abschließen]              │
│   Ranking als Ergebnis speichern    │
│                                     │
│  ── oder ──                         │
│                                     │
│  [Noten ableiten →]                 │
│   Ranking in Notenvorschläge        │
│   überführen                        │
└─────────────────────────────────────┘
```

Gleichstände werden explizit als gleicher Rang angezeigt (nicht weginterpretiert).

### Schritt 1c — Reihungsergebnis: Triangulation

Wenn mehrere Verfahren abgeschlossen sind, erscheint anstelle von "Jetzt benoten" zunächst die Triangulations-Ansicht. Details: [`docs/triangulation.md`](triangulation.md)

---

### Schritt 2 — Notenvorschlag

```
┌─────────────────────────────────────┐
│ ← Reihungsergebnis                  │
│  Notenvorschlag                     │
├─────────────────────────────────────┤
│  [Reihung]     [Notenvorschlag]     │
│                 ▔▔▔▔▔▔▔▔▔▔▔▔▔▔     │
├─────────────────────────────────────┤
│                                     │
│  Notensystem                        │
│  ┌─────────────────────────────┐    │
│  │ Schulnoten 1–6          ▼   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Verteilungsmethode                 │
│  ┌─────────────────────────────┐    │
│  │ Linear                  ▼   │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│  Vorschau                           │
│                                     │
│  Vorschlag: 1  ClumsyGoldenDragon   │
│  Vorschlag: 2  WiseMightyPhoenix    │
│               GrumpyTinyWizard   ←  │ Gleichstand → bessere Note
│  Vorschlag: 3  SleepyBraveTroll     │
│  Vorschlag: 4  BoldSilverFox        │
│  Vorschlag: 5  SwiftDarkWolf        │
│               LazyCrimsonBear    ←  │ Gleichstand
│  Vorschlag: 6  CleverTinyOwl        │
│                                     │
│  Tippe auf eine Note zum Ändern     │
│                                     │
├─────────────────────────────────────┤
│  Notiz zur Benotung (optional)      │
│  ┌─────────────────────────────┐    │
│  │ z.B. "Klasse insgesamt      │    │
│  │ schwach, Noten angehoben"   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ☐ Ich habe die vorgeschlagene      │
│    Notenverteilung geprüft und      │
│    halte sie für angemessen.        │
│                                     │
│  [Noten übernehmen]  ← disabled     │
│         bis ☐ angehakt ODER         │
│         mind. 1 Note geändert       │
└─────────────────────────────────────┘
```

Vorschau aktualisiert sich sofort bei Änderung von Notensystem oder Verteilungsmethode.

Die Checkbox entfällt automatisch, sobald der Lehrer mindestens eine Note manuell geändert hat — die manuelle Änderung selbst ist Ausdruck der Reflexion.

Die Kontextnotiz wird im `ratingResult.note` gespeichert und ist in der Abschlussansicht sowie bei späterem Aufruf sichtbar.

### Notenvorschlag — manuelle Note überschreiben

```
│  Vorschlag: 3  SleepyBraveTroll  [3 ▼] │
│             ╔═══════════════════╗       │
│             ║  1 · 2 · 3 · 4   ║       │
│             ║      •            ║       │ (aktuell: 3)
│             ╚═══════════════════╝       │
```

### Notenvorschlag — nach manueller Änderung

```
│  Vorschlag: 1  ClumsyGoldenDragon      │
│  Vorschlag: 2  WiseMightyPhoenix       │
│                GrumpyTinyWizard        │
│  Note: 2       SleepyBraveTroll  ✎    │ ← manuell geändert (war Vorschlag: 3)
│  Vorschlag: 4  BoldSilverFox           │
│  Vorschlag: 5  SwiftDarkWolf           │
│                LazyCrimsonBear         │
│  Vorschlag: 6  CleverTinyOwl           │
```

`✎` markiert manuell überschriebene Noten visuell (abweichender Farbton + Symbol). Unveränderte Noten bleiben als „Vorschlag" gekennzeichnet, manuell gesetzte als „Note". Speichern sichert sowohl berechnete als auch finale Note pro Abgabe im `ratingResult`.

Sobald mindestens eine Note manuell geändert wurde, wird die Bestätigungs-Checkbox ausgeblendet und der Speichern-Button wird aktiv.

### Abschlussansicht — Noten festgelegt (nach Speichern, Noten teilweise angepasst)

```
┌─────────────────────────────────────┐
│ ← Dashboard                         │
│  Noten festgelegt ✓                 │
├─────────────────────────────────────┤
│                                     │
│  Abgabe              Note  Status   │
│  ─────────────────────────────────  │
│  ClumsyGoldenDragon   1             │
│  WiseMightyPhoenix    2             │
│  GrumpyTinyWizard     2             │
│  SleepyBraveTroll     2    ✎        │
│  BoldSilverFox        4             │
│  SwiftDarkWolf        5             │
│  LazyCrimsonBear      5             │
│  CleverTinyOwl        6             │
│                                     │
│  ✎ = manuell angepasst (1 Eintrag)  │
│                                     │
│  Notiz: "Klasse insgesamt schwach,  │
│  Noten angehoben"                   │
│                                     │
│  [Klarnamen anzeigen]               │
│  [Als CSV exportieren]  ← Sprint 2  │
│                                     │
└─────────────────────────────────────┘
```

### Abschlussansicht — Noten festgelegt (nach Speichern, alle Noten unverändert)

```
┌─────────────────────────────────────┐
│ ← Dashboard                         │
│  Noten festgelegt ✓                 │
├─────────────────────────────────────┤
│                                     │
│  Abgabe              Note  Status   │
│  ─────────────────────────────────  │
│  ClumsyGoldenDragon   1             │
│  WiseMightyPhoenix    2             │
│  GrumpyTinyWizard     3             │
│  SleepyBraveTroll     4             │
│  BoldSilverFox        5             │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ℹ Alle Noten entsprechen    │    │
│  │   dem Algorithmus-Vorschlag.│    │
│  │   Bitte prüfen, ob die      │    │
│  │   Verteilung der Klassen-   │    │
│  │   leistung entspricht.      │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Klarnamen anzeigen]               │
│  [Als CSV exportieren]  ← Sprint 2  │
│                                     │
└─────────────────────────────────────┘
```

---

### Perspektivenvergleich Lehrer/Peers (Sprint 2)

Wenn sowohl Lehrer-Reihung als auch Schüler-Dot-Voting vorliegen, erscheint in der Reihungsansicht ein Perspektivenvergleich. Dieser dient als Diskussionsgrundlage — nicht als Korrektur.

```
┌─────────────────────────────────────┐
│  Perspektivenvergleich              │
│                                     │
│  Abgabe              Lehrer  Peers  │
│  ─────────────────────────────────  │
│  ClumsyGoldenDragon   1.     3.    │  ← Divergenz!
│  WiseMightyPhoenix    2.     1.    │
│  GrumpyTinyWizard     3.     2.    │
│  SleepyBraveTroll     4.     4.    │  ← Übereinstimmung
│  BoldSilverFox        5.     8.    │  ← starke Divergenz
│  SwiftDarkWolf        6.     5.    │
│  LazyCrimsonBear      7.     6.    │
│  CleverTinyOwl        8.     7.    │
│                                     │
│  ⚡ 2 starke Abweichungen           │
│  Peers schätzen Dragon niedriger    │
│  und Fox deutlich schlechter ein    │
│  als der Lehrer.                    │
│                                     │
│  Starke Abweichungen können als     │
│  Diskussionsgrundlage dienen —      │
│  was sehen die Peers anders?        │
└─────────────────────────────────────┘
```

Der Vergleich ist rein informativ. Er fließt nicht automatisch in die Benotung ein. Der Lehrer entscheidet, ob und wie er die Peer-Perspektive berücksichtigt.

---

## StudentSessionView `/session/:id`

Kein Login erforderlich. Wird per QR-Code erreicht. Nur Dot Voting (Sprint 2).

### Einstieg: Abgabe-Auswahl

```
┌─────────────────────────────────────┐
│         rank2rate                   │
│  Präsentationen ITA-Klasse          │
│  Peer-Review · Dot Voting           │
├─────────────────────────────────────┤
│                                     │
│  Welches ist deine Abgabe?          │
│  (Sie wird bei der Bewertung        │
│   ausgeblendet.)                    │
│                                     │
│  ○  ClumsyGoldenDragon              │
│  ○  WiseMightyPhoenix               │
│  ○  GrumpyTinyWizard                │
│  ○  SleepyBraveTroll                │
│  ○  BoldSilverFox                   │
│  ···                                │
│  ○  Ich bin kein Abgaben-Autor      │
│                                     │
│  [Weiter zur Bewertung]             │
│                                     │
└─────────────────────────────────────┘
```

Voting-Ansicht und Bestätigung: → [`docs/verfahren.md` Abschnitt 3 (Dot Voting)](verfahren.md)
