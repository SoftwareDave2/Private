'use client'

import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"
import {open, handler} from "@material-tailwind/react/types/components/dialog";
import {useState} from 'react'

type UploadMediaDialogProps = {
    open: open,
    openHandler: handler
}

type ImageDimensions = {
    width: Number,
    height: Number,
}

export default function UploadMediaDialog({open, openHandler}: UploadMediaDialogProps) {

    const [file, setFile] = useState<File | null>(null)
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFile: File = e.target.files[0]
            setFile(newFile)

            let img = new Image()
            const imgUrl = window.URL.createObjectURL(newFile)
            img.onload = () => {
                console.log('img.onload()')
                setImageDimensions({
                    width: img.width,
                    height: img.height,
                })
                window.URL.revokeObjectURL(imgUrl)
            }
            img.src = imgUrl
        }
    }

    const handleUpload = async () => {
        if (file) {
            console.log('Uploading file...')

            const formData = new FormData()
            formData.append('file', file)

            try {
                // TODO: Call Fetch-API
            } catch (error) {
                console.error('Error on uploading file.', error)
            }
        }

        handleClose()
    }

    const handleClose = () => {
        setFile(null)
        setImageDimensions(null)
        openHandler()
    }

    return (
        <Dialog open={open} handler={handler}>
            <DialogHeader>Hochladen</DialogHeader>
            <DialogBody>
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
                <Button variant='outlined' className='text-primary border-primary' onClick={handleClose}>Cancel</Button>
                <Button className='bg-primary text-white' onClick={handleUpload}>Speichern</Button>
            </DialogFooter>
        </Dialog>
    )
}