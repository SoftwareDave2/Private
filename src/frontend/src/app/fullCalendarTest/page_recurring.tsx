"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import { Input, Select, Option } from "@material-tailwind/react";

export default function CalendarComponent() {
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(null);
    const [title, setTitle] = useState("");
    const [repeat, setRepeat] = useState("none");
    const [eventToDelete, setEventToDelete] = useState(null);

    // Lade Events aus localStorage beim ersten Rendern
    useEffect(() => {
        const storedEvents = localStorage.getItem("events");
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        }
    }, []);

    // Speichern der Events im localStorage, wenn sie sich ändern
    useEffect(() => {
        if (events.length > 0) {
            localStorage.setItem("events", JSON.stringify(events));
        }
    }, [events]);

    const handleDateClick = (info) => {
        setDate(info.dateStr);
        setOpen(true);
        setEventToDelete(null); // Reset delete state when adding new event
    };

    const handleSave = () => {
        let newEvents = [];
        const startDate = new Date(date);
        const newId = new Date().getTime(); // Eindeutige ID für jedes Event (basierend auf der aktuellen Zeit)

        if (repeat === "none") {
            newEvents.push({ id: newId, title, start: startDate.toISOString().split("T")[0] });
        } else if (repeat === "daily") {
            for (let i = 0; i < 7; i++) {
                const newDate = new Date(startDate);
                newDate.setDate(startDate.getDate() + i);
                newEvents.push({
                    id: new Date().getTime() + i, // Eindeutige ID für jedes Event
                    title,
                    start: newDate.toISOString().split("T")[0]
                });
            }
        } else if (repeat === "weekly") {
            for (let i = 0; i < 4; i++) {
                const newDate = new Date(startDate);
                newDate.setDate(startDate.getDate() + i * 7); // Wöchentlich, d.h. jeden 7. Tag
                newEvents.push({
                    id: new Date().getTime() + i, // Eindeutige ID für jedes Event
                    title,
                    start: newDate.toISOString().split("T")[0]
                });
            }
        }
        setEvents([...events, ...newEvents]);
        setOpen(false);
        setTitle("");
        setRepeat("none");
    };

    const handleEventClick = (info) => {
        setEventToDelete(info.event);
        setOpen(true);
    };

    const handleDelete = () => {
        if (eventToDelete) {
            const updatedEvents = events.filter(event => event.id !== eventToDelete.id); // Verwende die ID zum Vergleichen
            setEvents(updatedEvents);
            localStorage.setItem("events", JSON.stringify(updatedEvents)); // Update localStorage
            setOpen(false);
            setEventToDelete(null);
        }
    };

    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick} // Event click handler for deletion
            />

            <Dialog open={open} handler={() => setOpen(false)}>
                <DialogHeader>{eventToDelete ? "Termin löschen" : "Neuer Termin"}</DialogHeader>
                <DialogBody>
                    {eventToDelete ? (
                        <div>
                            <p>Wollen Sie den Termin "{eventToDelete.title}" wirklich löschen?</p>
                        </div>
                    ) : (
                        <div>
                            <Input
                                label="Titel"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Select label="Wiederholung" value={repeat} onChange={(e) => setRepeat(e)}>
                                <Option value="none">Keine</Option>
                                <Option value="daily">Täglich (7 Tage)</Option>
                                <Option value="weekly">Wöchentlich (4 Wochen)</Option>
                            </Select>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button onClick={() => setOpen(false)} color="red">Abbrechen</Button>
                    {!eventToDelete ? (
                        <Button onClick={handleSave} color="blue">Speichern</Button>
                    ) : (
                        <Button onClick={handleDelete} color="blue">Löschen</Button>
                    )}
                </DialogFooter>
            </Dialog>
        </div>
    );
}
