import React, {SyntheticEvent} from "react";

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    filename: string,
    onImageLoaded?: (width: number, height: number) => void
}

export default function Image({filename, onImageLoaded, ...props}: ImageProps) {
    const imageFolderPath = '/uploads/'

    const loadedHandler = (e: SyntheticEvent<HTMLImageElement, Event>) => {
        e.preventDefault()
        const img = e.target as HTMLImageElement
        if (onImageLoaded) {
            onImageLoaded(img.naturalWidth, img.naturalHeight)
        }
    }

    return (
        <img src={imageFolderPath + filename} alt={''} {...props} onLoad={loadedHandler} />
    )
}