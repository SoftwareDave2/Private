import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from "@material-tailwind/react";
import Image from "@/components/shared/Image";
import styles from "./MediaItemViewDialog.module.css"
import {useState} from "react";
import {ConfirmDeleteImageDialog} from "@/components/media/ConfirmDeleteImageDialog";

type MediaItemViewDialogProps = {
    open: boolean,
    filename: string,
    onClose: () => void,
    onDeleted: () => void,
}

export default function MediaItemViewDialog({open, filename, onClose, onDeleted}: MediaItemViewDialogProps) {

    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false)

    const toggleShowConfirmDeleteDialog =
        () => setShowConfirmDeleteDialog(!showConfirmDeleteDialog)

    const deletedHandler = () => {
        setShowConfirmDeleteDialog(false)
        setTimeout(onDeleted, 300)
    }

    return (
        <>
            <Dialog open={open} size={'xl'} handler={onClose} className={'!w-auto !min-w-min'}>
                <DialogHeader>{filename}</DialogHeader>
                <DialogBody>
                    <div className={styles.img}>
                        <Image filename={filename} className={'rounded-sm w-full h-full object-contain'} />
                    </div>
                    <ConfirmDeleteImageDialog open={showConfirmDeleteDialog} filename={filename}
                                              onClose={toggleShowConfirmDeleteDialog} onDeleted={deletedHandler} />
                </DialogBody>
                <DialogFooter className={'justify-between'}>
                    <Button variant={'filled'} className={'bg-primary text-white'}
                            onClick={toggleShowConfirmDeleteDialog}>Löschen</Button>
                    <Button variant={'outlined'} className={'text-primary border-primary'}
                            onClick={onClose}>Close</Button>
                </DialogFooter>
            </Dialog>

        </>
    )
}