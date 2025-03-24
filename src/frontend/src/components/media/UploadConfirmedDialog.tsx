import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from '@material-tailwind/react'
import React from 'react'

type UploadConfirmedDialogProps = {
    open: boolean,
    message: string,
    onClose: () => void,
}

export default function UploadConfirmedDialog({open, message, onClose}: UploadConfirmedDialogProps) {
    return (
        <Dialog open={open} handler={onClose}>
            <DialogHeader>Upload Bestätigung</DialogHeader>
            <DialogBody className="text-center">{message}</DialogBody>
            <DialogFooter>
                <Button className={'bg-primary text-white'} onClick={onClose}>OK</Button>
            </DialogFooter>
        </Dialog>
    )
}