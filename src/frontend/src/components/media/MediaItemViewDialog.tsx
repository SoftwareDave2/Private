import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from "@material-tailwind/react";
import Image from "@/components/shared/Image";
import styles from "./MediaItemViewDialog.module.css"

type MediaItemViewDialogProps = {
    open: boolean,
    filename: string,
    onClose: () => void,
    onDeleted: () => void,
}

export default function MediaItemViewDialog({open, filename, onClose, onDeleted}: MediaItemViewDialogProps) {

    const backendApiUrl = 'http://localhost:8080'

    const tryDeleteHandler = async () => {
        try {
            // TODO: Fetch events and check displays if this image is used!
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
        <Dialog open={open} size={'xl'} handler={onClose} className={'!w-auto !min-w-min'}>
            <DialogHeader>{filename}</DialogHeader>
            <DialogBody>
                <div className={styles.img}>
                    <Image filename={filename} className={'rounded-sm w-full h-full object-contain'} />
                </div>
            </DialogBody>
            <DialogFooter className={'justify-between'}>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={tryDeleteHandler}>Löschen</Button>
                <Button variant={'outlined'} className={'text-primary border-primary'} onClick={onClose}>Close</Button>
            </DialogFooter>
        </Dialog>
    )
}