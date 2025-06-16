# IT-Projekt Digitale Schilder

### 📌 Inhaltsverzeichnis
1. [Projektbeschreibung](#-projektbeschreibung)
2. [Einrichtung der Entwicklungsumgebung](#-einrichtung-der-entwicklungsumgebung)
3. [Anwendung Starten](#-anwendung-starten)
    - [Option 1: Starten als Dockercontainer](#option-1-starten-als-dockercontainer)
    - [Option 2: Manueller Start](#option-1-manueller-start)
    - [Option 3: Start-Skript](#option-2-start-skript)
    - [Option 4: Start mit IntelliJ IDE](#option-4-start-mit-intellij-ide)
4. [Ordnerstruktur](#-ordnerstruktur)
    - [Backend](#backend)
    - [Frontend](#frontend)


## 📑 Projektbeschreibung
Die Webanwendung **Digitale Schilder** ermöglicht die Verwaltung und Steuerung von E-Paper Displays über eine
benutzerfreundliche Weboberfläche. Die Anwendung wurde entwickelt, um mehrere Displays zentral zu verwalten und
Bilder schnell und einfach auf die gewünschten Displays zu übertragen. Über einen Kalender können Ereignisse
geplant werden, um Bilder zu einem bestimmten Zeitpunkt in der Zukunft anzuzeigen. Außerdem können mit dem
integrierten Editor eigene Inhalte generiert werden, die anschließend auf den Displays angezeigt werden können.


## ⚙️ Einrichtung der Entwicklungsumgebung
Stellen Sie sicher, dass die folgenden Programme auf Ihrem System installiert sind, bevor Sie die Anwendung ausführen.

#### 1. Node.js
- Node.js wird benötigt, da das Frontend mit Next.js entwickelt wurde.
- Sie können die neueste Version von Node.js von der [offiziellen Node.js-Website](https://nodejs.org/) herunterladen und installieren.

#### 2. Docker Desktop
- Docker Desktop wird benötigt, um den Datenbank-Container auszuführen.
- Laden Sie Docker Desktop von der [offiziellen Docker-Website](https://www.docker.com/products/docker-desktop) herunter und installieren Sie es.

#### 3. Java 17
- Das Backend wurde mit Spring Boot entwickelt und benötigt Java 17.
- Sie können Java 17 von [OpenJDK](https://adoptium.net/) oder anderen Anbietern Ihrer Wahl herunterladen und installieren.

#### 4. Maven (Build Tool)
- Für das Backend-Projekt wird Maven als Build-Tool verwendet. Stellen Sie sicher, dass Maven auf Ihrem System installiert ist.
- Sie können Maven von der [offiziellen Maven-Website](https://maven.apache.org/) herunterladen und installieren.

Als Entwicklungsumgebung für dieses Projekt eignet sich z.B. die [IntelliJ IDE](https://www.jetbrains.com/de-de/idea/) von JetBrains.

⚠️ **Wichtiger Hinweis zur Entwicklung**

Für die lokale Entwicklung **muss** die Datei `docker-compose-development.yml` genutzt werden – insbesondere, wenn du das Startskript (z. B. `./start.sh`) aufrufst.  

1. Lege zunächst ein Backup aller vorhandenen Compose-Dateien an (z. B. `docker-compose.yml`, `docker-compose.prod.yml` usw.).  
2. Benenne anschließend **`docker-compose-development.yml` zu `docker-compose.yml`** um.  

Nur so stellt das Startskript sicher, dass die Container mit den richtigen Entwicklungs-Einstellungen gebaut und ausgeführt werden, ohne die produktiven Konfigurationen zu beeinträchtigen.



## ▶️ Anwendung Starten

### Option 1: Starten als Dockercontainer
   - Wechseln Sie im Terminal in das Root-Verzeichnis des Projekts.
   - Verwenden Sie docker compose, um den Webservice zu starten:
     ```bash
     docker compose up -d
     ```
   - Dies startet die Spring Boot-Anwendung mit der Backend-API und der Datenbank.

   - Wenn das Docker image noch nicht gebaut ist:
      - Build the backend
        ```
        mvn clean package -D skipTests
        ```
      - Build the docker container:
        ```
        docker compose build
        ```


### Option 2: Manueller Start
#### 1. Starten des Spring Boot Backends
   - Wechseln Sie im Terminal in das Root-Verzeichnis des Projekts.
   - Verwenden Sie Maven, um das Backend zu bauen und zu starten:
     ```bash
     mvn clean install -D skipTests
     mvn spring-boot:run
     ```
   - Dies startet die Spring Boot-Anwendung mit der Backend-API und den erforderlichen Endpunkten.
#### 2. Starten des Next.js Frontends
   - Wechseln Sie im Terminal in das Verzeichnis des Frontend-Projekts: `src/frontend/`
   - Installieren Sie die erforderlichen Node.js-Abhängigkeiten:
     ```bash
     npm install
     ```
   - Nachdem die Abhängigkeiten installiert wurden, starten Sie den Next.js-Entwicklungsserver:
     ```bash
     npm run dev
     ```
   - Dies startet die Frontend-Anwendung unter [http://localhost:3000](http://localhost:3000).

### Option 3: Start-Skript
Das PowerShell-Skript `start_script.ps1` wurde entwickelt, um den Start eines Webservice-Umfelds zu automatisieren. Es umfasst das
Starten von Docker Desktop, das Bereinigen und Erstellen des Backends mit Maven und die Verwaltung des Frontends mit npm.
Das Skript überwacht außerdem die Eingabe der Taste `q`, um alle laufenden Prozesse zu stoppen und zurück zum
Root-Verzeichnis zu wechseln.

⚠️ **Wichtiger Hinweis zur Entwicklung**

Für die lokale Entwicklung **muss** die Datei `docker-compose-development.yml` genutzt werden – insbesondere, wenn du das Startskript (z. B. `./start.sh`) aufrufst.  

1. Lege zunächst ein Backup der vorhandenen Compose-Datei an (z. B. `docker-compose.yml` zu `docker-compose-production.yml`).  
2. Benenne anschließend **`docker-compose-development.yml` zu `docker-compose.yml`** um.  


### Option 4: Start mit IntelliJ IDE
Um die Debuggung-Funktionen der IntelliJ IDE verwenden zu können, kann die Anwendung auch direkt aus der
Entwicklungsumgebung gestartet werden. Dazu muss das Spring Boot-Backend über den Run-Befehl der IDE gestartet werden
(`Umschalt`+`F10`). Das Next.js Frontend kann wie bei Option 1 über das Terminal gestartet werden.


## 📂 Ordnerstruktur
Im Folgenden wird eine Übersicht über die wichtigsten Ordner und Dateien des Backends und Frontends gegeben.


### Backend
```
src/main
├── java
│ ├── master.it_projekt_tablohm
│ │ ├── controller # REST-Controller für API-Endpunkte
│ │ ├── dto # Datentransferobjekte
│ │ ├── model # Datenmodelle und Entity-Klassen
│ │ ├── repositories # JPA Repositories für DB-Interaktionen
│ │ └── services # Geschäftslogik und Services
├── resources
│ ├── static
│ │ └── api_test.http # Testen der REST-Schnittstelle
│ ├── application.properties # Globale Parameter und Logging Parameter
```

### Frontend
```
src/frontend
├── public
│ └── uploads # Upload-Ordner der Mediathek
├── src
│ ├── app # Page-Komponenten für Seiten
│ │ ├── calendar # Page-Komponente für Kalender
│ │ ├── config # Page-Komponente für Konfigurationsseite
│ │ ├── media # Page-Komponente für Mediathek
│ │ ├── template_editor # Page-Komponente für Template Editor
│ │ ├── globals.css # Globales CSS-File (gültig für alle Komponenten)
│ │ ├── layout.tsx # Layout-Komponente
│ │ └── page.tsx # Dashboard
│ ├── components # Verwendete Komponenten der jeweiligen Seiten
│ │ └── shared # Geteilte Komponenten
│ ├── types # Datenstrukturen
│ └── utils # Globale Funktionen
├── next.config.ts # Globale Konfiguration für next.js
├── package.json # Verwendete Pake 
```
