'use client'

import PageHeader from "@/components/layout/PageHeader";
import PageHeaderButton from "@/components/layout/PageHeaderButton";
import React, { useState, useEffect, useRef } from "react";
import UploadMediaDialog from "@/components/media/UploadMediaDialog";
import { MediaContentItemData } from "@/types/mediaContentItemData";
import MediaContentItems from "@/components/media/MediaContentItems";
import { getBackendApiUrl } from "@/utils/backendApiUrl";
import { Select, Option, Dialog, DialogHeader, DialogBody, DialogFooter, Button } from "@material-tailwind/react";

export default function Media() {
    const backendApiUrl = getBackendApiUrl();
    const hasFetched = useRef(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [images, setImages] = useState<MediaContentItemData[]>([]);
    const [sortOption, setSortOption] = useState<"filename" | "uploadDate">("filename");
    const [deletePopup, setDeletePopup] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

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

    const showDeletePopup = (message: string) => {
        setDeletePopup({ open: true, message });
    };

    const closeDeletePopup = () => {
        setDeletePopup({ open: false, message: '' });
    };

    const updateImages = async () => {
        // Endpunkt entsprechend der Sortierung wählen
        const endpoint = sortOption === "filename" ? '/image/listByFilename' : '/image/listByDate';
        const response = await fetch(backendApiUrl + endpoint);
        const data = (await response.json()) as MediaContentItemData[];
        setImages(data);
    };

    // Initialer Abruf der Bilder beim Mount
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        updateImages()
            .then(() => console.log('Images loaded!'))
            .catch(err => console.error('Error loading images', err));
    }, []);

    // Bilder neu laden, wenn sich die Sortierung ändert
    useEffect(() => {
        updateImages()
            .then(() => console.log('Images updated on sort change!'))
            .catch(err => console.error('Error updating images on sort change', err));
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

            <MediaContentItems
                images={images}
                onImageDeleted={handleImageDeleted}
                onDeleteResult={showDeletePopup}
            />

            <UploadMediaDialog open={dialogOpen} onCancel={handleDialogOpen} onSaved={handleImageUpload} />

            {/* Popup zur Anzeige des Lösch-Ergebnisses */}
            <Dialog open={deletePopup.open} handler={closeDeletePopup}>
                <DialogHeader>Löschen</DialogHeader>
                <DialogBody>
                    {deletePopup.message}
                </DialogBody>
                <DialogFooter>
                    <Button variant="filled" color="primary" onClick={closeDeletePopup}>
                        OK
                    </Button>
                </DialogFooter>
            </Dialog>
        </main>
    );
}
