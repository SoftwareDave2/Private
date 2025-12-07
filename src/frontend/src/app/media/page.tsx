'use client'

import PageHeader from '@/components/layout/PageHeader'
import PageHeaderButton from '@/components/layout/PageHeaderButton'
import React, {useState, useEffect, useRef} from 'react'
import UploadMediaDialog from '@/components/media/UploadMediaDialog'
import {MediaContentItemData} from '@/types/mediaContentItemData'
import MediaContentItems from '@/components/media/MediaContentItems'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'
import {Select, Option, Dialog, DialogHeader, DialogBody, DialogFooter, Button} from '@material-tailwind/react'
import ImageDeleteResultDialog from '@/components/media/ImageDeleteResultDialog'
import UploadConfirmedDialog from '@/components/media/UploadConfirmedDialog'
import {Images, LayoutGrid} from 'lucide-react'

export default function Media() {
    type TemplateDefinition = {
        templateType: string
        name: string
        description?: string
        displayWidth: number
        displayHeight: number
        svgContent: string
    }

    const backendApiUrl = getBackendApiUrl()
    const hasFetched = useRef(false)
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const [images, setImages] = useState<MediaContentItemData[]>([])
    const [templates, setTemplates] = useState<TemplateDefinition[]>([])
    const [sortOption, setSortOption] = useState<'filename' | 'uploadDate'>('filename')
    const [deletePopup, setDeletePopup] = useState<{ open: boolean; message: string }>({open: false, message: ''})
    const [uploadPopup, setUploadPopup] = useState<{ open: boolean; message: string }>({open: false, message: ''})
    const [showImages, setShowImages] = useState<boolean>(true)
    const [showTemplates, setShowTemplates] = useState<boolean>(false)

    const handleDialogOpen = () => setDialogOpen(prev => !prev)

    // Wird vom UploadMediaDialog nach erfolgreichem Upload mit dem finalen Dateinamen aufgerufen
    const handleUploadComplete = (finalFileName: string) => {
        updateImages()
            .then(() => console.log('Images updated!'))
            .catch(err => console.error('Error updating images', err))
        setUploadPopup({
            open: true,
            message: `Bild wurde unter dem Namen ${finalFileName} erfolgreich hochgeladen.`,
        })
    }

    const handleImageDeleted = (filename: string) => {
        updateImages()
            .then(() => console.log('Images updated!'))
            .catch(err => console.error('Error updating images', err))
    }

    const showDeletePopup = (message: string) => {
        setDeletePopup({open: true, message})
    }

    const closeDeletePopup = () => {
        setDeletePopup({open: false, message: ''})
    }

    const closeUploadPopup = () => {
        setUploadPopup({open: false, message: ''})
    }

    const updateImages = async () => {
        const endpoint = sortOption === 'filename' ? '/image/listByFilename' : '/image/listByDate'
        const response = await authFetch(backendApiUrl + endpoint)
        const data = (await response.json()) as MediaContentItemData[]
        setImages(data)
    }

    const updateTemplates = async () => {
        const response = await authFetch(backendApiUrl + '/oepl/templates')
        const data = (await response.json()) as TemplateDefinition[]
        setTemplates(data)
    }

    // Initialer Abruf der Bilder beim Mount
    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true
        Promise.all([updateImages(), updateTemplates()])
            .then(() => console.log('Media loaded!'))
            .catch(err => console.error('Error loading media', err))
    }, [])

    // Bilder neu laden, wenn sich die Sortierung ändert
    useEffect(() => {
        updateImages()
            .then(() => console.log('Images updated on sort change!'))
            .catch(err => console.error('Error updating images on sort change', err))
    }, [sortOption])

    return (
        <main>
            <PageHeader title={'Mediathek'} info={''}>
                <div className="mt-[-40px]">
                    <PageHeaderButton onClick={handleDialogOpen}>Hochladen</PageHeaderButton>
                </div>
            </PageHeader>

            <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowImages((prev) => !prev)}
                        className={`flex items-center gap-2 rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors ${
                            showImages
                                ? 'border-red-400 bg-red-50 text-red-700 shadow-sm'
                                : 'border-slate-300 text-slate-600'
                        }`}
                    >
                        <Images className="h-4 w-4" />
                        Bilder
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowTemplates((prev) => !prev)}
                        className={`flex items-center gap-2 rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors ${
                            showTemplates
                                ? 'border-red-400 bg-red-50 text-red-700 shadow-sm'
                                : 'border-slate-300 text-slate-600'
                        }`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Templates
                    </button>
                </div>
                <div className="flex justify-center">
                    <Select label="Sortieren nach" value={sortOption}
                            onChange={(value) => setSortOption(value as 'filename' | 'uploadDate')}>
                        <Option value="filename">Dateiname</Option>
                        <Option value="uploadDate">Upload Datum</Option>
                    </Select>
                </div>
            </div>

            {showImages && (
                <MediaContentItems
                    images={images}
                    onImageDeleted={handleImageDeleted}
                    onDeleteResult={showDeletePopup}/>
            )}

            {showTemplates && (
                <div className="mt-8">
                    <h2 className="mb-3 text-lg font-semibold text-slate-800">Template Vorlagen</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {templates.map((tpl) => (
                            <div key={`${tpl.templateType}-${tpl.name}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{tpl.templateType}</p>
                                        <p className="text-sm font-bold text-slate-900">{tpl.name}</p>
                                        <p className="text-xs text-slate-600">{tpl.displayWidth} x {tpl.displayHeight}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-2">
                                    <div
                                        className="max-h-48 w-full overflow-hidden [&_svg]:h-auto [&_svg]:w-full"
                                        dangerouslySetInnerHTML={{__html: tpl.svgContent}}
                                    />
                                </div>
                                {tpl.description && (
                                    <p className="mt-2 text-xs text-slate-600">{tpl.description}</p>
                                )}
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                                Keine Templates gefunden.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <UploadMediaDialog open={dialogOpen} onCancel={handleDialogOpen} onSaved={handleUploadComplete}/>

            <ImageDeleteResultDialog open={deletePopup.open} message={deletePopup.message} onClose={closeDeletePopup}/>

            <UploadConfirmedDialog open={uploadPopup.open} message={uploadPopup.message} onClose={closeUploadPopup} />
        </main>
    )
}
