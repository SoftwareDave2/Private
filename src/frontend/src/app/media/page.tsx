'use client'

import PageHeader from "@/components/layout/PageHeader";
import PageHeaderButton from "@/components/layout/PageHeaderButton";
import React, {useState, useEffect, useRef} from "react";
import UploadMediaDialog from "@/components/media/UploadMediaDialog";
import {MediaContentItemData} from "@/types/mediaContentItemData";
import MediaContentItems from "@/components/media/MediaContentItems";
import {getBackendApiUrl} from "@/utils/backendApiUrl";

export default function Media() {

    // const host = window.location.hostname;
    // const backendApiUrl = 'http://' + host + ':8080';
    const backendApiUrl = getBackendApiUrl();

    const hasFetched = useRef(false)
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const [images, setImages] = useState<MediaContentItemData[]>([])

    const handleDialogOpen = () => setDialogOpen(!dialogOpen)

    const handleImageUpload = () => {
        updateImages()
            .then(() => console.log('Images updated!'))
            .catch(err => console.error('Error updating images', err))

        handleDialogOpen()
    }

    const handleImageDeleted = (filename: string) => {
        updateImages()
            .then(() => console.log('Images updated!'))
            .catch(err => console.error('Error updating images', err))
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

            <MediaContentItems images={images} onImageDeleted={handleImageDeleted} />

            <UploadMediaDialog open={dialogOpen} onCancel={handleDialogOpen} onSaved={handleImageUpload} />
        </main>
    )
}