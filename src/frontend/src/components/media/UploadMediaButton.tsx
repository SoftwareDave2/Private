import {Button} from "@material-tailwind/react";
import {EventHandler} from "react";
import {getBackendApiUrl} from "@/utils/backendApiUrl";

type UploadMediaButtonProps = {
    onClick: () => void,
}

export default function UploadMediaButton({onClick}: UploadMediaButtonProps) {

    // const host = window.location.hostname;
    // const backendApiUrl = 'http://' + host + ':8080';
    const backendApiUrl = getBackendApiUrl();

    // const handleUpload = async () => { // handleUpload funktion nichtmehr benötigt, da in upload media dialog durchgeführt wird
    //
    //     if (file) {
    //         const formData = new FormData()
    //         formData.append('image', file)
    //
    //         try {
    //             await fetch(backendApiUrl + '/image/upload', {
    //                 method: 'POST',
    //                 body: formData
    //             })
    //
    //             console.log('Request successfully sent to server.')
    //         } catch (error) {
    //             console.error('Error on uploading file.', error)
    //         }
    //     }
    //
    //     onClick()
    // }

    return (
        <Button className='bg-primary text-white' onClick={onClick}>Speichern</Button>
    )
}