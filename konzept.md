# rank2rate – Konzeptdokument

**Projekt**: rank2rate – Lehrerdiagnostik-Tool: Reihung von Schülerabgaben → Benotung
**Zielgruppe**: Primär Lehrer (Einzelbewertung & Peer-Review-Initiator). Schüler nehmen ausschließlich an der **Reihungsphase** via Peer-Review teil — die Benotung ist ausschließlich dem Lehrer vorbehalten.
**Technologie**: Vue.js 3 + Node.js/Express + MongoDB → Details: [`docs/stack.md`](docs/stack.md)
**Status**: MVP in Entwicklung
**Datum**: 2026-03-06
**Version**: 1.2

---

## Inhaltsverzeichnis

1. Vision & Ziele
2. Personas & Use Cases
3. Kern-Konzepte
   - 3.1 Triangulation
   - 3.2 Anonymisierung
   - 3.3 QR-Code-Workflow
   - 3.4 Ergebnisansicht
   - 3.5 Zweiphasiger Prozess: Reihung → Benotung
   - 3.6 Fachglossar & Begriffspräzisierung
4. Reihungsverfahren (Übersicht)
5. User Stories
6. Datenmodell
7. API-Endpoints
8. Design System
9. Testing-Ansatz
10. Roadmap
11. Offene Fragen
12. Änderungshistorie

---

## 1. Vision & Ziele

### Vision

Ein interaktives Web-Tool, das die Bewertung von Schülerabgaben durch relative Verfahren (inspiriert von agilen Schätzmethoden) schrittweise verfeinert und durch Visualisierung sowie spielerische Interaktion unterstützt.

### Kernziele

- **Zweiphasiger Prozess**: Erst **Reihung** (relative Verfahren erzeugen eine Rangfolge), dann **Benotung** (Rangfolge wird in ein Notensystem überführt)
- **Methodenvielfalt**: Verschiedene Reihungsverfahren kombinierbar (Triangulation)
- **Leichte Interaktion**: Wenig Tippen, viel Drag & Drop, Klicken, Visualisieren
- **Visualisierung**: Top-Scorer, Mittelfeld, hintere Plätze anschaulich darstellen
- **Transparenz**: Nachvollziehbare Bewertungsprozesse durch Methodenvergleich

### Anwendungsfälle

- **Lehrer alleine**: Reihung von 3–15 Abgaben, optional Benotung (Kernfall)
- **Lehrer + Klasse**: Schüler liefern per QR-Code ihren Reihungs-Beitrag (Dot Voting), Lehrer benotet optional danach. Perspektivenvergleich Lehrer/Peers als Diskussionsgrundlage.
- **Kollegiale Einschätzung** *(Sprint 3+)*: Mehrere Kolleg\*innen reihen dasselbe Set unabhängig. Ergebnis: Übereinstimmungsmatrix — wo sind sich alle einig, wo gehen die Einschätzungen auseinander? Echte Triangulation auf der Evaluator-Achse.
- **Selbstreflexion** *(sehr optionale Erweiterung, eigener Scope)*: Schüler priorisieren eigene Ideen per Paarvergleich — nutzt nur Phase 1, keine Benotung, benötigt eigenes Auth-Modell

---

## 2. Personas & Use Cases

Ausführliche Persona-Profile: → [`docs/personas.md`](docs/personas.md)

### Persona-Übersicht

| Persona | Name | Rolle | Tech-Affinität |
|---------|------|-------|----------------|
| P1 | Daria Schmitz, 42 J. | Lehrerin Berufskolleg – Deutsch & Wirtschaft (Einzelbewertung) | Mittel |
| P2 | Amir Yilmaz, 35 J. | Lehrer – Informatik & Netzwerktechnik (Session-Initiator Peer-Review) | Hoch |
| P3 | Sofia Wagner, 19 J. | Schülerin – Duale Ausbildung FIAE (Peer-Review) | Hoch |
| P4 | Aarav Patel, 17 J. | Schüler – 13. Klasse Abitur-Vorbereitung (Selbstreflexion) | Mittel |

---

### Use Case Übersicht

| Use Case | Persona | Hauptmethode | Teilnehmer |
|---|---|---|---|
| UC1: Schnelle Lehrerbewertung | P1 | Drag & Drop + Paarvergleich | 1 (Lehrer) |
| UC2: Detaillierte Lehrerbewertung *(Sprint 3+)* | P1 | Kategorien-Bewertung + Paarvergleiche | 1 (Lehrer) |
| UC3: Peer-Review (Lehrer-initiiert) *(Sprint 2)* | P2 + P3 | Dot Voting | 1 Lehrer + 15–30 Schüler |
| UC4: Hybride Bewertung *(Sprint 3+)* | P1 + P2 + P3 | Schüler-Vote + Lehrer-Bewertung | 1 Lehrer + Schüler |
| UC5: Kollegiale Einschätzung *(Sprint 3+)* | P1 + P2 | Multi-Evaluator-Reihung | 2–4 Lehrer |
| UC6: Selbstreflexion *(sehr optionaler Scope, kein Sprint geplant)* | P4 | Paarvergleiche | 1 (Schüler) |

---

### Szenario im Detail: Lehrer-initiiertes Peer-Review (UC3)

**Setting**: Klassenzimmer, nach Präsentationen · **Teilnehmer**: Lehrer + 24 Schüler · **Abgaben**: 12 Gruppen-Präsentationen

**Phase 1 – Vorbereitung (5 Min)**
- Lehrer öffnet rank2rate, erstellt Session „Präsentationen ITA-Klasse"
- Methode: Dot Voting (5 Punkte/Schüler), Anonymisierung aktiv → Fantasy-Namen
- QR-Code wird generiert und am Beamer gezeigt

**Phase 2 – Bewertung (15 Min)**
- Schüler scannen QR-Code, Interface öffnet sich ohne Login
- Optional: „Welches ist deine Abgabe?" → Auswahl wird ausgeblendet
- Schüler verteilen 5 Punkte mit Live-Counter „Noch X Punkte verfügbar"

**Phase 3 – Live-Auswertung**
- Lehrer sieht Dashboard: Fortschrittsbalken „18 von 24 Schülern haben bewertet"

**Phase 4 – Präsentation (10 Min)**
- Ergebnisse am Beamer, Diskussion
- Optional: Lehrer addiert eigene Bewertung (Hybride Bewertung, Phase 3)

---

## 3. Kern-Konzepte

### 3.1 Triangulation

Verwendung mehrerer unterschiedlicher Bewertungsmethoden für dasselbe Objekt, um ein robusteres Gesamtbild zu erhalten. Triangulation entsteht sinnvoll entlang drei Achsen: Erkenntnisart (relativ vs. absolut), Evaluator (Lehrer vs. Peers) und Kognitionstyp (holistisch vs. analytisch).

Vollständige Analyse, Kombinationsszenarien und Architekturhinweise: [`docs/triangulation.md`](docs/triangulation.md)

**Stärkste Kombinationen**:
- Sprint 1b: Drag & Drop + Paarweiser Vergleich (Kognitionstyp-Triangulation, Lehrer allein)
- Sprint 2: Paarweiser Vergleich + Dot Voting (Experte + Peers — pädagogisch wertvollste Achse)
- Sprint 3+: + Kategorien-Bewertung (vollständige Triangulation aller Achsen)

**Hinweis**: Die vergleichende Ansicht mehrerer Methoden nebeneinander (Triangulations-Dashboard) ist in Sprint 3+ geplant. Das Datenmodell (`methods: [String]`) ist ab Sprint 1a multi-method-fähig.

---

### 3.2 Anonymisierung

**Ziel**: Bewertungs-Bias durch persönliche Bekanntheit reduzieren.

**Umsetzung**:
- Abgaben erhalten Fantasy-Namen (Format: `[Adjective][Adjective][Creature]` in CamelCase, z.B. `ClumsyGoldenDragon`, `WiseMightyPhoenix`)
- Reihenfolge wird einmalig randomisiert und stabil in der DB gespeichert
- `actualName` wird AES-256-verschlüsselt gespeichert; Mongoose-Middleware ver-/entschlüsselt transparent

**Klarnamen-Einblendung (Lehrer)**:
Der Lehrer kann in allen Views, die Abgaben anzeigen, den Klarnamen einer anonymisierten Abgabe temporär einblenden. Anforderungen:
- Verfügbar in: Session-Verwaltung, Bewertungs-Views (Drag & Drop, Paarweiser Vergleich), Ergebnisansicht
- Pro Abgabe unabhängig schaltbar (nicht „alle aufdecken")
- Nicht persistent: beim nächsten Seitenaufruf oder Paarwechsel wieder verborgen

**Klarnamen-Freigabe für Schüler (Lehrer-Entscheidung)**:
Der Lehrer entscheidet, ob Schüler bei einer anonymisierten Session Klarnamen sehen dürfen. Diese Einstellung ist unabhängig von der Anonymisierung selbst:
- Anonymisierung aktiv + Freigabe aus (Standard): Schüler sehen ausschließlich Fantasy-Namen
- Anonymisierung aktiv + Freigabe an: Schüler sehen Fantasy-Namen und können Klarnamen einblenden
- Die Freigabe kann der Lehrer z.B. nach Abschluss der Bewertung aktivieren (Ergebnispräsentation)

| Bias-Typ | Beschreibung | rank2rate-Lösung |
|---|---|---|
| Halo-Effekt | „Max war immer gut, also ist das auch gut" | Anonymisierung |
| Primacy-Effekt | Erste Abgabe wird bevorzugt | Randomisierte Reihenfolge |
| Contrast-Effekt | Bewertung hängt von vorheriger Abgabe ab | Paarweise Vergleiche |
| Severity-Bias | Einzelne Bewerter sind strenger | Triangulation |

---

### 3.3 QR-Code-Workflow

1. Lehrer erstellt Session → Session-URL wird generiert
2. QR-Code wird **clientseitig** aus der URL erzeugt (kein Server-Schritt)
3. Schüler scannen QR-Code → Browser öffnet `/session/:id` ohne Login
4. Optional: „Welches ist deine Abgabe?" → wird ausgeblendet
5. Nach Abstimmung: Cookie gesetzt (Mehrfach-Voting-Schutz, Sprint 2)
6. Lehrer sieht Fortschritt live (Polling alle 2 s, Sprint 2)
7. Lehrer schließt Session → Ergebnisse im Präsentations-Modus

**DSGVO**:
- Keine Schülernamen gespeichert (nur anonyme Voter-Tokens)
- `actualName` AES-verschlüsselt
- Sessions automatisch nach 7 Tagen gelöscht (MongoDB TTL-Index, kein Cron-Job)

---

### 3.4 Ergebnisansicht

Vollständige Wireframes: [`docs/ui-views.md` (SessionResultsView)](docs/ui-views.md)

Die Ergebnisansicht bietet zwei Wege nach abgeschlossener Reihung.

**Schritt 1 – Reihungsergebnis** (nach gespeicherter Reihung):
- Zugang wird erst angeboten, nachdem eine Reihung gespeichert wurde (kein leerer Zustand)
- Darstellung je nach Verfahren:
  - **Drag & Drop**: Gruppen-Karten mit zugeordneten Abgaben
  - **Paarweiser Vergleich**: Rangliste nach Punkten (Rang, Abgabe, Punkte)
- Anonymisierungs-Toggle (Klarnamen ein-/ausblenden) verfügbar
- **Zwei gleichwertige Abschlussoptionen:**
  - **„Reihung abschließen"**: Das Ranking ist das Endergebnis — keine Benotung. Sinnvoll für formative Bewertung, Feedback-Runden, Präsentationsreihenfolgen. Status bleibt `ranked`.
  - **„Noten ableiten →"**: Übergang zu Schritt 2 (Benotung). Die Formulierung betont den abgeleiteten, konstruierten Charakter der Notenberechnung.

**Schritt 2 – Notenvorschlag** (nach Reihung, optional):
- Lehrer wählt Notensystem (z.B. Schulnoten 1–6, Abiturpunkte 0–15, A–F)
- Lehrer wählt Verteilungsmethode (Sprint 1: linear; Sprint 2: gaußverteilt)
- Vorschau zeigt sofort die resultierende Notenverteilung — alle Noten sind als **Vorschlag** gekennzeichnet
- Gleichstände an Notengrenzen: alle erhalten standardmäßig die bessere Note
- **Die algorithmisch ermittelte Note ist immer nur ein Vorschlag.** Der Lehrer kann jede einzelne Note individuell überschreiben (Feintuning). Geänderte Noten werden visuell markiert (z.B. anderer Farbton), damit die Abweichung vom Vorschlag erkennbar bleibt.
- **Reflexionspflicht vor dem Speichern:** Der Lehrer muss entweder mindestens eine Note manuell anpassen **oder** explizit bestätigen, dass er den Vorschlag geprüft hat (Checkbox). Passives Durchklicken wird verhindert.
- **Optionale Kontextnotiz:** Freitextfeld für Anmerkungen zur Benotung (z.B. „Klasse insgesamt schwach, Noten angehoben"). Wird im `ratingResult.note` gespeichert.
- **Hinweisbox bei 0 manuellen Änderungen:** Nach dem Speichern erscheint ein Info-Hinweis, wenn alle Noten dem Algorithmus-Vorschlag entsprechen.
- Benotungsergebnis wird separat gespeichert (`ratingResult`)
- Sprint 3+: Präsentations-Modus (Vollbild, beameroptimiert)

---

### 3.5 Zweiphasiger Prozess: Reihung → Benotung

Das namensgebende Kernkonzept des Tools: `rank2rate` bedeutet wörtlich **Reihung → Benotung**.

#### Phase 1: Reihung (Ranking)

Durch die Anwendung eines oder mehrerer vergleichender Verfahren (Paarvergleich, Drag & Drop, Dot Voting etc.) entsteht eine **Rangfolge der Abgaben**. Diese Rangfolge:
- ist relativ (Abgaben werden zueinander geordnet, nicht an festen Kriterien gemessen)
- erlaubt **Gleichstände** — z.B. `a, b, c, c, d, e, e, e, f`
- ist das Ergebnis der Reihungsphase und Ausgangspunkt für die Benotungsphase

**Reihung als Endprodukt:** Die Reihung kann auch ohne anschließende Benotung als eigenständiges Ergebnis gespeichert und exportiert werden (Status `ranked` als Endzustand). Anwendungsfälle: formative Bewertung, Feedback-Runden, Präsentationsreihenfolge, Selbstreflexion.

#### Phase 2: Benotung (Rating) — optional, ausschließlich Lehrer

**Die Benotungsphase ist dem Lehrer vorbehalten und optional.** Schüler nehmen an der Reihungsphase teil (via Peer-Review), haben aber keinen Zugang zur Benotung. Technisch: alle Benotungs-Endpunkte erfordern JWT-Auth (Lehrer-Account), die `StudentSessionView` hat keinen Zugang zu Benotungsfunktionen.

**Messtheoretischer Hinweis:** Die Ableitung absoluter Noten aus einem relativen Ranking (soziale → sachliche Bezugsnorm) ist ein Kategoriensprung. Das Tool adressiert dies durch: (1) konsequente Kennzeichnung aller Noten als „Vorschlag", (2) Reflexionspflicht vor dem Speichern, (3) die Möglichkeit, beim Ranking zu verbleiben. Siehe [`docs/anregung.md`](docs/anregung.md).

Aus der Rangfolge wird eine Note abgeleitet. Der Lehrer wählt dafür:

1. **Notensystem**: z.B. Schulnoten 1–6, Punkte 0–15 (Abitur), Prozent, A–F
2. **Verteilungsmethode**:
   - **Linear**: Gleiche Abstände zwischen den Noten; jede Note erhält annähernd gleich viele Abgaben
   - **Gaußverteilt**: Mehr Abgaben im Mittelfeld, wenige Ausreißer oben/unten (Normalverteilung)
   - **Manuell**: Der Lehrer verschiebt Grenzen nach eigenem Ermessen

**Gleichstände an Notengrenzen**: Liegen gleichrangige Abgaben genau auf einer Grenze zwischen zwei Noten, erhalten sie standardmäßig alle die **bessere Note**. Der Lehrer kann dies manuell anpassen.

```
Reihung-Ergebnis (Beispiel, 8 Abgaben):
  Platz 1: ClumsyGoldenDragon
  Platz 2: WiseMightyPhoenix, GrumpyTinyWizard  ← Gleichstand
  Platz 4: SleepyBraveTroll
  ...

  ↓  Benotung mit Schulnoten 1–4, linear

  Note 1: ClumsyGoldenDragon
  Note 2: WiseMightyPhoenix, GrumpyTinyWizard
  Note 3: SleepyBraveTroll, ...
  Note 4: ...
```

---

### 3.6 Fachglossar & Begriffspräzisierung

#### Abgabe (Submission)
Das konkrete Arbeitsergebnis eines Schülers (Plakat, Infografik, Code-Demo, Kurzpräsentation). Überschaubar: in 1–3 Minuten erfassbar. **Keine Abgabe** im Sinne dieses Tools: umfangreiche Dokumentationen (> 10 Seiten), komplexe Software ohne Demo.

#### Projekt
Die übergeordnete Unterrichtseinheit (z.B. „Informatik-Projekt Smart Home"). In rank2rate intern als MongoDB-Collection `projects` bezeichnet – bezieht sich aber stets auf **Abgaben**, nicht auf Projekte im pädagogischen Sinn.

#### Reihung vs. Benotung
- **Reihung** (engl. Ranking): Die Kernbegriffe des Tools. Vergleichende Verfahren erzeugen eine Rangfolge. Gleichstände sind explizit erlaubt und gewünscht.
- **Benotung** (engl. Rating): Zweiter Schritt — die Rangfolge wird in ein Notensystem überführt. Erst hier entstehen absolute Noten.

#### Reihung vs. Gruppierung
- **Reihung**: Vollständige Rangfolge der Abgaben zueinander, Gleichstände möglich (z.B. Ergebnis des Paarvergleichs)
- **Gruppierung**: Abgaben werden Qualitätsstufen zugeordnet, keine strikte Reihenfolge innerhalb einer Gruppe (z.B. Drag & Drop)

#### Drag & Drop ≠ Bewertungsmethode
Drag & Drop ist eine UI-Interaktionstechnik. Sie kann für Ranking (Reihenfolge) oder Gruppierung (Qualitätsstufen) eingesetzt werden.

#### Relative vs. Absolute Bewertung
- **Relativ**: Objekte im Vergleich zueinander (Paarvergleich, Dot Voting) – leichter anzuwenden
- **Absolut**: Anhand fester Kriterien (Kategorien-Bewertung) – transparenter, braucht Kriterien

#### Paarweiser Vergleich
Zwei Objekte direkt gegenübergestellt: „Welches ist besser?" – Binäre Entscheidung (optional: Gleichstand). rank2rate verwendet eine **Zufallsstichprobe** von ~2×n Paaren (nicht alle n×(n−1)/2).

#### Gleichstand (Tie)
Zwei oder mehr Abgaben auf demselben Rang. Bei **Reihung** immer erlaubt und gewünscht (z.B. gleiche Punktzahl im Paarvergleich, gleiche Gruppe im Drag & Drop). Bei **Benotung** an einer Notengrenze gilt die Sonderregel: alle Gleichrangigen erhalten standardmäßig die bessere Note. Der Lehrer kann manuell abweichen.

#### Triangulation
Dasselbe Objekt mit mehreren unterschiedlichen Verfahren bewerten, um ein robusteres Gesamtbild zu erhalten. Echte Triangulation entsteht entlang dreier Achsen: Erkenntnisart (relativ vs. absolut), Evaluator (Lehrer vs. Peers), Kognitionstyp (holistisch vs. analytisch). Details: [`docs/triangulation.md`](docs/triangulation.md)

#### Konfidenz (im Triangulationskontext)
Grad der Übereinstimmung zwischen mehreren Verfahren für eine einzelne Abgabe. Hohe Konfidenz (●●●) = alle Verfahren liefern ähnliche Ränge. **Keine statistische Konfidenz** — rein deskriptiver Indikator im UI.

#### Divergenz
Gegenstück zu Konfidenz: starke Abweichung der Ränge einer Abgabe zwischen Verfahren. Divergenzen sind keine Fehler — sie machen Ambivalenz sichtbar und können pädagogisch wertvoll sein (z.B. Lehrer vs. Peer-Perspektive).

#### Konsistenz vs. Inkonsistenz
Zwei verschiedene Bedeutungen im System — nicht verwechseln:
- **Konsistenzprüfung**: Gleicher Evaluator wendet zwei ähnliche Verfahren an (z.B. Drag & Drop + Paarvergleich). Prüft, ob der Bewerter mit sich selbst übereinstimmt. Ergibt keine neue Perspektive, aber deckt Unsicherheit auf.
- **Inkonsistenz**: Logischer Widerspruch *innerhalb* eines einzelnen Paarvergleichs — Dreier-Zyklus A > B > C > A. Wird als nicht-blockierende Warnung angezeigt.

---

## 4. Reihungsverfahren

Detailbeschreibungen mit UI-Skizzen und Algorithmus-Details: [`docs/verfahren.md`](docs/verfahren.md)

### Übersicht

| Nr. | Verfahren | Typ | Zeitaufwand | Best Use Case | Sprint |
|---|---|---|---|---|---|
| 1 | Paarweiser Vergleich | Relativ | Mittel | Unsichere Fälle | ✅ 1 |
| 2 | Drag & Drop Gruppierung | Relativ | Niedrig | Schnellbewertung | ✅ 1 |
| 3 | Dot Voting | Relativ | Niedrig | Gruppen/Peer-Review | 2 |
| 4 | Kategorien-Bewertung | Absolut | Mittel | Detailbewertung | 3+ |

---

## 5. User Stories

### 5.1 Lehrperson (Einzelbewertung)

- **US-1.1**: Als Lehrerin möchte ich Abgaben mit Titeln und optionalem Link eingeben.
- **US-1.1a**: Als Lehrerin möchte ich Titel und Link einer Abgabe nachträglich bearbeiten können.
- **US-1.1b**: Als Lehrerin möchte ich eine Abgabe löschen können (Minimum 3 Abgaben müssen erhalten bleiben).
- **US-1.2**: Als Lehrerin möchte ich Abgaben anonymisieren (Fantasy-Namen), um unvoreingenommen zu bewerten.
- **US-1.2a**: Als Lehrerin möchte ich bei anonymisierten Sessions den Klarnamen einer Abgabe temporär einblenden können.
- **US-1.2b**: Als Lehrerin möchte ich entscheiden können, ob Schüler Klarnamen sehen dürfen (z.B. nach Abschluss der Bewertung für die Ergebnispräsentation).
- **US-1.3**: Als Lehrerin möchte ich Abgaben per Drag & Drop in Gruppen sortieren.
- **US-1.4**: Als Lehrerin möchte ich Abgaben paarweise vergleichen.
- **US-1.4a**: Als Lehrerin möchte ich die Reihung als eigenständiges Ergebnis abschließen können, ohne Noten abzuleiten.
- **US-1.5**: Als Lehrerin möchte ich nach der Reihung optional ein Notensystem und eine Verteilungsmethode wählen, um die Rangfolge in Notenvorschläge zu überführen.
- **US-1.5a**: Als Lehrerin möchte ich jede einzelne algorithmisch vorgeschlagene Note individuell überschreiben können (Feintuning), und manuell geänderte Noten sollen visuell als solche erkennbar sein.
- **US-1.5b**: Als Lehrerin möchte ich vor dem Speichern der Noten aktiv bestätigen, dass ich die Vorschläge geprüft habe — oder mindestens eine Note manuell anpassen.
- **US-1.5c**: Als Lehrerin möchte ich eine optionale Notiz zur Benotung hinterlegen können (z.B. „Klasse insgesamt schwach, Noten angehoben"), die im Ergebnis gespeichert wird.
- **US-1.6** *(Sprint 2)*: Als Lehrerin möchte ich Ergebnisse als CSV exportieren.

### 5.2 Lehrperson (Session-Initiator)

- **US-2.1**: Als Lehrer möchte ich eine Peer-Review-Session per QR-Code teilen.
- **US-2.2**: Als Lehrer möchte ich verhindern, dass Schüler ihre eigene Abgabe bewerten.
- **US-2.3**: Als Lehrer möchte ich live sehen, wie viele Schüler bereits bewertet haben.
- **US-2.4**: Als Lehrer möchte ich Ergebnisse im Präsentations-Modus am Beamer zeigen.

### 5.3 Schüler (Peer-Review)

- **US-3.1**: Als Schüler möchte ich einen QR-Code scannen und sofort bewerten, ohne Login.
- **US-3.2**: Als Schüler möchte ich meine eigene Abgabe nicht sehen.
- **US-3.3**: Als Schüler möchte ich Punkte auf Abgaben verteilen (Dot Voting).
- **US-3.4**: Als Schüler möchte ich sehen, wie viele Abgaben ich noch bewerten muss.

### 5.4 Priorisierung

- **Sprint 1 (MVP)**: US-1.1–1.5c (Einzelbewertung Lehrer: Abgaben, Reihung, optionale Benotung mit Reflexionspflicht)
- **Sprint 2**: US-1.6 (CSV-Export), US-2.1–2.4 (Peer-Review), US-3.1–3.4 (Schüler)
- **Sprint 3+**: Triangulations-Ansicht, Echtzeit-Updates
- **Sehr optionaler Scope (kein Sprint geplant)**: Selbstreflexion — nutzt nur Phase 1, benötigt eigenes Auth-Modell, abweichendes UX-Konzept

---

## 6. Datenmodell

**Technologie**: MongoDB mit Mongoose · Details: [`docs/stack.md`](docs/stack.md)

### sessions

```
{
  _id:             ObjectId,
  title:           String (required),
  methods:         [String] (enum-Werte: pairwise | drag-drop | categories | dot-voting, mind. 1 Eintrag),
  settings:        Mixed  { groupCount: 3|5 (drag-drop), pointsPerVoter: Number (dot-voting), ... },
  teacherId:       ObjectId → users,
  anonymized:      Boolean (default: false),
  revealNamesForStudents: Boolean (default: false),  // Klarnamen-Freigabe für Schüler
  status:          String (enum: draft | active | ranked | graded, default: draft),
  groupingResult:  Mixed | null,   // Array von { label, projectIds[] } nach Drag & Drop
  pairwiseResult:  Mixed | null,   // { comparisons[], ranking[] } nach Paarvergleich
  ratingResult:    Mixed | null,   // { gradeSystem, distributionMethod, grades: [{ projectId, computedGrade, finalGrade }], note?: String } nach Benotung
  expiresAt:       Date (default: now + 7 Tage),  // TTL-Index → automatische Löschung
  createdAt:       Date,
  updatedAt:       Date
}
```

### projects (= Abgaben)

```
{
  _id:         ObjectId,
  sessionId:   ObjectId → sessions,
  displayName: String,   // Fantasy-Name (anonymisiert) oder echter Name
  actualName:  String,   // AES-256-verschlüsselt (Mongoose-Middleware)
  link:        String,   // optional
  order:       Number    // stabile Reihenfolge (einmalig randomisiert bei Anonymisierung)
}
```

### votes (Phase 1: Dot Voting / Peer-Review)

```
{
  _id:        ObjectId,
  sessionId:  ObjectId → sessions,
  projectId:  ObjectId → projects,
  voterToken: String,   // anonymer Cookie-Wert, kein Schülername
  points:     Number,
  createdAt:  Date
}
```

### users (Lehrer-Accounts)

```
{
  _id:          ObjectId,
  email:        String (unique),
  passwordHash: String (bcrypt),
  createdAt:    Date
}
```

**Technische Hinweise**:
- TTL-Index auf `sessions.expiresAt` → MongoDB löscht Sessions nach 7 Tagen automatisch
- `actualName` wird per AES-256 mit Server-Secret (`.env`) ver-/entschlüsselt
- `settings` und `*Result`-Felder als `Mixed` (native MongoDB-Dokumentstruktur, kein JSONB)

---

## 7. API-Endpoints & Frontend-Routen

Details: [`docs/routen-api.md`](docs/routen-api.md)

---

## 8. Design System

Vollständige Entscheidungen: siehe CLAUDE.md (Kern-Konventionen)

### Farbschema (Tailwind)

| Rolle | Klassen |
|---|---|
| Primary | `blue-600` / `blue-500` (hover) / `blue-700` (active) |
| Success | `green-600` / `green-100` |
| Warning | `amber-500` / `amber-100` |
| Error | `red-600` / `red-100` |
| Neutral | `slate-900` (Headings) / `slate-700` (Text) / `slate-300` (Borders) / `slate-100` (BG) |

### Empfohlene Bewertungsskalen

| Einsatz | Stufen |
|---|---|
| Allgemein (5 Stufen) | Herausragend / Sehr gut / Gut / Ausreichend / Nicht ausreichend |
| Kriterien (4 Stufen) | Vollständig erfüllt / Überwiegend erfüllt / Teilweise erfüllt / Nicht erfüllt |
| Schnell/formativ (3 Stufen) | Vorbildlich / Solide / Entwicklungspotenzial |

---

## 9. Testing-Ansatz

**Methode**: ATDD – Szenarien werden vor der Implementierung als Prosa/Tabellen definiert und gemeinsam abgenommen, dann als automatisierte Tests umgesetzt.

### Test-Stack

| Schicht | Tool | Zweck |
|---|---|---|
| Frontend (Unit/Composables) | Vitest + happy-dom | Composable-Logik, Zustandsmaschinen |
| Frontend (Komponenten) | @vue/test-utils | Vue-Komponenten isoliert testen |
| Backend (API-Integration) | Vitest + supertest | Express-Endpunkte mit echter DB |
| Backend (DB) | mongodb-memory-server 11.x | In-Memory-MongoDB, kein externes MongoDB nötig |

### Workflow pro Feature

1. Testfälle als Szenarien definieren (wird bei Implementierung als `docs/testing.md` angelegt)
2. Abnahme der Szenarien durch den User
3. Testfälle als Vitest-Tests implementieren
4. Feature implementieren
5. Manuelle Plausibilisierung (wird als `docs/mvp-manual-testing.N.md` angelegt)
6. Commit → Merge → Feature-Branch löschen

---

## 10. Roadmap

Detaillierter Implementierungsplan mit Checkboxen: [`docs/plan.md`](docs/plan.md)

### Sprint 1a: Echter MVP – ein kompletter Durchlauf

> Login → Session erstellen → Drag & Drop reihen → benoten. Reihung → Benotung vollständig.

| Feature | Status |
|---|---|
| Setup & Infrastruktur | offen |
| Backend: Auth (register, login, JWT) | offen |
| Backend: Session & Abgaben CRUD (ohne GET /sessions) | offen |
| Backend: Drag & Drop Ergebnis speichern | offen |
| Backend: Benotung (lineare Verteilung) | offen |
| Frontend: Auth (Login, Register, Store) | offen |
| Frontend: Session erstellen | offen |
| Frontend: Drag & Drop Gruppierung | offen |
| Frontend: Ergebnisansicht (Drag & Drop) | offen |
| Frontend: Benotung (Notensystem + Verteilung) | offen |

### Sprint 1b: Zweites Verfahren + vollständige Verwaltung

| Feature | Status |
|---|---|
| Backend: GET /api/sessions (für Dashboard) | offen |
| Backend: Paarvergleich-Ergebnis speichern | offen |
| Frontend: Dashboard | offen |
| Frontend: Session verwalten (bearbeiten, löschen) | offen |
| Frontend: Paarweiser Vergleich | offen |
| Frontend: Ergebnisansicht um Paarvergleich-Ansicht ergänzen | offen |

### Sprint 2: Peer-Review + Verteilungsoptionen

| Feature | Status |
|---|---|
| Reihung: Dot Voting | offen |
| QR-Code-Workflow & Session-Management | offen |
| Live-Dashboard (Abstimmungsfortschritt) | offen |
| Benotung: Gaußverteilung | offen |
| Perspektivenvergleich Lehrer/Peers (Divergenz-Ansicht) | offen |
| CSV-Export (Ranking und/oder Noten) | offen |

### Sprint 3+

Kategorien-Bewertung, Triangulations-Ansicht, Kollegiale Peer-Review (Multi-Evaluator), WebSockets, PIN-Code-Schutz, Visualisierungen (Podest, Heatmap), Hybride Bewertung, PDF-Export, Session-Templates, Bradley-Terry-Algorithmus, Präsentations-Modus, Dark Mode, Multi-Language

---

## 11. Offene Fragen

| Frage | Kontext |
|---|---|
| Notizen/Kommentare | Nur Freitext oder strukturiertes Feedback pro Abgabe? |
| Kategorien-Bewertung | Mindest- und Maximalanzahl an Kategorien? |
| Schüler-Zustimmung | Explizites Opt-in im Interface oder nur Lehrer-Bestätigung vor Session-Start? |
| Dashboard-Umfang | Welche Informationen zeigt das Lehrer-Dashboard pro Session (Thumbnail, letztes Bearbeitungsdatum, Methoden-Badge)? |
| ~~QR-Code~~ | **Entschieden**: clientseitig im Frontend. `qrcode`-Paket nach `frontend/package.json` verschoben. |

---

## 12. Änderungshistorie

| Datum | Version | Änderung |
|---|---|---|
| 2026-02-07 | 0.1 | Initiales Konzeptdokument |
| 2026-02-07 | 0.2 | Personas, User Stories, QR-Code-Workflow, Roadmap |
| 2026-02-10 | 0.3 | Fachglossar, Bewertungsskalen, Begriffspräzisierung |
| 2026-02-11 | 0.3.1 | „Projekt" → „Abgabe" durchgängig ersetzt |
| 2026-02-11 | 0.3.2 | Paarvergleich vereinheitlicht |
| 2026-02-20 | 0.4 | Alle Tech-Entscheidungen getroffen, Datenmodell als MongoDB-Dokumentstruktur |
| 2026-02-20 | 0.5 | Personas nach `personas.md` ausgelagert |
| 2026-03-05 | 1.0 | Vollständige Überarbeitung: Datenmodell auf Implementierungsstand aktualisiert (anonymized, groupingResult, pairwiseResult, order), API-Endpoints ergänzt (Auth, CRUD, Peer-Review), Testing-Abschnitt neu, Roadmap auf plan.md konsolidiert, veraltete „Offene Fragen" entfernt, stack.md referenziert statt dupliziert |
| 2026-03-06 | 1.1 | Begriffspräzisierung: Zweiphasiger Prozess Reihung → Benotung als neuer Kern-Konzept-Abschnitt (3.5) eingeführt. Glossar um Reihung/Benotung erweitert, Gleichstände in Reihung explizit erlaubt. Kernziel aktualisiert. |
| 2026-03-06 | 1.2 | Roadmap auf Sprint-Struktur umgestellt (Sprint 1: MVP Reihung+Benotung, Sprint 2: Peer-Review+Gaußverteilung, Sprint 3+: Rest). Datenmodell um ratingResult ergänzt. API-Endpoint für Benotung ergänzt. Ergebnisansicht um Benotungsschritt erweitert. User Stories für Benotung (US-1.5/1.5a) ergänzt, Priorisierung korrigiert. UC-Tabelle mit Sprint-Zuordnung. Verfahrens-Übersicht mit Sprint-Spalte. Terminologie „Phase 1/2" im QR-Workflow → „Sprint 1/2". |
| 2026-03-06 | 1.3 | Abschnitt 4 (Verfahren-Details) nach docs/verfahren.md ausgelagert. Falsche stack.md-Referenz in Abschnitt 7 entfernt. Doppelte mongodbMemoryServer-Versionsnotiz aus Abschnitt 9 entfernt (steht in stack.md). QR-Code client/serverseitig als offene Frage eingetragen. |
| 2026-03-06 | 1.4 | Abschnitt 7 (API-Endpoints + Frontend-Routen) nach docs/routen-api.md ausgelagert. stack.md und personas.md nach docs/ verschoben, Referenzen aktualisiert. |
| 2026-03-07 | 1.5 | Glossar erweitert (Gleichstand, Triangulation, Konfidenz, Divergenz, Konsistenz/Inkonsistenz). Normalisierung als Verfahren entfernt (passt nicht zum Zweiphasen-Modell). Session-Status-Enum: draft\|active\|ranked\|graded. ratingResult.grades um computedGrade/finalGrade erweitert. teacherId-Referenz korrigiert (→ users). UC1 "Kalibrierung" → "Paarvergleich". QR-Code-Frage entschieden (clientseitig). entscheidungen.md-Referenz entfernt. |
| 2026-03-08 | 1.6 | Vorschlagscharakter und Reflexionspflicht: Benotung als optional positioniert, Reihung als eigenständiges Endergebnis (Status `ranked` als Endzustand). Sprachliche Repositionierung im gesamten UI (Vorschlag statt Note, Noten ableiten statt Jetzt benoten). Reflexionspflicht vor Speichern (Checkbox oder manuelle Änderung). Kontextnotiz in `ratingResult.note`. Hinweisbox bei 0 manuellen Änderungen. Perspektivenvergleich Lehrer/Peers (Sprint 2). Kollegiale Peer-Review als UC5 und Sprint 3+ Feature. User Stories US-1.4a, US-1.5b, US-1.5c ergänzt. Siehe `docs/anregung.md`. |
