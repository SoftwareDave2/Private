"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
    Input,
    Button,
    Checkbox,
    Dialog,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import PageHeader from "@/components/layout/PageHeader";

interface DayTimeConfig {
    enabled: boolean;
    startTime: string;
    endTime: string;
}

interface Config {
    displayIntervalDay: string;
    vorlaufzeit: string;
    nachlaufzeit: string;
    deleteAfterDays: string;
    weekdayTimes: { [day: string]: DayTimeConfig };
}

export default function ConfigPage() {
    const defaultWeekdayTimes: { [day: string]: DayTimeConfig } = {
        Montag: { enabled: true, startTime: "08:00", endTime: "18:00" },
        Dienstag: { enabled: true, startTime: "08:00", endTime: "18:00" },
        Mittwoch: { enabled: true, startTime: "08:00", endTime: "18:00" },
        Donnerstag: { enabled: true, startTime: "08:00", endTime: "18:00" },
        Freitag: { enabled: true, startTime: "08:00", endTime: "18:00" },
        Samstag: { enabled: false, startTime: "08:00", endTime: "18:00" },
        Sonntag: { enabled: false, startTime: "08:00", endTime: "18:00" },
    };

    const [config, setConfig] = useState<Config | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");

    const days = [
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
        "Sonntag",
    ];

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch("http://localhost:8080/config/get");
                if (response.ok) {
                    const data = await response.json();
                    const weekdayTimes = data.weekdayTimes || defaultWeekdayTimes;
                    const mergedWeekdayTimes = { ...defaultWeekdayTimes, ...weekdayTimes };
                    setConfig({
                        displayIntervalDay: data.wakeIntervalDay.toString(),
                        vorlaufzeit: data.leadTime.toString(),
                        nachlaufzeit: data.followUpTime.toString(),
                        deleteAfterDays: data.deleteAfterDays.toString(),
                        weekdayTimes: mergedWeekdayTimes,
                    });
                } else if (response.status === 404) {
                    console.error("Keine Konfiguration gefunden. Es werden Standardwerte verwendet.");
                    setConfig({
                        displayIntervalDay: "30",
                        vorlaufzeit: "10",
                        nachlaufzeit: "5",
                        deleteAfterDays: "30",
                        weekdayTimes: defaultWeekdayTimes,
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

    const toggleWeekday = (day: string) => {
        if (!config) return;
        const currentDayConfig = config.weekdayTimes?.[day] || defaultWeekdayTimes[day];
        setConfig({
            ...config,
            weekdayTimes: {
                ...config.weekdayTimes,
                [day]: {
                    ...currentDayConfig,
                    enabled: !currentDayConfig.enabled,
                },
            },
        });
    };

    const handleDayTimeChange = (
        day: string,
        field: "startTime" | "endTime",
        value: string
    ) => {
        if (!config) return;
        const currentDayConfig = config.weekdayTimes?.[day] || defaultWeekdayTimes[day];
        setConfig({
            ...config,
            weekdayTimes: {
                ...config.weekdayTimes,
                [day]: {
                    ...currentDayConfig,
                    [field]: value,
                },
            },
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!config) return;

        for (const day of days) {
            const dayConfig = config.weekdayTimes?.[day] || defaultWeekdayTimes[day];
            if (dayConfig.enabled && dayConfig.startTime >= dayConfig.endTime) {
                setSaveStatus(`Fehler: Bei ${day} muss die Startzeit vor der Endzeit liegen.`);
                setIsModalOpen(true);
                return;
            }
        }

        const updatedConfig = {
            wakeIntervalDay: parseFloat(config.displayIntervalDay),
            leadTime: parseFloat(config.vorlaufzeit),
            followUpTime: parseFloat(config.nachlaufzeit),
            deleteAfterDays: parseInt(config.deleteAfterDays, 10),
            weekdayTimes: config.weekdayTimes,
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
                const weekdayTimes = data.weekdayTimes || config.weekdayTimes;
                const mergedWeekdayTimes = { ...defaultWeekdayTimes, ...weekdayTimes };
                setConfig({
                    displayIntervalDay: data.wakeIntervalDay.toString(),
                    vorlaufzeit: data.leadTime.toString(),
                    nachlaufzeit: data.followUpTime.toString(),
                    deleteAfterDays: data.deleteAfterDays.toString(),
                    weekdayTimes: mergedWeekdayTimes,
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
            <div className="max-w-4xl mx-auto p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Linke Spalte: Wochentage – jetzt breiter */}
                        <div className="w-full md:w-1/2 flex-shrink-0 min-w-[400px]">
                            <span className="block mb-2 font-bold">Wochentage:</span>
                            <ul>
                                {days.map((day) => {
                                    const dayConfig =
                                        config.weekdayTimes?.[day] || defaultWeekdayTimes[day];
                                    return (
                                        <li key={day} className="mb-2 border rounded p-4">
                                            <div className="flex items-center">
                                                <Checkbox
                                                    id={day}
                                                    label={day}
                                                    checked={dayConfig.enabled}
                                                    onChange={() => toggleWeekday(day)}
                                                />
                                            </div>
                                            {dayConfig.enabled && (
                                                <div className="mt-2 flex flex-col md:flex-row gap-2">
                                                    <Input
                                                        className="w-full"
                                                        label="Startzeit"
                                                        type="time"
                                                        name={`${day}-startTime`}
                                                        required
                                                        value={dayConfig.startTime}
                                                        onChange={(e) =>
                                                            handleDayTimeChange(day, "startTime", e.target.value)
                                                        }
                                                    />
                                                    <Input
                                                        className="w-full"
                                                        label="Endzeit"
                                                        type="time"
                                                        name={`${day}-endTime`}
                                                        required
                                                        value={dayConfig.endTime}
                                                        onChange={(e) =>
                                                            handleDayTimeChange(day, "endTime", e.target.value)
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        {/* Rechte Spalte: Weitere Eingabefelder */}

                        <div className="w-full md:w-1/2 flex flex-col gap-4 relative top-10">
                            <Input
                                label="Aufweck-Intervall Tagsüber (in Minuten)"
                                type="number"
                                name="displayIntervalDay"
                                step="0.1"
                                required
                                value={config.displayIntervalDay}
                                onChange={(e) =>
                                    setConfig({...config, displayIntervalDay: e.target.value})
                                }
                            />
                            <Input
                                label="Vorlaufzeit (Minuten)"
                                type="number"
                                name="vorlaufzeit"
                                required
                                value={config.vorlaufzeit}
                                onChange={(e) =>
                                    setConfig({...config, vorlaufzeit: e.target.value})
                                }
                            />
                            <Input
                                label="Nachlaufzeit (Minuten)"
                                type="number"
                                name="nachlaufzeit"
                                required
                                value={config.nachlaufzeit}
                                onChange={(e) =>
                                    setConfig({...config, nachlaufzeit: e.target.value})
                                }
                            />
                            <Input
                                label="Tage bis zur Löschung ungenutzter Bilder von den Displays"
                                type="number"
                                name="deleteAfterDays"
                                required
                                value={config.deleteAfterDays}
                                onChange={(e) =>
                                    setConfig({...config, deleteAfterDays: e.target.value})
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                    <Button
                            type="submit"
                            variant="filled"
                            className="bg-primary text-white"
                            fullWidth
                        >
                            Speichern
                        </Button>
                    </div>
                </form>
            </div>
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
