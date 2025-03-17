'use client'

import React, { useEffect, useRef, useState } from 'react';
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

    // State for background image upload
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
                            {
                                // No scaling: scaleX and scaleY set to 1
                                scaleX: 1,
                                scaleY: 1,
                            }
                        );
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    };


    // Original helper functions from your template editor
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

    const saveImage = async () => {
        if (fabricCanvas.current) {
            fabricCanvas.current.discardActiveObject();
            fabricCanvas.current.renderAll();
            const canvasElement = fabricCanvas.current.lowerCanvasEl;

            let baseName = tempImageName.trim() !== '' ? tempImageName.trim() : 'output';
            baseName = baseName + '.png';
            const finalFileName = await getAvailableFileName(baseName);

            // Delay export slightly if needed
            setTimeout(() => {
                canvasElement.toBlob(async (blob) => {
                    if (!blob) return;
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
                        // Now hide the modal after export completes
                        setShowNamePopup(false);
                    } catch (error: any) {
                        console.error('Fehler beim Hochladen des Bildes:', error.message || error);
                        setPopupMessage('Fehler beim Hochladen des Bildes.');
                        // Optionally hide the modal even on error
                        setShowNamePopup(false);
                    }
                }, 'image/png');
            }, 100); // You can adjust the delay as needed
        }
    };



    // Handlers for modal popup
    const handleSaveClick = () => {
        setShowNamePopup(true);
    };

    const handlePopupSave = async () => {
        await saveImage();
        // Do not call setShowNamePopup(false) here since it’s handled after export
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

            {/* Save Button (opens popup for file name) */}
            <div style={{ marginBottom: '16px' }}>
                <Button variant="filled" className="bg-primary text-white" onClick={handleSaveClick}>
                    Bild Speichern
                </Button>
            </div>

            {/* Modal für die Benennung */}
            {showNamePopup && (
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
                    zIndex: 1000  // Hinzufügen eines hohen z-index
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
                            style={{width: '100%', padding: '8px', marginBottom: '16px'}}
                        />
                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button variant={'outlined'}
                                    className='text-primary border-primary'
                                    onClick={handlePopupCancel} style={{marginRight: '8px'}}>
                                Abbrechen
                            </Button>
                            <Button variant={'filled'}
                                    className={'bg-primary text-white'}
                                    onClick={handlePopupSave} style={{

                            }}>
                                Speichern
                            </Button>

                        </div>
                    </div>
                </div>
            )}


            {/* Fabric Canvas */}
            <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />

            {/* Popup for notifications */}
            {popupMessage && (
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
                </div>
            )}
        </div>
    );
};

export default TemplateEditorPage;
