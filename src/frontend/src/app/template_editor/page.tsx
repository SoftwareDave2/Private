'use client'

import React, {useEffect, useRef, useState} from 'react'
import {fabric} from 'fabric'
import {Button} from '@material-tailwind/react'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'
import EditorToolbar from '@/components/template-editor/EditorToolbar'
import NotificationDialog from '@/components/template-editor/NotificationDialog'
import SetNameDialog from '@/components/template-editor/SetNameDialog'
import PageHeaderButton from '@/components/layout/PageHeaderButton'
import PageHeader from '@/components/layout/PageHeader'
import {checkFileNameExists} from '@/utils/checkFileNameExists'

const TemplateEditorPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fabricCanvas = useRef<fabric.Canvas | null>(null)
    const backendApiUrl = getBackendApiUrl()

    const [textColor, setTextColor] = useState<string>('#000000')
    const [fontSize, setFontSize] = useState<number>(24)
    const [fontFamily, setFontFamily] = useState<string>('Arial')
    const [isBold, setIsBold] = useState<boolean>(false)
    const [showNameDialog, setShowNameDialog] = useState<boolean>(false)
    const [showNotificationDialog, setShowNotificationDialog] = useState<boolean>(false)
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null)

    // Initialize Fabric canvas
    useEffect(() => {
        if (canvasRef.current) {
            fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
                width: 800,
                height: 600,
                backgroundColor: '#f0f0f0',
            })

            // On double-click, add a new IText object if no object is under the pointer
            fabricCanvas.current.on('mouse:dblclick', (opt) => {
                const pointer = fabricCanvas.current?.getPointer(opt.e)
                if (pointer) {
                    const target = fabricCanvas.current?.findTarget(opt.e, false)
                    if (!target) {
                        const text = new fabric.IText('Neuer Text', {
                            left: pointer.x,
                            top: pointer.y,
                            fontFamily: fontFamily,
                            fill: textColor,
                            fontSize: fontSize,
                            fontWeight: isBold ? 'bold' : 'normal',
                            editable: true,
                        })
                        fabricCanvas.current?.add(text)
                        fabricCanvas.current?.setActiveObject(text)
                        text.enterEditing()
                        text.selectAll()
                        updateToolbarValues(text)
                    }
                }
            })

            fabricCanvas.current.on('selection:created', (e) => {
                const activeObj = fabricCanvas.current.getActiveObject()
                if (activeObj && activeObj.type === 'i-text') {
                    updateToolbarValues(activeObj as fabric.IText)
                }
            })

            fabricCanvas.current.on('selection:updated', (e) => {
                const activeObj = fabricCanvas.current.getActiveObject()
                if (activeObj && activeObj.type === 'i-text') {
                    updateToolbarValues(activeObj as fabric.IText)
                }
            })

            fabricCanvas.current.on('selection:cleared', (e) => {
                resetToolbarValues()
            })

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Delete') {
                    const activeObjects = fabricCanvas.current.getActiveObjects()
                    if (activeObjects.length > 0) {
                        activeObjects.forEach((obj) => fabricCanvas.current.remove(obj))
                    }
                }
            })
        }
        return () => fabricCanvas.current?.dispose()
    }, [])

    const resetToolbarValues = () => {
        const textObj = new fabric.IText('', {
            fill: '#000000',
            fontSize: 24,
            fontFamily: 'Arial',
            fontWeight: 'normal',
        })
        updateToolbarValues(textObj)
    }

    const updateToolbarValues = (textObj: fabric.IText) => {
        setTextColor(textObj.fill as string)
        setFontSize(textObj.fontSize || 24)
        setFontFamily(textObj.fontFamily || 'Arial')
        setIsBold(textObj.fontWeight === 'bold')
    }

    useEffect(() => {
        updateActiveText()
    }, [textColor, fontSize, fontFamily, isBold])

    // Update active text object with toolbar properties
    const updateActiveText = () => {
        const activeObject = fabricCanvas.current?.getActiveObject()
        if (activeObject && activeObject.type === 'i-text') {
            const textObj = activeObject as fabric.IText
            textObj.set({
                fill: textColor,
                fontSize: fontSize,
                fontFamily: fontFamily,
                fontWeight: isBold ? 'bold' : 'normal',
            })
            fabricCanvas.current?.renderAll()
        }
    }

    const saveImage = async (filename: string) => {
        if (!fabricCanvas.current) {
            return
        }

        // Temporarily remove scaling of the background image and canvas.
        const bgImage = fabricCanvas.current.backgroundImage as fabric.Image
        let bgScaleX = 1
        let bgScaleY = 1
        const originalCanvasWidth = fabricCanvas.current.width
        const originalCanvasHeight = fabricCanvas.current.height
        let scaleFactorX = 1
        let scaleFactorY = 1
        if (bgImage) {
            bgScaleX = bgImage.scaleX
            bgScaleY = bgImage.scaleY
            bgImage.scaleX = 1
            bgImage.scaleY = 1

            // Calculate scale factor (new size / current size)
            scaleFactorX = bgImage.width / fabricCanvas.current.width
            scaleFactorY = bgImage.height / fabricCanvas.current.height

            // Scale canvas.
            fabricCanvas.current.setWidth(bgImage.width)
            fabricCanvas.current.setHeight(bgImage.height)

            // Scale all objects in canvas.
            fabricCanvas.current.getObjects().forEach((obj) => {
                obj.set({
                    left: obj.left! * scaleFactorX,
                    top: obj.top! * scaleFactorY,
                    scaleX: obj.scaleX! * scaleFactorX,
                    scaleY: obj.scaleY! * scaleFactorY,
                })
                obj.setCoords()
            });
        }

        // Finalize the canvas: deselect objects and render all.
        fabricCanvas.current.discardActiveObject()
        fabricCanvas.current.renderAll()

        // Generate data URL of the canvas as PNG.
        const dataURL = fabricCanvas.current.toDataURL({
            format: 'png',
            quality: 1.0,
        })

        const blob = dataURLToBlob(dataURL)
        if (!blob) return

        let baseName = filename.trim() !== '' ? filename.trim() : 'output'
        baseName = baseName + '.png'
        const finalFileName = await getAvailableFileName(baseName)

        const file = new File([blob], finalFileName, {type: 'image/png'})
        const formData = new FormData()
        formData.append('image', file)

        // Restore scaling of background image and canvas.
        if (bgImage) {
            fabricCanvas.current.setWidth(originalCanvasWidth)
            fabricCanvas.current.setHeight(originalCanvasHeight)
            fabricCanvas.current.getObjects().forEach((obj) => {
                obj.set({
                    left: obj.left! / scaleFactorX,
                    top: obj.top! / scaleFactorY,
                    scaleX: obj.scaleX! / scaleFactorX,
                    scaleY: obj.scaleY! / scaleFactorY,
                })
                obj.setCoords()
            })
            bgImage.scaleX = bgScaleX
            bgImage.scaleY = bgScaleY
            fabricCanvas.current.renderAll()
        }

        // Upload image.
        try {
            const response = await authFetch(`${backendApiUrl}/image/upload`, {
                method: 'POST',
                body: formData,
            })
            if (!response.ok) {
                throw new Error(`Upload fehlgeschlagen: ${response.status} ${response.statusText}`)
            }
            openNotificationDialog(`Das Bild wurde unter dem Namen ${finalFileName} erfolgreich hochgeladen.`)
            setShowNameDialog(false)
        } catch (error: any) {
            console.error('Fehler beim Hochladen des Bildes:', error.message || error)
            openNotificationDialog('Fehler beim Hochladen des Bildes.')
            setShowNameDialog(false)
        }
    }

    const dataURLToBlob = (dataURL: string): Blob | null => {
        const parts = dataURL.split(',')
        if (parts.length < 2) return null
        const mimeMatch = parts[0].match(/:(.*?);/)
        if (!mimeMatch) return null
        const mime = mimeMatch[1]
        const bstr = atob(parts[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], {type: mime})
    }

    const getAvailableFileName = async (baseName: string): Promise<string> => {
        let finalName = baseName
        let counter = 1
        while (await checkFileNameExists(finalName)) {
            const nameWithoutExt = baseName.substring(0, baseName.lastIndexOf('.'))
            finalName = `${nameWithoutExt}_${counter}.png`
            counter++
        }
        return finalName
    }

    const handleFontFamilyChange = (fontFamily: string) => setFontFamily(fontFamily)
    const handleFontSizeChange = (fontSize: number) => setFontSize(fontSize)
    const handleBoldChange = (bold: boolean) => setIsBold(bold)
    const handleColorChange = (color: string) => setTextColor(color)

    const handleBackgroundUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (f) => {
            const data = f.target?.result
            fabric.Image.fromURL(data as string, (img) => {
                if (fabricCanvas.current) {
                    // Set canvas dimensions to match the image's natural dimensions
                    //fabricCanvas.current.setWidth(img.width!)
                    //fabricCanvas.current.setHeight(img.height!)
                    // Set the image as background without scaling
                    const scaleX = fabricCanvas.current.width! / img.width!
                    const scaleY = fabricCanvas.current.height! / img.height!
                    const scale = Math.max(scaleX, scaleY)
                    img.scaleToWidth(fabricCanvas.current.width!)
                    //img.scaleToHeight(fabricCanvas.current.height!)
                    //console.log(img.getScaledWidth())
                    fabricCanvas.current.setWidth(img.getScaledWidth())
                    fabricCanvas.current.setHeight(img.getScaledHeight())
                    img.set({
                        left: 0,
                        top: 0,
                        selectable: false
                    })

                    fabricCanvas.current.setBackgroundImage(
                        img,
                        fabricCanvas.current.renderAll.bind(fabricCanvas.current),
                    )
                }
            })
        }
        reader.readAsDataURL(file)
    }

    const openNotificationDialog = (message: string) => {
        setNotificationMessage(message)
        setShowNotificationDialog(true)
    }

    const openNameDialog = () => {
        setShowNameDialog(true)
    }

    const handleCloseNameDialog = () => {
        setShowNameDialog(false)
    }

    return (
        <main>
            <PageHeader title={'Template Editor'} info={''}>
            </PageHeader>

            <EditorToolbar fontFamily={fontFamily} fontSize={fontSize} isBold={isBold} color={textColor}
                           onFontFamilyChange={handleFontFamilyChange} onFontSizeChange={handleFontSizeChange}
                           onSetBoldChange={handleBoldChange} onColorChange={handleColorChange}
                           onBackgroundUpload={handleBackgroundUpload}/>

            <canvas ref={canvasRef} style={{border: '1px solid #ccc'}}/>

            <div className={'text-xs text-blue-gray-700 mt-1'}>
                <span className={'font-bold'}>Hinweis: </span> Fügen Sie mit einem Doppelklick in dem Bild Text hinzu.
            </div>

            <Button variant="filled" className="bg-primary text-white mt-4" onClick={openNameDialog}>
                Bild Speichern
            </Button>

            <SetNameDialog open={showNameDialog} onClose={handleCloseNameDialog} onSave={saveImage}/>

            <NotificationDialog open={showNotificationDialog} message={notificationMessage}
                                onClose={() => setShowNotificationDialog(false)}/>
        </main>
    )
}

export default TemplateEditorPage
