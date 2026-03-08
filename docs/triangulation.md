# rank2rate – Triangulation

Triangulation bedeutet: dasselbe Objekt mit mehreren unterschiedlichen Verfahren bewerten, um ein robusteres Gesamtbild zu erhalten. Dieses Dokument beschreibt die fachliche Grundlage, sinnvolle Verfahrenskombinationen und konkrete Szenarien.

Sprint-Zuordnung und Implementierungsplan: [`docs/plan.md`](plan.md)

---

## Triangulationsachsen

Echte Triangulation entsteht nur, wenn mindestens zwei dieser Achsen unterschiedlich bedient werden. Zwei ähnliche Verfahren vom selben Evaluator liefern eher Konsistenzprüfung als Triangulation.

| Achse | Variante A | Variante B |
|---|---|---|
| **Erkenntnisart** | Relativ (Vergleich) | Absolut (Kriterien) |
| **Evaluator** | Lehrer (Experte) | Schüler (Peers) |
| **Kognitionstyp** | Holistisch / ganzheitlich | Analytisch / kriterienbasiert |

---

## Sinnvolle Kombinationen

### Kombination 1: Drag & Drop + Paarweiser Vergleich
**Verfügbar ab**: Sprint 1b
**Triangulationsachse**: Kognitionstyp (holistisch → analytisch), gleicher Evaluator

**Szenario**:
Daria hat 8 Referate bewertet. Drag & Drop in 3 Minuten: 2 Abgaben im Top, 4 im Mittelfeld, 2 unten. Die 4 im Mittelfeld fühlen sich alle "gleich gut" an. Der anschließende paarweise Vergleich deckt auf: eine davon gewinnt 4 von 4 direkten Vergleichen innerhalb der Gruppe — Rang 3, nicht Rang 5.

**Warum sinnvoll**:
Die holistische Gruppierung und der analytisch-binäre Direktvergleich greifen auf unterschiedliche kognitive Prozesse zu. Wo sie divergieren, liegt echte Ambivalenz — die Triangulation macht sie sichtbar statt zu verbergen.

**Einschränkung**: Gleicher Evaluator, beide Verfahren relativ. Eher Konsistenzprüfung als Perspektivenvielfalt — aber wertvoll für den Lehrer als Einzelbewerter.

---

### Kombination 2: Paarweiser Vergleich + Dot Voting
**Verfügbar ab**: Sprint 2
**Triangulationsachsen**: Evaluator (Experte + Peers) und Kognitionstyp (analytisch + distributiv)

**Szenario**:
Amir initiiert eine Peer-Review-Session für 12 Gruppen-Präsentationen mit 24 Schülern. Amir macht selbst den Paarvergleich: methodische Tiefe, Fachwissen. Die Schüler machen Dot Voting: Breite der Perspektiven, soziale Signale. Ergebnis: "ClumsyGoldenDragon" gewinnt Amirs Paarvergleich klar, bekommt im Schüler-Voting aber nur Platz 3. Amir nutzt die Diskrepanz als Unterrichtsgespräch: "Was habt ihr gesehen, was ich nicht gesehen habe?"

**Warum sinnvoll**:
Expertenwissen vs. Crowd-Perspektive ist die klassischste und wertvollste Triangulationsachse. Divergenzen sind keine Fehler — sie sind Erkenntnisgewinn. Pädagogisch besonders wertvoll, weil die Differenz selbst zum Lerngegenstand wird.

---

### Kombination 3: Drag & Drop + Dot Voting
**Verfügbar ab**: Sprint 2
**Triangulationsachse**: Evaluator (Experte + Peers)

Wie Kombination 2, aber der Lehrer verwendet Drag & Drop statt Paarvergleich. Funktioniert, ist aber weniger präzise: Drag & Drop liefert keine Feinabstufung innerhalb von Gruppen, sodass Dot Voting weniger gut ergänzt als beim Paarvergleich.

**Empfehlung**: Nur wenn Zeit für den Paarvergleich fehlt. Kombination 2 ist vorzuziehen.

---

### Kombination 4: Paarweiser Vergleich + Kategorien-Bewertung
**Verfügbar ab**: Sprint 3+
**Triangulationsachse**: Erkenntnisart (relativ-intuitiv + absolut-kriterienbasiert), gleicher Evaluator

**Szenario**:
Daria bewertet Abschlussarbeiten. Der Paarvergleich ergibt eine Rangfolge 1–8. Die Kategorien-Bewertung (Inhalt / Form / Struktur) ergibt Punktesummen pro Kriterium. "WiseMightyPhoenix" steht im Paarvergleich auf Platz 2, hat aber in "Formale Gestaltung" den höchsten Score aller Abgaben. Daria erkennt: sie hat holistisch Abgaben mit starker Form überbewertet. Im kriterienbasierten Vergleich liegt "GrumpyTinyWizard" eigentlich vorne.

**Warum sinnvoll**:
Relative Verfahren sind schnell, aber anfällig für Halo-Effekte (gute Form → wirkt insgesamt besser). Die Kategorien-Bewertung neutralisiert das durch explizite Kriterien. Stärkste Kombination für sachlich dokumentierbare Einzelbewertungen — z.B. Abschlussarbeiten, bei denen die Note begründungspflichtig ist.

---

### Kombination 5: Paarweiser Vergleich + Dot Voting + Kategorien-Bewertung
**Verfügbar ab**: Sprint 3+
**Triangulationsachsen**: Alle drei Dimensionen

**Szenario**:
Abitur-Projektwoche, 10 Abgaben. Der Lehrer macht Paarvergleich (intuitiv-relativ) und Kategorien-Bewertung (kriterienbasiert-absolut). Die Klasse macht Dot Voting (Peer-Perspektive). Drei unabhängige Rangfolgen entstehen. Das Triangulations-Dashboard zeigt Übereinstimmungen (hohe Konfidenz) und Divergenzen (erfordern Lehrer-Urteil).

**Warum sinnvoll**:
Vollständige Abdeckung aller Triangulationsachsen. Methodisch am stärksten begründbar. Für Hochstakessituationen mit viel Gewicht auf der Note geeignet.

**Einschränkung**: Hoher Aufwand. Nur gerechtfertigt, wenn Noten explizit rechtfertigungspflichtig sind.

---

### Kombination 6: Kollegiale Peer-Review (Multi-Evaluator)
**Verfügbar ab**: Sprint 3+
**Triangulationsachse**: Evaluator (mehrere Experten)

**Szenario**:
Daria ist unsicher bei der Bewertung von 6 Abschlussarbeiten. Sie lädt zwei Kolleg\*innen per Link ein, dasselbe Set unabhängig zu reihen (Drag & Drop oder Paarvergleich). Keine\*r sieht die Ergebnisse der anderen. Nach Abschluss zeigt eine Übereinstimmungsmatrix: Bei 4 Abgaben sind sich alle einig, bei 2 gehen die Einschätzungen auseinander. Daria nutzt die Divergenzen als Grundlage für ein Gespräch mit den Kolleg\*innen.

**Warum sinnvoll**:
Echte Triangulation auf der Evaluator-Achse — ohne Schüler, ohne Noten. Reduziert individuelle Bewertungs-Bias und macht implizite Maßstäbe sichtbar. Besonders wertvoll bei begründungspflichtigen Noten.

**Umsetzung**:
- Neuer Session-Modus: „Kollegiale Einschätzung"
- Session-Ersteller lädt 1–3 Kolleg\*innen per Link/Code ein
- Jede\*r reiht unabhängig (eigenes Auth-Token, kein geteilter Account)
- Ergebnis: Übereinstimmungsmatrix mit Divergenz-Markierung
- Benötigt Multi-Evaluator-Datenmodell (Erweiterung von `groupingResult`/`pairwiseResult` um Evaluator-ID)

---

## Nicht sinnvolle Kombinationen

| Kombination | Warum nicht |
|---|---|
| Dot Voting + Dot Voting (zwei Runden) | Gleiche Methode, gleicher Evaluatortyp — kein Erkenntnisgewinn |
| Drag & Drop 3 Gruppen + Drag & Drop 5 Gruppen | Variation in Granularität, keine neue Dimension |

---

## Sprint-Zuordnung

| Sprint | Verfügbare Kombination | Triangulationsachse |
|---|---|---|
| 1b | Drag & Drop + Paarweiser Vergleich | Kognitionstyp |
| 2 | + Dot Voting | Evaluator (Lehrer + Peers) |
| 2 | Perspektivenvergleich Lehrer/Peers | Evaluator (Divergenz-Ansicht) |
| 3+ | + Kategorien-Bewertung | Erkenntnisart |
| 3+ | Kollegiale Peer-Review (Multi-Evaluator) | Evaluator (mehrere Experten) |
| 3+ | Triangulations-Dashboard (vergleichende Ansicht) | — |

---

## Architekturhinweis: Datenmodell

Das Sessionmodell verwendet `methods: [String]` statt `method: String` (Einzelwert), um mehrere Reihungsverfahren pro Session zu ermöglichen. Die zugehörigen Ergebnisfelder (`groupingResult`, `pairwiseResult` usw.) bleiben als separate `Mixed`-Felder erhalten — kein gemeinsames Ergebnisfeld.

Details: [`konzept.md` Abschnitt 6 (Datenmodell)](../konzept.md)

---

## Wireframes

Alle Views sind Mobile-first (375px). Die kombinierte Rangfolge ist read-only — der Lehrer kann sie nicht manuell umsortieren. Eingriffe sind nur durch Wiederholen eines Verfahrens möglich.

### A — Triangulations-Übersicht: 2 Verfahren

```
┌─────────────────────────────────────┐
│ ← Triangulation                  ⋯ │
│ Präsentationen ITA-Klasse           │
├─────────────────────────────────────┤
│ Drag & Drop ✓   Paarvergleich ✓    │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  2/2     │
├─────────────────────────────────────┤
│                                     │
│  KOMBINIERTES ERGEBNIS              │
│  ─────────────────────────          │
│                                     │
│  1  ClumsyGoldenDragon   ●●● hoch  │
│  2  WiseMightyPhoenix    ●●● hoch  │
│  3  GrumpyTinyWizard     ●●○ mittel│
│  4  SleepyBraveTroll     ●●● hoch  │
│  5  BoldSilverFox        ●○○ nied. │
│  5  SwiftDarkWolf        ●○○ nied. │
│  7  LazyCrimsonBear      ●●○ mittel│
│  8  CleverTinyOwl        ●●● hoch  │
│                                     │
│  ── Legende ──                      │
│  ●●● beide Verfahren einig          │
│  ●●○ geringfügige Abweichung        │
│  ●○○ starke Abweichung — prüfen    │
│                                     │
│  [5 Einträge ohne Abweichung]       │
│  [2 Einträge mit Abweichung  ▼]    │
│                                     │
│  Einzelne Verfahren                 │
│  [Drag & Drop]  [Paarvergleich]    │
├─────────────────────────────────────┤
│       [Noten ableiten →]            │
└─────────────────────────────────────┘
```

Konfidenz-Indikator `●●●` / `●●○` / `●○○` zeigt Übereinstimmung der Verfahren. Divergente Einträge sind in einem aufklappbaren Bereich gebündelt — bei hoher Übereinstimmung bleibt die Ansicht ruhig.

---

### B — Divergenz-Detail (Tap auf Eintrag mit niedriger Konfidenz)

```
┌─────────────────────────────────────┐
│ ← Zurück zur Übersicht              │
├─────────────────────────────────────┤
│                                     │
│  BoldSilverFox                      │
│  Kombiniert: Platz 5                │
│  Konfidenz: niedrig  ●○○            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Drag & Drop                 │    │
│  │ Gruppe: Mittelfeld (2/3)    │    │
│  │ Gemeinsam mit 3 anderen     │    │
│  │ → entspricht Rang 4–6       │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Paarweiser Vergleich        │    │
│  │ Punkte: 1,5 von 8           │    │
│  │ Siege: 1 · Nied.: 5 · =: 1  │    │
│  │ → Rang 7 von 8              │    │
│  └─────────────────────────────┘    │
│                                     │
│  Im Überblick wirkte diese Abgabe   │
│  mittelmäßig. Im direkten Vergleich │
│  schnitt sie deutlich schlechter ab.│
│                                     │
│  ─────────────────────────────      │
│  [Paarvergleich neu starten]        │
│                                     │
└─────────────────────────────────────┘
```

"Verfahren neu starten" ist eine destruktive Aktion — öffnet einen Bestätigungsdialog bevor das Ergebnis überschrieben wird.

---

### C — Tab: Einzelnes Verfahren (Drag & Drop Detailansicht)

```
┌─────────────────────────────────────┐
│ ← Triangulation                     │
│ Einzelansicht: Drag & Drop          │
├─────────────────────────────────────┤
│ [Drag & Drop ✓] [Paarvergleich ✓]  │
├─────────────────────────────────────┤
│                                     │
│  TOP                                │
│  ┌─────────────┐ ┌─────────────┐   │
│  │ClumsyGolden-│ │WiseMighty-  │   │
│  │Dragon       │ │Phoenix      │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  MITTELFELD                         │
│  ┌─────────────┐ ┌─────────────┐   │
│  │GrumpyTiny-  │ │BoldSilver-  │   │
│  │Wizard       │ │Fox          │   │
│  └─────────────┘ └─────────────┘   │
│  ┌─────────────┐                   │
│  │SleepyBrave- │                   │
│  │Troll        │                   │
│  └─────────────┘                   │
│                                     │
│  UNTERE GRUPPE                      │
│  ┌─────────────┐ ┌─────────────┐   │
│  │SwiftDark-   │ │LazyCrimson- │   │
│  │Wolf         │ │Bear         │   │
│  └─────────────┘ └─────────────┘   │
│  ┌─────────────┐                   │
│  │CleverTiny-  │                   │
│  │Owl          │                   │
│  └─────────────┘                   │
│                                     │
│  (schreibgeschützt — abgeschlossen) │
│                                     │
└─────────────────────────────────────┘
```

---

### D — Triangulations-Übersicht: 3 Verfahren (Lehrer + Peers)

```
┌─────────────────────────────────────┐
│ ← Triangulation                  ⋯ │
│ Präsentationen ITA-Klasse           │
├─────────────────────────────────────┤
│ D&D ✓  Paarv. ✓  Dot Voting ✓     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  3/3     │
├─────────────────────────────────────┤
│                                     │
│  KOMBINIERTES ERGEBNIS              │
│  ─────────────────────────          │
│                                     │
│  1  ClumsyGoldenDragon   ●●● hoch  │
│  2  WiseMightyPhoenix    ●●● hoch  │
│  3  GrumpyTinyWizard     ●●○ mittel│
│  4  SleepyBraveTroll     ●●● hoch  │
│  5  BoldSilverFox        ●○○ nied. │
│  6  SwiftDarkWolf        ●●○ mittel│
│  7  LazyCrimsonBear      ●●● hoch  │
│  8  CleverTinyOwl        ●●● hoch  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ⚠ Starke Divergenz          │    │
│  │ BoldSilverFox               │    │
│  │ Lehrer: Rang 5–7            │    │
│  │ Schüler (Dot Voting): Rang 2│    │
│  │ [Details ansehen]           │    │
│  └─────────────────────────────┘    │
│                                     │
│  [D&D]  [Paarverl.]  [Dot Voting]  │
├─────────────────────────────────────┤
│       [Noten ableiten →]            │
└─────────────────────────────────────┘
```

Der Hinweisblock für starke Divergenzen erscheint nur wenn mindestens ein Eintrag die Konfidenz-Schwelle unterschreitet. Bei vollständiger Übereinstimmung ist die Ansicht still.

---

### E — Divergenz-Detail: 3 Verfahren

```
┌─────────────────────────────────────┐
│ ← Zurück zur Übersicht              │
├─────────────────────────────────────┤
│                                     │
│  BoldSilverFox                      │
│  Kombiniert: Platz 5                │
│  Konfidenz: niedrig  ●○○            │
│                                     │
│  Lehrer                             │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ Drag & Drop  │ │ Paarvergl.   │  │
│  │ Mittelfeld   │ │ Rang 7/8     │  │
│  │ → Rang 4–6   │ │ 1,5 Pkt.    │  │
│  └──────────────┘ └──────────────┘  │
│                                     │
│  Schüler (24 Votes)                 │
│  ┌─────────────────────────────┐    │
│  │ Dot Voting                  │    │
│  │ 18 Punkte erhalten          │    │
│  │ → Rang 2 von 8              │    │
│  └─────────────────────────────┘    │
│                                     │
│  Schüler bewerten möglicherweise    │
│  andere Qualitäten als der Lehrer.  │
│  Das kombinierte Ergebnis gewichtet │
│  alle Verfahren gleichwertig.       │
│                                     │
│  [Paarvergleich wiederholen]        │
│  [Dot Voting neu öffnen]            │
│                                     │
└─────────────────────────────────────┘
```

Der Erklärungstext ist immer neutral formuliert — er benennt die Divergenz ohne zu werten, welches Verfahren "richtig" liegt. Die Entscheidung liegt beim Lehrer, ob er ein Verfahren wiederholt oder das kombinierte Ergebnis akzeptiert.
