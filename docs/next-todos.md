# rank2rate – Next-Todos

Persönliche Aufgabenliste für den Wiedereinstieg und die nächsten Schritte.
Stand: 15.07.2026 · Maßgeblicher Projektstatus: [`plan.md` → „Realer Stand"](plan.md)

---

## 1. Wiedereinstieg (zuerst)

- [ ] Grün-Check: `cd backend && npm test` und `cd frontend && npm test` (beide laufen in Sekunden, aktuell 33/33 + 39/39)
- [ ] App lokal starten: MongoDB läuft, `backend/` mit `node --watch server.js`, `frontend/` mit `npm run dev`
- [ ] Manuellen Testplan [`mvp-manual-testing-1.md`](mvp-manual-testing-1.md) **einmal komplett durchspielen** und Häkchen in der Abschlusstabelle setzen (bisher alles ⬜, nie ausgeführt). Achte besonders auf Test 5.3/5.4a (Notenvorschau 1/2/3) — validiert den heutigen Grading-Fix in der echten UI.

## 2. Nächstes Feature: Paarweiser Vergleich (Sprint 1b) — nach ATDD

> Der eigentliche didaktische Mehrwert: zweites Reihungsverfahren → erste Triangulationsdaten. Reihenfolge nicht überspringen.

- [ ] Szenarien als Prosa/Tabellen definieren (Stichprobe `min(2n, n(n−1)/2)`, Punkte Sieg/Gleichstand/Überspringen, Inkonsistenz-Erkennung A>B>C>A)
- [ ] Szenarien mit dir selbst / abnehmen
- [ ] Backend-Tests schreiben, dann `PATCH /api/sessions/:id/pairwise-result` implementieren (`{ comparisons[], ranking[] }`)
- [ ] Frontend-Tests schreiben, dann `PairwiseEvaluateView.vue` + Route `/sessions/:id/pairwise`
- [ ] Stichproben-Composable, Fortschrittsanzeige, Klarnamen-Toggle (Muster steht bereit), nicht-blockierende Inkonsistenz-Warnung
- [ ] `SessionResultsView` um Paarvergleich-Rangliste (Rang, Name, Punkte, Gleichstände) ergänzen
- [ ] Manuelle Plausibilisierung als `docs/mvp-manual-testing-2.md`
- [ ] Commit

## 3. Rest Sprint 1b

- [ ] `SessionManageView` vervollständigen: Abgabe bearbeiten (Titel/Link), Abgabe löschen (Guard: mind. 3 verbleiben), Buttons „Reihung starten" / „Ergebnisse anzeigen"

## 4. Tech-Hygiene (klein, jederzeit)

- [ ] `.gitattributes` mit `* text=auto eol=lf` anlegen (beseitigt die CRLF/LF-Warnungen bei jedem `git add`)
- [ ] Prüfen, ob `frontend/GRADE_SYSTEMS` und `backend/utils/gradeSystems.js` divergiert sind — beide müssen konsistent bleiben (aktuell manuell gespiegelt, echtes Cross-Package-Sharing steht aus)

## 5. Später / im Blick behalten

- [ ] Modell-Drift zu `konzept.md` Abschnitt 6 auflösen, sobald ein Feature es braucht: `settings.groupCount` (statt flachem `groupCount`), `revealNamesForStudents`, `updatedAt` — spätestens mit Sprint 2 (Peer-Review/Schüler-Sicht)
- [ ] Sprint-2-Ausblick: Dot Voting, QR-Code-Workflow, Live-Dashboard, Gaußverteilung, Perspektivenvergleich Lehrer/Peers, CSV-Export
