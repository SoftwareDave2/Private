'use client'

import {Button} from '@material-tailwind/react'
import {useState, useEffect, useRef} from 'react'
import styles from './SelectImage.module.css'
import SelectImageDialog from "@/components/edit-display/SelectImageDialog";
import {MediaContentItemData} from "@/types/mediaContentItemData";

type SelectImageProps = {
    selectedFilename?: string,
    onSelect: (filename: string) => void
}

export default function SelectImage({selectedFilename, onSelect}: SelectImageProps) {

    const backendApiUrl = 'http://localhost:8080'

    const hasFetched = useRef(false)
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const [images, setImages] = useState<MediaContentItemData[]>([])

    const handleDialogOpen = () => setDialogOpen(!dialogOpen)

    const selectHandler = (filename: string) => {
        onSelect(filename)
        handleDialogOpen()
    }

    const updateImages = async () => {
        const response = await fetch(backendApiUrl + '/image/download/all')
        const filenames = (await response.json()) as string[]
        setImages(filenames.map(f => ({ filename: f } as MediaContentItemData)))
    }

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        updateImages()
            .catch(err => console.error(err))
    }, []);

    return (
        <>
            <div className={`flex gap-3 items-center`}>
                {selectedFilename && (
                    <div>
                        <img src={`/uploads/${selectedFilename}`} alt={''} className={`rounded-sm ${styles.image}`}/>
                        <span className={`block text-xs text-gray-700`}>{selectedFilename}</span>
                    </div>
                )}
                <Button type={'button'} variant='outlined' className={`text-blue-gray-400 border-blue-gray-200`}  onClick={handleDialogOpen}>Bild auswählen</Button>
            </div>
            <SelectImageDialog open={dialogOpen}
                               selectedImage={selectedFilename}
                               images={images}
                               onCancel={handleDialogOpen}
                               onSelect={selectHandler} />
        </>
    )
}