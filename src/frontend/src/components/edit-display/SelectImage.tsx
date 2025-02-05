'use client'

import {Button} from '@material-tailwind/react'
import {useState, useEffect, useRef} from 'react'
import styles from './SelectImage.module.css'
import SelectImageDialog from "@/components/edit-display/SelectImageDialog";
import {MediaContentItemData} from "@/types/mediaContentItemData";
import Image from "@/components/shared/Image";
import {ImageData} from "@/types/imageData";

type SelectImageProps = {
    selectedFilename?: string,
    width?: number,
    height?: number,
    onSelect: (filename: string) => void
    onUnselect: () => void
}

export default function SelectImage({selectedFilename, width, height, onSelect, onUnselect}: SelectImageProps) {

    const backendApiUrl = 'http://localhost:8080'

    const hasFetched = useRef(false)
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const [images, setImages] = useState<ImageData[]>([])
    const [filteredImages, setFilteredImages] = useState<ImageData[]>([])

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        fetchImages()
            .catch(err => console.error(err))
    }, []);

    useEffect(() => updateFilteredImages(), [images])

    useEffect(() => {
        // Check current image resolution
        if (selectedFilename) {
            const selectedImgWidth = imageWidth() ?? 0
            const selectedImgHeight = imageHeight() ?? 0
            if (!isResolutionMatch(selectedImgWidth, selectedImgHeight)) {
                onUnselect()
            }
        }

        updateFilteredImages()
    }, [width, height]);

    const fetchImages = async () => {
        const response = await fetch(backendApiUrl + '/image/download/all')
        const filenames = (await response.json()) as string[]
        updateImageData(filenames)
    }

    const updateImageData = (filenames: string[]) => {
        const newImages: ImageData[] = []
        let loadedCount = 0

        const checkAndUpdate = () => {
            loadedCount++
            if (loadedCount === filenames.length) {
                setImages(newImages)
            }
        }

        filenames.forEach(filename => {
            const image: HTMLImageElement = document.createElement('img')
            image.onload = () => {
                newImages.push({
                    filename: filename,
                    width: image.width,
                    height: image.height
                })
                checkAndUpdate()
            }
            image.onerror = () => {
                checkAndUpdate()
            }
            image.src = 'uploads/' + filename
        })
    }

    const isResolutionMatch = (imgWidth: number, imgHeight: number) => {
        const tolerance = 5
        return Math.abs(imgWidth - (width ?? 0)) <= tolerance &&
            Math.abs(imgHeight - (height ?? 0)) <= tolerance
    }

    const updateFilteredImages = () => {
        if (!width || !height) {
            setFilteredImages(images)
        } else {
            const filtered: ImageData[] = []
            images.forEach(i => {
                if (isResolutionMatch(i.width, i.height)) {
                    filtered.push(i)
                }
            })
            setFilteredImages(filtered)
        }
    }

    const getCurrentImageData = () => {
        const selectedImage = images.filter(i => i.filename === selectedFilename)
        return selectedImage.length > 0 ? selectedImage[0] : null
    }

    const imageWidth = () => getCurrentImageData()?.width
    const imageHeight = () => getCurrentImageData()?.height

    const handleDialogOpen = () => setDialogOpen(!dialogOpen)

    const selectHandler = (filename: string) => {
        onSelect(filename)
        handleDialogOpen()
    }

    return (
        <>
            <div className={`flex gap-3 items-center`}>
                {selectedFilename && (
                    <div>
                        <Image filename={selectedFilename} className={`rounded-sm ${styles.image}`} />
                        <span className={`block text-xs text-gray-700`}>{selectedFilename}</span>
                        <span className={'block text-xs text-gray-700'}>({imageWidth()}x{imageHeight()})</span>
                    </div>
                )}
                <Button type={'button'} variant='outlined' className={`text-blue-gray-400 border-blue-gray-200`}
                        onClick={handleDialogOpen}>Bild auswählen</Button>
            </div>
            <SelectImageDialog open={dialogOpen}
                               selectedImage={selectedFilename}
                               images={filteredImages}
                               onCancel={handleDialogOpen}
                               onSelect={selectHandler} />
        </>
    )
}