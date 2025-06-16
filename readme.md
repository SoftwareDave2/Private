# 📺 Display-Buchungs- und Content-System

Dieses Projekt ist eine Webanwendung zur Verwaltung von Inhalten auf öffentlichen Displays. Es bietet Nutzern die Möglichkeit, Inhalte zu erstellen und zu buchen, während Administratoren diese moderieren und verwalten können. Technologiestack: **Next.js**, **Tailwind CSS**, **Supabase**, **Railway/Vercel/Netlify**.

---

## 🚀 PHASE 1 – Setup & Infrastruktur

### 🔧 #01 - Projekt-Repo & Struktur aufsetzen
- ✅ Frontend- und Backend-Ordnerstruktur anlegen
- ✅ NPM-Projekte initialisieren
- ✅ README mit Projektbeschreibung schreiben

### 🔧 #02 - Deployment für Frontend & Backend einrichten
- Vercel (Next.js) & Supabase oder Netlify + Railway einrichten
- Einfaches „Hello World“ deployen

---

## ✍️ PHASE 2 – Nutzer & Authentifizierung

### 🔐 #03 - Supabase/Backend Auth einrichten (Login + Registrierung)
- ✅ Registrierung mit E-Mail + Passwort
- ✅ Login über UI
- ✅ Logout-Funktion
- ⏱ Tests mit zwei Dummy-Accounts

### 🔐 #04 - Rollenmodell umsetzen (Public / Admin)
- ✅ Bei Registrierung → Standardrolle „public“
- ✅ Manuelle Änderung auf „admin“ im Backend
- ✅ API-Absicherung: nur Admins dürfen Inhalte freigeben

---

## 📅 PHASE 3 – Kalender & Buchungssystem

### 📆 #05 - Datenbankstruktur: Displays, Buchungen modellieren
- Tabellen: `displays`, `bookings` (mit Relationen)
- Dummy-Displays einfügen (Name + Standort)

### 📆 #06 - Kalenderkomponente mit Verfügbarkeit bauen
- Kalender-Komponente anzeigen
- API ruft verfügbare Displays & Zeiträume ab
- 7 oder 14 Tage auswählbar

### 📆 #07 - Buchungslogik + Prüfung auf Konflikte
- Beim Absenden: Prüfung, ob Zeitraum frei ist
- Bei Kollision → Fehler anzeigen
- Buchung in Datenbank speichern

---

## 📝 PHASE 4 – Content-Erstellung

### ✍️ #08 - Content-Formular implementieren
- Felder: Titel, Text, Link
- Validierung: max. 25 / 400 Zeichen
- Auswahl: Content-Typ (Teaser, Suche/Biete, Event)

### 📱 #09 - Display-Vorschau mit QR-Code
- QR-Code-Generator einbauen (z. B. `qrcode.react`)
- Live-Vorschau, wie Inhalt auf Display aussehen würde
- Zeichenanzahl anzeigen

---

## 🧠 PHASE 5 – Moderation & Admin

### 🧾 #10 - Moderationsansicht für Admin bauen
- Admin sieht alle Inhalte im Status „pending“
- Freigeben / Ablehnen mit einem Klick
- Status-Update per API

### 🤖 #11 - Optionale KI-Prüfung von Inhalten (Basic Check)
- Beispiel: OpenAI API einbauen für Content Check
- Entscheidung „OK / nicht OK“
- Ergebnis anzeigen + Admin

---

## 📤 PHASE 6 – Anzeige auf Display

### 🖥 #12 - API: Display-Inhalt nach Datum ausliefern
- `GET /display/:id/current`
- Liefert Content, wenn `start_date <= today <= end_date`
- JSON-Struktur für Display: Titel, Text, QR

### 🕒 #13 - Ablauf-Logik: Auto-Deaktivierung nach Zeitraum
- Cron-Job oder Abfrage, die abgelaufene Inhalte ausblendet
- Optional: 1–2 Tage Kulanzzeit (offline-Fall)

---

## ✅ BONUS & DOKU

### 🪄 #14 - Styling mit Tailwind + Accessibility
- Farben, Kontraste, Fokus-Indikatoren, etc.
- Schriftgrößen für Bildschirm-Vorschau

### 📖 #15 - Entwicklerdokumentation schreiben
- Projektstruktur
- API-Doku (Swagger / Markdown)
- Setup-Anleitung für neue Entwickler

---

## 🧪 TESTS (optional)

### 🧪 #16 - API-Tests (z. B. Buchung, Content-Erstellung)
- Mit Postman oder Jest (z. B. für `POST /bookings`)
- Prüfen: Validierung, Rollen-Check, Kollisionen

### 🧪 #17 - Usability-Test mit Kommilitonen vorbereiten
- Test-Account bereitstellen
- Mini-Fragebogen: „War etwas unklar?“
- Feedback notieren & Verbesserungen planen

---

## 🧠 Hinweise zur Planung
- ⏱ Jede dieser Aufgaben passt in ~4 Stunden Aufwand
- 🧑‍🤝‍🧑 Einige Aufgaben (z. B. #08 und #09) können zu zweit parallel gemacht werden
- 📦 Alle Issues können direkt in GitHub oder Trello übernommen werden
