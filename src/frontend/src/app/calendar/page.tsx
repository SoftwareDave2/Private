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
    const calendarRef = useRef<FullCalendar | null>(null);

    const hasFetched = useRef(false)
    const [events, setEvents] = useState<EventDetails[]>([])
    const [openCalendarEntry, setOpenCalendarEntry] = useState<boolean>(false)
    const [eventDetailsForEdit, setEventDetailsForEdit] = useState<EventDetails | null>(null)

    const updateEvents = async () => {
        const response = await fetch('http://localhost:8080/event/all');
        const eventData = (await response.json()) as EventDetails[]
        console.log(eventData);
        setEvents(eventData);
    } 
    
    const formatIsoDateString = (str: string, onlyDate: boolean) => {
        // "T00:00:00" and ":000Z"
        const sliceCharacters = onlyDate ? -14 : -5
        return str.slice(0, sliceCharacters)
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
        const date = formatIsoDateString(info.date.toISOString(), info.allDay)
        let start: string
        let end: string

        if (info.allDay) {
            start = date
            end = date
        } else {
            start = date
            // Set end date two hours later.
            const endDate = new Date(info.date)
            endDate.setHours(endDate.getHours() + 2)
            end = endDate.toISOString().slice(0, -5)       // Remove ":000Z"
        }

        const event: EventDetails = {
            id: "",
            title: "",
            start: start,
            end: end,
            allDay: info.allDay,
            displayMac: "",
            image: "",
        }

        setEventDetailsForEdit(event)
        setOpenCalendarEntry(true)
    }

    const handleEventClicked = (evt: EventClickArg) => {
        const event: EventDetails = {
            id: evt.event.id,
            title: evt.event.title,
            start: evt.event.start ? formatIsoDateString(evt.event.start.toISOString(), evt.event.allDay) : "",
            end: evt.event.end ? formatIsoDateString(evt.event.end.toISOString(), evt.event.allDay) : "",
            allDay: evt.event.allDay,
            image: evt.event.extendedProps.image.slice(8, 0),   // remove "uploads/"
            displayMac: evt.event.extendedProps.displayMac,
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
                        displayMac: evt.displayMac
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

            <ul className="space-y-4 p-4">
                {events.map((event: EventDetails) => (
                    <li
                        key={event.id}
                        className="p-4 bg-white shadow-md rounded-lg text-grey-700"
                    >
                        Id: {event.id} <br/>
                        Title: {event.title} <br/>
                        all day: {event.allDay.toString()} <br/>
                        start: {event.start} <br/>
                        end: {event.end} <br/>
                        Mac Adresse: {(event.displayMac )} <br/>
                    </li>
                ))}
            </ul>

            {eventDetailsForEdit &&
                <CalendarEntryDialog open={openCalendarEntry} eventDetails={eventDetailsForEdit}
                                     onClose={closeCalendarEditEntryHandler}
                                     onDataUpdated={handleDisplayDataUpdated}/>}
        </>
    );
}
