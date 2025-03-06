import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Checkbox
} from "@material-tailwind/react"

import React, { useState } from "react";
import { EventDetails, EventDisplayDetails } from "@/types/eventDetails";
import CollisionDetectedAlert from "@/components/calendar/CollisionDetectedAlert";
import { DeleteCalendarEventDialog } from "@/components/calendar/DeleteCalendarEventDialog";
import SaveEventErrorAlert from "@/components/calendar/SaveEventErrorAlert";
import DisplayInputCards from "@/components/calendar/DisplayInputCards";
import {getBackendApiUrl} from "@/utils/backendApiUrl";

type CalendarEntryDialogProps = {
    open: boolean,
    eventDetails: EventDetails,
    onClose: () => void,
    onDataUpdated: () => void,
}

export function CalendarEntryDialog({ open, eventDetails, onClose, onDataUpdated }: CalendarEntryDialogProps) {

    const COLLISION_DETECTED_ERROR_CODE = 569;
    // const host = window.location.hostname;
    // const backendApiUrl = 'http://' + host + ':8080';
    const backendApiUrl = getBackendApiUrl();

    // Heutiges Datum im Format "YYYY-MM-DD"
    const today = new Date().toISOString().split("T")[0];

    // Initial State: Defaultwerte für Wiederholungsfelder setzen, falls nicht vorhanden.
    const [data, setData] = useState<EventDetails>({
        ...eventDetails,
        recurrenceType: eventDetails.recurrenceType || "keine",
        recurrenceWeekdays: eventDetails.recurrenceWeekdays || [],
        recurrenceStartDate: eventDetails.recurrenceStartDate || today,
        recurrenceEndDate: eventDetails.recurrenceEndDate || today,
        recurrenceStartTime: eventDetails.recurrenceStartTime || "08:00",
        recurrenceEndTime: eventDetails.recurrenceEndTime || "09:30",
    });
    const [errors, setErrors] = useState<string[] | null>(null);
    const [collisionError, setCollisionError] = useState<boolean>(false);
    const [openDeleteEvent, setOpenDeleteEvent] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setData({
                ...data,
                [name]: checked,
                // Beispielhafte Anpassung der start/end Felder, falls benötigt
                ['start']: checked ? data.start.slice(0, -9) : (data.start.length > 0 ? data.start + "T12:00:00" : ""),
                ['end']: checked ? data.end.slice(0, -9) : (data.end.length > 0 ? data.end + "T15:00:00" : "")
            });
        } else {
            setData({ ...data, [name]: value });
        }
    };

    // Handler für das Dropdown zur Wiederholungsart
    const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as "keine" | "täglich" | "wöchentlich";
        setData({ ...data, recurrenceType: value });
    };

    // Handler für die Änderung der Wochentags-Checkboxen (bei wöchentlicher Wiederholung)
    const handleWeekdayChange = (e: React.ChangeEvent<HTMLInputElement>, day: number) => {
        const { checked } = e.target;
        let updatedWeekdays = data.recurrenceWeekdays ? [...data.recurrenceWeekdays] : [];
        if (checked) {
            if (!updatedWeekdays.includes(day)) {
                updatedWeekdays.push(day);
            }
        } else {
            updatedWeekdays = updatedWeekdays.filter(item => item !== day);
        }
        setData({ ...data, recurrenceWeekdays: updatedWeekdays });
    };

    const setDisplaysHandler = (displays: EventDisplayDetails[]) =>
        setData(d => ({ ...d, displayImages: displays }));

    const validateData = () => {
        let errors: string[] = [];
        if (data.title.length < 3 || data.title.length > 30) {
            errors.push("Der Titel muss mindestens 3 und maximal 30 Zeichen beinhalten");
        }

        if (data.recurrenceType === "keine") {
            // Validierung wie bisher
            const start = new Date(data.start);
            const end = new Date(data.end);
            if (end < start) {
                errors.push("Das End-Datum muss nach dem Start-Datum liegen");
            }
        } else {
            // Für wiederkehrende Termine: getrennte Datums- und Zeitfelder prüfen
            if (!data.recurrenceStartDate || !data.recurrenceEndDate || !data.recurrenceStartTime || !data.recurrenceEndTime) {
                errors.push("Bitte füllen Sie alle Felder für wiederkehrende Termine aus.");
            } else {
                const start = new Date(data.recurrenceStartDate + 'T' + data.recurrenceStartTime);
                const end = new Date(data.recurrenceEndDate + 'T' + data.recurrenceEndTime);
                if (end < start) {
                    errors.push("Das End-Datum und die End-Zeit müssen nach dem Start liegen");
                }
            }
            // Für wöchentliche Termine: Mindestens ein Wochentag muss ausgewählt sein
            if (data.recurrenceType === "wöchentlich" && (!data.recurrenceWeekdays || data.recurrenceWeekdays.length === 0)) {
                errors.push("Bitte wählen Sie mindestens einen Wochentag für den wöchentlichen Termin aus.");
            }
        }

        if (data.displayImages.length === 0 || data.displayImages[0].displayMac.length === 0) {
            errors.push("Es muss mindestens ein Display ausgewählt werden");
        } else {
            let invalidDisplayConfig = false;
            data.displayImages.forEach(d => {
                if (d.displayMac.length === 0 || d.image.length === 0) {
                    invalidDisplayConfig = true;
                }
            });
            if (invalidDisplayConfig) {
                errors.push("Die Konfiguration der Displays ist unvollständig.");
            }
        }

        return errors;
    };

    const updateEvent = async (formdata: FormData) => {
        const errors = validateData();
        if (errors.length > 0) {
            setErrors(errors);
            return;
        } else {
            setErrors(null);
        }

        // Event-Objekt erstellen – hier werden auch die neuen Wiederholungsfelder mit übertragen.
        const event: EventDetails = {
            id: data.id,
            title: data.title,
            start: data.allDay ? (data.start + 'T00:00:00') : data.start,
            end: data.allDay ? (data.end + 'T00:00:00') : data.end,
            allDay: data.allDay,
            displayImages: data.displayImages,
            rrule: data.rrule,
            recurrenceType: data.recurrenceType,
            recurrenceStartDate: data.recurrenceStartDate,
            recurrenceEndDate: data.recurrenceEndDate,
            recurrenceStartTime: data.recurrenceStartTime,
            recurrenceEndTime: data.recurrenceEndTime,
            recurrenceWeekdays: data.recurrenceWeekdays
        };

        console.log(event)




        const isUpdate = data.id > 0;
        const path = isUpdate ? ('/event/update/' + data.id) : '/event/add';
        try {
            const response = await fetch(backendApiUrl + path, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
            if (response.status === 200) {
                onDataUpdated();
            } else {
                if (response.status === COLLISION_DETECTED_ERROR_CODE) {
                    setCollisionError(true);
                } else {
                    const errorMsg = await response.text();
                    setErrors([errorMsg]);
                }
            }
        } catch (err) {
            console.error(err);
            setErrors(["Error: " + err]);
        }
    };

    const toggleOpenDeleteDialogHandler = () => {
        setOpenDeleteEvent(!openDeleteEvent);
    };

    const eventDeletedHandler = () => {
        toggleOpenDeleteDialogHandler();
        onDataUpdated();
    };

    return (
        <Dialog open={open} handler={onClose}>
            <DialogHeader>Kalendereintrag {data.id > 0 ? "anpassen" : "erstellen"}</DialogHeader>
            <form action={updateEvent}>
                <DialogBody className={'max-h-[75vh] overflow-y-auto'}>
                    {collisionError && <CollisionDetectedAlert />}
                    {errors && <SaveEventErrorAlert errorMsg={errors} />}
                    <div>
                        <Input label={'Titel'} name={'title'} value={data.title} onChange={handleInputChange} />
                    </div>
                    <div className={'mt-5'}>
                        <label className="block text-sm font-medium text-gray-700">Wiederholung</label>
                        <select name="recurrenceType" value={data.recurrenceType} onChange={handleRecurrenceChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="keine">keine</option>
                            <option value="täglich">täglich</option>
                            <option value="wöchentlich">wöchentlich</option>
                        </select>
                    </div>
                    {data.recurrenceType === "keine" ? (
                        <>
                            <div className={'mt-5'}>
                                <Checkbox label={'Ganztägig'} name={'allDay'} checked={data.allDay} onChange={handleInputChange} />
                            </div>
                            <div className={'mt-5 flex gap-2'}>
                                <Input type={data.allDay ? 'date' : 'datetime-local'} label={'Start'} value={data.start} name={'start'} onChange={handleInputChange} />
                                <Input type={data.allDay ? 'date' : 'datetime-local'} label={'Ende'} value={data.end} name={'end'} onChange={handleInputChange} />
                            </div>
                        </>
                    ) : (
                        <div className={'mt-5'}>
                            <div className={'flex gap-2'}>
                                <Input type="date" label="Startdatum" name="recurrenceStartDate" value={data.recurrenceStartDate || ''} onChange={handleInputChange} />
                                <Input type="date" label="Enddatum" name="recurrenceEndDate" value={data.recurrenceEndDate || ''} onChange={handleInputChange} />
                            </div>
                            <div className={'flex gap-2 mt-2'}>
                                <Input type="time" label="Startzeit" name="recurrenceStartTime" value={data.recurrenceStartTime || ''} onChange={handleInputChange} />
                                <Input type="time" label="Endzeit" name="recurrenceEndTime" value={data.recurrenceEndTime || ''} onChange={handleInputChange} />
                            </div>
                            {data.recurrenceType === "wöchentlich" && (
                                <div className={'mt-5'}>
                                    <label className="block text-sm font-medium text-gray-700">Wochentage</label>
                                    <div className="flex gap-2 mt-1">
                                        <Checkbox label="Mo" name="weekday0" checked={data.recurrenceWeekdays?.includes(0) || false} onChange={(e) => handleWeekdayChange(e, 0)} />
                                        <Checkbox label="Di" name="weekday1" checked={data.recurrenceWeekdays?.includes(1) || false} onChange={(e) => handleWeekdayChange(e, 1)} />
                                        <Checkbox label="Mi" name="weekday2" checked={data.recurrenceWeekdays?.includes(2) || false} onChange={(e) => handleWeekdayChange(e, 2)} />
                                        <Checkbox label="Do" name="weekday3" checked={data.recurrenceWeekdays?.includes(3) || false} onChange={(e) => handleWeekdayChange(e, 3)} />
                                        <Checkbox label="Fr" name="weekday4" checked={data.recurrenceWeekdays?.includes(4) || false} onChange={(e) => handleWeekdayChange(e, 4)} />
                                        <Checkbox label="Sa" name="weekday5" checked={data.recurrenceWeekdays?.includes(5) || false} onChange={(e) => handleWeekdayChange(e, 5)} />
                                        <Checkbox label="So" name="weekday6" checked={data.recurrenceWeekdays?.includes(6) || false} onChange={(e) => handleWeekdayChange(e, 6)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DisplayInputCards displays={data.displayImages} onSetDisplays={setDisplaysHandler} />
                </DialogBody>
                <DialogFooter className={'justify-between'}>
                    {data.id > 0 &&
                        <Button type={'button'} variant={'filled'}
                                className={'bg-primary text-white'}
                                onClick={toggleOpenDeleteDialogHandler}>Löschen</Button>}
                    {data.id === 0 && <div></div>}
                    <div className={'flex space-x-2'}>
                        <Button type={'button'} variant='outlined' className='text-primary border-primary'
                                onClick={onClose}>Cancel</Button>
                        <Button type={'submit'} variant={'filled'}
                                className={'bg-primary text-white'}>Speichern</Button>
                    </div>
                </DialogFooter>
            </form>
            <DeleteCalendarEventDialog open={openDeleteEvent} event={data}
                                       onClose={toggleOpenDeleteDialogHandler}
                                       onDeleted={eventDeletedHandler} />
        </Dialog>
    );
}
