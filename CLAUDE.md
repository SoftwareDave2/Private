# CLAUDE.md - Tablohm Projekt Dokumentation

## 📋 Projektübersicht

**Tablohm** ist eine Full-Stack Webanwendung zur Verwaltung und Steuerung von E-Paper Displays. Die Anwendung ermöglicht die zentrale Verwaltung mehrerer Displays, das Planen von zeitgesteuerten Ereignissen über einen Kalender und die Erstellung eigener Inhalte mit einem integrierten Template Editor.

### Hauptfunktionen
- 📺 **Display-Verwaltung**: Zentrale Steuerung mehrerer E-Paper Displays
- 📅 **Kalender-System**: Zeitgesteuerte Anzeige von Inhalten
- 🎨 **Template Editor**: Erstellung eigener Inhalte mit Fabric.js
- 📁 **Mediathek**: Upload und Verwaltung von Bildern
- ⚙️ **Konfiguration**: Display-Einstellungen und -Parameter

---

## 🏗️ Technologie-Stack

### Backend
- **Framework**: Spring Boot 3.3.5
- **Java Version**: Java 17
- **Build Tool**: Maven
- **Datenbank**: MySQL (via Docker)
- **ORM**: JPA/Hibernate
- **API**: RESTful API

### Frontend
- **Framework**: Next.js 15.2.3 (React 18)
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **UI-Komponenten**: Material Tailwind, Lucide Icons
- **Kalender**: FullCalendar
- **Canvas-Editor**: Fabric.js
- **Icons**: FontAwesome

---

## 📁 Projektstruktur

### Backend (`src/main/java/master/it_projekt_tablohm/`)
```
├── controller/          # REST-Controller für API-Endpunkte
├── dto/                # Data Transfer Objects
├── model/              # JPA Entity-Klassen
├── repositories/       # JPA Repositories
└── services/           # Geschäftslogik
```

### Frontend (`src/frontend/`)
```
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── calendar/          # Kalender-Seite
│   │   ├── config/            # Konfigurations-Seite
│   │   ├── events/            # Event-Management (Türschild, Raumbuchung, etc.)
│   │   ├── media/             # Mediathek
│   │   ├── template_editor/   # Template Editor
│   │   ├── login/             # Login-Seite
│   │   ├── register/          # Registrierungs-Seite
│   │   ├── layout.tsx         # Root Layout mit Navigation
│   │   ├── page.tsx           # Dashboard (Startseite)
│   │   └── globals.css        # Globale Styles
│   ├── components/
│   │   ├── layout/            # Header, Nav, NavLinks
│   │   ├── calendar/          # Kalender-Komponenten
│   │   ├── dashboard/         # Dashboard-Komponenten
│   │   ├── media/             # Mediathek-Komponenten
│   │   ├── template-editor/   # Editor-Komponenten
│   │   └── shared/            # Wiederverwendbare Komponenten
│   ├── types/                 # TypeScript Type Definitionen
│   └── utils/                 # Hilfsfunktionen
├── public/uploads/            # Upload-Ordner für Medien
└── package.json
```

---

## 🎨 Design-System & UI-Patterns

### Farbschema
- **Primary**: Red-600 bis Red-700 Gradients
- **Text**: Slate-700 (Standard), Slate-900 (Betont)
- **Backgrounds**: White mit Transparenz-Effekten
- **Borders**: Slate-200 mit verschiedenen Opazitäten

### UI-Komponenten Patterns

#### Navigation
- **Desktop**: Horizontale Navigation mit Hover-Effekten
- **Mobile**: Hamburger-Menü mit Overlay-Navigation
- **Features**:
  - Glasmorphismus-Effekte (backdrop-blur)
  - Scroll-basierte Shadow-Anpassungen
  - Active-State mit Unterstrich-Indikator
  - Touch-optimierte Targets (min. py-3.5)

#### Buttons
- Gradient-Backgrounds für Primary Actions
- Hover: Scale-Effekte (hover:scale-105)
- Active: Scale-Down (active:scale-95)
- Shadow-Effekte mit farbigen Schatten

#### Cards & Modals
- Rounded Borders (rounded-xl bis rounded-2xl)
- Backdrop-Blur für Overlays
- Subtile Shadows (shadow-lg, shadow-2xl)
- Gradient-Backgrounds für Highlights

---

## 🔑 Wichtige Konzepte & Best Practices

### Frontend

#### 1. **Component Organization**
- **Page Components**: In `src/app/[route]/page.tsx`
- **Feature Components**: In `src/components/[feature]/`
- **Shared Components**: In `src/components/shared/`
- **Layout Components**: In `src/components/layout/`

#### 2. **State Management**
- Client Components mit `"use client"` Direktive markieren
- useState für lokale Component-States
- useEffect für Side-Effects (z.B. Event Listeners)

#### 3. **Styling Conventions**
- **Tailwind CSS** als primäres Styling-System
- **Mobile-First Approach**: `md:`, `lg:` Breakpoints
- **Konsistente Spacing**: 4px Grid System
- **Transitions**: duration-200 bis duration-300

#### 4. **API-Kommunikation**
- Fetch API für Backend-Requests
- Base URL typischerweise: `http://localhost:8080/api/`
- Error Handling mit try-catch Blöcken
- Loading States für bessere UX

### Backend

#### 1. **API-Struktur**
- RESTful Endpoints unter `/api/*`
- DTOs für Request/Response Mapping
- Service Layer für Geschäftslogik
- Repository Layer für Datenbankzugriff

#### 2. **Datenbank**
- JPA Entities mit Hibernate
- MySQL Datenbank via Docker
- Migration über JPA Auto-DDL

---

## 🚀 Development Workflow

### Setup & Start

#### Vollständiger Stack (Docker)
```bash
# Development Setup
docker compose -f docker-compose-development.yml up -d
```

#### Separater Start (Development)

**Backend**:
```bash
mvn clean install -DskipTests
mvn spring-boot:run
```

**Frontend**:
```bash
cd src/frontend
npm install
npm run dev
```

Frontend läuft auf: `http://localhost:3000`
Backend API läuft auf: `http://localhost:8080`

### Key Commands

```bash
# Backend Build
mvn clean package -DskipTests

# Frontend Build
npm run build

# Linting
npm run lint
```

---

## ⚠️ Wichtige Hinweise für Entwickler

### 1. **Docker Compose Files**
- **Development**: `docker-compose-development.yml`
- **Production**: `docker-compose.yml` oder `docker-compose.prod.yml`
- ⚠️ Für lokale Entwicklung **immer** development.yml verwenden!

### 2. **Environment Variablen**
- Backend: `src/main/resources/application.properties`
- Frontend: `.env.local` (nicht in Git committed)

### 3. **API Testing**
- Test-Datei: `src/main/resources/static/api_test.http`
- Verwendung mit IntelliJ HTTP Client oder ähnlichen Tools

### 4. **Mediathek Uploads**
- Upload-Pfad: `src/frontend/public/uploads/`
- Dieser Ordner sollte persistent gemounted werden
- Max. Dateigröße beachten (Backend-Konfiguration)

### 5. **Navigation & Routing**
- Next.js App Router (nicht Pages Router)
- File-based Routing
- Server Components by default
- Client Components explizit mit `"use client"` markieren

### 6. **TypeScript**
- Strict Mode aktiviert
- Type-Definitionen in `src/types/`
- Interface-First Approach für API-Responses

---

## 🐛 Debugging & Troubleshooting

### Backend
- **Logs**: Console Output von Spring Boot
- **Debug Mode**: IntelliJ Debugger verwenden
- **Database**: MySQL Workbench für DB-Inspektion

### Frontend
- **Browser DevTools**: React Developer Tools
- **Network Tab**: API-Request Debugging
- **Console Logs**: Für State-Debugging

### Häufige Probleme

1. **Port bereits belegt**
   - Backend: Port 8080 checken
   - Frontend: Port 3000 checken
   - MySQL: Port 3306 checken

2. **CORS Errors**
   - Backend CORS-Konfiguration prüfen
   - Proxy-Settings in `next.config.ts`

3. **Hydration Errors**
   - `suppressHydrationWarning` in layout.tsx gesetzt
   - Client/Server Component Boundaries prüfen

---

## 📚 Weitere Dokumentation

- `readme.md` - Hauptdokumentation mit Setup-Anleitung
- `readme_backend_api.md` - Detaillierte API-Dokumentation
- `readme_frontend_tutorial.md` - Frontend-Tutorial
- `Raspberry_Pi.md` - Raspberry Pi Integration

---

## 🎯 Roadmap & TODOs

### Aktuelle Features
- ✅ Display-Management
- ✅ Kalender mit Ereignissen
- ✅ Mediathek
- ✅ Template Editor
- ✅ Event-System (Türschild, Raumbuchung, Notice Board)
- ✅ Moderne Navigation mit Glasmorphismus

### Geplante Features
- 🔄 User Authentication & Authorization
- 🔄 Multi-Tenancy Support
- 🔄 Real-time Display Status Updates
- 🔄 Advanced Template Templates
- 🔄 Export/Import Funktionalität

---

## 👥 Team & Contribution

Bei Fragen oder Problemen:
1. Bestehende Dokumentation prüfen
2. Code-Kommentare lesen
3. API-Tests in `api_test.http` anschauen
4. Team kontaktieren

**Wichtig**: Vor größeren Änderungen immer mit dem Team absprechen!
