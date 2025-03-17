'use client'

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { fabric } from 'fabric';
import { Button } from '@material-tailwind/react';
import { getBackendApiUrl } from '@/utils/backendApiUrl';

const TemplateEditorPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvas = useRef<fabric.Canvas | null>(null);
    const backendApiUrl = getBackendApiUrl();

    // Toolbar state for text editing
    const [textColor, setTextColor] = useState<string>('#000000');
    const [fontSize, setFontSize] = useState<number>(24);
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [isBold, setIsBold] = useState<boolean>(false);

    // State for background image upload and saving
    const [tempImageName, setTempImageName] = useState<string>('');
    const [showNamePopup, setShowNamePopup] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string | null>(null);

    // Initialize Fabric canvas
    useEffect(() => {
        if (canvasRef.current) {
            fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
                width: 800,
                height: 600,
                backgroundColor: '#f0f0f0'
            });

            // On double-click, add a new IText object if no object is under the pointer
            fabricCanvas.current.on('mouse:dblclick', (opt) => {
                const pointer = fabricCanvas.current?.getPointer(opt.e);
                if (pointer) {
                    const target = fabricCanvas.current?.findTarget(opt.e, false);
                    if (!target) {
                        const text = new fabric.IText('Neuer Text', {
                            left: pointer.x,
                            top: pointer.y,
                            fontFamily: fontFamily,
                            fill: textColor,
                            fontSize: fontSize,
                            fontWeight: isBold ? 'bold' : 'normal',
                            editable: true
                        });
                        fabricCanvas.current?.add(text);
                        fabricCanvas.current?.setActiveObject(text);
                        text.enterEditing();
                        text.selectAll();
                        updateToolbarValues(text);
                    }
                }
            });

            // Update toolbar when a text object is selected
            fabricCanvas.current.on('selection:created', (e) => {
                const activeObj = e.target;
                if (activeObj && activeObj.type === 'i-text') {
                    updateToolbarValues(activeObj as fabric.IText);
                }
            });
            fabricCanvas.current.on('selection:updated', (e) => {
                const activeObj = e.target;
                if (activeObj && activeObj.type === 'i-text') {
                    updateToolbarValues(activeObj as fabric.IText);
                }
            });
        }
        return () => {
            fabricCanvas.current?.dispose();
        };
    }, []);

    // Update toolbar values from the active text object
    const updateToolbarValues = (textObj: fabric.IText) => {
        setTextColor(textObj.fill as string);
        setFontSize(textObj.fontSize || 24);
        setFontFamily(textObj.fontFamily || 'Arial');
        setIsBold(textObj.fontWeight === 'bold');
    };

    // Update active text object with toolbar properties
    const updateActiveText = () => {
        const activeObject = fabricCanvas.current?.getActiveObject();
        if (activeObject && activeObject.type === 'i-text') {
            const textObj = activeObject as fabric.IText;
            textObj.set({
                fill: textColor,
                fontSize: fontSize,
                fontFamily: fontFamily,
                fontWeight: isBold ? 'bold' : 'normal'
            });
            fabricCanvas.current?.renderAll();
        }
    };

    useEffect(() => {
        updateActiveText();
    }, [textColor, fontSize, fontFamily, isBold]);

    // Background image upload handler
    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (f) => {
                const data = f.target?.result;
                fabric.Image.fromURL(data as string, (img) => {
                    if (fabricCanvas.current) {
                        // Set canvas dimensions to match the image's natural dimensions
                        fabricCanvas.current.setWidth(img.width!);
                        fabricCanvas.current.setHeight(img.height!);
                        // Set the image as background without scaling
                        fabricCanvas.current.setBackgroundImage(
                            img,
                            fabricCanvas.current.renderAll.bind(fabricCanvas.current),
                            { scaleX: 1, scaleY: 1 }
                        );
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Original helper functions for duplicate checking
    const checkFileNameExists = async (fileName: string): Promise<boolean> => {
        try {
            const response = await fetch(`${backendApiUrl}/image/exists?filename=${encodeURIComponent(fileName)}`);
            if (!response.ok) {
                throw new Error('Fehler bei der Überprüfung des Dateinamens.');
            }
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Fehler beim Prüfen des Dateinamens:', error);
            return false;
        }
    };

    const getAvailableFileName = async (baseName: string): Promise<string> => {
        let finalName = baseName;
        let counter = 1;
        while (await checkFileNameExists(finalName)) {
            const nameWithoutExt = baseName.substring(0, baseName.lastIndexOf('.'));
            finalName = `${nameWithoutExt}_${counter}.png`;
            counter++;
        }
        return finalName;
    };

    // Helper: convert a dataURL to a Blob
    const dataURLToBlob = (dataURL: string): Blob | null => {
        const parts = dataURL.split(',');
        if (parts.length < 2) return null;
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    // Save image using Fabric's toDataURL
    const saveImage = async () => {
        if (fabricCanvas.current) {
            // Finalize the canvas: deselect objects and render all
            fabricCanvas.current.discardActiveObject();
            fabricCanvas.current.renderAll();

            // Generate data URL of the canvas as PNG
            const dataURL = fabricCanvas.current.toDataURL({
                format: 'png',
                quality: 1.0,
            });

            const blob = dataURLToBlob(dataURL);
            if (!blob) return;

            let baseName = tempImageName.trim() !== '' ? tempImageName.trim() : 'output';
            baseName = baseName + '.png';
            const finalFileName = await getAvailableFileName(baseName);

            const file = new File([blob], finalFileName, { type: 'image/png' });
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(`${backendApiUrl}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    throw new Error(`Upload fehlgeschlagen: ${response.status} ${response.statusText}`);
                }
                setPopupMessage(`Bild wurde unter dem Namen <strong>${finalFileName}</strong> erfolgreich hochgeladen.`);
                // Hide modal after saving
                setShowNamePopup(false);
            } catch (error: any) {
                console.error('Fehler beim Hochladen des Bildes:', error.message || error);
                setPopupMessage('Fehler beim Hochladen des Bildes.');
                setShowNamePopup(false);
            }
        }
    };

    // Handlers for modal popup
    const handleSaveClick = () => {
        setShowNamePopup(true);
    };

    const handlePopupSave = async () => {
        await saveImage();
    };

    const handlePopupCancel = () => {
        setShowNamePopup(false);
    };

    // Toolbar handlers
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextColor(e.target.value);
    };

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFontSize(parseInt(e.target.value, 10));
    };

    const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFontFamily(e.target.value);
    };

    const handleBoldToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsBold(e.target.checked);
    };

    return (
        <div style={{ padding: '16px' }}>
            <h1>Fabric.js Template Editor</h1>

            {/* Toolbar for text editing */}
            <div style={{
                marginBottom: '16px',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
            }}>
                <label>
                    Text Color:
                    <input type="color" value={textColor} onChange={handleColorChange} style={{ marginLeft: '4px' }} />
                </label>
                <label>
                    Font Size:
                    <input type="number" value={fontSize} onChange={handleFontSizeChange} style={{ width: '60px', marginLeft: '4px' }} />
                </label>
                <label>
                    Font Family:
                    <select value={fontFamily} onChange={handleFontFamilyChange} style={{ marginLeft: '4px' }}>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                </label>
                <label>
                    Bold:
                    <input type="checkbox" checked={isBold} onChange={handleBoldToggle} style={{ marginLeft: '4px' }} />
                </label>
            </div>

            {/* Background Image Upload */}
            <div style={{ marginBottom: '16px' }}>
                <label>
                    Upload Background Image:
                    <input type="file" accept="image/*" onChange={handleBackgroundUpload} style={{ marginLeft: '4px' }} />
                </label>
            </div>

            {/* Save Button (opens modal for file naming) */}
            <div style={{ marginBottom: '16px' }}>
                <Button variant="filled" className="bg-primary text-white" onClick={handleSaveClick}>
                    Bild Speichern
                </Button>
            </div>

            {/* Render Modal in a Portal */}
            {showNamePopup && ReactDOM.createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        padding: '24px',
                        borderRadius: '8px',
                        minWidth: '300px'
                    }}>
                        <h3>Bild benennen</h3>
                        <input
                            type="text"
                            value={tempImageName}
                            onChange={(e) => setTempImageName(e.target.value)}
                            placeholder="Name eingeben"
                            style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="outlined" className="text-primary border-primary" onClick={handlePopupCancel} style={{ marginRight: '8px' }}>
                                Abbrechen
                            </Button>
                            <Button variant="filled" className="bg-primary text-white" onClick={handlePopupSave}>
                                Speichern
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Fabric Canvas */}
            <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />

            {/* Notification Popup */}
            {popupMessage && ReactDOM.createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: '#fff',
                        padding: '24px',
                        borderRadius: '8px',
                        minWidth: '300px',
                        textAlign: 'center'
                    }}>
                        <h3 dangerouslySetInnerHTML={{ __html: popupMessage }} />
                        <Button variant="filled" className="bg-primary text-white" onClick={() => setPopupMessage(null)}>
                            Schließen
                        </Button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default TemplateEditorPage;
