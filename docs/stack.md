# rank2rate – Tech-Stack & Abhängigkeiten

## Laufzeitumgebung

| Tool    | Version                          |
|---------|----------------------------------|
| Node.js | ≥ 22 (empfohlen: 22.x LTS)       |
| MongoDB | 8.0 (als Windows-Dienst lokal)   |

---

## Frontend (`frontend/`)

### Dependencies

| Paket            | Version    | Zweck                          |
|------------------|------------|--------------------------------|
| vue              | ^3.5.29    | UI-Framework (Composition API) |
| vue-router       | ^5.0.3     | SPA-Routing                    |
| pinia            | ^3.0.4     | State Management               |
| lucide-vue-next  | ^0.575.0   | Icons (Vue 3)                  |
| sortablejs       | ^1.15.7    | Drag & Drop (Desktop + Touch)  |
| qrcode           | ^1.5.4     | QR-Code-Generierung (clientseitig, Sprint 2) |

### DevDependencies

| Paket               | Version    | Zweck                          |
|---------------------|------------|--------------------------------|
| vite                | latest     | Build-Tool / Dev-Server        |
| @vitejs/plugin-vue  | latest     | Vue SFC-Support für Vite       |
| tailwindcss         | ^4.2.1     | Utility-CSS (v4, CSS-first)    |
| @tailwindcss/vite   | latest     | Tailwind v4 Vite-Plugin        |
| vitest              | ^4.0.18    | Test-Runner                    |
| @vitest/coverage-v8 | ^4.0.18    | Coverage-Reports               |
| @vue/test-utils     | ^2.4.6     | Vue-Komponenten-Tests          |
| happy-dom           | ^20.7.0    | DOM-Simulation für Tests       |

### Konfigurationshinweise

- Tailwind v4: **CSS-first** – kein `tailwind.config.js`, stattdessen `@import "tailwindcss"` in der CSS-Datei
- Vue Router 5 + Pinia 3 erfordern Vue 3.5+

---

## Backend (`backend/`)

### Dependencies

| Paket          | Version    | Zweck                                  |
|----------------|------------|----------------------------------------|
| express        | ^5.2.1     | HTTP-Framework (Node ≥ 18, async-safe) |
| mongoose       | ^9.2.1     | MongoDB ODM                            |
| dotenv         | ^17.3.1    | Umgebungsvariablen aus `.env`          |
| jsonwebtoken   | ^9.0.3     | JWT (Lehrer-Authentifizierung)         |
| bcryptjs       | ^3.0.3     | Passwort-Hashing                       |
| cors           | ^2.8.6     | CORS-Middleware                        |


### DevDependencies

| Paket                  | Version    | Zweck                                  |
|------------------------|------------|----------------------------------------|
| vitest                 | ^4.0.18    | Test-Runner                            |
| @vitest/coverage-v8    | ^4.0.18    | Coverage-Reports                       |
| supertest              | ^7.2.2     | HTTP-Integrationstests                 |
| mongodb-memory-server  | ^11.0.1    | In-Memory-MongoDB für Tests            |

### Konfigurationshinweise

- `"type": "module"` in `package.json` → ESM (`import`/`export` statt `require`)
- Dev-Start: `node --watch server.js` (kein nodemon nötig, ab Node 18+)
- `mongodbMemoryServer.version` ist auf `"8.0.19"` gepinnt, damit mongodb-memory-server nicht automatisch die Rapid-Release-Version 8.2.x lädt

### Erforderliche `.env`-Variablen

```
JWT_SECRET=<zufälliger langer String>
ENCRYPTION_KEY=<32-Byte Hex-String für AES-256>
PORT=3000               # optional, Standard: 3000
MONGODB_URI=mongodb://localhost:27017/rank2rate  # optional
```
