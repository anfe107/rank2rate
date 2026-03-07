# rank2rate – Manuelle Plausibilisierung

Übersicht aller manuellen Testdurchläufe. Automatisierte Tests (Vitest) sind kein Ersatz hierfür — diese Dokumente prüfen den echten Browser-Flow inkl. SortableJS-Drag, Animationen und API-Verbindung.

---

## Übersicht

| Teil | Inhalt | Sprint | Status |
|------|--------|--------|--------|
| [Teil 1](./mvp-manual-testing-1.md) | Kompletter MVP-Durchlauf: Auth → Session → Drag & Drop → Benotung | 1a | ⬜ ausstehend |

---

## Voraussetzungen

- Node.js 22 installiert
- MongoDB 8 lokal installiert **oder** Cloud-URI in `backend/.env` eingetragen
- `npm install` in `frontend/` und `backend/` wurde ausgeführt (einmalig)
- `backend/.env` existiert (aus `.env.example` erstellt, Secrets befüllt)

---

## Terminal-Setup (3 Terminals parallel)

Alle drei müssen laufen bevor Tests beginnen.

### Terminal 1 – MongoDB (nur bei lokaler Installation)

```bash
mongod --dbpath /data/db
# Windows-Alternative (wenn MongoDB als Service installiert):
# net start MongoDB
```

Prüfen ob MongoDB läuft:
```bash
mongosh --eval "db.adminCommand('ping')"
# Erwartete Ausgabe: { ok: 1 }
```

### Terminal 2 – Backend

```bash
cd backend
node --watch server.js
```

Erwartete Ausgabe:
```
Server läuft auf Port 3000
```

Verbindung prüfen: Browser öffnen → `http://localhost:3000/api/health`
Erwartete Antwort: `{"status":"ok"}`

### Terminal 3 – Frontend

```bash
cd frontend
npm run dev
```

Erwartete Ausgabe:
```
  VITE ready in ... ms
  ➜  Local: http://localhost:5173/
```

Browser öffnen: `http://localhost:5173`

---

## MongoDB zurücksetzen

Zwischen Testläufen oder bei unerwartetem Zustand die Datenbank zurücksetzen.

### Option A – mongosh (empfohlen)

```bash
mongosh rank2rate --eval "db.dropDatabase()"
```

Danach Backend-Terminal kurz neu starten (Ctrl+C → `node --watch server.js`), damit Mongoose-Indizes neu angelegt werden.

### Option B – Einzelne Collections leeren (ohne Nutzer zu verlieren)

```bash
mongosh rank2rate --eval "
  db.sessions.deleteMany({});
  db.projects.deleteMany({});
"
```

### Option C – Über Browser-Konsole (Dev-Modus)

```js
// Auf localhost:5173 in der Browser-Konsole:
await fetch('http://localhost:3000/api/health').then(r => r.json())
// → {status: 'ok'} bestätigt Backend läuft
```

---

## Konventionen in den Testdokumenten

| Symbol | Bedeutung |
|--------|-----------|
| **→** | Aktion ausführen |
| **✓** | Erwartetes Ergebnis prüfen |
| `code` | Einzugebender Text oder Konsolenbefehl |
| ⚠ | Bekannte Einschränkung oder Hinweis |
| 🔴 | Test fehlgeschlagen – Fehler dokumentieren |
| 🟢 | Test bestanden |

Jeden Schritt mit 🟢 oder 🔴 markieren und bei 🔴 den tatsächlichen Befund notieren.
