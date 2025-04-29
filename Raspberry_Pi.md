# Einrichten
## Benötigte Komponenten
- Raspberry Pi 5 (RPi 5)
- Netzteil für RPi 5
- micro SD-Karte
- RPi 5 Gehäuse
- SSD
- SSD Adapter für RPi

- SD-Kartenleser
- Laptop/PC

- Bildschirm
- Tastatur
- Maus
- micro HDMI zu HDMI Kabel

## Betriebssystem installieren
Den RPi Imager von der [Webseite](https://www.raspberrypi.com/software/) herunterladen und auf den PC installieren.

Die SD-Karte mit dem SD-Kartenleser am PC anschließen und die installierte Software starten. Im RPi Imager den "Raspberry Pi 5" als Modell und als Betriebssystem "Raspberry Pi OS (64-bit)" auswählen. Unter "SD-Karte" die Karte auswählen. Dabei ist zu beachten, dass das richtige Speichermedium gewählt wird, da im nächsten Schritt alle Daten auf diesem überschrieben werden.

Anschließen auf "Weiter" und "Einstellungen bearbeiten" klicken. Im Einstellungsfenster den Benutzernamen und Passwort setzten und mit "Speichern" bestätigen.

Danach wird durch Drücken auf den Knopf "Ja" das Image aus dem Internet geladen und auf die SD-Karte gespielt.

Nach erfolgreichen Abschluss des Schreibvorgangs die SD-Karte aus dem Leser entnehmen.

## RPi starten
Die SD-Karte in den RPi einlegen und mit der SSD ins Gehäuse einbauen. Anschließen den RPi mit Maus, Tastatur, Bildschirm und Netzteil verbinden. Der RPi startet automatisch.

Den RPi mit LAN oder mit dem WLAN Menü oben rechts mit dem Internet verbinden.

Im Menü oben links den "Raspberry Pi Imager" suchen und starten. Danach die Schritte wie im Abschnitt "Betriebssystem installieren" durchführen. Mit den Änderungen, dass als Betriebssystem "Raspberry Pi OS (other)" -> "Raspberry Pi OS Lite (64-bit)" ausgewählt wird und im Einstellungsfenster unter Dienste SSH aktiviert wird. Als "SD-Karte" wird die mit dem RPi verbunden SSD gewählt.

Nachdem das Programm fertig ist, den RPi Herunterfahren. Anschließend die SD-Karte entnehmen und den RPi durch ab- und anschließen des Netzteils starten.

## Software installieren
Nachdem der RPi hochgefahren ist mit Benutzername und Passwort anmelden. Danach den RPi mit LAN oder mit dem Programm "sudo nmtui" über WLAN mit dem Internet verbinden.

Mit den folgenden Kommandos werden die benötigten Programme installiert.
~~~bash
sudo apt update && sudo apt upgrade
sudo apt install -y openjdk-17-jdk-headless
sudo apt install -y maven
sudo apt install -y nodejs
sudo apt install -y --no-install-recommends --no-install-suggests npm
~~~

Docker mit der Anleitung von der [Webseite](https://docs.docker.com/engine/install/debian/) installieren und mit dem Kommando den angelegten Benutzer zur Gruppe "docker" hinzufügen.
~~~bash
sudo usermod -a -G docker <Benutzername>
sudo systemctl enable docker
~~~

Mit git die Projektdateien auf den RPi laden und mit docker den Container erstellen und starten.
~~~bash
git clone <Adresse>
cd <Git-Ordner>
mvn clean install -D skipTests
mvn clean package -D skipTests
docker compose build
docker compose up -d
~~~

Anschließen kann das Internet getrennt werden.

Der Hotspot wird mit den folgenden Befehlen automatisch beim Neustart erstellt.
~~~bash
sudo nmcli device wifi hotspot con-name tableauxHotspot ssid <Hotspot-Name> band bg password <Passwort>
sudo nmcli connection modify tableauxHotspot connection.autoconnect true
~~~

Danach kann man sich mit `exit` vom RPi abmelden und mit einem PC mit dem erstellten Hotspots verbinden.
Die Weboberfläche ist unter der Adresse [http://10.42.0.1:3000/](http://10.42.0.1:3000/) erreichbar.

## Verwalten
Mit dem folgenden Kommando kann man sich mit SSH zur Kommandozeile des RPi verbinden. (Ausführen unter Windows über Eingabeaufforderung oder Powershell oder unter Mac und Linux mit dem Terminal)
~~~bash
ssh <Benutzername>@10.42.0.1
~~~
