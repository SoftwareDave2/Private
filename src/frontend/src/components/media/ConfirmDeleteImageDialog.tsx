import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from "@material-tailwind/react";
import React from "react";

type ConfirmDeleteImageDialogProps = {
    open: boolean,
    filename: string,
    onClose: () => void,
    onDeleted: () => void,
}

export function ConfirmDeleteImageDialog({open, filename, onClose, onDeleted}: ConfirmDeleteImageDialogProps) {

    return (
        <Dialog open={open} size={'xs'} handler={onClose}>
            <DialogHeader>Bild {filename} löschen?</DialogHeader>
            <DialogBody>
                <p>Möchten Sie das Bild <strong>{filename}</strong> wirklich löschen?</p>
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={onDeleted}>Bild Löschen</Button>
            </DialogFooter>
        </Dialog>
    )
}