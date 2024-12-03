import {MediaContentItemData} from "@/types/mediaContentItemData";
import styles from './MediaContentItems.module.css'

type MediaContentItemProps = {
    images: MediaContentItemData[]
}

export default function MediaContentItems({images}: MediaContentItemProps) {
    return (
        <div className={`flex gap-2 flex-wrap`}>
            {images.map(image =>
                <div key={image.filename}>
                    <img src={`/uploads/${image.filename}`} alt={''} className={styles.image}/>
                    <span className={`block text-xs text-gray-700`}>{image.filename}</span>
                </div>
            )}
        </div>
    )
}