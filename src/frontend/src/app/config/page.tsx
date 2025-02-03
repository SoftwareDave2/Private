"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Input, Button, Dialog, DialogBody, DialogFooter } from "@material-tailwind/react";
import PageHeader from "@/components/layout/PageHeader";

export default function ConfigPage() {
    // State für die aktuellen Konfigurationswerte
    const [config, setConfig] = useState({
        displayIntervalDay: "4",
        displayIntervalNight: "8",
        nachlaufzeit: "5",
        vorlaufzeit: "5",
        deleteAfterDays: "30",
    });

    // Modal-Status
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");

    // Funktion zum Abrufen der aktuellen Konfigurationswerte
    useEffect(() => {
        const fetchConfig = async () => {
            // try {
            //     const response = await fetch("http://localhost:8080/config");
            //     const data = await response.json();
            //
            //     setConfig({
            //         displayIntervalDay: data.displayIntervalDay.toString(),
            //         displayIntervalNight: data.displayIntervalNight.toString(),
            //         nachlaufzeit: data.nachlaufzeit.toString(),
            //         vorlaufzeit: data.vorlaufzeit.toString(),
            //         deleteAfterDays: data.deleteAfterDays.toString(),
            //     });
            // } catch (error) {
            //     console.error("Fehler beim Abrufen der Konfiguration:", error);
            // }
        };

        fetchConfig();
    }, []);

    // Funktion zum Verarbeiten des Formulars
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const updatedConfig = {
            displayIntervalDay: formData.get("displayIntervalDay"),
            displayIntervalNight: formData.get("displayIntervalNight"),
            nachlaufzeit: formData.get("nachlaufzeit"),
            vorlaufzeit: formData.get("vorlaufzeit"),
            deleteAfterDays: formData.get("deleteAfterDays"),
        };

        console.log("Neue Konfiguration:", updatedConfig);

        try {
            // Backend-Aufruf (später aktivieren)
            // const response = await fetch("http://localhost:8080/config/update", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(updatedConfig),
            // });

            // if (response.ok) {
            //     setSaveStatus("Konfiguration erfolgreich gespeichert!");
            // } else {
            //     setSaveStatus("Fehler beim Speichern!");
            // }

            // Für jetzt nur Simulation der Erfolgsmeldung:
            setSaveStatus("Konfiguration erfolgreich gespeichert!");

        } catch (error) {
            setSaveStatus("Fehler beim Speichern!");
        }

        setIsModalOpen(true); // Modal öffnen
    };

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
                        onChange={(e) => setConfig({...config, displayIntervalDay: e.target.value})}
                    />
                    <Input
                        label="Aufweck-Intervall Nachts (in Stunden)"
                        type="number"
                        name="displayIntervalNight"
                        step="0.1"
                        required
                        value={config.displayIntervalNight}
                        onChange={(e) => setConfig({...config, displayIntervalNight: e.target.value})}
                    />
                    <Input
                        label="Nachlaufzeit (Minuten)"
                        type="number"
                        name="nachlaufzeit"
                        required
                        value={config.nachlaufzeit}
                        onChange={(e) => setConfig({...config, nachlaufzeit: e.target.value})}
                    />
                    <Input
                        label="Vorlaufzeit (Minuten)"
                        type="number"
                        name="vorlaufzeit"
                        required
                        value={config.vorlaufzeit}
                        onChange={(e) => setConfig({...config, vorlaufzeit: e.target.value})}
                    />
                    <Input
                        label="Tage bis zur Löschung ungenutzter Bilder von den Displays"
                        type="number"
                        name="deleteAfterDays"
                        required
                        value={config.deleteAfterDays}
                        onChange={(e) => setConfig({...config, deleteAfterDays: e.target.value})}
                    />
                    <Button type={'submit'} variant={'filled'} className={'bg-primary text-white'} fullWidth>Speichern</Button>
                </form>
            </div>

            {/* Pop-up Modal */}
            <Dialog open={isModalOpen} handler={() => setIsModalOpen(false)}>
                <DialogBody className="text-center">{saveStatus}</DialogBody>
                <DialogFooter>
                    <Button variant={'filled'} className={'bg-primary text-white'} onClick={() => setIsModalOpen(false)}>OK</Button>
                </DialogFooter>
            </Dialog>
        </main>
    );
}
