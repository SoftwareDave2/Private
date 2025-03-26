# REST-API Dokumentation
Diese API stellt Endpunkte zur Verwaltung von Displays, Bildern, Events, Benutzern, Konfigurationen und wiederkehrenden Events zur Verfügung.

---

## **1. DisplayController Endpunkte**

### **Initiieren eines Displays**
**POST** `/display/initiate`

**Parameter:**
- `macAddress` (String, required)
- `width` (Integer, required)
- `height` (Integer, required)

**Antwort:**
- 200 OK mit Statusmeldung und Zeitinformationen.

---

### **Display hinzufügen**
**POST** `/display/add`

**Parameter:**
- `macAddress`, `displayName`, `brand`, `model`, `width`, `height`, `orientation`, `defaultFilename` (alle required)
- `wakeTime` (optional)

**Antwort:**
- "Saved" oder Fehlermeldung, wenn MAC-Adresse nicht initialisiert wurde.

---

### **Alle Displays abrufen**
**GET** `/display/all`

Antwort: Liste aller Displays.

---

### **Display löschen**
**DELETE** `/display/delete/{mac}`

Antwort: Erfolgs- oder Fehlermeldung.

---

### **Display nach MAC abrufen (inkl. Wake-Logik)**
**GET** `/display/get/{mac}`

Antwort: Aktuelle Displaydaten inkl. WakeTime und zu ladendem Bild.

---

### **Bildwechsel bestätigen**
**POST** `/display/switch`

**Parameter:** `macAddress`, `filename`

Antwort: Timestamp-basierte Bestätigung.

---

### **Akkustand übermitteln**
**POST** `/display/postBattery`

**Parameter:** `macAddress`, `batteryPercentage`

Antwort: Erfolgsnachricht oder Fehler falls Display nicht gefunden.

---

### **Marken und Modelle abrufen**
- `GET /display/brands`
- `GET /display/models`

Antwort: Liste eindeutiger Marken/Modelle.

---

### **Aktuelle Zeit**
**GET** `/display/currentTime`

Antwort: JSON mit aktueller Zeit.

---

## **2. EventController Endpunkte**

### **Event erstellen**
**POST** `/event/add`

**Body:** Event-Objekt mit `title`, `start`, `end`, `allDay`, `displayImages`

Antwort:
- `200 OK` bei Erfolg
- `541` falls ein Display vor Eventbeginn nicht aufwacht (Fehlermeldung + MACs)
- `400` bei Konflikten oder fehlenden Displays

---

### **Event aktualisieren**
**PUT** `/event/update/{id}`

**Body:** Gleiches Format wie beim Erstellen

Antwort: Analog zu `/add`

---

### **Event löschen**
**DELETE** `/event/delete/{id}`

Löscht Event + aktualisiert ggf. `nextEventTime` und entfernt Fehler.

Antwort: 200 OK oder 404

---

### **Alle Events abrufen**
**GET** `/event/all`

### **Events für ein Display**
**GET** `/event/all/{macAddress}`

Antwort: Liste der Events für das Display.

---

## **3. RecEventController Endpunkte (Wiederkehrende Events)**

### **Recurring Event hinzufügen**
**POST** `/recevent/add`

**Body:** RecEvent mit `title`, `start`, `end`, `rrule`, `displayImages`

Antwort:
- 200 OK mit Group-ID
- 400 bei Konflikten, falscher Displayzuordnung oder Parsingfehler

### **Alle wiederkehrenden Events abrufen**
**GET** `/recevent/all`

Antwort: Liste aller RecEvents (DTO mit Titel, GroupID, Start, RRule)

### **Recurring Event löschen**
**DELETE** `/recevent/delete/{groupId}`

Antwort: Löscht alle Events mit dieser GroupID

---

## **4. ImageController Endpunkte**

### **Bild hochladen**
**POST** `/image/upload`

Form-Data mit `image` (MultipartFile)

Antwort: Erfolgs- oder Fehlermeldung mit Pfad

### **Bild herunterladen**
**GET** `/image/download/{filename}`

Antwort: Bild-Datei mit passenden Headern oder Fehler (404, 500)

### **Bild existiert?**
**GET** `/image/exists?filename=xyz.jpg`

Antwort: `{ "exists": true/false }`

### **Bilder auflisten**
- `/image/listByDate` – sortiert nach Upload-Datum (neueste zuerst)
- `/image/listByFilename` – alphabetisch sortiert

### **Bild löschen**
**DELETE** `/image/delete/{filename}`

Antwort:
- Erfolgsnachricht
- 404 falls Datei oder DB-Eintrag fehlt
- 409/410 falls Datei in Events oder Displays referenziert wird

---

## **5. ConfigController**

### **Konfiguration abrufen**
**GET** `/config/get`

Antwort: Konfig-Objekt oder 404

### **Konfiguration speichern / aktualisieren**
**POST** `/config/post`

Body enthält Wake-Zeiten, Zeitfenster, Followups etc.

Antwort: Aktuelle Konfiguration nach Speichern

---

## **6. UserController**

### **Neuen Benutzer hinzufügen**
**POST** `/user/add`

Formulardaten: `name`, `email`

Antwort: "Saved"

### **Alle Benutzer abrufen**
**GET** `/user/all`

Antwort: Liste aller Benutzerobjekte

---

## **7. Hintergrundprozesse (Services)**

- **DisplayService:**
  - `checkDisplayStatus()` prüft, ob Bild dem Event entspricht → fügt Fehler bei Abweichung hinzu.
  - `checkDisplayNextEvent()` aktualisiert `nextEventTime` anhand kommender Events.

- **EventService:**
  - `deleteOldEvents()` löscht Events, deren Ende >7 Tage zurückliegt (täglich geplant).

---

## **Fehlercodes (Beispiele)**

- **101**: Event nicht aktualisiert (Anzeige zeigt falsches Bild)
- **102**: Display wacht nicht rechtzeitig auf vor Eventbeginn
- **121**: Batterie niedrig (unter 10%)

---

## **Hinweise zu Uploads**
- Upload-Verzeichnis: `src/frontend/public/uploads`
- Synchronisation erfolgt automatisch beim Start

---

## **RecurrenceRule Hinweise**
Beispiel: `FREQ=WEEKLY;BYDAY=MO;COUNT=4`

Für Details: [RFC 5545 Section 3.8.5.3](https://tools.ietf.org/html/rfc5545#section-3.8.5.3)

---

