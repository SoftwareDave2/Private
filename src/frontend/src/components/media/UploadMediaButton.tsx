import {Button} from "@material-tailwind/react";
import {EventHandler} from "react";

type UploadMediaButtonProps = {
    file: File | null,
    onClick: EventHandler<any>,
}

export default function UploadMediaButton({file, onClick}: UploadMediaButtonProps) {

    const host = window.location.hostname;
const backendApiUrl = 'http://' + host + ':8080';

    const handleUpload = async () => {

        if (file) {
            const formData = new FormData()
            formData.append('image', file)

            try {
                await fetch(backendApiUrl + '/image/upload', {
                    method: 'POST',
                    body: formData
                })

                console.log('Request successfully sent to server.')
            } catch (error) {
                console.error('Error on uploading file.', error)
            }
        }

        onClick()
    }

    return (
        <Button className='bg-primary text-white' onClick={handleUpload}>Speichern</Button>
    )
}