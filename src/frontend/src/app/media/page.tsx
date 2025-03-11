'use client'

import PageHeader from "@/components/layout/PageHeader";
import PageHeaderButton from "@/components/layout/PageHeaderButton";
import React, { useState, useEffect, useRef } from "react";
import UploadMediaDialog from "@/components/media/UploadMediaDialog";
import { MediaContentItemData } from "@/types/mediaContentItemData";
import MediaContentItems from "@/components/media/MediaContentItems";
import { getBackendApiUrl } from "@/utils/backendApiUrl";
import { Select, Option } from "@material-tailwind/react";

export default function Media() {
    const backendApiUrl = getBackendApiUrl();
    const hasFetched = useRef(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [images, setImages] = useState<MediaContentItemData[]>([]);
    const [sortOption, setSortOption] = useState<"filename" | "uploadDate">("filename");

    const handleDialogOpen = () => setDialogOpen(!dialogOpen);

    const handleImageUpload = () => {
        updateImages()
            .then(() => console.log('Images updated!'))
            .catch(err => console.error('Error updating images', err));
        handleDialogOpen();
    };

    const handleImageDeleted = (internalName: string) => {
        updateImages()
            .then(() => console.log('Images updated!'))
            .catch(err => console.error('Error updating images', err));
    };

    const updateImages = async () => {
        // Use new endpoints to list images.
        const endpoint = sortOption === "filename" ? '/image/listByFilename' : '/image/listByDate';
        const response = await fetch(backendApiUrl + endpoint);
        const data = (await response.json()) as MediaContentItemData[];
        setImages(data);
    };

    useEffect(() => {
        updateImages()
            .then(() => console.log('Images loaded!'))
            .catch(err => console.error('Error loading images', err));
    }, [sortOption]);

    return (
        <main>
            <PageHeader title={'Mediathek'} info={''}>
                <PageHeaderButton onClick={handleDialogOpen}>Hochladen</PageHeaderButton>
            </PageHeader>

            <div className="mb-4 flex justify-center">
                <Select
                    label="Sortieren nach"
                    value={sortOption}
                    onChange={(value) => setSortOption(value as "filename" | "uploadDate")}
                >
                    <Option value="filename">Dateiname</Option>
                    <Option value="uploadDate">Upload Datum</Option>
                </Select>
            </div>

            <MediaContentItems images={images} onImageDeleted={handleImageDeleted} />

            <UploadMediaDialog open={dialogOpen} onCancel={handleDialogOpen} onSaved={handleImageUpload} />
        </main>
    );
}
