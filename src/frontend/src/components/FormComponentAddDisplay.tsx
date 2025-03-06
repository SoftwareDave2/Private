'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import {getBackendApiUrl} from "@/utils/backendApiUrl";

interface FormData {
    brand: string;
    model: string;
    width: string;
    height: string;
    orientation: string;
    filename: string;
}

const FormComponent = () => {
    const [formData, setFormData] = useState<FormData>({
        brand: '',
        model: '',
        width: '',
        height: '',
        orientation: '',
        filename: '',
    });

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        // Daten in ein URL-encoded Format umwandeln
        const params = new URLSearchParams();
        params.append('brand', formData.brand);
        params.append('model', formData.model);
        params.append('width', formData.width);
        params.append('height', formData.height);
        params.append('orientation', formData.orientation);
        params.append('filename', formData.filename);
        // const host = window.location.hostname;
        // const backendApiUrl = 'http://' + host + ':8080';
        const backendApiUrl = getBackendApiUrl();

        try {
            const response = await fetch(backendApiUrl + '/display/all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // Richtiges Format setzen
                },
                body: params.toString(), // URL-codierte Daten
            });

            if (response.ok) {
                console.log('Daten erfolgreich gesendet');
            } else {
                console.error('Fehler beim Senden der Daten');
            }
        } catch (error) {
            console.error('Fehler bei der Anfrage', error);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="brand">Brand</label>
                <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="model">Model</label>
                <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="width">Width</label>
                <input
                    type="number"
                    id="width"
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="height">Height</label>
                <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="orientation">Orientation</label>
                <input
                    type="text"
                    id="orientation"
                    name="orientation"
                    value={formData.orientation}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="filename">Filename</label>
                <input
                    type="text"
                    id="filename"
                    name="filename"
                    value={formData.filename}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <button type="submit">Absenden</button>
        </form>
    );
};

export default FormComponent;
