import { MediaContentItemData } from "@/types/mediaContentItemData";
import styles from "./MediaContentItems.module.css";
import Image from "@/components/shared/Image";
import { useState } from "react";
import MediaItemViewDialog from "@/components/media/MediaItemViewDialog";

type MediaContentItemProps = {
    images: MediaContentItemData[];
    onImageDeleted: (filename: string) => void;
};

export default function MediaContentItems({ images, onImageDeleted }: MediaContentItemProps) {
    const [showImgView, setShowImgView] = useState<boolean>(false);
    const [imgViewFilename, setImgViewFilename] = useState<string>("");

    const imageClickHandler = (filename: string) => {
        setImgViewFilename(filename);
        setShowImgView(true);
    };

    const closeImgViewHandler = () => {
        setShowImgView(false);
        setImgViewFilename("");
    };

    const imgDeletedHandler = () => {
        const filename = imgViewFilename;
        closeImgViewHandler();
        onImageDeleted(filename);
    };

    return (
        <>
            <div className={styles.gridContainer}>
                {images.map((image) => (
                    <div key={image.filename} className={styles.imageWrapper}>
                        <div className={styles.imageContainer}>
                            <Image
                                filename={image.filename}
                                className={styles.image}
                                onClick={() => imageClickHandler(image.filename)}
                            />
                        </div>
                        <span className={styles.filenameText}>{image.filename}</span>
                    </div>
                ))}
            </div>
            <MediaItemViewDialog
                open={showImgView}
                filename={imgViewFilename}
                onClose={closeImgViewHandler}
                onDeleted={imgDeletedHandler}
            />
        </>
    );
}
