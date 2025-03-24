import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from '@material-tailwind/react'

type ImageDeleteResultDialogProps = {
    open: boolean,
    message: string,
    onClose: () => void
}

export default function ImageDeleteResultDialog({open, message, onClose}: ImageDeleteResultDialogProps) {
    return (
        <Dialog open={open} size={'xs'} handler={onClose}>
            <DialogHeader>Bild löschen</DialogHeader>
            <DialogBody>
                <p>{message}</p>
            </DialogBody>
            <DialogFooter>
                <Button className={'bg-primary text-white'} onClick={onClose}>OK</Button>
            </DialogFooter>
        </Dialog>
    )
}