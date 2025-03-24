import {Button, Dialog, DialogBody, DialogFooter} from '@material-tailwind/react'
import React from 'react'

type SaveDialogProps = {
    open: boolean,
    message: string,
    onClose: () => void,
}

export default function SaveDialog({open, message, onClose}: SaveDialogProps) {
    return (
        <Dialog open={open} handler={onClose}>
            <DialogBody className="text-center">{message}</DialogBody>
            <DialogFooter>
                <Button className="bg-primary text-white" onClick={onClose}>OK</Button>
            </DialogFooter>
        </Dialog>
    )
}