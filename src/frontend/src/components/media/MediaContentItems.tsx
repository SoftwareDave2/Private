import {MediaContentItemData} from "@/types/mediaContentItemData";
import styles from './MediaContentItems.module.css'
import Image from "@/components/shared/Image";
import {useState} from "react";
import MediaItemViewDialog from "@/components/media/MediaItemViewDialog";

type MediaContentItemProps = {
    images: MediaContentItemData[],
    onImageDeleted: (filename: string) => void,
}

export default function MediaContentItems({images, onImageDeleted}: MediaContentItemProps) {
    const [showImgView, setShowImgView] = useState<boolean>(false)
    const [imgViewFilename, setImgViewFilename] = useState<string>("")

    const imageClickHandler = (filename: string) => {
        setImgViewFilename(filename)
        setShowImgView(true)
    }

    const closeImgViewHandler = () => {
        setShowImgView(false)
        setImgViewFilename("")
    }

    const imgDeletedHandler = () => {
        const filename = imgViewFilename
        closeImgViewHandler()
        onImageDeleted(filename)
    }

    return (
        <>
            <div className={`flex gap-2 flex-wrap`}>
                {images.map(image =>
                    <div key={image.filename}>
                        <Image filename={image.filename} className={`rounded-sm ${styles.image}`}
                               onClick={() => imageClickHandler(image.filename)} />
                        <span className={`block text-xs text-gray-700`}>{image.filename}</span>
                    </div>
                )}
            </div>
            <MediaItemViewDialog open={showImgView} filename={imgViewFilename}
                                 onClose={closeImgViewHandler} onDeleted={imgDeletedHandler} />
        </>
    )
}