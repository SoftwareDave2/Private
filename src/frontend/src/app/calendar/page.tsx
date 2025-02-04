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


type Display = {
    macAddress: string;
    id: number;
    brand: string;
    model: string;
    width: number;
    height: number;
    orientation: string;
    filename: string;
    wakeTime: string;
};

export default function Calendar() {
    const calendarRef = useRef<FullCalendar | null>(null)
    const hasFetched = useRef(false)
    const [events, setEvents] = useState<EventDetails[]>([])
    const [openCalendarEntry, setOpenCalendarEntry] = useState<boolean>(false)
    const [eventDetailsForEdit, setEventDetailsForEdit] = useState<EventDetails | null>(null)

    const [displays, setDisplays] = useState<Display[]>([]);
    const [selectedMACs, setSelectedMACs] = useState<string[]>([]);

    const updateEvents = async () => {

        // Lade die ausgewählten MAC-Adressen direkt aus dem localStorage
        const savedSelections = JSON.parse(localStorage.getItem("selectedMACs") || "[]");
        console.log("Aktuelle ausgewählte MAC-Adressen:", savedSelections);

        const response = await fetch('http://localhost:8080/event/all');
        const eventData = (await response.json()) as EventDetails[];

        // TODO: Workaroud until multiple displays can be saved for events.
        eventData.forEach(d => {
            d.displays = [{
                macAddress: d.display.macAddress,
                image: d.image
            }]
        })

        // Events filtern basierend auf den ausgewählten MAC-Adressen
        const filteredEvents = eventData.filter(event => savedSelections.includes(event.display.macAddress));

        console.log("Gefilterte Events:", filteredEvents);
        setEvents(filteredEvents);


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


        const fetchDisplays = async () => {
            const response = await fetch('http://localhost:8080/display/all');
            const data = await response.json();
            setDisplays(data); // Update the state with fetched data
            const savedSelections = JSON.parse(localStorage.getItem("selectedMACs") || "[]");
            setSelectedMACs(savedSelections);
        };

        fetchDisplays();

        if (hasFetched.current) return
        hasFetched.current = true

        updateEvents()
            .then(() => console.log('Events updated.'))
            .catch(err => console.error(err))
    }, []);

    // Gefilterte Displays (nur aktivierte MACs)
    const filteredDisplays = displays.filter(display => selectedMACs.includes(display.macAddress));

    // Toggle Checkbox
    const handleCheckboxChange = (mac: string) => {
        let updatedSelections;
        if (selectedMACs.includes(mac)) {
            updatedSelections = selectedMACs.filter(item => item !== mac);
        } else {
            updatedSelections = [...selectedMACs, mac];
        }

        setSelectedMACs(updatedSelections);
        localStorage.setItem("selectedMACs", JSON.stringify(updatedSelections));
        // Kalendereinträge aktualisieren
        updateEvents();
    };

    // Alle Displays auswählen/abwählen
    const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        const allMACs = displays.map(display => display.macAddress);

        if (isChecked) {
            setSelectedMACs(allMACs);
        } else {
            setSelectedMACs([]);
        }

        localStorage.setItem("selectedMACs", JSON.stringify(isChecked ? allMACs : []));
        // Kalendereinträge aktualisieren
        updateEvents();
    };



    const closeCalendarEditEntryHandler = () => {
        setOpenCalendarEntry(false)
        setTimeout(() => setEventDetailsForEdit(null), 500)      // Wait until dialog close animation is over.
    }

    const handleDateClicked = (info: DateClickArg) => {
        //const dateStr = formatDateToString(info.date, info.allDay)
        let dateStr = formatDatetimeLocal(info.date , info.allDay)

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


        // Extrahiere Jahr, Monat, Tag, Stunde und Minute im richtigen Format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Monat muss 2-stellig sein
        const day = String(date.getDate()).padStart(2, '0'); // Tag muss 2-stellig sein
        const hours = String(date.getHours()).padStart(2, '0'); // Stunden 2-stellig
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Minuten 2-stellig

        if(allday == false){
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            return `${year}-${month}-${day}`;
        }
    };



    const handleEventClicked = (evt: EventClickArg) => {
        //const start = evt.event.start ? formatDateToString(evt.event.start, evt.event.allDay) : ""
        //const end = evt.event.end ? formatDateToString(evt.event.end, evt.event.allDay) : start
        let start = formatDatetimeLocal(evt.event.start ? evt.event.start : new Date(), evt.event.allDay)
        let end
        if (evt.event.end){
            end = formatDatetimeLocal(evt.event.end, evt.event.allDay)
        } else {
            end = start
        }
        //let end = formatDatetimeLocal(evt.event.end ? evt.event.end : start, evt.event.allDay)
        console.log("start: "+ start)
        console.log("start_test: "+ start)
        console.log("end: " + end)
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
            <div style={{ display: 'flex' }}>
                {/* Left Column for Display Checkboxes */}
                <div style={{width: '300px', paddingRight: '20px'}}>
                    <h2 style={{fontSize: '24px', fontWeight: 'bold'}}>Display Filter</h2>
                    <div>
                        {/* Checkbox zum Auswählen/Auszuwählen aller Displays */}
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedMACs.length === displays.length} // Wenn alle Displays ausgewählt sind
                                onChange={handleSelectAllChange}
                                style={{marginRight: '10px'}} // Abstand zwischen Checkbox und Text
                            />
                            Alle auswählen/abwählen
                        </label>
                    </div>
                    <div style={{ borderBottom: '1px solid #ccc', margin: '10px 0' }}></div> {/* Trennstrich */}

                    <ul>
                        {displays.map(display => (
                            <li key={display.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedMACs.includes(display.macAddress)}
                                        onChange={() => handleCheckboxChange(display.macAddress)}
                                        style={{marginRight: '10px'}} // Abstand zwischen Checkbox und Text
                                    />
                                    {"Display Id: " + display.id} ({"Mac: " + display.macAddress})
                                </label>
                            </li>
                        ))}
                    </ul>

                    <h2>Gefilterte Displays</h2>
                    <ul>
                        {filteredDisplays.map(display => (
                            <li key={display.id}>{display.id} ({display.macAddress})</li>
                        ))}
                    </ul>
                </div>

                {/* Right Column for Calendar */}
                <div style={{ flex: 1 }}>
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