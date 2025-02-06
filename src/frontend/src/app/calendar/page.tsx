"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {DateClickArg} from "@fullcalendar/interaction";
import React, { useRef, useState } from "react";
import {CalendarEntryDialog} from "@/components/calendar/CalendarEntryDialog";
import {EventDetails} from "@/types/eventDetails";
import {  useEffect } from 'react';
import PageHeader from "@/components/layout/PageHeader";
import {EventClickArg} from "@fullcalendar/core";
import DisplayFilters from "@/components/calendar/DisplayFilters";

export default function Calendar() {

    const backendApiUrl = 'http://localhost:8080'

    const calendarRef = useRef<FullCalendar | null>(null)
    const hasFetched = useRef(false)
    const [events, setEvents] = useState<EventDetails[]>([])
    const [openCalendarEntry, setOpenCalendarEntry] = useState<boolean>(false)
    const [eventDetailsForEdit, setEventDetailsForEdit] = useState<EventDetails | null>(null)
    const [selectedMACs, setSelectedMACs] = useState<string[]>([]);

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        const savedSelections = getSelectedDisplaysFromStorage()
        setSelectedMACs(savedSelections)

        updateEvents()
            .then(() => console.log('Events updated.'))
            .catch(err => console.error(err))
    }, [])

    const updateEvents = async () => {
        const response = await fetch(backendApiUrl + '/event/all')
        const eventData = (await response.json()) as EventDetails[]

        // TODO: Workaroud until multiple displays can be saved for events.
        eventData.forEach(d => {
            d.displays = [{
                macAddress: d.display.macAddress,
                image: d.image
            }]
        })

        const savedSelections = getSelectedDisplaysFromStorage()
        const filteredEvents = eventData.filter(event =>
            savedSelections.includes(event.display.macAddress))
        setEvents(filteredEvents)
    }

    const getSelectedDisplaysFromStorage = () =>
        JSON.parse(localStorage.getItem("selectedMACs") || "[]")

    const setSelectedDisplaysOnStorage = (macs: string[]) => {
        localStorage.setItem("selectedMACs", JSON.stringify(macs))
    }

    const formatDateToString = (date: Date, onlyDate: boolean) => {
        const dateStr = date.toLocaleDateString('en-CA')    // returns 1970-01-01
        const timeStr = date.toLocaleTimeString()       // returns 00:00:00
        if (onlyDate) {
            return dateStr      // Output: 1970-01-01
        } else {
            return dateStr + 'T' + timeStr      // Output: 1970-01-01T00:00:00
        }
    }

    const selectedMacsChanged = async (newSelectedMacs: string[]) => {
        setSelectedMACs(newSelectedMacs)
        setSelectedDisplaysOnStorage(newSelectedMacs)
        await updateEvents()
    }

    const closeCalendarEditEntryHandler = () => {
        setOpenCalendarEntry(false)
        setTimeout(() => setEventDetailsForEdit(null), 500)      // Wait until dialog close animation is over.
    }

    const handleDateClicked = (info: DateClickArg) => {
        const dateStr = formatDatetimeLocal(info.date , info.allDay)
        let start: string, end: string

        if (info.allDay) {
            start = dateStr
            end = dateStr
        } else {
            start = dateStr
            // Set end date two hours later.
            const endDate = new Date(info.date)
            endDate.setHours(endDate.getHours() + 2)
            end = formatDateToString(endDate, false)
        }

        const event: EventDetails = {
            id: "",
            title: "",
            start: start,
            end: end,
            allDay: info.allDay,
            display: {
                macAddress: ""
            },
            displays: [],
            image: "",
        }

        setEventDetailsForEdit(event)
        setOpenCalendarEntry(true)
    }

    const formatDatetimeLocal = (date: Date, allday: boolean) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Monat muss 2-stellig sein
        const day = String(date.getDate()).padStart(2, '0'); // Tag muss 2-stellig sein
        const hours = String(date.getHours()).padStart(2, '0'); // Stunden 2-stellig
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Minuten 2-stellig

        return allday
            ? `${year}-${month}-${day}`
            : `${year}-${month}-${day}T${hours}:${minutes}`
    };

    const handleEventClicked = (evt: EventClickArg) => {
        const start = formatDatetimeLocal(evt.event.start ? evt.event.start : new Date(), evt.event.allDay)
        const end = evt.event.end
            ? formatDatetimeLocal(evt.event.end, evt.event.allDay)
            : start

        const event: EventDetails = {
            id: evt.event.id,
            title: evt.event.title,
            start: start,
            end: end,
            allDay: evt.event.allDay,
            image: evt.event.extendedProps.image.slice(8),   // remove "uploads/"
            display: {
                macAddress: evt.event.extendedProps.displayMac,
            },
            displays: [{
                macAddress: evt.event.extendedProps.displayMac,
                image: evt.event.extendedProps.image.slice(8),   // remove "uploads/"
            }]
        }

        setEventDetailsForEdit(event)
        setOpenCalendarEntry(true)
    }

    const handleDisplayDataUpdated = () => {
        updateEvents()
            .then(() => console.log('Events successfully updated!'))
            .catch(err => console.error(err))
        closeCalendarEditEntryHandler()
    }

    return (
        <>
            <PageHeader title={'Kalender'} info={''}></PageHeader>
            <div className={'flex gap-7'}>
                <DisplayFilters selectedMacs={selectedMACs} onSelectedMacsChanged={selectedMacsChanged} />
                <div className={'flex-1'}>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                        events={events.map(evt => ({
                            id: evt.id,
                            title: evt.title,
                            start: evt.start,
                            end: evt.end,
                            allDay: evt.allDay,
                            extendedProps: {
                                image: "uploads/" + evt.image,
                                displayMac: evt.display.macAddress
                            }
                        }))}
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
                                         style={{maxWidth: "50px", marginTop: "5px"}}/>
                                )}
                            </div>
                        )}
                        eventClick={handleEventClicked}
                    />
                </div>
            </div>

            {eventDetailsForEdit &&
                <CalendarEntryDialog open={openCalendarEntry} eventDetails={eventDetailsForEdit}
                                     onClose={closeCalendarEditEntryHandler}
                                     onDataUpdated={handleDisplayDataUpdated} />}
        </>
    );
}