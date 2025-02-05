"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useRef, useState } from "react";
import {CalendarEntryDialog} from "@/components/calendar/CalendarEntryDialog";
import {EventDetails} from "@/types/eventDetails";
import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from "@material-tailwind/react";
import {  useEffect } from 'react';
import {DisplayData} from "@/types/displayData";


type Event = {
  id: string;
  title: string;
  allDay: string;
  start: string;
  end: string;
  display: DisplayData;
  image: object;
};

export default function Calendar() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [openCalendarEntry, setOpenCalendarEntry] = useState<boolean>(false)
  const [eventDetailsForEdit, setEventDetailsForEdit] = useState<EventDetails | null>(null)
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    id: "",
    title: "",
    date: "",
    start: "",
    end: "",
    allDay: false,
    image: undefined,
  });


  const toggleOpenCalendarEntryHandler = () => setOpenCalendarEntry(!openCalendarEntry)

  // gespeicherte Events aus dem Backend holen
  const [events, setEvents] = useState<Event[]>([]); // State to store displays
  // Fetch data on mount using useEffect
  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('http://localhost:8080/event/all');
      const eventData = await response.json();
      // Hinweis: die console.log(...) befehle werden in der Console im browser ausgeführt -> bei Safari: Entwickler -> javaScript-Konsole einblenden
      console.log(eventData);
      setEvents(eventData); // Update the state with fetched data
    };
    fetchEvents();
  }, []); // Empty dependency array means it runs only once after the component mounts

  // erzeugen der Einträge für den fullCalendar
  const fullCalendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay === 'true',
    extendedProps: {
      display: event.display,
      image: "uploads/"+event.image
    }
  }));

  const closeCalendarEntryHandler = () => {
    //toggleOpenCalendarEntryHandler()
    setOpenCalendarEntry(false)
    setTimeout(() => setEventDetailsForEdit(null), 500)      // Wait until dialog close animation is over.
  }


  const testcloseCalendarEntryHandler = () => {
    //toggleOpenCalendarEntryHandler()
    //setOpenCalendarEntry(false)
    setTimeout(() => setEventDetailsForEdit(null), 500)      // Wait until dialog close animation is over.
  }




  const calendarEntryHandler = async () => {
    try {
      const newEvent = {
        id: "",
        title: "",
        date: "",
        start: "",
        end: "",
        allDay: false,
        image: undefined,
      }
      setEventDetailsForEdit(newEvent)
      //toggleOpenCalendarEntryHandler()
      setOpenCalendarEntry(true)
    } catch (err) {
      console.error(err)
    }
  }

  const displayDataUpdated = () => {
    closeCalendarEntryHandler()
    //onEventDetailsUpdated()
  }

  return (
      <>
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            events={fullCalendarEvents}

            headerToolbar={{
              left: "prev,today,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            //dateClick={(info) => openModal(info.dateStr)} // Modal öffnen bei Klick auf ein Datum
            dateClick={(info) => setOpenCalendarEntry(true)} // Modal öffnen bei Klick auf ein Datum
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
            eventClick={(clickInfo) => {
              // Event-Klick-Handler
              alert(`Event clicked: ${clickInfo.event.title}`+
                  `\n Start: ${clickInfo.event.start}` +
                  `\n End: ${clickInfo.event.end}` +
                  `\n AllDay: ${clickInfo.event.allDay}` +
                  `\n Display: ${clickInfo.event.extendedProps.display.id}`
              );
            }}
        />

        <ul className="space-y-4 p-4">
          {events.map((event: Event) => (
              <li
                  key={event.id}
                  className="p-4 bg-white shadow-md rounded-lg text-grey-700"
              >
                Id: {event.id} <br/>
                Title: {event.title} <br/>
                all day: {event.allDay.toString()} <br/>
                start: {event.start} <br/>
                end: {event.end} <br/>
                Mac Adresse: {(event.display.macAddress )} <br/>
                DisplayId: {(event.display.id )} <br/>
                Image: {event.image}
              </li>
          ))}
        </ul>


        <Dialog open={openCalendarEntry} handler={toggleOpenCalendarEntryHandler}>
          <DialogHeader>Display {eventDetails.title}</DialogHeader>
          <DialogBody>
            <div className={'flex gap-6'}>
              <Button variant={"outlined"} className={'text-primary border-primary mt-4'}
                      onClick={calendarEntryHandler}>CalendarEntry</Button>


            </div>


            {eventDetailsForEdit &&
                <CalendarEntryDialog open={openCalendarEntry} eventDetails={eventDetailsForEdit}
                    //onClose={closeCalendarEntryHandler}
                                     onClose={testcloseCalendarEntryHandler}
                                     onDataUpdated={displayDataUpdated}/>}
          </DialogBody>
          <DialogFooter className={'space-x-2'}>
            <Button variant='outlined' className='text-primary border-primary'
                    onClick={toggleOpenCalendarEntryHandler}>Cancel</Button>
            <Button variant={'filled'} className={'bg-primary text-white'}>Standard Content</Button>
            <Button variant={'filled'} className={'bg-primary text-white'}>Kalender öffnen</Button>
          </DialogFooter>
        </Dialog>

      </>
  );
}
