"use client"
import { useEffect, useState } from 'react';

const MyComponent = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Zustand für den Ladeprozess

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch('https://images.app.goo.gl/Ha7JXsvMWjJpPrFL7');  // Bild-URL
                const blob = await response.blob(); // Umwandlung in Blob
                const url = URL.createObjectURL(blob); // Erstellen einer URL aus dem Blob
                setImageUrl(url); // Bild-URL speichern
                setLoading(false); // Ladeprozess abgeschlossen
            } catch (error) {
                console.error('Fehler beim Laden des Bildes:', error);
                setLoading(false); // Ladeprozess bei Fehler ebenfalls beenden
            }
        };

        fetchImage(); // Bild herunterladen

        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl); // URL wieder freigeben, wenn die Komponente entfernt wird
            }
        };
    }, []);

    return (
        <div>
            <h1>Bild von API laden</h1>
            {loading ? (
                <p>Bild wird geladen...</p> // Ladehinweis anzeigen, solange das Bild noch lädt
            ) : imageUrl ? (
                <img src={imageUrl} alt="Geladenes Bild" /> // Bild anzeigen, wenn es geladen wurde
            ) : (
                <p>Fehler beim Laden des Bildes.</p> // Fehlerhinweis, wenn etwas schiefgeht
            )}
        </div>
    );
};

export default MyComponent;
