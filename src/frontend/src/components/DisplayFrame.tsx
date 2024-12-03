import styles from './DisplayFrame.module.css'
import {useEffect, useState} from "react";


type DisplayFrameProps = {
    id: number,
    width: number,
    height: number,
    orientation: string,
    filename: string,
}

export default function DisplayFrame({id, width, height, orientation, filename}: DisplayFrameProps) {

    //const response = await fetch("http://localhost:8080/display/all");
    //const displays = await response.json();
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        // Die Bilddatei von der Spring Boot API herunterladen
        const fetchImage = async () => {
            try {
                let teststring = "http://localhost:8080/image/download/"+filename
                const response = await fetch(teststring, {});

                if (response.status === 200) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    setImageSrc(imageUrl); // Bild-URL setzen, um es anzuzeigen
                } else {
                    console.error('Fehler beim Laden des Bildes:', response.status);
                }
            } catch (error) {
                console.error('Fehler beim Abrufen des Bildes:', error);
            }
        };

        fetchImage();
    }, []);






    return (
        <div className={`flex flex-col`}>
            <div className={`${styles.frame} border-gray-700 rounded`}>
                <img src={imageSrc} alt={''} className={`h-full object-fill`}/>
            </div>
            <span className={`${styles.name} text-gray-800`}>Display {id}</span>
        </div>
    )
}