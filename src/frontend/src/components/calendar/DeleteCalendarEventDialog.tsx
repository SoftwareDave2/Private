import {EventDetails} from "@/types/eventDetails";
import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from "@material-tailwind/react";
import React from "react";
import {getBackendApiUrl} from "@/utils/backendApiUrl";
import {authFetch} from "@/utils/authFetch";

type DeleteCalendarEventDialogProps = {
    open: boolean,
    event: EventDetails,
    onClose: () => void,
    onDeleted: () => void,
}

export function DeleteCalendarEventDialog({open, event, onClose, onDeleted}: DeleteCalendarEventDialogProps) {
    // const host = window.location.hostname;
    // const backendApiUrl = 'http://' + host + ':8080';
    const backendApiUrl = getBackendApiUrl();

    const deleteHandler = async () => {
        try {
            const response = await authFetch(backendApiUrl + '/event/delete/' + event.id, {
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



    const deleteAllHandler = async () => {
        try {
            const response = await authFetch(backendApiUrl + '/recevent/delete/' + event.groupId, {
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
                <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={deleteHandler}>Event Löschen</Button>
                {(event.id > 0) && (event.groupId != "" && event.groupId != null) &&

                    <Button type={'button'} variant={'filled'}
                            className={'bg-primary text-white'}
                            onClick={deleteAllHandler}>Alle Löschen</Button>}
            </DialogFooter>
        </Dialog>
    )
}
