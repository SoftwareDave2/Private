'use client'
import {Button, Dialog, DialogHeader, DialogBody, DialogFooter} from '@material-tailwind/react'
import {useState} from 'react'
import UploadMediaButton from '@/components/media/UploadMediaButton'
import InvalidFileAlert from '@/components/media/InvalidFileAlert'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {checkFileNameExists} from '@/utils/checkFileNameExists'
import {authFetch} from '@/utils/authFetch'

type UploadMediaDialogProps = {
    open: boolean,
    onCancel: () => void,
    onSaved: (finalFileName: string) => void,
}

type ImageDimensions = {
    width: number,
    height: number,
}

export default function UploadMediaDialog({open, onCancel, onSaved}: UploadMediaDialogProps) {
    const backendApiUrl = getBackendApiUrl()
    const [file, setFile] = useState<File | null>(null)
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null)
    const [uploadError, setUploadError] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(false)
        setFile(null)
        if (e.target.files) {
            const newFile: File = e.target.files[0]
            const fileSize = newFile.size / (1024 * 1024)
            if (fileSize > 10) {
                setUploadError(true)
                return
            }
            setFile(newFile)
            const img = new Image()
            const imgUrl = window.URL.createObjectURL(newFile)
            img.onload = () => {
                setImageDimensions({width: img.width, height: img.height})
                window.URL.revokeObjectURL(imgUrl)
            }
            img.src = imgUrl
        }
    }

    const resetFiles = () => {
        setFile(null)
        setImageDimensions(null)
        setUploadError(false)
    }

    // Ermittelt einen verfügbaren Dateinamen (fügt bei Bedarf einen Zähler an)
    const getAvailableFileName = async (baseName: string): Promise<string> => {
        let finalName = baseName
        let counter = 1
        while (await checkFileNameExists(finalName)) {
            const nameWithoutExt = baseName.substring(0, baseName.lastIndexOf('.'))
            const extension = baseName.substring(baseName.lastIndexOf('.'))
            finalName = `${nameWithoutExt}_${counter}${extension}`
            counter++
        }
        return finalName
    }

    // Beim Klick auf "Speichern" wird der Dialog sofort geschlossen und der Upload gestartet.
    const handleUpload = async () => {
        if (!file) return
        const originalName = file.name
        const finalFileName = await getAvailableFileName(originalName)
        // Dialog sofort schließen:
        onCancel()
        const newFile = new File([file], finalFileName, {type: file.type})
        const formData = new FormData()
        formData.append('image', newFile)
        try {
            const response = await authFetch(`${backendApiUrl}/image/upload`, {
                method: 'POST',
                body: formData,
            })
            if (!response.ok) {
                throw new Error(`Upload fehlgeschlagen: ${response.status} ${response.statusText}`)
            }
            // Übergebe den finalen Dateinamen an die übergeordnete Komponente
            onSaved(finalFileName)
            resetFiles()
        } catch (error) {
            console.error('Fehler beim Hochladen des Bildes:', error)
            // Bei Bedarf kann hier noch ein Fehler-Handling erfolgen
        }
    }

    return (
        <Dialog open={open} handler={onCancel}>
            <DialogHeader>Hochladen</DialogHeader>
            <DialogBody>
                {uploadError && <InvalidFileAlert/>}
                <p className="">Ausgewählte Dateien:</p>
                {file && imageDimensions && (
                    <div className="ms-2 flex gap-4">
                        <span>{file.name}</span>
                        <span>{file.type}</span>
                        <span>{imageDimensions.width} x {imageDimensions.height}</span>
                    </div>
                )}
                {!file && (
                    <div className="flex justify-center mt-6">
                        <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange}/>
                    </div>
                )}
            </DialogBody>
            <DialogFooter className="space-x-2">
                <Button variant="outlined" className="text-primary border-primary"
                        onClick={() => {
                            resetFiles()
                            onCancel()
                        }}>Cancel</Button>
                <Button variant={'filled'} className={'bg-primary text-white'}
                        onClick={handleUpload}>Hochladen</Button>
            </DialogFooter>
        </Dialog>
    )
}
