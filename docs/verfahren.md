# rank2rate – Reihungsverfahren (Detailbeschreibung)

Dieses Dokument beschreibt die einzelnen Reihungsverfahren mit UI-Skizzen und Algorithmus-Details.
Übersicht und Sprint-Zuordnung: [`konzept.md`](../konzept.md)

---

## 1. Paarweiser Vergleich ✅ (Sprint 1b)

**Prinzip**: Zwei Abgaben direkt gegenübergestellt, Bewerter wählt die bessere.

**Algorithmus**: Zufallsstichprobe von min(2×n, n×(n−1)/2) Paaren. Sieg = 1 Punkt, Gleichstand = 0,5 Punkte, Überspringen = 0 Punkte. Reihung nach Gesamtpunkten.

**Inkonsistenz-Erkennung** (Standardfeature): Das System erkennt Dreier-Zyklen (A > B > C > A) und zeigt eine nicht-blockierende Warnung.

**Vorteile**: Zuverlässig, niedrige kognitive Last
**Nachteile**: Stichprobe weniger präzise als vollständige Paare (bewusster Kompromiss)

### Wireframe: Vergleichsansicht (Mobile)

```
┌─────────────────────────────────────┐
│ ← Paarweiser Vergleich           ⋯ │
│ Vergleich 3 von 6                   │
│ ████████████░░░░░░░░░░░░  50%       │
├─────────────────────────────────────┤
│                                     │
│  Welche Abgabe ist besser?          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  ClumsyGoldenDragon         │    │
│  │  [Link öffnen ↗]            │    │
│  │  [Klarnamen anzeigen]       │    │
│  │                             │    │
│  │      [Diese wählen]         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  WiseMightyPhoenix          │    │
│  │  [Link öffnen ↗]            │    │
│  │  [Klarnamen anzeigen]       │    │
│  │                             │    │
│  │      [Diese wählen]         │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Gleich gut]    [Überspringen]     │
│                                     │
└─────────────────────────────────────┘
```

Abgaben werden vertikal gestapelt (Mobile-first). Klarnamen-Toggle ist pro Abgabe unabhängig und nicht persistent.

### Wireframe: Inkonsistenz-Warnung

```
┌─────────────────────────────────────┐
│  ⚠ Mögliche Inkonsistenz erkannt    │
├─────────────────────────────────────┤
│  A wurde besser bewertet als B,     │
│  B besser als C —                   │
│  aber C besser als A.               │
│                                     │
│  Das ist erlaubt. Prüfe bei         │
│  Bedarf die betroffenen Abgaben.    │
│                                     │
│  [Schließen]                        │
└─────────────────────────────────────┘
```

Nicht-blockierend — erscheint als Overlay, lässt sich schließen. Der Vergleich läuft weiter.

### Wireframe: Abschluss

```
┌─────────────────────────────────────┐
│  Alle Vergleiche abgeschlossen ✓    │
├─────────────────────────────────────┤
│                                     │
│  Vorläufige Rangfolge               │
│                                     │
│   1  ClumsyGoldenDragon   7,0 Pkt. │
│   2  WiseMightyPhoenix    5,5 Pkt. │
│   2  GrumpyTinyWizard     5,5 Pkt. │
│   4  SleepyBraveTroll     4,0 Pkt. │
│   ···                               │
│                                     │
│  [Ergebnis speichern →]             │
│                                     │
└─────────────────────────────────────┘
```

---

## 2. Drag & Drop Gruppierung ✅ (Sprint 1a)

**Prinzip**: Abgaben per Drag & Drop in vordefinierte Qualitätsgruppen einsortieren.

**Varianten**:
- 3 Gruppen: Top / Mittelfeld / Untere Gruppe
- 5 Gruppen: Herausragend / Sehr gut / Gut / Ausreichend / Nicht ausreichend

**Vorteile**: Schnell (< 5 Min bei 10 Abgaben), intuitiv, Gleichstand möglich
**Nachteile**: Keine Feinabstufung innerhalb der Gruppen

### Wireframe: Startstand (alle Abgaben unzugewiesen)

```
┌─────────────────────────────────────┐
│ ← Drag & Drop Gruppierung        ⋯ │
│ 8 Abgaben · 3 Gruppen              │
├─────────────────────────────────────┤
│  Noch zuzuweisen (8)                │
│  ┌──────────┐ ┌──────────┐         │
│  │ClumsyGol-│ │WiseMight-│  ···    │
│  │denDragon │ │yPhoenix  │         │
│  └──────────┘ └──────────┘         │
│  [Klarnamen anzeigen]               │
├─────────────────────────────────────┤
│  TOP (Herausragend)          leer   │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                     │
│  MITTELFELD (Gut)            leer   │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                     │
│  UNTERE GRUPPE (Ausreichend) leer   │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
├─────────────────────────────────────┤
│  [Speichern]  (erst nach Zuweisung) │
└─────────────────────────────────────┘
```

Der Ablagebereich oben enthält alle unzugeordneten Abgaben. Erst wenn alle Abgaben einer Gruppe zugewiesen sind, wird der Speichern-Button aktiv.

### Wireframe: In Bearbeitung (3 Gruppen)

```
┌─────────────────────────────────────┐
│ ← Drag & Drop Gruppierung        ⋯ │
│ 8 Abgaben · 3 Gruppen              │
├─────────────────────────────────────┤
│  Noch zuzuweisen (3)                │
│  ┌──────────┐ ┌──────────┐         │
│  │GrumpyTin-│ │SwiftDark-│  ···    │
│  │yWizard   │ │Wolf      │         │
│  └──────────┘ └──────────┘         │
├─────────────────────────────────────┤
│  TOP (Herausragend)          2      │
│  ┌──────────┐ ┌──────────┐         │
│  │ClumsyGol-│ │WiseMight-│         │
│  │denDragon │ │yPhoenix  │         │
│  └──────────┘ └──────────┘         │
│                                     │
│  MITTELFELD (Gut)            3      │
│  ┌──────────┐ ┌──────────┐         │
│  │SleepyBra-│ │BoldSilve-│  ···    │
│  │veTroll   │ │rFox      │         │
│  └──────────┘ └──────────┘         │
│                                     │
│  UNTERE GRUPPE (Ausreichend) 0      │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
├─────────────────────────────────────┤
│  [Speichern]  (noch 3 offen)        │
└─────────────────────────────────────┘
```

### Wireframe: 5-Gruppen-Variante (Startstand)

```
┌─────────────────────────────────────┐
│ ← Drag & Drop Gruppierung        ⋯ │
│ 10 Abgaben · 5 Gruppen             │
├─────────────────────────────────────┤
│  Noch zuzuweisen (10)               │
│  [Abgaben-Pool ···]                 │
├─────────────────────────────────────┤
│  HERAUSRAGEND                leer   │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                     │
│  SEHR GUT                    leer   │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                     │
│  GUT                         leer   │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                     │
│  AUSREICHEND                 leer   │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                     │
│  NICHT AUSREICHEND           leer   │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
├─────────────────────────────────────┤
│  [Speichern]  (erst nach Zuweisung) │
└─────────────────────────────────────┘
```

### Wireframe: Abschluss (alle zugewiesen)

```
┌─────────────────────────────────────┐
│  Alle Abgaben zugewiesen ✓          │
├─────────────────────────────────────┤
│  TOP           ClumsyGoldenDragon   │
│                WiseMightyPhoenix    │
│  MITTELFELD    GrumpyTinyWizard     │
│                SleepyBraveTroll     │
│                BoldSilverFox        │
│  UNTERE GR.    SwiftDarkWolf        │
│                LazyCrimsonBear      │
│                CleverTinyOwl        │
├─────────────────────────────────────┤
│  [Ergebnis speichern →]             │
└─────────────────────────────────────┘
```

---

## 3. Dot Voting – Punkteverteilung (Sprint 2)

**Prinzip**: Jeder Bewerter hat eine begrenzte Anzahl Punkte und verteilt diese auf die Abgaben.

**Regeln**: Alle Punkte müssen verteilt werden. Eigene Abgabe wird ausgeblendet (Peer-Review). Mehrfach-Voting-Schutz via Cookie (voterToken).
**Vorteile**: Schnell, spielerisch, für Gruppen geeignet
**Nachteile**: Keine inhaltliche Begründung, strategisches Voting möglich

Dot Voting ist das einzige Verfahren mit Schüler-Sicht (via QR-Code, kein Login). Die Einstiegsview ist in [`docs/ui-views.md` (StudentSessionView)](ui-views.md) beschrieben.

### Wireframe: Voting-Ansicht (Schüler-Sicht, Mobile)

```
┌─────────────────────────────────────┐
│  Präsentationen ITA-Klasse          │
│  Verteile 5 Punkte                  │
│  Noch verfügbar: ██░░░░  2 Punkte   │
├─────────────────────────────────────┤
│                                     │
│  WiseMightyPhoenix                  │
│  [−]  ██  2 Punkte  [+]            │
│                                     │
│  GrumpyTinyWizard                   │
│  [−]  █   1 Punkt   [+]            │
│                                     │
│  SleepyBraveTroll                   │
│  [−]     0 Punkte   [+]            │
│                                     │
│  BoldSilverFox                      │
│  [−]     0 Punkte   [+]            │
│                                     │
│  SwiftDarkWolf                      │
│  [−]     0 Punkte   [+]            │
│                                     │
│  ─────────────────────────          │
│  (ClumsyGoldenDragon ausgeblendet)  │
│                                     │
│  [Bewertung abschicken]             │
│  Alle 5 Punkte vergeben             │
└─────────────────────────────────────┘
```

Der [+]-Button ist gesperrt wenn keine Punkte mehr verfügbar. [Bewertung abschicken] ist gesperrt solange nicht alle Punkte vergeben sind.

### Wireframe: Bestätigung

```
┌─────────────────────────────────────┐
│                                     │
│         ✓ Danke!                    │
│                                     │
│  Deine Bewertung wurde              │
│  übermittelt.                       │
│                                     │
│  Warte auf die Ergebnisse —         │
│  dein Lehrer schließt die           │
│  Session.                           │
│                                     │
└─────────────────────────────────────┘
```

Kein weiterer Schritt für Schüler. Mehrfaches Aufrufen der URL zeigt denselben Bestätigungsscreen (Cookie-Schutz).

---

## 4. Kategorien-Bewertung (Sprint 3+)

**Prinzip**: Jede Abgabe wird in mehreren Kategorien mit einem Slider bewertet.

**Standard-Kategorien**: Inhalt, Form, Struktur (alle anpassbar, Gewichtung möglich)
**Vorteile**: Detailliert, kriterienbasiert, nachvollziehbar
**Nachteile**: Zeitaufwändig, erfordert klare Kriteriendefinition

### Wireframe: Bewertungsansicht (Mobile)

```
┌─────────────────────────────────────┐
│ ← Kategorien-Bewertung           ⋯ │
│ Abgabe 3 von 8                      │
│ ████████████░░░░░░░░░░░░  3/8       │
├─────────────────────────────────────┤
│  ClumsyGoldenDragon                 │
│  [Link öffnen ↗]  [Klarnamen]      │
├─────────────────────────────────────┤
│                                     │
│  Inhaltliche Qualität               │
│  ○──────────●────────○  8 / 10     │
│                                     │
│  Formale Gestaltung                 │
│  ○────────●──────────○  6 / 10     │
│                                     │
│  Strukturierung                     │
│  ○───────────●───────○  9 / 10     │
│                                     │
│  Gesamtpunktzahl: 23 / 30           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Notiz (optional)…           │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│  [← Zurück]          [Weiter →]    │
└─────────────────────────────────────┘
```

Fortschrittsanzeige oben zeigt aktuelle Abgabe. Navigation vor/zurück möglich — bereits bewertete Abgaben können überarbeitet werden.

### Wireframe: Abschlussübersicht

```
┌─────────────────────────────────────┐
│ ← Kategorien-Bewertung             │
│ Alle 8 Abgaben bewertet ✓          │
├─────────────────────────────────────┤
│                                     │
│  Rang  Abgabe             Punkte    │
│  ──────────────────────────────     │
│   1    ClumsyGoldenDragon  26/30    │
│   2    WiseMightyPhoenix   23/30    │
│   3    GrumpyTinyWizard    21/30    │
│   4    SleepyBraveTroll    19/30    │
│   ···                               │
│                                     │
│  [Einzelne Bewertung ansehen]       │
│  [Ergebnis speichern →]             │
│                                     │
└─────────────────────────────────────┘
```

