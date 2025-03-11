import { MediaContentItemData } from "@/types/mediaContentItemData";
import styles from "./MediaContentItems.module.css";
import Image from "@/components/shared/Image";
import { useState } from "react";
import MediaItemViewDialog from "@/components/media/MediaItemViewDialog";

type MediaContentItemProps = {
    images: MediaContentItemData[];
    onImageDeleted: (internalName: string) => void;
};

export default function MediaContentItems({ images, onImageDeleted }: MediaContentItemProps) {
    // Store the entire image object so both display name and internalName are available.
    const [selectedImage, setSelectedImage] = useState<MediaContentItemData | null>(null);
    const [showImgView, setShowImgView] = useState<boolean>(false);

    const imageClickHandler = (image: MediaContentItemData) => {
        setSelectedImage(image);
        setShowImgView(true);
    };

    const closeImgViewHandler = () => {
        setShowImgView(false);
        setSelectedImage(null);
    };

    const imgDeletedHandler = () => {
        if (selectedImage) {
            onImageDeleted(selectedImage.internalName);
        }
        closeImgViewHandler();
    };

    return (
        <>
            <div className={styles.gridContainer}>
                {images.map((image) => (
                    <div key={image.internalName} className={styles.imageWrapper}>
                        <div className={styles.imageContainer}>
                            <Image
                                internalName={image.internalName}
                                className={styles.image}
                                onClick={() => imageClickHandler(image)}
                            />
                        </div>
                        <span className={styles.filenameText}>{image.filename}</span>
                    </div>
                ))}
            </div>
            {selectedImage && (
                <MediaItemViewDialog
                    open={showImgView}
                    filename={selectedImage.filename}
                    internalName={selectedImage.internalName}
                    id={selectedImage.id}
                    onClose={closeImgViewHandler}
                    onDeleted={imgDeletedHandler}
                />
            )}
        </>
    );
}
