import {Button, Dialog, DialogBody, DialogFooter} from "@material-tailwind/react";

type NotificationDialogProps = {
    open: boolean,
    message: string | null,
    onClose: () => void,
}

export default function NotificationDialog({open, message, onClose}: NotificationDialogProps) {
    return (
        <Dialog open={open} size={'xs'} handler={onClose}>
            <DialogBody>
                <p>{message}</p>
            </DialogBody>
            <DialogFooter>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={onClose}>Schließen</Button>
            </DialogFooter>
        </Dialog>
    )
}