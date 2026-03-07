# rank2rate – Umsetzungsplan

Detaillierter Implementierungsplan mit Checkboxen.
Überblick: [`konzept.md` Abschnitt 10 (Roadmap)](../konzept.md)

---

## Sprint 1a: Echter MVP – ein kompletter Durchlauf (Drag & Drop → Benotung)

> Ziel: Ein Lehrer kann sich einloggen, Abgaben eingeben, per Drag & Drop reihen und benoten.
> Das ist Reihung → Benotung vollständig, mit dem einfacheren der zwei Reihungsverfahren.

### Setup & Infrastruktur

- [ ] `npm install` in `frontend/` und `backend/`
- [ ] `backend/.env` aus `.env.example` erstellen und befüllen (JWT_SECRET, ENCRYPTION_KEY)
- [ ] MongoDB-Verbindung in `backend/server.js` verifizieren (`/api/health` antwortet)
- [ ] Vitest in beiden Paketen lauffähig (`npm test` zeigt 0 Tests, kein Fehler)

### Datenmodell-Weichenstellung: Triangulation

- [ ] `Session`-Modell: `method: String` → `methods: [String]` (Array, mind. 1 Eintrag required)
- [ ] Alle Stellen die `session.method` lesen/schreiben auf `session.methods` anpassen (betrifft: `SessionCreateView`, `SessionManageView`, API-Endpunkte)
- [ ] `SessionCreateView` erlaubt vorerst nur eine Methode — die Datenstruktur ist aber bereits multi-method-fähig

Begründung: Die Triangulations-Ansicht (Sprint 3+) benötigt mehrere Methoden pro Session. Eine spätere Migration von `method: String` → `methods: [String]` wäre aufwändiger als die Weichenstellung jetzt. Details: [`docs/triangulation.md`](triangulation.md)

---

### Backend – Authentifizierung

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben (register, login, ungültige Credentials, doppelte E-Mail)
- [ ] Mongoose `User`-Modell (`email`, `passwordHash`, `createdAt`)
- [ ] `POST /api/auth/register` – E-Mail + Passwort, bcrypt-Hash speichern
- [ ] `POST /api/auth/login` – Credentials prüfen, JWT zurückgeben
- [ ] JWT-Middleware (`middleware/auth.js`) für alle Lehrer-Routen

---

### Backend – Sessions & Abgaben (CRUD)

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben
- [ ] Mongoose `Session`-Modell (vollständig laut Datenmodell in `konzept.md`)
- [ ] Mongoose `Project`-Modell mit AES-256-Middleware für `actualName`
- [ ] Fantasy-Namen-Generator (`utils/fantasyNames.js`) — Format: `[Adjective][Adjective][Creature]` CamelCase
- [ ] `POST /api/sessions` – Session + Abgaben erstellen, bei Anonymisierung Fantasy-Namen zuweisen & Reihenfolge randomisieren
- [ ] `GET /api/sessions/:id` – Session + Abgaben (Lehrer: inkl. `actualName` entschlüsselt)
- [ ] `PATCH /api/sessions/:id/projects/:pid` – Titel/Link bearbeiten
- [ ] `DELETE /api/sessions/:id/projects/:pid` – Abgabe löschen (Guard: mind. 3 verbleiben)

---

### Backend – Reihung: Drag & Drop Gruppierung

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben
- [ ] `PATCH /api/sessions/:id/grouping` – `groupingResult` speichern (`[{ label, projectIds[] }]`)

---

### Backend – Benotung

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben (lineare Verteilung, Gleichstände an Grenzen, verschiedene Notensysteme)
- [ ] Lineare Verteilungslogik (`utils/grading.js`) — Rangfolge → Noten gleichmäßig aufteilen
- [ ] Gleichstandsregel: alle Gleichrangigen an Grenze bekommen die **bessere** Note
- [ ] `PATCH /api/sessions/:id/rating` – `ratingResult` speichern (`{ gradeSystem, distributionMethod, grades[] }`)

---

### Frontend – Auth

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben (Auth-Store, Token-Handling)
- [ ] Pinia `useAuthStore` (`stores/auth.js`) – Token, Login, Logout, isAuthenticated
- [ ] `LoginView.vue` – Formular, JWT in `localStorage`, Weiterleitung auf `/sessions/new`
- [ ] `RegisterView.vue` – Formular, nach Registrierung auf `/login`
- [ ] Navigation Guard in `router/index.js` greift korrekt (bereits angelegt, verifizieren)

---

### Frontend – Session erstellen

- [ ] `SessionCreateView.vue`
- [ ] Felder: Titel (required), Reihungsverfahren wählen (Sprint 1a: nur drag-drop, ab 1b: multi-select), Anonymisierung toggle
- [ ] Bei drag-drop: Gruppenanzahl wählen (3 oder 5)
- [ ] Abgaben-Liste: Titel (required), Link (optional), dynamisch erweiterbar
- [ ] Minimum 3 Abgaben vor Absenden erzwingen
- [ ] Nach Erstellen → direkt in Drag & Drop Reihung

---

### Frontend – Reihung: Drag & Drop Gruppierung

> **SortableJS + Vue: Pflichtregeln** (Details: [`LessonsLearned-SortableJS-Vue.md`](LessonsLearned-SortableJS-Vue.md))
>
> 1. **`evt.item.remove()`** — nach jedem Cross-Container-Drop das DOM-Element entfernen, bevor Vue-State aktualisiert wird. Sonst Reconciliation-Konflikt (Items springen/doppeln).
> 2. **Initialisierungs-Reihenfolge** — `loading = false` → `await nextTick()` → `initSortable()`. Nie Sortable vor dem DOM-Aufbau binden.
> 3. **`shallowRef`** für Session/State-Objekte — tiefe Reaktivität löst Re-Renders aus, die mit Sortable kollidieren.
> 4. **`draggable: '[data-id]'`** — nur Projekt-Kacheln ziehbar, Gruppen-Titel ausschließen.
> 5. **`filter: '.dd-no-drag'` + `preventOnFilter: false`** — Klarnamen-Toggle (Eye-Button) klickbar lassen, ohne Drag auszulösen.
> 6. **`emptyInsertThreshold: 60`** — Drop in leere Gruppen-Container ermöglichen (Default 5px ist zu klein).
> 7. **`sort: false`** — keine Umsortierung innerhalb Pool/Gruppe (Gleichstände, keine Reihenfolge).

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben (Zuweisung, Speichern)
- [ ] Drag & Drop View mit SortableJS (Pflichtregeln oben beachten)
- [ ] 3-Gruppen-Modus: Top / Mittelfeld / Untere Gruppe
- [ ] 5-Gruppen-Modus: Herausragend / Sehr gut / Gut / Ausreichend / Nicht ausreichend
- [ ] Alle Abgaben müssen einer Gruppe zugewiesen sein vor dem Speichern
- [ ] Klarnamen-Toggle pro Abgabe
- [ ] Ergebnis speichern (`PATCH /grouping`) → Weiterleitung auf Ergebnisansicht

---

### Frontend – Ergebnisansicht: Reihung (Schritt 1)

- [ ] `SessionResultsView.vue` – Schritt 1: Reihungsergebnis
- [ ] Drag & Drop: Gruppen-Karten mit zugeordneten Abgaben
- [ ] Klarnamen-Toggle
- [ ] Button "Jetzt benoten" → Schritt 2

---

### Frontend – Benotung (Schritt 2)

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben (lineare Verteilung, Gleichstandsregel, Vorschau-Logik)
- [ ] Notensystem-Auswahl: Schulnoten 1–6, Abiturpunkte 0–15, A–F, Prozent
- [ ] Verteilungsmethode: linear
- [ ] Live-Vorschau: Notenverteilung aktualisiert sich sofort bei Auswahländerung
- [ ] Gleichstände an Notengrenzen: automatisch bessere Note
- [ ] Jede Note individuell überschreibbar (Feintuning per Klick/Dropdown)
- [ ] Manuell geänderte Noten visuell markieren (abweichender Farbton)
- [ ] Ergebnis speichern (`PATCH /rating`) — speichert berechnete und finale Note pro Abgabe
- [ ] Finale Ansicht: Tabelle Abgabe → Note (mit Markierung bei manuellen Änderungen)

---

## Sprint 1b: Zweites Verfahren + vollständige Verwaltung

> Ziel: Paarweiser Vergleich als zweites Reihungsverfahren, Dashboard und vollständige Session-Verwaltung.
> Ab diesem Sprint können beide Lehrer-Verfahren (Drag & Drop + Paarweiser Vergleich) in einer Session kombiniert werden — erste Triangulationsdaten entstehen.

### Backend – Sessions (fehlende Endpoints)

- [ ] `GET /api/sessions` – eigene Sessions des Lehrers (für Dashboard)

---

### Backend – Reihung: Paarweiser Vergleich

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben
- [ ] `PATCH /api/sessions/:id/pairwise-result` – `pairwiseResult` speichern (`{ comparisons[], ranking[] }`)

---

### Frontend – Dashboard

- [ ] `DashboardView.vue` – eigene Sessions auflisten
- [ ] Session-Karte: Titel, Methode, Datum, Links (Verwalten, Ergebnisse)
- [ ] Leerer Zustand: "Noch keine Sessions – Neue Session erstellen"
- [ ] Button "Neue Session"
- [ ] Nach Login Weiterleitung auf Dashboard (statt direkt auf `/sessions/new`)

---

### Frontend – Session verwalten

- [ ] `SessionManageView.vue`
- [ ] Abgaben anzeigen (`displayName`, Link falls vorhanden)
- [ ] Klarnamen temporär einblenden (pro Abgabe unabhängig, nicht persistent)
- [ ] Abgabe bearbeiten (Titel, Link)
- [ ] Abgabe löschen (mit Bestätigung, Guard: mind. 3 verbleiben)
- [ ] Buttons: Reihung starten (je nach Methode), Ergebnisse anzeigen (nur nach gespeicherter Reihung)

---

### Frontend – Reihung: Paarweiser Vergleich

- [ ] Testszenarien definieren & abgenommen
- [ ] Tests schreiben (Stichprobe-Algorithmus, Punkte-Berechnung, Inkonsistenz-Erkennung)
- [ ] Stichproben-Composable: `min(2×n, n×(n−1)/2)` Zufallspaare generieren
- [ ] Paarvergleich-View: zwei Abgaben nebeneinander
- [ ] Optionen: "Diese wählen", "Gleich gut", "Überspringen"
- [ ] Fortschrittsanzeige: "X von Y Vergleichen"
- [ ] Punkte-Berechnung: Sieg = 1, Gleichstand = 0,5, Überspringen = 0
- [ ] Inkonsistenz-Erkennung (Dreier-Zyklen A>B>C>A) — nicht-blockierende Warnung
- [ ] Klarnamen-Toggle pro Abgabe
- [ ] Ergebnis speichern (`PATCH /pairwise-result`) → Weiterleitung auf Ergebnisansicht

---

### Frontend – Ergebnisansicht: Paarvergleich ergänzen

- [ ] Paarvergleich-Ergebnis in `SessionResultsView.vue` Schritt 1 ergänzen
- [ ] Rangliste nach Punkten (Rang, Name, Punkte), Gleichstände sichtbar

---

## Sprint 2: Peer-Review + Verteilungsoptionen

### Backend – Dot Voting & Peer-Review

- [ ] Mongoose `Vote`-Modell (`sessionId`, `projectId`, `voterToken`, `points`, `createdAt`)
- [ ] `GET /api/sessions/:id/status` – Abstimmungsfortschritt (X von Y abgestimmt)
- [ ] `POST /api/sessions/:id/vote` – Stimme abgeben, voterToken-Cookie prüfen (Mehrfach-Voting-Schutz)
- [ ] `GET /api/sessions/:id/results` – aggregierte Abstimmungsergebnisse
- [ ] `POST /api/sessions/:id/close` – Session beenden

### Backend – Gaußverteilung

- [ ] Gaußverteilungs-Logik in `utils/grading.js` ergänzen
- [ ] `PATCH /api/sessions/:id/rating` unterstützt `distributionMethod: "gaussian"`

### Frontend – QR-Code & Session-Management

- [ ] Entscheidung QR-Code: clientseitig oder serverseitig (offene Frage klären)
- [ ] QR-Code-Generierung und Anzeige in SessionManageView
- [ ] Session aktivieren (Status: draft → active)
- [ ] Session schließen (Status: active → closed)

### Frontend – StudentSessionView (Dot Voting)

- [ ] `StudentSessionView.vue` – kein Login, öffnet via `/session/:id`
- [ ] Optional: "Welches ist deine Abgabe?" → wird ausgeblendet
- [ ] Dot Voting Interface: Punkte verteilen mit Live-Counter "Noch X Punkte verfügbar"
- [ ] Alle Punkte müssen verteilt werden vor Abschicken
- [ ] Nach Abgabe: "Danke! Warte auf Ergebnisse."
- [ ] Mehrfach-Voting-Schutz via Cookie (voterToken)

### Frontend – Live-Dashboard

- [ ] Fortschrittsanzeige im Lehrer-Dashboard: "X von Y Schülern haben abgestimmt"
- [ ] Polling alle 2 Sekunden gegen `GET /api/sessions/:id/status`

### Frontend – CSV-Export

- [ ] Ergebnisse (Abgabe, Rang, Note) als CSV exportieren
- [ ] Klarnamen in CSV (nicht Fantasy-Namen)

---

## Sprint 3+

- [ ] Kategorien-Bewertung (Slider pro Kriterium, Gewichtung, anpassbare Kategorien)
- [ ] Triangulations-Ansicht (mehrere Reihungen nebeneinander vergleichen) — Konzept und Szenarien: [`docs/triangulation.md`](triangulation.md)
- [ ] WebSockets (Echtzeit statt Polling)
- [ ] PIN-Code-Schutz für Sessions
- [ ] Visualisierungen (Podest-Ansicht, Heatmap)
- [ ] Hybride Bewertung (Schüler-Vote + Lehrer-Gewichtung)
- [ ] PDF-Export
- [ ] Session-Templates (Einstellungen wiederverwenden)
- [ ] Bradley-Terry-Algorithmus (Alternative zu Punktesumme bei Paarvergleich)
- [ ] Präsentations-Modus (Vollbild, beameroptimiert)
- [ ] Dark Mode
- [ ] Multi-Language (i18n)

---

## Sehr optionaler Scope: Selbstreflexion (kein Sprint geplant)

> Nutzt nur Phase 1 (Reihung). Kein Benotungsschritt. Benötigt eigenes Auth-Modell (kein Lehrer-Account) und abweichendes UX-Konzept. Erst angehen wenn das Kernprodukt vollständig ist.

- [ ] Konzept für Selbstreflexions-Modus ausarbeiten (Auth, UX, Abgrenzung zum Lehrer-Tool)
- [ ] Paarvergleich ohne Session/Auth (lokale Nutzung)
- [ ] Ergebnisansicht ohne Benotung
