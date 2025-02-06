"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
    Input,
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import PageHeader from "@/components/layout/PageHeader";

interface Config {
    displayIntervalDay: string;
    displayIntervalNight: string;
    nachlaufzeit: string;
    vorlaufzeit: string;
    deleteAfterDays: string;
}

export default function ConfigPage() {
    // Initialer State als null, um anzuzeigen, dass noch keine Daten geladen wurden
    const [config, setConfig] = useState<Config | null>(null);

    // Modal-Status
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");

    // Beim Laden der Seite: aktuelle Konfiguration abrufen
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch("http://localhost:8080/config/get");
                if (response.ok) {
                    const data = await response.json();
                    // Mapping der Backend-Felder zu unseren State-Feldern
                    setConfig({
                        displayIntervalDay: data.wakeIntervalDay.toString(),
                        displayIntervalNight: data.wakeIntervalNight.toString(),
                        vorlaufzeit: data.leadTime.toString(),
                        nachlaufzeit: data.followUpTime.toString(),
                        deleteAfterDays: data.deleteAfterDays.toString(),
                    });
                } else if (response.status === 404) {
                    console.error("Keine Konfiguration gefunden. Es werden Standardwerte verwendet.");
                    // Default-Werte, falls keine Konfiguration vorhanden ist
                    setConfig({
                        displayIntervalDay: "30",
                        displayIntervalNight: "60",
                        vorlaufzeit: "10",
                        nachlaufzeit: "5",
                        deleteAfterDays: "30",
                    });
                } else {
                    console.error("Fehler beim Abrufen der Konfiguration:", response.statusText);
                }
            } catch (error) {
                console.error("Fehler beim Abrufen der Konfiguration:", error);
            }
        };

        fetchConfig();
    }, []);

    // Funktion zum Verarbeiten des Formulars und Speichern der Konfiguration
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        // Erstellen des Objekts im Format, das das Backend erwartet
        const updatedConfig = {
            wakeIntervalDay: parseFloat(formData.get("displayIntervalDay") as string),
            wakeIntervalNight: parseFloat(formData.get("displayIntervalNight") as string),
            leadTime: parseFloat(formData.get("vorlaufzeit") as string),
            followUpTime: parseFloat(formData.get("nachlaufzeit") as string),
            deleteAfterDays: parseInt(formData.get("deleteAfterDays") as string, 10),
        };

        console.log("Neue Konfiguration:", updatedConfig);

        try {
            const response = await fetch("http://localhost:8080/config/post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedConfig),
            });

            if (response.ok) {
                const data = await response.json();
                setConfig({
                    displayIntervalDay: data.wakeIntervalDay.toString(),
                    displayIntervalNight: data.wakeIntervalNight.toString(),
                    vorlaufzeit: data.leadTime.toString(),
                    nachlaufzeit: data.followUpTime.toString(),
                    deleteAfterDays: data.deleteAfterDays.toString(),
                });
                setSaveStatus("Konfiguration erfolgreich gespeichert!");
            } else {
                setSaveStatus("Fehler beim Speichern der Konfiguration!");
            }
        } catch (error) {
            console.error("Fehler beim Speichern der Konfiguration:", error);
            setSaveStatus("Fehler beim Speichern der Konfiguration!");
        }

        setIsModalOpen(true);
    };

    // Solange config null ist, zeigen wir einen Ladezustand
    if (config === null) {
        return (
            <main>
                <PageHeader title="Konfiguration" info="" />
                <div className="max-w-xl mx-auto p-4">Lade Konfiguration...</div>
            </main>
        );
    }

    return (
        <main>
            <PageHeader title="Konfiguration" info="" />

            <div className="max-w-xl mx-auto p-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Aufweck-Intervall Tagsüber (in Stunden)"
                        type="number"
                        name="displayIntervalDay"
                        step="0.1"
                        required
                        value={config.displayIntervalDay}
                        onChange={(e) =>
                            setConfig({ ...config, displayIntervalDay: e.target.value })
                        }
                    />
                    <Input
                        label="Aufweck-Intervall Nachts (in Stunden)"
                        type="number"
                        name="displayIntervalNight"
                        step="0.1"
                        required
                        value={config.displayIntervalNight}
                        onChange={(e) =>
                            setConfig({ ...config, displayIntervalNight: e.target.value })
                        }
                    />
                    <Input
                        label="Vorlaufzeit (Minuten)"
                        type="number"
                        name="vorlaufzeit"
                        required
                        value={config.vorlaufzeit}
                        onChange={(e) =>
                            setConfig({ ...config, vorlaufzeit: e.target.value })
                        }
                    />
                    <Input
                        label="Nachlaufzeit (Minuten)"
                        type="number"
                        name="nachlaufzeit"
                        required
                        value={config.nachlaufzeit}
                        onChange={(e) =>
                            setConfig({ ...config, nachlaufzeit: e.target.value })
                        }
                    />
                    <Input
                        label="Tage bis zur Löschung ungenutzter Bilder von den Displays"
                        type="number"
                        name="deleteAfterDays"
                        required
                        value={config.deleteAfterDays}
                        onChange={(e) =>
                            setConfig({ ...config, deleteAfterDays: e.target.value })
                        }
                    />
                    <Button
                        type="submit"
                        variant="filled"
                        className="bg-primary text-white"
                        fullWidth
                    >
                        Speichern
                    </Button>
                </form>
            </div>

            {/* Pop-up Modal */}
            <Dialog open={isModalOpen} handler={() => setIsModalOpen(false)}>
                <DialogBody className="text-center">{saveStatus}</DialogBody>
                <DialogFooter>
                    <Button
                        variant="filled"
                        className="bg-primary text-white"
                        onClick={() => setIsModalOpen(false)}
                    >
                        OK
                    </Button>
                </DialogFooter>
            </Dialog>
        </main>
    );
}
