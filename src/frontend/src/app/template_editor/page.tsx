'use client'
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';

// Erweitertes Interface mit relativen Positionen
interface FieldConfig {
    id: string;
    xPercent: number; // X-Position als Prozentwert (z.B. 0.1 für 10% der Bildbreite)
    yPercent: number; // Y-Position als Prozentwert
    widthPercent: number; // Breite als Prozentwert
    heightPercent: number; // Höhe als Prozentwert
    placeholder: string;
    defaultText?: string;
    fontSizePercent?: number; // Schriftgröße relativ zur Bildhöhe
    bold?: boolean;
}

// Beispiel-Templates mit relativen Werten
const templateConfig: Record<string, FieldConfig[]> = {
    "template_1_links.png": [
        {
            id: 'field1',
            xPercent: 0.1,  // 10% der Bildbreite
            yPercent: 0.2,  // 20% der Bildhöhe
            widthPercent: 0.3,
            heightPercent: 0.05,
            placeholder: "Textfeld 1",
            defaultText: "Beispieltext 1",
            fontSizePercent: 0.03,
            bold: true
        },
        {
            id: 'field2',
            xPercent: 0.5,
            yPercent: 0.4,
            widthPercent: 0.3,
            heightPercent: 0.05,
            placeholder: "Textfeld 2",
            defaultText: "Beispieltext 2",
            fontSizePercent: 0.025,
            bold: false
        }
    ]
};

const backendApiUrl = 'http://localhost:8080';

const TemplateEditorPage: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("template_1_links.png");
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [imageName, setImageName] = useState<string>('');
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

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

            // Setze die defaultText-Werte beim Laden des Templates
            const fields = templateConfig[selectedTemplate] || [];
            const initialValues: Record<string, string> = {};
            fields.forEach(field => {
                initialValues[field.id] = field.defaultText || "";
            });
            setInputValues(initialValues);
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

    // Funktion zum Zeichnen von Text auf dem Canvas
    const drawTextOnCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !bgImage) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Canvas löschen
        ctx.drawImage(bgImage, 0, 0);  // Hintergrundbild neu zeichnen

        const fields = templateConfig[selectedTemplate] || [];
        fields.forEach(field => {
            const text = inputValues[field.id] || field.defaultText || "";  // Text aus Input oder DefaultText
            const fontSize = field.fontSizePercent ? field.fontSizePercent * canvas.height : 16;
            const fontWeight = field.bold ? 'bold' : 'normal';
            ctx.font = `${fontWeight} ${fontSize}px Arial`;
            ctx.fillStyle = "black";

            const x = field.xPercent * canvas.width;
            const y = field.yPercent * canvas.height + (field.heightPercent * canvas.height) - 5;

            ctx.fillText(text, x, y);  // Text zeichnen
        });
    };

    const handleSave = () => {
        drawTextOnCanvas();  // Text auf das Canvas zeichnen
        const canvas = canvasRef.current;
        if (!canvas) return;
        const finalFileName = imageName.trim() !== '' ? imageName.trim() + '.png' : `output_${Date.now()}.png`;
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
                    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
                }

                setPopupMessage('Bild wurde erfolgreich hochgeladen.');
            } catch (error: any) {
                console.error('Error on uploading file.', error.message || error);
                setPopupMessage('Fehler beim Hochladen des Bildes.');
            }
        }, 'image/png');
    };

    return (
        <div style={{ padding: '16px' }}>
            <h1>Template Editor</h1>
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="templateSelect">Wähle ein Template: </label>
                <select id="templateSelect" value={selectedTemplate} onChange={handleTemplateChange}>
                    <option value="template_1_links.png">Template 1</option>
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ position: 'relative', width: canvasDimensions.width, height: canvasDimensions.height }}>
                    <canvas ref={canvasRef} style={{ border: '1px solid #000', display: 'block' }} />
                    {(templateConfig[selectedTemplate] || []).map(field => (
                        <input
                            key={field.id}
                            type="text"
                            value={inputValues[field.id] || ""}
                            placeholder={field.placeholder}
                            onChange={(e) => handleInputChange(e, field.id)}
                            style={{
                                position: 'absolute',
                                left: `${field.xPercent * 100}%`,
                                top: `${field.yPercent * 100}%`,
                                width: `${field.widthPercent * 100}%`,
                                height: `${field.heightPercent * 100}%`,
                                border: '1px solid #ccc',
                                background: 'rgba(255,255,255,0.7)',
                                fontSize: field.fontSizePercent ? `${field.fontSizePercent * canvasDimensions.height}px` : '16px',
                                fontWeight: field.bold ? 'bold' : 'normal'
                            }}
                        />
                    ))}
                </div>
            </div>

            <button onClick={handleSave}>Bild speichern</button>

            {popupMessage && <div style={{ marginTop: '16px', color: 'green' }}>{popupMessage}</div>}
        </div>
    );
};

export default TemplateEditorPage;
