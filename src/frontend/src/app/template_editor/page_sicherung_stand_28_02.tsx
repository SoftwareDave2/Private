'use client'
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import TextAlign = Property.TextAlign;
import Color = Property.Color;

// Typdefinition für die Konfiguration der Textfelder
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

// Konfiguration: Für jedes Template die zu platzierenden Textfelder (in Prozent)
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
            color: 'white',
            background: 'black',
            placeholder: "Themen:" },
    ],
    "template_1_links.png": [
        { id: 'field1', xPercent: 0.03, yPercent: 0.145, widthPercent: 0.5, heightPercent: 0.05, fontSize: "2.2vw", fontWeight: "bold", textAlign: "left", placeholder: "Überschrift" },
        { id: 'field2', xPercent: 0.01, yPercent: 0.18, widthPercent: 0.2, heightPercent: 0.05, fontSize: "0.9vw", fontWeight: "bold", textAlign: "left", placeholder: "Datum" },
        { id: 'field3', xPercent: 0.05, yPercent: 0.28, widthPercent: 0.3, heightPercent: 0.05, fontSize: "0.9vw", fontWeight: "bold", textAlign: "left", placeholder: "Unterthema" },
    ]
};

// Stelle hier die URL deines Backends ein
const backendApiUrl = 'http://localhost:8080'

const TemplateEditorPage: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("test3200.png");
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const spanRefs = useRef<Record<string, HTMLSpanElement | null>>({});

    // Beim Laden oder Ändern des Templates wird das Bild geladen und ins Canvas gezeichnet.
    useEffect(() => {
        const img = new Image();
        img.src = `/templates/${selectedTemplate}`;
        img.onload = () => {
            setBgImage(img);

            // Dynamische Skalierung für das Bild
            const maxWidth = window.innerWidth * 0.9;  // Bild maximal 90% der Bildschirmbreite
            const maxHeight = window.innerHeight * 0.9; // Bild maximal 90% der Bildschirmhöhe
            let newWidth = img.width;
            let newHeight = img.height;

            // Skaliere das Bild so, dass es vollständig auf den Bildschirm passt
            const widthRatio = maxWidth / img.width;
            const heightRatio = maxHeight / img.height;
            const scaleFactor = Math.min(widthRatio, heightRatio);

            newWidth = img.width * scaleFactor;
            newHeight = img.height * scaleFactor;

            setCanvasDimensions({ width: newWidth, height: newHeight });

            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                }
            }
        };

        // Setze die Input-Werte für das neue Template zurück
        const fields = templateConfig[selectedTemplate] || [];
        const initialValues: Record<string, string> = {};
        fields.forEach(field => {
            initialValues[field.id] = field.placeholder; // Standardtext direkt setzen
        });
        setInputValues(initialValues);
    }, [selectedTemplate]);

    // Handler für den Wechsel des Templates
    const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedTemplate(e.target.value);
    };

    // Handler für die Eingabefelder
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        setInputValues(prev => ({
            ...prev,
            [id]: e.target.value
        }));
    };

    // handleSave: Wandelt das Canvas in einen Blob um, erstellt daraus ein File,
    // verpackt es in FormData und sendet den Request an den Upload-Endpunkt.
    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const fileName = `output_${Date.now()}.png`;

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], fileName, { type: 'image/png' });
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

                alert('Bild wurde erfolgreich hochgeladen!');
            } catch (error: any) {
                alert('Fehler beim Hochladen des Bildes: ' + (error.message || error));
            }
        }, 'image/png');
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Template Editor</h1>
            <div>
                <label htmlFor="templateSelect">Wähle ein Template:</label>
                <select id="templateSelect" value={selectedTemplate} onChange={handleTemplateChange}>
                    <option value="template_1_links.png">template_1_links</option>
                    <option value="test3200.png">test3200</option>
                    <option value="template_1_rechts.png">template_1_rechts</option>
                </select>
            </div>

            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100vh' }}>
                <canvas ref={canvasRef} style={{ border: '1px solid #000', width: '100%', height: 'auto' }} />
                {/* Unsichtbare Span zur Breitenmessung */}
                {(templateConfig[selectedTemplate] || []).map(field => (
                    <div key={field.id} style={{ position: 'absolute', left: `${field.xPercent * 100}%`, top: `${field.yPercent * 100}%` }}>
                        <span
                            ref={(el) => (spanRefs.current[field.id] = el)}
                            style={{
                                position: 'absolute',
                                visibility: 'hidden',
                                whiteSpace: 'nowrap',
                                fontSize: `${field.fontSize}`,
                                fontWeight: `${field.fontWeight}`,
                            }}
                        >
                            {inputValues[field.id] || " "}
                        </span>

                        <input
                            ref={(el) => (inputRefs.current[field.id] = el)}
                            type="text"
                            value={inputValues[field.id] || ""}
                            onChange={(e) => {
                                handleInputChange(e, field.id);
                                const input = inputRefs.current[field.id];
                                const span = spanRefs.current[field.id];
                                if (input && span) {
                                    span.textContent = e.target.value || " "; // Falls leer, damit `offsetWidth` messbar bleibt
                                    input.style.width = `${span.offsetWidth + 5}px`; // Kleine Padding-Korrektur
                                    if (field.background === 'black') {
                                        input.style.background = 'black';  // Hintergrund nur für Textbereich
                                    }
                                }
                            }}
                            style={{
                                height: `${field.heightPercent * canvasDimensions.height}px`,
                                border: 'none',
                                outline: 'none',
                                color: `${field.color}`,
                                fontSize: `${field.fontSize}`,
                                fontWeight: `${field.fontWeight}`,
                                textAlign: `${field.textAlign}`,
                                whiteSpace: 'nowrap',
                                position: 'absolute',
                                background: field.background === 'black' ? 'black' : 'transparent',
                            }}
                        />
                    </div>
                ))}
            </div>

            <div>
                <button onClick={handleSave}
                        style={{ marginTop: '10px', padding: '10px 20px', border: '2px solid black', cursor: 'pointer' }}>
                    Bild speichern
                </button>
            </div>
        </div>
    );
};

export default TemplateEditorPage;
