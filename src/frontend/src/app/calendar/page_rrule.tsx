"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import React, { useRef, useState, useEffect } from "react";
import { CalendarEntryDialog } from "@/components/calendar/CalendarEntryDialog";
import { EventDetails } from "@/types/eventDetails";
import PageHeader from "@/components/layout/PageHeader";
import { EventClickArg } from "@fullcalendar/core";
import DisplayFilters from "@/components/calendar/DisplayFilters";

export default function Calendar() {

    const backendApiUrl = 'http://localhost:8080';

    const calendarRef = useRef<FullCalendar | null>(null);
    const hasFetched = useRef(false);
    const [events, setEvents] = useState<EventDetails[]>([]);
    const [openCalendarEntry, setOpenCalendarEntry] = useState<boolean>(false);
    const [eventDetailsForEdit, setEventDetailsForEdit] = useState<EventDetails | null>(null);
    const [selectedMACs, setSelectedMACs] = useState<string[]>([]);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;


        const dummyEvent: EventDetails = {
            id: 999,
            title: "Dummy Wiederkehrender Termin",
            // Diese Felder werden nicht genutzt, wenn recurrenceType ≠ "keine" gesetzt ist.
            start: "2025-03-01T09:00:00",
            end: "2025-03-01T10:00:00",
            allDay: false,
            displayImages: [{ displayMac: "00:00:00:00:01", image: "beach.jpg" }],
            recurrenceType: "wöchentlich", // Mögliche Werte: "keine", "täglich", "wöchentlich"
            recurrenceStartDate: "2025-02-01",
            recurrenceEndDate: "2025-02-28",
            recurrenceStartTime: "09:00",
            recurrenceEndTime: "10:00",
            recurrenceWeekdays: [1, 5], // 0 = Montag, 1 = Dienstag, usw. Hier: Dienstag, Donnerstag, Samstag
            rrule: "" // Falls gewünscht, kann hier ein fertiger rrule-String eingetragen werden.
        };
        const dummyEvent2: EventDetails = {
            id: 998,
            title: "Dummy Wiederkehrender Termin2",
            // Diese Felder werden nicht genutzt, wenn recurrenceType ≠ "keine" gesetzt ist.
            start: "2025-03-01T09:00:00",
            end: "2025-03-01T10:00:00",
            allDay: false,
            displayImages: [{ displayMac: "00:00:00:00:01", image: "beach.jpg" }],
            recurrenceType: "wöchentlich", // Mögliche Werte: "keine", "täglich", "wöchentlich"
            recurrenceStartDate: "2025-02-01",
            recurrenceEndDate: "2025-02-28",
            recurrenceStartTime: "09:00",
            recurrenceEndTime: "10:00",
            recurrenceWeekdays: [1, 5], // 0 = Montag, 1 = Dienstag, usw. Hier: Dienstag, Donnerstag, Samstag
            rrule: "" // Falls gewünscht, kann hier ein fertiger rrule-String eingetragen werden.
        };
        //setEvents([dummyEvent, dummyEvent2]);

        const savedSelections = getSelectedDisplaysFromStorage();
        setSelectedMACs(savedSelections);

        updateEvents()
            .then(() => console.log('Events updated.'))
            .catch(err => console.error(err));
    }, []);

    const updateEvents = async () => {
        const response = await fetch(backendApiUrl + '/event/all');
        const eventData = (await response.json()) as EventDetails[];

        const savedSelections = getSelectedDisplaysFromStorage();
        const filteredEvents = eventData.filter(event =>
            event.displayImages.some(displayImage =>
                savedSelections.includes(displayImage.displayMac)));
        setEvents(filteredEvents);
    };

    const getSelectedDisplaysFromStorage = () =>
        JSON.parse(localStorage.getItem("selectedMACs") || "[]");

    const setSelectedDisplaysOnStorage = (macs: string[]) => {
        localStorage.setItem("selectedMACs", JSON.stringify(macs));
    };

    const formatDateToString = (date: Date, onlyDate: boolean) => {
        const dateStr = date.toLocaleDateString('en-CA');    // z.B. "2025-02-24"
        const timeStr = date.toLocaleTimeString();             // z.B. "14:30:00"
        return onlyDate ? dateStr : dateStr + 'T' + timeStr;
    };

    const selectedMacsChanged = async (newSelectedMacs: string[]) => {
        setSelectedMACs(newSelectedMacs);
        setSelectedDisplaysOnStorage(newSelectedMacs);
        await updateEvents();
    };

    const closeCalendarEditEntryHandler = () => {
        setOpenCalendarEntry(false);
        setTimeout(() => setEventDetailsForEdit(null), 500); // Warten bis die Dialoganimation beendet ist
    };

    const handleDateClicked = (info: DateClickArg) => {
        const dateStr = formatDatetimeLocal(info.date, info.allDay);
        let start: string, end: string;

        if (info.allDay) {
            start = dateStr;
            end = dateStr;
        } else {
            start = dateStr;
            const endDate = new Date(info.date);
            endDate.setHours(endDate.getHours() + 2);
            end = formatDateToString(endDate, false);
        }

        // Neuer Termin – standardmäßig kein wiederholender Termin
        const event: EventDetails = {
            id: 0,
            title: "",
            start: start,
            end: end,
            allDay: info.allDay,
            displayImages: [],
            recurrenceType: "keine"
        };

        setEventDetailsForEdit(event);
        setOpenCalendarEntry(true);
    };

    const formatDatetimeLocal = (date: Date, allday: boolean) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return allday
            ? `${year}-${month}-${day}`
            : `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const handleEventClicked = (evt: EventClickArg) => {
        const id = parseInt(evt.event.id);
        const eventElements = events.filter(e => e.id === id);
        if (eventElements.length === 0) {
            console.log('Event with id not found', id);
            return;
        }
        const eventElem = eventElements[0];

        // Für wiederkehrende Events könnte evt.event.start nicht den gewünschten Wert liefern.
        // Daher verwenden wir die im Event gespeicherten Daten.
        const event: EventDetails = {
            id: eventElem.id,
            title: eventElem.title,
            start: eventElem.start,
            end: eventElem.end,
            allDay: eventElem.allDay,
            displayImages: eventElem.displayImages,
            recurrenceType: eventElem.recurrenceType || "keine",
            recurrenceStartDate: eventElem.recurrenceStartDate,
            recurrenceEndDate: eventElem.recurrenceEndDate,
            recurrenceStartTime: eventElem.recurrenceStartTime,
            recurrenceEndTime: eventElem.recurrenceEndTime,
            recurrenceWeekdays: eventElem.recurrenceWeekdays,
            rrule: eventElem.rrule
        };

        setEventDetailsForEdit(event);
        setOpenCalendarEntry(true);
    };

    const handleDisplayDataUpdated = () => {
        updateEvents()
            .then(() => console.log('Events successfully updated!'))
            .catch(err => console.error(err));
        closeCalendarEditEntryHandler();
    };

    return (
        <>
            <PageHeader title={'Kalender'} info={''} />
            <div className={'flex gap-7'}>
                <DisplayFilters selectedMacs={selectedMACs} onSelectedMacsChanged={selectedMacsChanged} />
                <div className={'flex-1'}>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, rrulePlugin]}
                        events={events.map(evt => {
                            if (evt.recurrenceType && evt.recurrenceType !== "keine") {
                                // Für wiederkehrende Events: entweder vorhandene rrule nutzen oder dynamisch erstellen.
                                let rruleObj;
                                if (evt.rrule) {
                                    rruleObj = evt.rrule;
                                } else {
                                    const dtstart = evt.recurrenceStartDate + 'T' + evt.recurrenceStartTime;
                                    const until = evt.recurrenceEndDate + 'T' + evt.recurrenceEndTime;
                                    const freq = evt.recurrenceType === 'täglich' ? 'daily' : 'weekly';
                                    let byweekday;
                                    if (evt.recurrenceType === 'wöchentlich' && evt.recurrenceWeekdays && evt.recurrenceWeekdays.length > 0) {
                                        const weekdayMap = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
                                        byweekday = evt.recurrenceWeekdays.map(day => weekdayMap[day]);
                                    }
                                    rruleObj = {
                                        freq: freq,
                                        dtstart: dtstart,
                                        until: until,
                                        ...(byweekday ? { byweekday } : {})
                                    };
                                }
                                // Dauer berechnen: Differenz zwischen recurrenceStartTime und recurrenceEndTime
                                const durationMs = new Date('1970-01-01T' + evt.recurrenceEndTime).getTime() -
                                    new Date('1970-01-01T' + evt.recurrenceStartTime).getTime();
                                const hours = Math.floor(durationMs / (1000 * 60 * 60));
                                const minutes = Math.floor((durationMs - hours * 1000 * 60 * 60) / (1000 * 60));
                                const duration = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
                                return {
                                    id: evt.id,
                                    title: evt.title,
                                    allDay: evt.allDay,
                                    rrule: rruleObj,
                                    duration: duration,
                                    extendedProps: {
                                        image: "uploads/" + (evt.displayImages.length > 0 ? evt.displayImages[0].image : "")
                                    }
                                };
                            } else {
                                return {
                                    id: evt.id,
                                    title: evt.title,
                                    start: evt.start,
                                    end: evt.end,
                                    allDay: evt.allDay,
                                    extendedProps: {
                                        image: "uploads/" + (evt.displayImages.length > 0 ? evt.displayImages[0].image : "")
                                    }
                                };
                            }
                        })}
                        headerToolbar={{
                            left: "prev,today,next",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        dateClick={handleDateClicked}
                        ref={calendarRef}
                        initialView="dayGridMonth"
                        eventContent={(info) => (
                            <div>
                                <b>{info.event.title}</b>
                                {info.event.extendedProps.image && (
                                    <img src={info.event.extendedProps.image} alt="Event"
                                         style={{ maxWidth: "50px", marginTop: "5px" }} />
                                )}
                            </div>
                        )}
                        eventClick={handleEventClicked}
                    />
                </div>
            </div>

            {eventDetailsForEdit &&
                <CalendarEntryDialog open={openCalendarEntry}
                                     eventDetails={eventDetailsForEdit}
                                     onClose={closeCalendarEditEntryHandler}
                                     onDataUpdated={handleDisplayDataUpdated} />}
        </>
    );
}
