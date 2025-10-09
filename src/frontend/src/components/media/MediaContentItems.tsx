import {MediaContentItemData} from '@/types/mediaContentItemData'
import styles from './MediaContentItems.module.css'
import Image from '@/components/shared/Image'
import {useState} from 'react'
import MediaItemViewDialog from '@/components/media/MediaItemViewDialog'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {ConfirmDeleteImageDialog} from '@/components/media/ConfirmDeleteImageDialog'
import {authFetch} from '@/utils/authFetch'

type MediaContentItemProps = {
    images: MediaContentItemData[];
    onImageDeleted: (filename: string) => void;
    onDeleteResult: (message: string) => void;
};

export default function MediaContentItems({images, onImageDeleted, onDeleteResult}: MediaContentItemProps) {
    const [showImgView, setShowImgView] = useState<boolean>(false)
    const [imgViewFilename, setImgViewFilename] = useState<string>('')
    const [imageToDelete, setImageToDelete] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)

    const imageClickHandler = (filename: string) => {
        setImgViewFilename(filename)
        setShowImgView(true)
    }

    const closeImgViewHandler = () => {
        setShowImgView(false)
        setImgViewFilename('')
    }

    const openDeleteConfirmation = (e: React.MouseEvent, filename: string) => {
        e.stopPropagation() // Verhindert, dass die Detailansicht geöffnet wird
        setImageToDelete(filename)
        setShowDeleteConfirm(true)
    }

    const handleDeleteConfirmed = async () => {
        if (!imageToDelete) return
        const backendApiUrl = getBackendApiUrl()
        try {
            const response = await authFetch(backendApiUrl + '/image/delete/' + imageToDelete, {
                method: 'DELETE',
            })
            const responseText = await response.text()
            console.log(responseText)
            onDeleteResult(responseText)
            onImageDeleted(imageToDelete)
        } catch (err) {
            console.error(err)
            onDeleteResult(err)
        }
        setShowDeleteConfirm(false)
        setImageToDelete(null)
    }

    const cancelDelete = () => {
        setShowDeleteConfirm(false)
        setImageToDelete(null)
    }

    return (
        <>
            <div className={styles.gridContainer}>
                {images.map((image) => (
                    <div key={image.filename} className={styles.imageWrapper}>
                        <div className={styles.imageContainer} onClick={() => imageClickHandler(image.filename)}>
                            <Image
                                filename={image.filename}
                                className={styles.image}/>
                            {/* "X"-Button als Overlay */}
                            <button className={styles.deleteButton}
                                    onClick={(e) => openDeleteConfirmation(e, image.filename)}>
                                X
                            </button>
                        </div>
                        <span className={`w-full text-wrap break-words ${styles.filenameText}`}>{image.filename}</span>
                    </div>
                ))}
            </div>

            <MediaItemViewDialog
                open={showImgView}
                filename={imgViewFilename}
                onClose={closeImgViewHandler}/>


            <ConfirmDeleteImageDialog
                open={showDeleteConfirm}
                filename={imageToDelete ?? ''}
                onClose={cancelDelete}
                onDeleted={handleDeleteConfirmed}
            />
        </>
    )
}
