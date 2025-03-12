import { Button, Dialog, DialogBody, DialogFooter, DialogHeader } from "@material-tailwind/react";
import Image from "@/components/shared/Image";
import styles from "./MediaItemViewDialog.module.css";
import { useState } from "react";
import { ConfirmDeleteImageDialog } from "@/components/media/ConfirmDeleteImageDialog";
import { getBackendApiUrl } from "@/utils/backendApiUrl";

type MediaItemViewDialogProps = {
    open: boolean,
    filename: string,
    onClose: () => void,
    onDeleted: () => void,
    onDeleteResult: (message: string) => void,
}

export default function MediaItemViewDialog({ open, filename, onClose, onDeleted, onDeleteResult }: MediaItemViewDialogProps) {

    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [width, setWidth] = useState<number | undefined>();
    const [height, setHeight] = useState<number | undefined>();

    const loadedHandler = (imgWidth: number, imgHeight: number) => {
        setWidth(imgWidth);
        setHeight(imgHeight);
    };

    const toggleShowConfirmDeleteDialog = () => setShowConfirmDeleteDialog(!showConfirmDeleteDialog);

    const deletedHandler = async () => {
        const backendApiUrl = getBackendApiUrl();
        try {
            const response = await fetch(backendApiUrl + '/image/delete/' + filename, {
                method: 'DELETE'
            });
            const responseText = await response.text();
            console.log(responseText);
            onDeleteResult( responseText);
            onDeleted();
        } catch (err) {
            console.error(err);
            onDeleteResult(err);
            onClose();
        }
        setShowConfirmDeleteDialog(false);
    };

    return (
        <Dialog open={open} size={'xl'} handler={onClose} className={'!w-auto !min-w-min'}>
            <DialogHeader>
                {filename} {width && height && <span className={'ms-2 text-gray-600'}> ({width}x{height})</span>}
            </DialogHeader>
            <DialogBody>
                <div className={styles.img}>
                    <Image
                        filename={filename}
                        className={'rounded-sm w-full h-full object-contain'}
                        onImageLoaded={loadedHandler}
                    />
                </div>
                <ConfirmDeleteImageDialog
                    open={showConfirmDeleteDialog}
                    filename={filename}
                    onClose={toggleShowConfirmDeleteDialog}
                    onDeleted={deletedHandler}
                />
            </DialogBody>
            <DialogFooter className={'justify-between'}>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={toggleShowConfirmDeleteDialog}>
                    Löschen
                </Button>
                <Button variant={'outlined'} className={'text-primary border-primary'} onClick={onClose}>
                    Close
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
