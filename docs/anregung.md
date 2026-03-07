# Anregung: Vorschlagscharakter und Transparenz in der Benotung

## Hintergrund

rank2rate leitet aus einem relativen Verfahren (Reihung, soziale Bezugsnorm) eine absolute Note ab (sachliche Bezugsnorm). Messtheoretisch ist das ein Kategoriensprung: Ein Ranking sagt, wer besser ist — nicht, ob jemand gut genug für eine bestimmte Note ist. Die Bildungsforschung kritisiert die soziale Bezugsnorm zu Recht, weil sie kohortenabhängig ist: Die beste Abgabe einer schwachen Klasse wird zur "1", unabhängig vom absoluten Kompetenzniveau.

**rank2rate ist trotzdem pädagogisch vertretbar**, weil:
- Lehrer bei offenen Aufgabenformaten (Präsentationen, Projekte) implizit relativ vergleichen — das Tool macht diesen Prozess explizit und strukturiert
- Der Lehrer die Note überschreiben kann und Herr des Verfahrens bleibt
- Der algorithmische Output als Vorschlag deklariert ist, nicht als Ergebnis

**Die eigentliche Gefahr** ist nicht das Verfahren selbst, sondern unreflektiertes Übernehmen des Vorschlags. Das Interface muss aktives Nachdenken fördern, nicht passives Abnicken.

---

## Vorschlag: Reflexions-Hinweis in der Abschlussansicht

Wenn der Lehrer die Benotung speichert, ohne eine einzige Note geändert zu haben, erscheint ein dezenter Hinweis — kein Blocker, kein Modal, nur eine sichtbare Textzeile:

### Mockup: Abschlussansicht nach Speichern (alle Noten unverändert)

```
┌─────────────────────────────────────┐
│ ← Dashboard                         │
│  Benotung abgeschlossen ✓           │
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
│                                     │
└─────────────────────────────────────┘
```

### Mockup: Abschlussansicht nach Speichern (Noten teilweise angepasst)

```
┌─────────────────────────────────────┐
│ ← Dashboard                         │
│  Benotung abgeschlossen ✓           │
├─────────────────────────────────────┤
│                                     │
│  Abgabe              Note  Status   │
│  ─────────────────────────────────  │
│  ClumsyGoldenDragon   1             │
│  WiseMightyPhoenix    2             │
│  GrumpyTinyWizard     2    ✎        │
│  SleepyBraveTroll     4             │
│  BoldSilverFox        5             │
│                                     │
│  ✎ = manuell angepasst (1 Eintrag)  │
│                                     │
│  [Klarnamen anzeigen]               │
│                                     │
└─────────────────────────────────────┘
```

---

## Weitere Überlegung: Benotungskontext explizit machen

Vor dem Speichern könnte ein optionales Freitextfeld angeboten werden:

```
│  Notiz zur Benotung (optional)      │
│  ┌─────────────────────────────┐    │
│  │ z.B. "Klasse insgesamt      │    │
│  │ schwach, Noten angehoben"   │    │
│  └─────────────────────────────┘    │
```

Diese Notiz würde im `ratingResult` gespeichert und wäre für spätere Reflexion oder Dokumentation zugänglich. Sie signalisiert: Der Lehrer hat aktiv überlegt — und nicht nur auf "Speichern" geklickt.

---

## Einschätzung zur Umsetzung

| Maßnahme | Aufwand | Wirkung |
|---|---|---|
| Hinweisbox bei 0 manuellen Änderungen | gering | mittel — schafft Reflexionsmoment |
| Anzahl manueller Änderungen in Abschlussansicht | bereits implementiert | mittel — Transparenz sichtbar |
| Optionales Notizfeld | gering | mittel — dokumentiert Kontext |

Keiner dieser Vorschläge ist ein Blocker oder ändert den Workflow. Sie alle zielen darauf, den **Vorschlagscharakter des Algorithmus** im Interface spürbar zu halten, ohne den Lehrer zu bevormunden.
