"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Select,
    Option
} from "@material-tailwind/react";

const weekdays = [
    { label: "Sonntag", value: 0 },
    { label: "Montag", value: 1 },
    { label: "Dienstag", value: 2 },
    { label: "Mittwoch", value: 3 },
    { label: "Donnerstag", value: 4 },
    { label: "Freitag", value: 5 },
    { label: "Samstag", value: 6 },
];

export default function CalendarComponent() {
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState("create");
    const [title, setTitle] = useState("");
    const [repeat, setRepeat] = useState("none");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedWeekdays, setSelectedWeekdays] = useState([]);
    const [eventToDelete, setEventToDelete] = useState(null);

    useEffect(() => {
        const storedEvents = localStorage.getItem("events");
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("events", JSON.stringify(events));
    }, [events]);

    const handleDateClick = (info) => {
        setStartDate(info.dateStr);
        setEndDate(info.dateStr);
        setDialogMode("create");
        setOpen(true);
        setEventToDelete(null);
    };

    const generateId = () =>
        `${new Date().getTime()}_${Math.floor(Math.random() * 10000)}`;

    const handleSave = () => {
        if (!title || !startDate || !endDate) {
            alert("Bitte Titel, Startdatum und Enddatum angeben.");
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            alert("Das Enddatum muss nach dem Startdatum liegen.");
            return;
        }

        let newEvents = [];

        if (repeat === "none") {
            newEvents.push({
                id: generateId(),
                title,
                start: startDate,
                end: endDate,
            });
        } else if (repeat === "daily") {
            let currentDate = new Date(start);
            while (currentDate <= end) {
                const isoDate = currentDate.toISOString().split("T")[0];
                newEvents.push({
                    id: generateId(),
                    title,
                    start: isoDate,
                    end: isoDate,
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else if (repeat === "weekly") {
            if (selectedWeekdays.length === 0) {
                alert("Bitte wählen Sie mindestens einen Wochentag für die wöchentliche Wiederholung aus.");
                return;
            }
            let currentDate = new Date(start);
            while (currentDate <= end) {
                if (selectedWeekdays.includes(currentDate.getDay())) {
                    const isoDate = currentDate.toISOString().split("T")[0];
                    newEvents.push({
                        id: generateId(),
                        title,
                        start: isoDate,
                        end: isoDate,
                    });
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        setEvents([...events, ...newEvents]);
        setTitle("");
        setRepeat("none");
        setStartDate("");
        setEndDate("");
        setSelectedWeekdays([]);
        setOpen(false);
    };

    const handleEventClick = (info) => {
        setEventToDelete(info.event);
        setDialogMode("delete");
        setOpen(true);
    };

    const handleDelete = () => {
        if (eventToDelete) {
            const updatedEvents = events.filter(
                (event) => event.id !== eventToDelete.id
            );
            setEvents(updatedEvents);
            setOpen(false);
            setEventToDelete(null);
        }
    };

    const toggleWeekday = (value) => {
        if (selectedWeekdays.includes(value)) {
            setSelectedWeekdays(selectedWeekdays.filter((d) => d !== value));
        } else {
            setSelectedWeekdays([...selectedWeekdays, value]);
        }
    };

    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
            />

            <Dialog open={open} handler={() => setOpen(false)}>
                <DialogHeader>
                    {dialogMode === "delete" ? "Termin löschen" : "Neuer Termin"}
                </DialogHeader>
                <DialogBody>
                    {dialogMode === "delete" ? (
                        <div>
                            <p>
                                Wollen Sie den Termin <strong>"{eventToDelete?.title}"</strong> wirklich löschen?
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Titel"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Input
                                type="date"
                                label="Startdatum"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <Input
                                type="date"
                                label="Enddatum"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <Select
                                label="Wiederholung"
                                value={repeat}
                                onChange={(value) => setRepeat(value)}
                            >
                                <Option value="none">Keine</Option>
                                <Option value="daily">Täglich</Option>
                                <Option value="weekly">Wöchentlich</Option>
                            </Select>
                            {repeat === "weekly" && (
                                <div>
                                    <p>Wähle Wochentage:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {weekdays.map((day) => (
                                            <label key={day.value} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedWeekdays.includes(day.value)}
                                                    onChange={() => toggleWeekday(day.value)}
                                                />
                                                <span>{day.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button onClick={() => setOpen(false)} color="red">
                        Abbrechen
                    </Button>
                    {dialogMode === "delete" ? (
                        <Button onClick={handleDelete} color="blue">
                            Löschen
                        </Button>
                    ) : (
                        <Button onClick={handleSave} color="blue">
                            Speichern
                        </Button>
                    )}
                </DialogFooter>
            </Dialog>
        </div>
    );
}
