import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from "@material-tailwind/react";
import React from "react";

type ConfirmDeleteImageDialogProps = {
    open: boolean,
    filename: string,
    onClose: () => void,
    onDeleted: () => void,
}

export function ConfirmDeleteImageDialog({open, filename, onClose, onDeleted}: ConfirmDeleteImageDialogProps) {

    // TODO: Fetch events and check displays if this image is used!

    const backendApiUrl = 'http://localhost:8080'

    const deleteHandler = async () => {
        try {
            const response = await fetch(backendApiUrl + '/image/delete/' + filename, {
                method: 'DELETE'
            })
            const responseText = await response.text()
            console.log(responseText)

            onDeleted()
        } catch (err) {
            console.error(err)
            onClose()
        }
    }

    return (
        <Dialog open={open} size={'xs'} handler={onClose}>
            <DialogHeader>Bild {filename} löschen?</DialogHeader>
            <DialogBody>
                <p>Möchten Sie das Bild <strong>{filename}</strong> wirklich löschen?</p>
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={deleteHandler}>Bild Löschen</Button>
            </DialogFooter>
        </Dialog>
    )
}