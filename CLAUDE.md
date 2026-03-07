# CLAUDE.md – rank2rate

Projektkontext für Claude. Immer lesen bevor Code geschrieben wird.

---

## Was ist rank2rate?

Agiles Bewertungssystem für Schülerabgaben (3–15 Stück) an Berufskollegs.
Kernprozess **zweiphasig**: **Reihung** (relative Verfahren erzeugen Rangfolge) → **Benotung** (Rangfolge wird in Notensystem überführt).

Primäres Werkzeug für **Lehrer**. Schüler sind Peer-Review-Teilnehmer (Reihung only, Sprint 2+) — kein Zugang zur Benotungsphase.

Vollständiges Konzept: [`konzept.md`](konzept.md) · Fachglossar: `konzept.md` Abschnitt 3.6

---

## Pflichtlektüre vor Implementierung

| Aufgabe | Lies zuerst |
|---|---|
| Jede View / UI-Komponente | `docs/ui-views.md` (Wireframes, Mobile-first) |
| Verfahrens-View (Paarvergleich, D&D, Dot Voting …) | zusätzlich `docs/verfahren.md` |
| Session-Modell anlegen oder ändern | `docs/triangulation.md` (Architekturhinweis `methods: [String]`) |
| Jedes Feature | `docs/plan.md` — Checkboxen des aktiven Sprints prüfen |
| API-Endpunkte | `docs/routen-api.md` |

ATDD: Wireframes aus `docs/ui-views.md` und `docs/verfahren.md` sind der Ausgangspunkt für Szenarien (Schritt 1 des Testing-Workflows) — nicht umgekehrt.

Aktiver Sprint: **1a** (Auth, Session-CRUD, Drag & Drop, Benotung). Details: [`docs/plan.md`](docs/plan.md)

---

## Verzeichniskonventionen

- `frontend/src/views/` — eine View pro Route
- `frontend/src/components/` — wiederverwendbare Komponenten
- `frontend/src/composables/` — Vue Composables
- `frontend/src/stores/` — Pinia Stores
- `backend/routes/`, `controllers/`, `models/`, `middleware/`, `utils/`
- Exakte Paketversionen: [`docs/stack.md`](docs/stack.md)

---

## Kern-Konventionen

### Allgemein
- **Immer ESM**: `import`/`export`, kein `require()` — beide Pakete haben `"type": "module"`
- **Sprache**: Code und Variablen auf Englisch, UI-Texte und Kommentare auf Deutsch
- **Vue**: ausschließlich **Composition API** mit `<script setup>`, nie Options API

### Tailwind v4
- **CSS-first**: kein `tailwind.config.js`
- Einbindung nur via `@import "tailwindcss"` in `frontend/src/assets/main.css`
- Farbschema: `blue-600` (Primary), `green-600` (Success), `amber-500` (Warning), `red-600` (Error), `slate-*` (Neutral)

### Backend
- Entry point: `backend/server.js` — Start mit `node --watch server.js`
- **Kein nodemon** — Node 22 hat `--watch` built-in
- Routen in `routes/`, Logik in `controllers/`, Mongoose-Modelle in `models/`
- Alle Auth-geschützten Endpunkte prüfen JWT via Middleware

### Architekturentscheidungen

- **Benotung ist ausschließlich dem Lehrer vorbehalten.** Schüler nehmen nur an der Reihungsphase teil (Peer-Review via `StudentSessionView`). Die `StudentSessionView` hat keinen Zugang zu Benotungsfunktionen. Alle `/rating`-Endpunkte erfordern JWT-Auth.
- **Die berechnete Note ist immer nur ein Vorschlag.** Der Lehrer kann jede Note individuell überschreiben (Feintuning). Manuell geänderte Noten werden im UI visuell markiert (abweichender Farbton o.ä.), damit die Abweichung vom Algorithmus-Vorschlag sichtbar bleibt. Das `ratingResult` speichert sowohl `computedGrade` als auch `finalGrade` pro Abgabe.
- **`utils/grading.js` hat zwei getrennte Funktionen** — eine für Gruppen-Input (Drag & Drop liefert diskrete Qualitätsstufen), eine für Score-Input (Paarvergleich liefert kontinuierliche Punktescores). Niemals in einer gemeinsamen Funktion zusammenführen, da die Eingabestrukturen grundlegend verschieden sind.
- **Weniger Abgaben als Notenstufen → Standard: von oben beginnen.** Wenn z.B. 4 Abgaben auf Schulnoten 1–6 verteilt werden, erhalten sie standardmäßig die Noten 1–4. Die unteren Noten bleiben unbesetzt.
- **UI schlägt passendes Notensystem zur Gruppenanzahl vor.** Bei Drag & Drop mit 3 Gruppen wird ein 3-stufiges System vorgeschlagen, bei 5 Gruppen ein 5-stufiges.
- **Session unterstützt mehrere Reihungsverfahren**: `methods: [String]` statt `method: String` — Pflicht ab Sprint 1a, Voraussetzung für Triangulation.

### MongoDB / Mongoose
- `*Result`-Felder (`groupingResult`, `pairwiseResult`, `ratingResult`) sind `Mixed` — kein JSONB, kein Schema-Zwang
- `actualName` (echter Schülername) wird **AES-256** verschlüsselt — via Mongoose-Middleware in `models/Project.js`, niemals im Klartext speichern
- TTL-Index auf `sessions.expiresAt` (7 Tage) — kein Cron-Job nötig
- `mongodbMemoryServer.version` ist auf `"8.0.19"` gepinnt (in `backend/package.json`) — nicht ändern
- Session-Status: `draft | active | ranked | graded` — Solo-Lehrer überspringt `active`

---

## Wichtige Regeln

- Gleichstände bei Reihung: **immer erlaubt und korrekt**
- Gleichstände an Notengrenze: standardmäßig **bessere Note** für alle Gleichrangigen
- Minimum **3 Abgaben** pro Session (DELETE verhindert Unterschreiten)
- Paarvergleich-Stichprobe: `min(2*n, n*(n-1)/2)` Paare — kein vollständiger Vergleich
- Im Code heißt eine Abgabe `project` (Collection `projects`) — nie verwechseln mit "Projekt" im pädagogischen Sinn
- Fantasy-Namen-Format: `[Adjective][Adjective][Creature]` in **CamelCase**, englisch, amüsant (z.B. `ClumsyGoldenDragon`)

---

## Testing-Workflow (ATDD)

**Reihenfolge pro Feature — nie überspringen:**

1. Szenarien als Prosa/Tabellen definieren
2. Szenarien mit User abstimmen
3. Vitest-Tests schreiben (schlagen fehl)
4. Feature implementieren (Tests grün)
5. Manuelle Plausibilisierung
6. Commit

**Test-Schichten:**
- `frontend/tests/` — Composables (Vitest + happy-dom), Komponenten (@vue/test-utils)
- `backend/tests/` — API-Integration (Vitest + supertest + mongodb-memory-server)

---

## Getroffene Entscheidungen (ehemals offen)

- **QR-Code**: clientseitig im Frontend (`qrcode`-Paket). Session-URL ist bekannt, kein Server-Roundtrip nötig.
- **Benotungsroute**: kein eigener Pfad. Benotung bleibt Tab/Schritt innerhalb `SessionResultsView`.
