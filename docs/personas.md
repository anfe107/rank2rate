# rank2rate – Personas & Use Cases

> Maßgebliche Persona-Definitionen für rank2rate. `konzept.md` Kapitel 2 referenziert diese Datei.

---

## Personas

### Persona 1: Lehrperson (Einzelbewertung)

**Profil**: Daria Schmitz, 42 J., Deutsch & Wirtschaft, Berufskolleg, mittlere Tech-Affinität

**Kontext**:

- Bewertet 12 Abgaben ihrer ITA-Klasse
- Zeitdruck: Korrekturphase, viele andere Aufgaben
- Benötigt nachvollziehbare Bewertungen für Notenvergabe
- Will faire, kriterienbasierte Bewertung

**Ziele**:

- Effiziente Bewertung (< 45 Min für alle Abgaben)
- Transparenz gegenüber Schülern und Eltern
- Konsistente Bewertung ohne „Lieblinge"
- Feedback-Notizen für einzelne Abgaben

**Frustrationen**:

- „Die erste Abgabe wird zu streng, die letzte zu milde bewertet"
- „Kreative Arbeiten lassen sich schwer mit Recherchearbeiten vergleichen"
- „Ich bin unsicher bei 3–4 Abgaben im Mittelfeld"

**Typischer Workflow** (Sprint 1 MVP):

1. Abgaben eingeben (Titel, ggf. Link)
2. Drag & Drop für grobe Reihung in Gruppen
3. Paarvergleiche für unsichere Fälle im Mittelfeld
4. Benotung: Notensystem wählen, lineare Verteilung prüfen, ggf. manuell anpassen
5. *(Sprint 2)* Export als CSV für Notenverwaltung
6. *(Sprint 3+)* Kategorien-Bewertung für detaillierte Kriterienauswertung

**Wichtige Features**: Anonymisierung (gegen Bias), Notiz-Felder pro Abgabe, CSV-Export

---

### Persona 2: Lehrperson (Session-Initiator für Peer-Review)

**Profil**: Amir Yilmaz, 35 J., Informatik & Netzwerktechnik, hohe Tech-Affinität

**Kontext**:

- Organisiert Peer-Bewertungen von 15 Präsentationen im Klassenzimmer (Beamer + Smartphones)
- Möchte Schüler aktiv einbinden, ohne komplizierte Login-Systeme
- Benötigt schnellen Zugang ohne Login/Installation für Schüler

**Ziele**:

- Schüler aktiv in Bewertung einbinden
- Fairness: Keine Eigenbewertung
- Transparenz: Ergebnisse gemeinsam besprechen
- Zeitersparnis: Schüler bewerten, Lehrer moderiert

**Frustrationen**:

- „Login-Systeme sind zu kompliziert für Schüler"
- „Ich will Eigenbewertungen und Mehrfach-Abstimmungen verhindern"
- „Ergebnisse sollen sofort sichtbar sein"

**Typischer Workflow**:

1. Session erstellen (Titel, Abgaben, Methode wählen)
2. QR-Code am Beamer zeigen
3. Schüler scannen QR-Code und bewerten (10–15 Min)
4. Live-Dashboard: Fortschritt beobachten
5. Ergebnisse am Beamer präsentieren und diskutieren

**Wichtige Features**: QR-Code-Generierung, Eigenbewertung verhindern, Live-Dashboard, Präsentations-Modus

---

### Persona 3: Schülergruppe (Peer-Review)

**Profil**: Sofia Wagner, 19 J., Duale Ausbildung FIAE, Digital Native, hohe Tech-Affinität

**Kontext**:

- Bewertet anonym per Smartphone 10 Präsentationen der Mitschüler im Klassenzimmer
- Anonyme Bewertung (Fantasy-Namen für Abgaben)
- Motivation: „Meine Stimme zählt!"

**Ziele**:

- Schnelle, intuitive Bewertung (< 10 Min)
- Spaß am Bewerten (spielerisch)
- Fairness: Eigene Abgabe nicht bewerten

**Frustrationen**:

- „Zu viele Fragen, zu kompliziert"
- „Ich will nicht meinen Namen angeben"
- „Wie viele Abgaben muss ich noch bewerten?"

**Typischer Workflow**:

1. QR-Code scannen → Interface öffnet sich
2. Optional: „Welches ist deine Abgabe?" → wird ausgeblendet
3. Bewertung (z.B. Dot Voting: 5 Punkte verteilen)
4. Fortschrittsanzeige: „7 von 9 Abgaben bewertet"
5. Abschluss: „Danke! Ergebnisse folgen."

**Wichtige Features**: Mobile-optimiert, kein Login, spielerische Interaktion, Fortschrittsanzeige

---

### Persona 4: Einzelschüler (Selbstreflexion)

**Profil**: Aarav Patel, 17 J., 13. Klasse (Abitur-Vorbereitung), mittlere Tech-Affinität

**Kontext**:

- Nutzt rank2rate nicht zur Fremdbewertung, sondern zur Strukturierung eigener Ideen
- Beispiel: Themenwahl für die mündliche Abiturprüfung
- Keine Bewertung durch andere, nur eigene Reflexion

**Ziele**:

- Klarheit über eigene Präferenzen
- Strukturierte Entscheidungsfindung

**Frustrationen**:

- „Alle Optionen klingen gut, aber eine Entscheidung muss her"

**Typischer Workflow** *(Sprint 3+)*:

1. Eigene Ideen eingeben (5–8 Ideen)
2. Paarvergleiche: „Was interessiert mich mehr?"
3. Reihung vergleichen → Entscheidung treffen
4. *(Sprint 3+)* Kategorien-Bewertung: Machbarkeit, Interesse, Aufwand

**Wichtige Features**: Kein Account nötig (lokale Nutzung), einfache Bedienung

---

## Use Case Übersicht

Use Cases mit Sprint-Zuordnung: → [`konzept.md` Abschnitt 2](../konzept.md)
