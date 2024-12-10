import React from "react";

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    filename: string
}

export default function Image({filename, ...props}: ImageProps) {
    const imageFolderPath = '/uploads/'

    return (
        <img src={imageFolderPath + filename} alt={''} {...props} />
    )
}