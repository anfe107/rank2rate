# rank2rate – Routen & API-Endpunkte

Planungsstand. Konzeptuelle Grundlage: [`konzept.md` Abschnitt 7](../konzept.md)

---

Vollständige Wireframes aller Views: [`docs/ui-views.md`](ui-views.md)

## Frontend-Routen

| Pfad | View | Zugang |
|---|---|---|
| `/login` | LoginView | Gäste |
| `/register` | RegisterView | Gäste |
| `/dashboard` | DashboardView | Lehrer (Auth) |
| `/sessions/new` | SessionCreateView | Lehrer (Auth) |
| `/sessions/:id` | SessionManageView | Lehrer (Auth) |
| `/sessions/:id/results` | SessionResultsView | Lehrer (Auth) |
| `/session/:id` | StudentSessionView | Schüler (kein Login) |

**Navigation Guard**: Nicht eingeloggte Nutzer werden von Auth-Routen auf `/login` weitergeleitet.

**Offene Designfrage – Benotungsroute**: `/sessions/:id/results` deckt laut Konzept (3.4) zwei Schritte ab: Reihungs-Ergebnis (Schritt 1) und Benotung (Schritt 2). Ob Schritt 2 eine eigene Route `/sessions/:id/rating` bekommt oder intern in der ResultsView bleibt, ist noch nicht entschieden.

---

## API-Endpunkte (Backend)

### Health & Authentifizierung

| Methode | Pfad | Funktion |
|---|---|---|
| GET | `/api/health` | Erreichbarkeit prüfen |
| POST | `/api/auth/register` | Lehrer-Account erstellen |
| POST | `/api/auth/login` | Einloggen, JWT erhalten |

### Sessions & Abgaben

| Methode | Pfad | Funktion |
|---|---|---|
| POST | `/api/sessions` | Session mit Abgaben erstellen |
| GET | `/api/sessions` | Meine Sessions auflisten |
| GET | `/api/sessions/:id` | Session + Abgaben laden |
| PATCH | `/api/sessions/:id/projects/:pid` | Abgabe bearbeiten |
| DELETE | `/api/sessions/:id/projects/:pid` | Abgabe löschen |

### Reihung & Benotung (Sprint 1)

| Methode | Pfad | Funktion |
|---|---|---|
| PATCH | `/api/sessions/:id/grouping` | Drag & Drop Ergebnis speichern |
| PATCH | `/api/sessions/:id/pairwise-result` | Paarvergleich-Ergebnis speichern |
| PATCH | `/api/sessions/:id/rating` | Benotungs-Ergebnis speichern (Notensystem, Verteilung, Notenverteilung) |

### Peer-Review (Sprint 2)

| Methode | Pfad | Funktion |
|---|---|---|
| GET | `/api/sessions/:id/status` | Live-Abstimmungsfortschritt |
| POST | `/api/sessions/:id/vote` | Schüler-Stimme abgeben |
| GET | `/api/sessions/:id/results` | Finale Ergebnisse abrufen |
| POST | `/api/sessions/:id/close` | Session beenden |
