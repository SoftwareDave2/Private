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
            setData({
                ...data,
                [name]: value
            })
        }
    }

    const setDisplaysHandler = (displays: EventDisplayDetails[]) => {
        setData(d => ({
            ...d,
            displays: displays
        }))
    }

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

        if (data.displays.length === 0 || data.displays[0].macAddress.length === 0) {
            errors.push("Es muss mindestens ein Display ausgewählt werden")
        } else {
            let invalidDisplayConfig = false
            data.displays.forEach(d => {
                if (d.macAddress.length === 0 || d.image.length === 0) {
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

        let start = data.start
        let end = data.end

        if (data.allDay) {
            start += 'T00:00:00'
            end += 'T00:00:00'
        }

        // TODO: Save displays with images?
        const firstMacAddress = data.displays[0].macAddress
        const firstImage = data.displays[0].image

        const isUpdate = data.id.length > 0
        const path = isUpdate ? ('/event/update/' + data.id) : '/event/add'
        try {
            const response = await fetch(backendApiUrl + path, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body:
                    'title=' + data.title +
                    '&allDay=' + data.allDay +
                    '&start=' + start +
                    '&end=' + end +
                    '&displayMac=' + firstMacAddress +
                    '&image=' + firstImage
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
            <DialogHeader>Kalendereintrag {data.id.length > 0 ? "anpassen" : "erstellen"}</DialogHeader>
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
                    <DisplayInputCards displays={data.displays} onSetDisplays={setDisplaysHandler} />
                </DialogBody>
                <DialogFooter className={'justify-between'}>
                    {data.id.length > 0 &&
                        <Button type={'button'} variant={'filled'}
                                className={'bg-primary text-white'}
                                onClick={toggleOpenDeleteDialogHandler}>Löschen</Button>}
                    {data.id.length === 0 && <div></div>}
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