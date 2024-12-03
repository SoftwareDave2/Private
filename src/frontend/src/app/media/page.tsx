'use client'

import PageHeader from "@/components/PageHeader";
import PageHeaderButton from "@/components/PageHeaderButton";
import React, {useState, useEffect, useRef} from "react";
import UploadMediaDialog from "@/components/UploadMediaDialog";
import {MediaContentItemData} from "@/types/mediaContentItemData";
import MediaContentItems from "@/components/media/MediaContentItems";

export default function Media() {

    const backendApiUrl = 'http://localhost:8080'

    const hasFetched = useRef(false)
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const [images, setImages] = useState<MediaContentItemData[] | null>(null)

    const handleDialogOpen = () => setDialogOpen(!dialogOpen)

    const handleImageUpload = () => {
        updateImages()
            .then(() => console.log('Images updated!'))
            .catch(err => console.error('Error updating images', err))

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
            .then(() => { console.log('Images loaded!') })
            .catch(err => console.error('Error loading images', err))
    }, [])

    return (
        <main>
            <PageHeader title={'Mediathek'} info={''}>
                <PageHeaderButton onClick={handleDialogOpen}>Hochladen</PageHeaderButton>
            </PageHeader>

            {images && <MediaContentItems images={images} />}

            <UploadMediaDialog open={dialogOpen} cancelHandler={handleDialogOpen} savedHandler={handleImageUpload} />
        </main>
    )
}