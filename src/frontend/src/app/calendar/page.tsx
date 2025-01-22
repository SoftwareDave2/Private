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


export default function Calendar() {
    const calendarRef = useRef<FullCalendar | null>(null)
    const hasFetched = useRef(false)
    const [events, setEvents] = useState<EventDetails[]>([])
    const [openCalendarEntry, setOpenCalendarEntry] = useState<boolean>(false)
    const [eventDetailsForEdit, setEventDetailsForEdit] = useState<EventDetails | null>(null)

    const updateEvents = async () => {
        const response = await fetch('http://localhost:8080/event/all')
        const eventData = (await response.json()) as EventDetails[]
        console.log(eventData)
        setEvents(eventData)
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

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        updateEvents()
            .then(() => console.log('Events updated.'))
            .catch(err => console.error(err))
    }, []);

    const closeCalendarEditEntryHandler = () => {
        setOpenCalendarEntry(false)
        setTimeout(() => setEventDetailsForEdit(null), 500)      // Wait until dialog close animation is over.
    }

    const handleDateClicked = (info: DateClickArg) => {
        const dateStr = formatDateToString(info.date, info.allDay)

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
            image: "",
        }

        setEventDetailsForEdit(event)
        setOpenCalendarEntry(true)
    }

    const handleEventClicked = (evt: EventClickArg) => {
        const start = evt.event.start ? formatDateToString(evt.event.start, evt.event.allDay) : ""
        const end = evt.event.end ? formatDateToString(evt.event.end, evt.event.allDay) : start
        const event: EventDetails = {
            id: evt.event.id,
            title: evt.event.title,
            start: start,
            end: end,
            allDay: evt.event.allDay,
            image: evt.event.extendedProps.image.slice(8),   // remove "uploads/"
            display: {
                macAddress: evt.event.extendedProps.displayMac,
            }
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
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                events={events.map(evt => ({
                    id: evt.id,
                    title: evt.title,
                    start: evt.start,
                    end: evt.end,
                    allDay: evt.allDay,
                    extendedProps: {
                        //display: event.display,
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

            {eventDetailsForEdit &&
                <CalendarEntryDialog open={openCalendarEntry} eventDetails={eventDetailsForEdit}
                                     onClose={closeCalendarEditEntryHandler}
                                     onDataUpdated={handleDisplayDataUpdated}/>}
        </>
    );
}
