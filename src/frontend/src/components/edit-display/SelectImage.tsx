'use client'

import {Button} from '@material-tailwind/react'
import {useState, useEffect, useRef} from 'react'
import styles from './SelectImage.module.css'
import SelectImageDialog from "@/components/edit-display/SelectImageDialog";
import {MediaContentItemData} from "@/types/mediaContentItemData";
import Image from "@/components/shared/Image";
import {ImageData} from "@/types/imageData";
import {getBackendApiUrl} from "@/utils/backendApiUrl";
import {authFetch} from "@/utils/authFetch";

type SelectImageProps = {
    selectedFilename?: string,
    selectedDisplayMac?: string,
    screenWidth?: number,
    screenHeight?: number,
    screenOrientation?: string,
    onSelect: (filename: string) => void
    onUnselect: () => void
}


export default function SelectImage({selectedFilename, selectedDisplayMac, screenWidth, screenHeight, screenOrientation, onSelect, onUnselect}: SelectImageProps) {

    const backendApiUrl = getBackendApiUrl();

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
            if (selectedImgWidth > 0 && selectedImgHeight > 0 &&
                !isResolutionMatch(selectedImgWidth, selectedImgHeight)) {
                onUnselect()
            }
        }

        updateFilteredImages()
    }, [screenWidth, screenHeight]);

    const fetchImages = async () => {
        // Use the appropriate endpoint based on sortOption.
        const endpoint =  '/image/listByFilename';
        const response = await authFetch(backendApiUrl + endpoint);
        const data = (await response.json()) as MediaContentItemData[];
        updateImageData(data)
    };

    const updateImageData = (contentItemData: MediaContentItemData[]) => {
        const newImages: ImageData[] = []
        let loadedCount = 0

        const checkAndUpdate = () => {
            loadedCount++
            if (loadedCount === contentItemData.length) {
                setImages(newImages)
            }
        }

        contentItemData.forEach(contentItem => {
            const image: HTMLImageElement = document.createElement('img')
            image.onload = () => {
                newImages.push({
                    filename: contentItem.filename,
                    width: image.width,
                    height: image.height
                })
                checkAndUpdate()
            }
            image.onerror = () => {
                checkAndUpdate()
            }
            image.src = 'uploads/' + contentItem.filename
        })
    }

    const isResolutionMatch = (imgWidth: number, imgHeight: number) => {
        //const tolerance = 1
        //const isMatch = Math.abs(imgWidth - (width ?? 0)) <= tolerance && Math.abs(imgHeight - (height ?? 0)) <= tolerance
        // Sicherstellen, dass sowohl Bildschirmauflösung als auch Bildhöhe gültig sind
        if (!screenWidth || !screenHeight || !screenOrientation || imgHeight === 0 || imgWidth ===0) {
            return false;
        }
        let screenRatio = screenWidth / screenHeight; // screen ratio if orientation is vertical
        if (screenOrientation=="horizontal"){ // switch width and height for ratio calculation if screen orientation is horizontal
            screenRatio = screenHeight / screenWidth;
        }

        const tolerance = 0.10; // 10% Toleranz


        const imgRatio = imgWidth / imgHeight;
        const isMatch = imgRatio / screenRatio >= (1 - tolerance) && imgRatio / screenRatio <= (1 + tolerance);


        return isMatch
    }

    const updateFilteredImages = () => {
        if (!screenWidth || !screenHeight) {
            setFilteredImages(images)
            //console.log("width"+ screenWidth + "height" + screenHeight+ "images" + images)
        } else {
            //console.log("filtered: width"+ screenWidth + "height" + screenHeight+ "images" + images)
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

    const selectHandler = async (filename: string) => {

        onSelect(filename);
        handleDialogOpen();

        if (!selectedDisplayMac) {
            console.error("Mac is missing!");
            return;
        }

        try {
            const response = await authFetch(`${backendApiUrl}/oepl/send-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, mac: selectedDisplayMac }),
            });

            if (!response.ok) {
                console.error("Error while sending image:", await response.text());
            } else {
                console.log(`Image "${filename}" successfully sent to backend.`);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };



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
