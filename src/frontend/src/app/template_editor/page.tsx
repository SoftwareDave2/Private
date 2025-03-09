'use client'
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import PageHeader from "@/components/layout/PageHeader";
import { getBackendApiUrl } from "@/utils/backendApiUrl";
import { Button } from "@material-tailwind/react";

// Erweitertes Interface mit relativen Positionen
interface FieldConfig {
    id: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    placeholder: string;
    defaultText?: string;
    fontSizePercent?: number;
    bold?: boolean;
    defaultColor?: string;
}

const baseTemplateConfig: FieldConfig[] = [
    {
        id: 'field1',
        xPercent: 0.04,
        yPercent: 0.145,
        widthPercent: 0.8,
        heightPercent: 0.05,
        placeholder: "Textfeld 1",
        defaultText: "Überschrift",
        fontSizePercent: 0.045,
        bold: true
    },
    {
        id: 'field2',
        xPercent: 0.04,
        yPercent: 0.198,
        widthPercent: 0.8,
        heightPercent: 0.02,
        placeholder: "Textfeld 2",
        defaultText: "Datum",
        fontSizePercent: 0.02,
        bold: true
    },
    {
        id: 'field3',
        xPercent: 0.04,
        yPercent: 0.245,
        widthPercent: 0.8,
        heightPercent: 0.02,
        placeholder: "Textfeld 3",
        defaultText: "Unterthema",
        fontSizePercent: 0.02,
        bold: true
    },
    {
        id: 'field4',
        xPercent: 0.05,
        yPercent: 0.37,
        widthPercent: 0.8,
        heightPercent: 0.045,
        placeholder: "Textfeld 4",
        defaultText: "Themen:",
        fontSizePercent: 0.045,
        bold: true
    },
    {
        id: 'field5',
        xPercent: 0.05,
        yPercent: 0.48,
        widthPercent: 0.8,
        heightPercent: 0.025,
        placeholder: "Textfeld 5",
        defaultText: "Name",
        fontSizePercent: 0.02,
        bold: false
    },
    {
        id: 'field6',
        xPercent: 0.05,
        yPercent: 0.51,
        widthPercent: 0.8,
        heightPercent: 0.025,
        placeholder: "Textfeld 6",
        defaultText: "Thema",
        fontSizePercent: 0.025,
        bold: true
    },
    {
        id: 'field7',
        xPercent: 0.05,
        yPercent: 0.57,
        widthPercent: 0.8,
        heightPercent: 0.025,
        placeholder: "Textfeld 7",
        defaultText: "Name",
        fontSizePercent: 0.02,
        bold: false
    },
    {
        id: 'field8',
        xPercent: 0.05,
        yPercent: 0.60,
        widthPercent: 0.8,
        heightPercent: 0.025,
        placeholder: "Textfeld 8",
        defaultText: "Thema",
        fontSizePercent: 0.025,
        bold: true
    },
    {
        id: 'field9',
        xPercent: 0.05,
        yPercent: 0.66,
        widthPercent: 0.8,
        heightPercent: 0.025,
        placeholder: "Textfeld 9",
        defaultText: "Name",
        fontSizePercent: 0.02,
        bold: false
    },
    {
        id: 'field10',
        xPercent: 0.05,
        yPercent: 0.69,
        widthPercent: 0.8,
        heightPercent: 0.025,
        placeholder: "Textfeld 10",
        defaultText: "Thema",
        fontSizePercent: 0.025,
        bold: true
    },
];

const templateConfig: Record<string, FieldConfig[]> = {
    "template_1_links.png": [
        ...baseTemplateConfig,
    ],
    "template_1_rechts.png": [
        ...baseTemplateConfig,
    ],
    "template_2_links.png": [
        ...baseTemplateConfig,
    ],
    "template_2_rechts.png": [
        ...baseTemplateConfig,
    ],
    "template_3_links.png": [
        ...baseTemplateConfig,
    ],
    "template_3_rechts.png": [
        ...baseTemplateConfig,
    ],
};

const backendApiUrl = getBackendApiUrl();

const TemplateEditorPage: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("template_1_links.png");
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [textColors, setTextColors] = useState<Record<string, string>>({});
    const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
    const [showNamePopup, setShowNamePopup] = useState<boolean>(false);
    const [tempImageName, setTempImageName] = useState<string>('');
    const [popupMessage, setPopupMessage] = useState<string | null>(null);

    // Neuer State für Textmodus und Freitext
    const [textMode, setTextMode] = useState<string>("Standard");
    const [freitextValue, setFreitextValue] = useState<string>("");
    const [freitextColor, setFreitextColor] = useState<string>("#000000");

    useEffect(() => {
        const img = new Image();
        img.src = `/templates/${selectedTemplate}`;
        img.onload = () => {
            setBgImage(img);
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = img.width;
                canvas.height = img.height;
                setCanvasDimensions({ width: img.width, height: img.height });
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                }
            }
            const fields = templateConfig[selectedTemplate] || [];
            const initialValues: Record<string, string> = {};
            const initialColors: Record<string, string> = {};
            fields.forEach(field => {
                initialValues[field.id] = field.defaultText || "";
                initialColors[field.id] = field.defaultColor || "#000000";
            });
            setInputValues(initialValues);
            setTextColors(initialColors);
        };
    }, [selectedTemplate]);

    const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedTemplate(e.target.value);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        setInputValues(prev => ({
            ...prev,
            [id]: e.target.value
        }));
    };

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        setTextColors(prev => ({
            ...prev,
            [id]: e.target.value,
        }));
    };

    const drawTextOnCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !bgImage) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0);

        const fields = templateConfig[selectedTemplate] || [];
        fields.forEach(field => {
            // Bei Freitext-Modus überspringen wir die Felder field5 bis field10
            if (textMode === 'Freitext' && ["field5", "field6", "field7", "field8", "field9", "field10"].includes(field.id)) {
                return;
            }
            const text = inputValues[field.id] || field.defaultText || "";
            const fontSize = field.fontSizePercent ? field.fontSizePercent * canvas.height : 16;
            const fontWeight = field.bold ? 'bold' : 'normal';
            ctx.font = `${fontWeight} ${fontSize}px Arial`;
            ctx.fillStyle = textColors[field.id] || "#000000";
            const x = field.xPercent * canvas.width;
            const y = field.yPercent * canvas.height + (field.heightPercent * canvas.height) - 5;
            ctx.fillText(text, x, y);
        });

        // Zeichne den Freitext, falls ausgewählt
        if (textMode === 'Freitext') {
            const freitextX = 0.05 * canvas.width;
            const freitextY = 0.48 * canvas.height;
            const fontSize = 0.02 * canvas.height;
            ctx.font = `normal ${fontSize}px Arial`;
            ctx.fillStyle = freitextColor;
            const lines = freitextValue.split('\n');
            const lineHeight = fontSize + 5;
            lines.forEach((line, index) => {
                ctx.fillText(line, freitextX, freitextY + index * lineHeight);
            });
        }
    };

    // Funktion zum Überprüfen, ob ein Dateiname bereits existiert
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

    // Funktion, die einen verfügbaren Dateinamen ermittelt, falls der gewünschte Name schon existiert
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

    // Angepasste Funktion zum Speichern des Bildes mit überprüfter Benennung
    const saveImage = async () => {
        drawTextOnCanvas();
        const canvas = canvasRef.current;
        if (!canvas) return;

        let baseName = tempImageName.trim() !== '' ? tempImageName.trim() : 'output';
        baseName = baseName + '.png';

        const finalFileName = await getAvailableFileName(baseName);

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], finalFileName, { type: 'image/png' });
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(backendApiUrl + '/image/upload', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    throw new Error(`Upload fehlgeschlagen: ${response.status} ${response.statusText}`);
                }
                setPopupMessage(`Bild wurde unter dem Namen <strong>${finalFileName}</strong> erfolgreich hochgeladen.`);
            } catch (error: any) {
                console.error('Fehler beim Hochladen des Bildes:', error.message || error);
                setPopupMessage('Fehler beim Hochladen des Bildes.');
            }
        }, 'image/png');
    };

    const handleSaveClick = () => {
        setShowNamePopup(true);
    };

    const handlePopupSave = () => {
        setShowNamePopup(false);
        saveImage();
    };

    const handlePopupCancel = () => {
        setShowNamePopup(false);
    };

    return (
        <div style={{ padding: '16px' }}>
            <PageHeader title={'Template Editor'} info={''} />
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="templateSelect">Wähle ein Template: </label>
                <select id="templateSelect" value={selectedTemplate} onChange={handleTemplateChange}>
                    <option value="template_1_links.png">template_1_links</option>
                    <option value="template_1_rechts.png">template_1_rechts</option>
                    <option value="template_2_links.png">template_2_links</option>
                    <option value="template_2_rechts.png">template_2_rechts</option>
                    <option value="template_3_links.png">template_3_links</option>
                    <option value="template_3_rechts.png">template_3_rechts</option>
                </select>
            </div>

            {/* Dropdown für den Textmodus */}
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="textModeSelect">Textmodus: </label>
                <select id="textModeSelect" value={textMode} onChange={(e) => setTextMode(e.target.value)}>
                    <option value="Standard">Standard</option>
                    <option value="Freitext">Freitext</option>
                </select>
            </div>

            <Button variant={'filled'} className={'bg-primary text-white'} onClick={handleSaveClick}>
                Bild Speichern
            </Button>

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

            {/* Canvas und Eingabefelder */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ position: 'relative', width: canvasDimensions.width, height: canvasDimensions.height }}>
                    <canvas ref={canvasRef} style={{ border: '1px solid #000', display: 'block' }} />
                    {(templateConfig[selectedTemplate] || []).map(field => {
                        if (textMode === 'Freitext' && ["field5", "field6", "field7", "field8", "field9", "field10"].includes(field.id)) {
                            return null;
                        }
                        return (
                            <div
                                key={field.id}
                                style={{
                                    position: 'absolute',
                                    left: `${field.xPercent * 100}%`,
                                    top: `${field.yPercent * 100}%`,
                                    width: `${field.widthPercent * 100}%`,
                                    height: `${field.heightPercent * 100}%`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.7)'
                                }}
                            >
                                <input
                                    type="text"
                                    value={inputValues[field.id] || ""}
                                    placeholder={field.placeholder}
                                    onChange={(e) => handleInputChange(e, field.id)}
                                    style={{
                                        width: 'calc(100% - 40px)',
                                        height: '100%',
                                        border: '1px solid #ccc',
                                        fontSize: field.fontSizePercent ? `${field.fontSizePercent * canvasDimensions.height}px` : '16px',
                                        fontWeight: field.bold ? 'bold' : 'normal',
                                        color: textColors[field.id] || "#000000"
                                    }}
                                />
                                <input
                                    type="color"
                                    value={textColors[field.id] || "#000000"}
                                    onChange={(e) => handleColorChange(e, field.id)}
                                    style={{
                                        width: '35px',
                                        height: '100%',
                                        border: 'none',
                                        marginLeft: '5px'
                                    }}
                                />
                            </div>
                        );
                    })}
                    {textMode === 'Freitext' && canvasDimensions.width > 0 && (
                        <div style={{
                            position: 'absolute',
                            left: `${0.05 * canvasDimensions.width}px`,
                            top: `${0.48 * canvasDimensions.height}px`,
                            width: `${0.8 * canvasDimensions.width}px`,
                            height: `${(0.4) * canvasDimensions.height}px`,
                            background: 'rgba(255,255,255,0.7)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <textarea
                                value={freitextValue}
                                onChange={(e) => setFreitextValue(e.target.value)}
                                placeholder="Freitext eingeben..."
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    height: '100%',
                                    border: '1px solid #ccc',
                                    fontSize: `${0.02 * canvasDimensions.height}px`,
                                    resize: 'none',
                                    color: freitextColor
                                }}
                            />
                            <input
                                type="color"
                                value={freitextColor}
                                onChange={(e) => setFreitextColor(e.target.value)}
                                style={{
                                    width: '35px',
                                    height: '30px',
                                    border: 'none',
                                    margin: '5px'
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Neues modales Pop-up für die Erfolgs-/Fehlermeldung */}
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
                        <h3 style={{marginBottom: '16px'}} dangerouslySetInnerHTML={{__html: popupMessage}}/>

                        <Button variant={'filled'}
                                className={'bg-primary text-white'}
                                onClick={() => setPopupMessage(null)} style={{

                        }}>
                            Schließen
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateEditorPage;
