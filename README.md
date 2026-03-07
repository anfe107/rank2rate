# rank2rate

Agiles Bewertungssystem für Schülerabgaben.
Zweiphasiger Prozess: **Reihung** (relative Verfahren) → **Benotung** (Notensystem + Verteilung).

## Konzept & Dokumentation

- [`konzept.md`](konzept.md) – Vollständiges Konzeptdokument
- [`docs/stack.md`](docs/stack.md) – Tech-Stack & Abhängigkeiten
- [`docs/routen-api.md`](docs/routen-api.md) – Frontend-Routen & API-Endpunkte
- [`docs/verfahren.md`](docs/verfahren.md) – Reihungsverfahren (Detail)
- [`docs/personas.md`](docs/personas.md) – Personas & Use Cases

## Projektstruktur

```
rank2rate/
├── frontend/       # Vue 3 + Vite + Tailwind v4
├── backend/        # Node.js + Express 5 + MongoDB
└── docs/           # Konzept & Planungsdokumente
```

## Setup

### Voraussetzungen

- Node.js ≥ 22
- MongoDB 8.0

### Backend

```bash
cd backend
cp .env.example .env   # Werte eintragen
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```
