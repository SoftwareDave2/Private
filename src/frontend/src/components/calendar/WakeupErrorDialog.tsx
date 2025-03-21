import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from "@material-tailwind/react";
import React from "react";

type WakeupErrorDialogProps = {
    open: boolean,
    errorMessage: string | null,
    onClose: () => void
}

export default function WakeupErrorDialog({open, errorMessage, onClose}: WakeupErrorDialogProps) {
    return (
        <Dialog open={open} handler={onClose}>
            <DialogHeader>Warnung</DialogHeader>
            <DialogBody className={"text-black"}>
                <span className={'block mb-2'}>Der Display-Aufweckfehler ist aufgetreten:</span>
                {errorMessage}
            </DialogBody>
            <DialogFooter>
                <Button variant="filled" className="bg-primary text-white" onClick={onClose}>OK</Button>
            </DialogFooter>
        </Dialog>
    )
}