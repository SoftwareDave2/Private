import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Checkbox,
    Alert
} from "@material-tailwind/react"

import SelectImage from "@/components/edit-display/SelectImage";
import React, {useState} from "react";
import {EventDetails} from "@/types/eventDetails";
import ExclamationIcon from "@/components/shared/ExclamationIcon";
import CollisionDetectedAlert from "@/components/calendar/CollisionDetectedAlert";

type CalendarEntryDialogProps = {
    open: boolean,
    eventDetails: EventDetails,
    onClose: () => void,
    onDataUpdated: () => void,
}

export function CalendarEntryDialog({open, eventDetails, onClose, onDataUpdated}: CalendarEntryDialogProps) {

    const backendApiUrl = 'http://localhost:8080'

    const [data, setData] = useState<EventDetails>(eventDetails)
    const [collisionError, setCollisionError] = useState<boolean>(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        if (type === 'checkbox') {
            setData({
                ...data,
                [name]: checked
            })
        } else {
            setData({
                ...data,
                [name]: value
            })
        }
    }

    const filenameChangeHandler = (filename: string) =>
        setData(prevState => ({...prevState, image: filename}))

    const updateEvent = async (formdata: FormData) => {

        let isCollisionDetected = false

        let start = data.start.toString()
        let end = data.end.toString()

        if (!data.allDay) {
            start += ':00'
            end += ':00'
        }

        try {
            const response = await fetch(backendApiUrl + '/event/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body:
                    'title=' + data.title +
                    '&allDay=' + data.allDay +
                    '&start=' + start +
                    '&end=' + end +
                    '&displayMac=' + data.macaddress +
                    '&image=' + data.image
            })
            const responseText = await response.text()
            isCollisionDetected = true        // Status code: 569
            if (isCollisionDetected) {
                setCollisionError(true)
            }
            console.log(responseText)

        } catch (err) {
            console.error(err)
        }

        if (!isCollisionDetected) {
            onDataUpdated()
        }
    }

    return (
        <Dialog open={open} handler={onClose}>
            <DialogHeader>Kalendereintrag anpassen</DialogHeader>
            <form action={updateEvent}>
                <DialogBody>
                    {collisionError && <CollisionDetectedAlert />}
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
                    <div className={'mt-5'}>
                        <Input label={'MAC Adresse'} name={'macaddress'} value={data.macaddress} placeholder={'00:00:00:00:03'} onChange={handleInputChange} />
                    </div>
                    <div className={'mt-5'}>
                        <SelectImage selectedFilename={data.image} onSelect={filenameChangeHandler}/>
                    </div>
                </DialogBody>
                <DialogFooter className={'justify-end space-x-2'}>
                    <Button type={'button'} variant='outlined' className='text-primary border-primary'
                            onClick={onClose}>Cancel</Button>
                    <Button type={'submit'} variant={'filled'}
                            className={'bg-primary text-white'}>Speichern</Button>
                </DialogFooter>
            </form>
        </Dialog>
    )
}