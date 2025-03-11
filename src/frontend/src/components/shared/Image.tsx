import React, { SyntheticEvent } from "react";
import { getBackendApiUrl } from "@/utils/backendApiUrl";

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    internalName: string,
    onImageLoaded?: (width: number, height: number) => void
}

export default function Image({ internalName, onImageLoaded, ...props }: ImageProps) {
    const imageUrl = `${getBackendApiUrl()}/image/download/${internalName}`;

    const loadedHandler = (e: SyntheticEvent<HTMLImageElement, Event>) => {
        e.preventDefault();
        const img = e.target as HTMLImageElement;
        if (onImageLoaded) {
            onImageLoaded(img.naturalWidth, img.naturalHeight);
        }
    }

    return (
        <img src={imageUrl} alt={''} {...props} onLoad={loadedHandler} />
    );
}
