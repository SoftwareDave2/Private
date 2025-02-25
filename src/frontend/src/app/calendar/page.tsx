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

        const savedSelections = getSelectedDisplaysFromStorage()
        const filteredEvents = eventData.filter(event =>
            event.displayImages.some(displayImage =>
                savedSelections.includes(displayImage.displayMac)))
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
            id: 0,
            groupId: "",
            title: "",
            start: start,
            end: end,
            allDay: info.allDay,
            displayImages: [],
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
        const seconds = String(date.getSeconds()).padStart(2, '0') // Seconds

        return allday
            ? `${year}-${month}-${day}`
            : `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    };

    const handleEventClicked = (evt: EventClickArg) => {
        // Find event.
        const id = parseInt(evt.event.id)
        const eventElements = events.filter(e => e.id === id)
        if (eventElements.length === 0) {
            console.log('Event with id not found', id)
            return
        }
        const eventElem = eventElements[0]

        // Update start and end date format.
        const start = formatDatetimeLocal(evt.event.start ? evt.event.start : new Date(), eventElem.allDay)
        const end = evt.event.end
            ? formatDatetimeLocal(evt.event.end, eventElem.allDay)
            : start

        // Create event element.
        const event: EventDetails = {
            groupId: eventElem.groupId,
            id: eventElem.id,
            title: eventElem.title,
            start: start,
            end: end,
            allDay: eventElem.allDay,
            displayImages: eventElem.displayImages,
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
                                image: "uploads/" + (evt.displayImages.length > 0 ? evt.displayImages[0].image : "")
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