'use client'
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import TextAlign = Property.TextAlign;
import Color = Property.Color;
// Erweitertes Interface mit relativen Positionen
interface FieldConfig {
    id: string;
    xPercent: number;  // Position relativ zur Bildgröße (in Prozent)
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    fontSize: string;
    fontWeight: string;
    placeholder: string;
    textAlign: TextAlign;
    color: Color,
    background: string,
}

// Beispiel-Templates mit relativen Werten
const templateConfig: Record<string, FieldConfig[]> = {
    "test3200.png": [
        { id: 'field1',
            xPercent: 0.03,
            yPercent: 0.145,
            widthPercent: 0.1,
            heightPercent: 0.05,
            fontSize: "2.2vw",
            fontWeight: "bold",
            textAlign: "left",
            color: 'black',
            background: 'transparent',
            placeholder: "Überschrift" },
        { id: 'field2',
            xPercent: 0.05,
            yPercent: 0.18,
            widthPercent: 0.1,
            heightPercent: 0.05,
            fontSize: "0.9vw",
            fontWeight: "bold",
            textAlign: "left",
            color: 'black',
            background: 'transparent',
            placeholder: "Datum" },
        { id: 'field3',
            xPercent: 0.05,
            yPercent: 0.23,
            widthPercent: 0.1,
            heightPercent: 0.05,
            fontSize: "0.9vw",
            fontWeight: "bold",
            textAlign: "left",
            color: 'black',
            background: 'transparent',
            placeholder: "Unterthema" },
        { id: 'field4',
            xPercent: 0.05,
            yPercent: 0.33,
            widthPercent: 0.1,
            heightPercent: 0.05,
            fontSize: "1.6vw",
            fontWeight: "bold",
            textAlign: "left",
            color: 'black',
            background: 'transparent',
            placeholder: "Themen:" },
    ],
    "template_1_links.png": [
        { id: 'field1',
            xPercent: 0.03,
            yPercent: 0.145,
            widthPercent: 0.1,
            heightPercent: 0.05,
            fontSize: "2.2vw",
            fontWeight: "bold",
            textAlign: "left",
            color: 'black',
            background: 'transparent',
            placeholder: "Überschrift" },
        { id: 'field2',
            xPercent: 0.05,
            yPercent: 0.18,
            widthPercent: 0.1,
            heightPercent: 0.05,
            fontSize: "0.9vw",
            fontWeight: "bold",
            textAlign: "left",
            color: 'black',
            background: 'transparent',
            placeholder: "Datum" },
        { id: 'field3',
            xPercent: 0.05,
            yPercent: 0.23,
            widthPercent: 0.1,
            heightPercent: 0.05,
            fontSize: "0.9vw",
            fontWeight: "bold",
            textAlign: "left",
            color: 'black',
            background: 'transparent',
            placeholder: "Unterthema" },
        { id: 'field4',
            xPercent: 0.05,
            yPercent: 0.33,
            widthPercent: 0.1,
            heightPercent: 0.05,
            fontSize: "1.6vw",
            fontWeight: "bold",
            textAlign: "left",
            color: 'black',
            background: 'transparent',
            placeholder: "Themen:" },
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
                initialValues[field.id] = field.placeholder || "";
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

    const mergeCanvasAndText = () => {
        const canvas = canvasRef.current;
        if (!canvas || !bgImage) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0);

        const fields = templateConfig[selectedTemplate] || [];
        fields.forEach(field => {
            const text = inputValues[field.id];
            if (text) {
                const fontSize = field.fontSize;
                const fontWeight = field.fontWeight;
                ctx.font = `${fontWeight} ${fontSize}px Arial`;
                ctx.fillStyle = "black";

                const x = field.xPercent * canvas.width;
                const y = field.yPercent * canvas.height + (field.heightPercent * canvas.height) - 5;

                ctx.fillText(text, x, y);
            }
        });
    };

    const handleSave = () => {
        mergeCanvasAndText();
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
                    <option value="template_1_links.png">template_1_links</option>
                    <option value="test3200.png">test3200</option>
                </select>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
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
                                background: `${field.background}`,
                                fontSize: field.fontSize,
                                fontWeight: field.fontWeight
                            }}
                        />
                    ))}
                </div>
            </div>

            <button onClick={handleSave}>Bild speichern</button>
        </div>
    );
};

export default TemplateEditorPage;
