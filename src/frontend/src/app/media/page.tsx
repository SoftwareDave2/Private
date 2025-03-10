'use client'

import PageHeader from "@/components/layout/PageHeader";
import PageHeaderButton from "@/components/layout/PageHeaderButton";
import React, { useState, useEffect, useRef, useMemo } from "react";
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

    const handleImageDeleted = (filename: string) => {
        updateImages()
            .then(() => console.log('Images updated!'))
            .catch(err => console.error('Error updating images', err));
    };

    const updateImages = async () => {
        const response = await fetch(backendApiUrl + '/image/download/all');
        const filenames = (await response.json()) as string[];
        // Beispielhaft: Falls uploadDate nicht vorhanden ist, setzen wir hier das aktuelle Datum.
        setImages(
            filenames.map(f => ({ filename: f, uploadDate: new Date().toISOString() } as MediaContentItemData))
        );
    };

    // Sortiere Bilder basierend auf der gewählten Option
    const sortedImages = useMemo(() => {
        return [...images].sort((a, b) => {
            if (sortOption === "filename") {
                return a.filename.localeCompare(b.filename);
            } else if (sortOption === "uploadDate") {
                //return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
                return 0;
            }
            return 0;
        });
    }, [images, sortOption]);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        updateImages()
            .then(() => console.log('Images loaded!'))
            .catch(err => console.error('Error loading images', err));
    }, []);

    return (
        <main>
            <PageHeader title={'Mediathek'} info={''}>
                <PageHeaderButton onClick={handleDialogOpen}>Hochladen</PageHeaderButton>
            </PageHeader>

            {/* Material Tailwind Dropdown zur Sortierung */}
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

            {/* Anzeige der sortierten Bilder */}
            <MediaContentItems images={sortedImages} onImageDeleted={handleImageDeleted} />

            <UploadMediaDialog open={dialogOpen} onCancel={handleDialogOpen} onSaved={handleImageUpload} />
        </main>
    );
}
