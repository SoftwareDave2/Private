import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Checkbox
} from "@material-tailwind/react"

import React, {useState} from "react";
import {EventDetails, EventDisplayDetails} from "@/types/eventDetails";
import CollisionDetectedAlert from "@/components/calendar/CollisionDetectedAlert";
import {DeleteCalendarEventDialog} from "@/components/calendar/DeleteCalendarEventDialog";
import SaveEventErrorAlert from "@/components/calendar/SaveEventErrorAlert";
import DisplayInputCards from "@/components/calendar/DisplayInputCards";

type CalendarEntryDialogProps = {
    open: boolean,
    eventDetails: EventDetails,
    onClose: () => void,
    onDataUpdated: () => void,
}

export function CalendarEntryDialog({open, eventDetails, onClose, onDataUpdated}: CalendarEntryDialogProps) {

    const COLLISION_DETECTED_ERROR_CODE = 569
    const backendApiUrl = 'http://localhost:8080'

    const [data, setData] = useState<EventDetails>(eventDetails)
    const [errors, setErrors] = useState<string[] | null>(null)
    const [collisionError, setCollisionError] = useState<boolean>(false)
    const [openDeleteEvent, setOpenDeleteEvent] = useState<boolean>(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        if (type === 'checkbox') {
            setData({
                ...data,
                [name]: checked,
                ['start']: checked ? data.start.slice(0, -9) : (data.start.length > 0 ? data.start + "T12:00:00" : ""),
                ['end']: checked ? data.end.slice(0, -9) : (data.end.length > 0 ? data.end + "T15:00:00" : "")
            })
        } else {
            setData({...data, [name]: value})
        }
    }

    const setDisplaysHandler = (displays: EventDisplayDetails[]) =>
        setData(d => ({...d, displayImages: displays}))

    const validateData = () => {
        let errors = []
        if (data.title.length < 3 || data.title.length > 30) {
            errors.push("Der Titel muss mindestens 3 und maximal 30 Zeichen beinhalten")
        }

        const start = new Date(data.start)
        const end = new Date(data.end)
        if (end < start) {
            errors.push("Das End-Datum muss nach dem Start-Datum liegen")
        }

        if (data.displayImages.length === 0 || data.displayImages[0].displayMac.length === 0) {
            errors.push("Es muss mindestens ein Display ausgewählt werden")
        } else {
            let invalidDisplayConfig = false
            data.displayImages.forEach(d => {
                if (d.displayMac.length === 0 || d.image.length === 0) {
                    invalidDisplayConfig = true
                }
            })
            if (invalidDisplayConfig) {
                errors.push("Die Konfiguration der Displays ist unvollständig.")
            }
        }

        return errors
    }

    const updateEvent = async (formdata: FormData) => {

        const errors = validateData()
        if (errors.length > 0) {
            setErrors(errors)
            return
        } else {
            setErrors(null)
        }

        const event: EventDetails = {
            id: data.id,
            title: data.title,
            start: data.allDay ? (data.start + 'T00:00:00') : data.start,
            //start: data.start,
            end: data.allDay ? (data.end + 'T00:00:00') : data.end,
            //end: data.end,
            allDay: data.allDay,
            displayImages: data.displayImages,
        }

        const isUpdate = data.id > 0
        const path = isUpdate ? ('/event/update/' + data.id) : '/event/add'
        try {
            const response = await fetch(backendApiUrl + path, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(event)
            })
            if (response.status == 200) {
                onDataUpdated()
            } else {
                if (response.status == COLLISION_DETECTED_ERROR_CODE){
                    setCollisionError(true)
                } else {
                    const errorMsg = await response.text()
                    setErrors([errorMsg])
                }
            }
        } catch (err) {
            console.error(err)
            setErrors(["Error: " + err])
        }
    }

    const toggleOpenDeleteDialogHandler = () => {
        setOpenDeleteEvent(!openDeleteEvent)
    }

    const eventDeletedHandler = () => {
        toggleOpenDeleteDialogHandler()
        onDataUpdated()
    }

    return (
        <Dialog open={open} handler={onClose}>
            <DialogHeader>Kalendereintrag {data.id > 0 ? "anpassen" : "erstellen"}</DialogHeader>
            <form action={updateEvent}>
                <DialogBody className={'max-h-[75vh] overflow-y-auto'}>
                    {collisionError && <CollisionDetectedAlert />}
                    {errors && <SaveEventErrorAlert errorMsg={errors} />}
                    <div>
                        <Input label={'Titel'} name={'title'} value={data.title} onChange={handleInputChange}/>
                    </div>
                    <div className={'mt-5'}>
                        <Checkbox label={'Ganztägig'} name={'allDay'} checked={data.allDay} onChange={handleInputChange}/>
                    </div>
                    <div className={'mt-5 flex gap-2'}>
                        <Input type={data.allDay ? 'date' : 'datetime-local'} label={'Start'} value={data.start} name={'start'} onChange={handleInputChange}/>
                        <Input type={data.allDay ? 'date' : 'datetime-local'} label={'Ende'} value={data.end} name={'end'} onChange={handleInputChange}/>
                    </div>
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
    )
}