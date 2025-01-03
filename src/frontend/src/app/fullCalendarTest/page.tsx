"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useRef, useState } from "react";
import {CalendarEntryDialog} from "@/components/CalendarEntryDialog";
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
  const [isModalOpen, setModalOpen] = useState(false);
  const [openCalendarEntry, setOpenCalendarEntry] = useState<boolean>(false)
  const [eventDetailsForEdit, setEventDetailsForEdit] = useState<EventDetails | null>(null)


  const toggleOpenCalendarEntryHandler = () => setOpenCalendarEntry(!openCalendarEntry)


  // test zur anzeige von events
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

  const [eventDetails, setEventDetails] = useState<EventDetails>({
    id: "",
    title: "",
    date: "",
    start: "",
    end: "",
    allDay: false,
    image: undefined,
  });

  const handleAddEvent = () => {
    const calendarApi = calendarRef.current?.getApi?.() || (calendarRef.current as any)?.getApi?.();
    if (calendarApi) {
      const newEvent = {
        title: eventDetails.title,
        start: eventDetails.allDay ? eventDetails.date : `${eventDetails.date}T${eventDetails.start}`,
        end: eventDetails.allDay ? undefined : `${eventDetails.date}T${eventDetails.end}`,
        allDay: eventDetails.allDay,
        extendedProps: {
          image: eventDetails.image, // Bild als zusätzliches Property speichern
        },
      };
      calendarApi.addEvent(newEvent);
    } else {
      console.error("Calendar API not available");
    }
    closeModal(); // Modal schließen
  };






  const openModal = (date: string) => {
    setEventDetails({ ...eventDetails, date }); // Datum setzen
    console.log(eventDetailsForEdit?.title) // test m
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEventDetails({id:"", title: "", date: "", start: "", end: "", allDay: false, image: undefined }); // Felder zurücksetzen
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEventDetails({
      ...eventDetails,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEventDetails({
          ...eventDetails,
          image: event.target?.result as string, // Base64-String speichern
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };


  const calendarEntryHandler = async () => {
    // Fetch new display data from server.
    try {
      // const data = await fetch(backendApiUrl + '/display/all')
      // const allDisplays = (await data.json()) as DisplayData[]
      // const display = allDisplays.find(d => d.id === displayData.id)
      // if (!display) {
      //   console.error('Selected display not found!')
      //   return
      // }
      const eventTest = {
        id: "",
        title: "",
        date: "",
        start: "",
        end: "",
        allDay: false,
        image: undefined,
      }


      setEventDetailsForEdit(eventTest)
      //toggleOpenCalendarEntryHandler()
      setOpenCalendarEntry(true)
    } catch (err) {
      console.error(err)
    }
  }

  const displayDataUpdated = () => {
    handleAddEvent()
    closeCalendarEntryHandler()
    //onEventDetailsUpdated()
  }

  return (
      <>
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
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


        {/* Modal */}
        {isModalOpen && (
            <div className="modal-backdrop">
              <div className="modal">
                <h2>Add Event</h2>
                <form>
                  <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={eventDetails.title}
                        onChange={handleInputChange}
                        placeholder="Event Title"
                    />
                  </div>


                  <div>
                    <label>Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={eventDetails.date}
                        onChange={handleInputChange}
                    />
                  </div>
                  {!eventDetails.allDay && (
                      <>
                        <div>
                          <label>Start Time:</label>
                          <input
                              type="time"
                              name="start"
                              value={eventDetails.start}
                              onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label>End Time:</label>
                          <input
                              type="time"
                              name="end"
                              value={eventDetails.end}
                              onChange={handleInputChange}
                          />
                        </div>
                      </>
                  )}
                  <div>
                    <label>
                      <input
                          type="checkbox"
                          name="allDay"
                          checked={eventDetails.allDay}
                          onChange={handleInputChange}
                      />
                      All Day Event
                    </label>
                  </div>
                  <div>
                    <label>Upload Image:</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload}/>
                  </div>
                </form>
                <div className="modal-actions">
                  <button onClick={handleAddEvent}>Save</button>
                  <button onClick={closeModal}>Cancel</button>
                </div>
              </div>
            </div>
        )}

        {/* Styles */}
        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal {
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 300px;
          }

          .modal h2 {
            margin-top: 0;
          }

          .modal-actions {
            display: flex;
            justify-content: space-between;
          }

          .modal-actions button {
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
          }

          .modal-actions button:first-of-type {
            background-color: #007bff;
            color: white;
          }

          .modal-actions button:last-of-type {
            background-color: #dc3545;
            color: white;
          }
        `}</style>
      </>
  );
}
