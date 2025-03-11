'use client'

import { Button } from '@material-tailwind/react'
import { useState, useEffect, useRef } from 'react'
import styles from './SelectImage.module.css'
import SelectImageDialog from "@/components/edit-display/SelectImageDialog";
import { MediaContentItemData } from "@/types/mediaContentItemData";
import Image from "@/components/shared/Image";
import { ImageData } from "@/types/imageData";
import { getBackendApiUrl } from "@/utils/backendApiUrl";

type SelectImageProps = {
    selectedFilename?: string,
    screenWidth?: number,
    screenHeight?: number,
    screenOrientation?: string,
    onSelect: (filename: string) => void,
    onUnselect: () => void
}

export default function SelectImage({ selectedFilename, screenWidth, screenHeight, screenOrientation, onSelect, onUnselect }: SelectImageProps) {

    const backendApiUrl = getBackendApiUrl();
    const hasFetched = useRef(false)
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const [images, setImages] = useState<ImageData[]>([])
    const [filteredImages, setFilteredImages] = useState<ImageData[]>([])

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true
        fetchImages().catch(err => console.error(err))
    }, []);

    useEffect(() => updateFilteredImages(), [images])

    useEffect(() => {
        // Check current image resolution
        if (selectedFilename) {
            const selectedImgWidth = imageWidth() ?? 0
            const selectedImgHeight = imageHeight() ?? 0
            if (selectedImgWidth > 0 && selectedImgHeight > 0 &&
                !isResolutionMatch(selectedImgWidth, selectedImgHeight)) {
                onUnselect()
            }
        }
        updateFilteredImages()
    }, [screenWidth, screenHeight]);

    // Fetch images from new endpoint that returns an array of ImageData objects.
    const fetchImages = async () => {
        const response = await fetch(backendApiUrl + '/image/listByDate')
        const imagesFromApi = (await response.json()) as ImageData[]
        updateImageData(imagesFromApi)
    }

    // For each image from the API, we create a temporary image element
    // to load it from our backend download endpoint (using internalName) and measure its dimensions.
    const updateImageData = (imagesFromApi: ImageData[]) => {
        const newImages: ImageData[] = []
        let loadedCount = 0

        const checkAndUpdate = () => {
            loadedCount++
            if (loadedCount === imagesFromApi.length) {
                setImages(newImages)
            }
        }

        imagesFromApi.forEach(imgData => {
            const imageElement: HTMLImageElement = document.createElement('img')
            imageElement.onload = () => {
                newImages.push({
                    filename: imgData.filename,           // display name
                    internalName: imgData.internalName,       // internal name used for download
                    width: imageElement.width,
                    height: imageElement.height
                })
                checkAndUpdate()
            }
            imageElement.onerror = () => {
                checkAndUpdate()
            }
            imageElement.src = `${backendApiUrl}/image/download/${imgData.internalName}`
        })
    }

    const isResolutionMatch = (imgWidth: number, imgHeight: number) => {
        if (!screenWidth || !screenHeight || !screenOrientation || imgHeight === 0 || imgWidth === 0) {
            return false;
        }
        let screenRatio = screenWidth / screenHeight;
        if (screenOrientation === "horizontal"){
            screenRatio = screenHeight / screenWidth;
        }
        const tolerance = 0.05; // 5% tolerance
        const imgRatio = imgWidth / imgHeight;
        return imgRatio / screenRatio >= (1 - tolerance) && imgRatio / screenRatio <= (1 + tolerance);
    }

    const updateFilteredImages = () => {
        if (!screenWidth || !screenHeight) {
            setFilteredImages(images)
        } else {
            const filtered = images.filter(i => isResolutionMatch(i.width, i.height))
            setFilteredImages(filtered)
        }
    }

    // Lookup the full image data based on the selected display filename.
    const getCurrentImageData = () => {
        return images.find(i => i.filename === selectedFilename) || null;
    }

    const imageWidth = () => getCurrentImageData()?.width
    const imageHeight = () => getCurrentImageData()?.height

    const handleDialogOpen = () => setDialogOpen(!dialogOpen)

    // When an image is selected, we pass the display filename to onSelect.
    const selectHandler = (filename: string) => {
        onSelect(filename)
        handleDialogOpen()
    }

    return (
        <>
            <div className={`flex gap-3 items-center`}>
                {selectedFilename && getCurrentImageData() && (
                    <div>
                        {/* Pass the internalName to the Image component */}
                        <Image internalName={getCurrentImageData()!.internalName} className={`rounded-sm ${styles.image}`} />
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
