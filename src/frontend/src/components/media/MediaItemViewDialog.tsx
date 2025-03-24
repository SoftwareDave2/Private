import {Button, Dialog, DialogBody, DialogFooter, DialogHeader} from '@material-tailwind/react'
import Image from '@/components/shared/Image'
import styles from './MediaItemViewDialog.module.css'
import {useState} from 'react'
import {ConfirmDeleteImageDialog} from '@/components/media/ConfirmDeleteImageDialog'
import {getBackendApiUrl} from '@/utils/backendApiUrl'

type MediaItemViewDialogProps = {
    open: boolean,
    filename: string,
    onClose: () => void,
}

export default function MediaItemViewDialog({open, filename, onClose}: MediaItemViewDialogProps) {

    const [width, setWidth] = useState<number | undefined>()
    const [height, setHeight] = useState<number | undefined>()

    const loadedHandler = (imgWidth: number, imgHeight: number) => {
        setWidth(imgWidth)
        setHeight(imgHeight)
    }

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
            </DialogBody>
            <DialogFooter className={'justify-between'}>
                <Button variant={'outlined'} className={'text-primary border-primary'} onClick={onClose}>
                    Close
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
