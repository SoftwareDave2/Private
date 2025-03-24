# 📘 Website-Tutorial

Dieses Tutorial bietet einen Überblick über die Website und erklärt wie die einzelnen funktionen genutzt werden können.

## 📌 Inhaltsverzeichnis
- [Dashboard](#dashboard) – Überblick über alle Displays
- [Kalender](#kalender) – Termine verwalten
- [Mediathek](#mediathek) – Bilder verwalten
- [Template Editor](#template-editor) – Neue Vorlagen erstellen 
- [Config](#config) – Konfigurationseinstellungen 

---

## 🖥️ Dashboard <a name="dashboard"></a>
Das Dashboard bietet dir einen schnellen Überblick über alle Displays.

### Funktionen:
- **Bild-Anzeige** – Auf dem Dashboard werden die aktuellen Bilder auf den Displays angezeigt.      
- **Display-Setup** – Das Dashboard bietet die Möglichkeit neue Displays zu konfigurieren.   
- **Fehlermeldungen** – Auf dem Dashboard erscheinen Hinweise, wenn Fehler aufgetreten sind. 


![Dashboard Screenshot](pictures_readme_frontend/dashboard.png)

> **Hinweis:** Über das "Sortieren nach" Drop-Down Menü lässt sich einstellen, ob die Displays nach ihrem Namen soertiert werden, 
> oder ob man die Sortierung manuell per drag and drop vornehmen möchte.".

---

## 📅 Kalender <a name="kalender"></a>
Diese Seite dient der Anzeige und Verwaltung von Terminen.

### Funktionen:
- **Termine filtern** – Termine werden im Kalender dargestellt. Über die Checkboxen lassen sich Termine nach zugeteilten Displays filtern. 
- **Erstellen neuer Termine** – Neue Einträge im Kalender erstellen  
- **Bearbeiten von Terminen** – Nach einem klick auf einen Termin, öffnet sich ein Menü, über welches diser bearbeitet werden kann.
- **Löschen von Terminen** – Bestehende Termine lassen sich löschen. Bei widerholenden Terminen bietet sich die Option entweder nur den Einzeltermin zu löchen, oder alle zugehörigen Termine. 


![Kalender Screenshot](pictures_readme_frontend/kalender.png)



---

## 📂 Mediathek <a name="mediathek"></a>
Verwalte die Bilder der Mediathek. Bevor ein Bild als Standardbild oder in einem Termin verwendet werden kann, muss es zunächst in die Mediathek hochgeladen werden.

### Funktionen:
- **Hochladen von Bildern** – Nach einem klick auf den "Hochladen" Button öffnet sich ein entsprechendes Dialog-Menü 
- **Sorteiern von Bildern** – Die Bilder lassen sich nach dateiname oder nach uploaddatum sortieren.
- **Löschen von Bildern** – Wenn man mit der Maus über ein bild hovert, erschein ein "X" in der oberen rechten Ecke. 
Klickt man auf dieses "X" öffnet sich ein Dialog zur Bestätigung das dieses Bild gelöscht werden soll.

![Mediathek Screenshot](pictures_readme_frontend/mediathek.png)

> **Hinweis:** Die maximal zulässige Dateigröße für den Upload beträgt 10 MB.


---
 
## 🎨 Template Editor <a name="template-editor"></a>
Der Template Editor dient zur Erstellung von neuen Bildern für die Mediathek.

### Funktionen:
- **Beliebiges Hintergrundbild hochladbar**  
- **Hinzufügen von Textfeldern an beliebiger Position** – Textfelder können durch einen einfachen doppelklick in dem Bild platziert werden. Die Textfelder lassen sich aiuch im nachhinein noch verschieben. 
- **Schriftart, Schriftgröße und Schriftfarbe einstellbar** – Nach dem das gewünschte Textfeld angeklickt wurde, können Schriftart (Arial, Helvetica, Times New Roman, Courier New) Schriftgröße und Schriftfarbe verändert werden. Außerdem lässt sich die Schriftgröße auch verändern, indem das Textfeld größer gezogen wird.
- **Editiertes Bild in Mediathek speichern** – Nach dem das Bild editiert wurde, kann es nach einem Klick auf den "Bild speichern" Button gespeichert werden. Dieser befindet sich unter dem Bild. Anschließend erscheint ein kleiner Dialog zur Benennung des Bildes.


![Template Editor Screenshot](pictures_readme_frontend/template-editor.png)

---

## ⚙️ Config <a name="config"></a>
Hier lassen sich diverse Konfigurationseinstellungen treffen. Nach einem klick auf den "Speichern" Button werden die Änderungen übernommen.

### Funktionen:
- **Wochentage** – Über die Checkboxen lässt sich einstellen, an welchen Tagen sich die displays automatisch periodosch aufwecken sollen um vom Server abzufragen ob neue Termine geplant wurden.
- **Start- und Endzeit** – In welchem Zeitraum sich die Displays periodisch aufwecken sollen, um nach neuen Terminen zu fragen.
- **Aufweck-Intervall** – Die Anzahl in Minuten, nach denen sich die Displays automatisch wieder aufwecken sollen, um nach neuen Terminen zu fragen.
- **Vorlaufzeit** – Die Anzahl der Minuten, die der Bildwechsel vor dem beginn des eigentlichen Termin angestoßen werden soll.
- **Nachlaufzeit** – Die Anzahl in Minuten, die der Bildwechsel nach der Beendigung des Termines stattfinden soll 
- **Tage bis zur Löschung ungenutzter Bilder auf den Displays** – Die verwendeten Bilder werden jeweils auch lokal auf den Displays gespeichert, damit diese angzeigt werden können. Nach der hier angegebenen Anzahl an Tagen werden ungenutzte Bilder wieder von den Displays entfernt, damit der Speicher nicht volläuft. (In der Mediathek bleiben hochgeladene Bilder selbstverständlich erhalten)

![Config Screenshot](pictures_readme_frontend/config.png)

💡 **Hinweis:** Die Vor-und Nachlaufzeiten werden ignoriert bzw. gekürzt, wenn zwei aufeinander folgenden Termine so nahe hintereinander liegen, dass die Vor- und Nachlaufzeit nicht vollständig ausgeführt werden können!

---