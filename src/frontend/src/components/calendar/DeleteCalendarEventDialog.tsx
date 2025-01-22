import {EventDetails} from "@/types/eventDetails";
import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from "@material-tailwind/react";
import React from "react";

type DeleteCalendarEventDialogProps = {
    open: boolean,
    event: EventDetails,
    onClose: () => void,
    onDeleted: () => void,
}

export function DeleteCalendarEventDialog({open, event, onClose, onDeleted}: DeleteCalendarEventDialogProps) {
    const backendApiUrl = 'http://localhost:8080'

    const deleteHandler = async () => {
        try {
            const response = await fetch(backendApiUrl + '/event/delete/' + event.id, {
                method: 'DELETE' }
            )
            const responseText = await response.text()
            console.log(responseText)
            onDeleted()
        } catch (err) {
            console.error(err)
            onClose()
        }
    }

    return (
        <Dialog open={open} handler={onClose} size={'xs'}>
            <DialogHeader>Event {event.title} löschen?</DialogHeader>
            <DialogBody>
                <p>Möchten Sie den Kalendereintrag <strong>{event.title}</strong> wirklich löschen?</p>
            </DialogBody>
            <DialogFooter className={'justify-between'}>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={deleteHandler}>Event Löschen</Button>
                <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
            </DialogFooter>
        </Dialog>
    )
}