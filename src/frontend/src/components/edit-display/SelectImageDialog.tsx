import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"
import {open, handler} from "@material-tailwind/react/types/components/dialog";
import {MediaContentItemData} from "@/types/mediaContentItemData";
import styles from './SelectImageDialog.module.css'
import Image from "@/components/shared/Image";

type SelectImageDialogProps = {
    open: open,
    selectedImage?: string,
    images: MediaContentItemData[],
    onCancel: handler,
    onSelect: handler,
}

export default function SelectImageDialog({open, selectedImage, images, onCancel, onSelect}: SelectImageDialogProps) {
    return (
        <Dialog open={open} handler={onCancel}>
            <DialogHeader>Bild auswählen</DialogHeader>
            <DialogBody className={'max-h-[30rem] overflow-auto'}>
                <div className={`flex gap-2 flex-wrap`}>
                    {images.map(image =>
                        <div key={image.filename}
                             className={`rounded p-2 border border-transparent hover:border-gray-300 hover:cursor-pointer hover:shadow hover:scale-105 ${selectedImage === image.filename ? 'bg-gray-200' : null}`}
                             onClick={() => onSelect(image.filename)}>
                            <Image filename={image.filename} className={`rounded-sm ${styles.image}`} />
                            <span className={`block text-gray-700 ${styles.label}`}>{image.filename}</span>
                        </div>
                    )}
                </div>
            </DialogBody>
            <DialogFooter>
                <Button variant='outlined' className='text-primary border-primary' onClick={onCancel}>Cancel</Button>
            </DialogFooter>
        </Dialog>
    )
}