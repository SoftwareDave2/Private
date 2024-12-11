import {MediaContentItemData} from "@/types/mediaContentItemData";
import styles from './MediaContentItems.module.css'
import Image from "@/components/shared/Image";

type MediaContentItemProps = {
    images: MediaContentItemData[]
}

export default function MediaContentItems({images}: MediaContentItemProps) {
    return (
        <div className={`flex gap-2 flex-wrap`}>
            {images.map(image =>
                <div key={image.filename}>
                    <Image filename={image.filename} className={`rounded-sm ${styles.image}`} />
                    <span className={`block text-xs text-gray-700`}>{image.filename}</span>
                </div>
            )}
        </div>
    )
}