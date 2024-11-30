'use client'

import PageHeader from "@/components/PageHeader";
import PageHeaderButton from "@/components/PageHeaderButton";
import React, {useState} from "react";
import UploadMediaDialog from "@/components/UploadMediaDialog";

export default function Media() {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const handleDialogOpen = () => setDialogOpen(!dialogOpen)

    return (
        <main>
            <PageHeader title={'Mediathek'} info={''}>
                <PageHeaderButton onClick={handleDialogOpen}>Hochladen</PageHeaderButton>
            </PageHeader>

            <UploadMediaDialog open={dialogOpen} openHandler={handleDialogOpen} />
        </main>
    )
}