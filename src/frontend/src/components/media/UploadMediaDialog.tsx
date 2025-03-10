'use client'

import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"
import {open} from "@material-tailwind/react/types/components/dialog";
import {useState} from 'react'
import UploadMediaButton from "@/components/media/UploadMediaButton";
import InvalidFileAlert from "@/components/media/InvalidFileAlert";

type UploadMediaDialogProps = {
    open: open,
    onCancel: () => void,
    onSaved: () => void,
}

type ImageDimensions = {
    width: Number,
    height: Number,
}

export default function UploadMediaDialog({open, onCancel, onSaved}: UploadMediaDialogProps) {

    const [file, setFile] = useState<File | null>(null)
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null)
    const [uploadError, setUploadError] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(false)
        setFile(null)

        if (e.target.files) {
            const newFile: File = e.target.files[0]
            const fileSize = (newFile.size / (1024 * 1024))
            if (fileSize > 5) {
                setUploadError(true)
                return
            }

            setFile(newFile)

            let img = new Image()
            const imgUrl = window.URL.createObjectURL(newFile)
            img.onload = () => {
                setImageDimensions({
                    width: img.width,
                    height: img.height,
                })
                window.URL.revokeObjectURL(imgUrl)
            }

            img.src = imgUrl
        }
    }

    const resetFiles = () => {
        setFile(null)
        setImageDimensions(null)
        setUploadError(false)
    }

    const handleCancel = () => {
        resetFiles()
        onCancel()
    }

    const handleSaved = () => {
        resetFiles()
        if (file) {
            onSaved()
        } else {
            onCancel()
        }
    }

    return (
        <Dialog open={open} handler={onCancel}>
            <DialogHeader>Hochladen</DialogHeader>
            <DialogBody>
                {uploadError && <InvalidFileAlert />}
                <p className=''>Ausgewählte Dateien:</p>
                {file && imageDimensions && (
                    <div className='ms-2 flex gap-4'>
                        <span>{file.name}</span>
                        <span>{file.type}</span>
                        <span>{imageDimensions.width} x {imageDimensions.height}</span>
                    </div>
                )}

                {!file && (
                    <div className='flex justify-center mt-6'>
                        <input type='file' accept='image/png, image/jpeg' onChange={handleFileChange}/>
                    </div>
                )}

            </DialogBody>
            <DialogFooter className='space-x-2'>
                <Button variant='outlined' className='text-primary border-primary' onClick={handleCancel}>Cancel</Button>
                <UploadMediaButton file={file} onClick={handleSaved} />
            </DialogFooter>
        </Dialog>
    )
}