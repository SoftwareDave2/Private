import {Alert, Typography} from "@material-tailwind/react";
import ExclamationIcon from "@/components/shared/ExclamationIcon";

type InvalidFileAlertProps = {

}

export default function InvalidFileAlert() {
    return (
        <Alert color={'amber'} icon={<ExclamationIcon />} className={'mb-4'}>
            <Typography>
                Das ausgewählte Bild ist leider nicht im korrekten Format! Bitte beachten Sie folgende Vorgaben:
            </Typography>
            <ul className={'ms-3 list-disc list-inside'}>
                <li>Maximale Dateigröße: 10MB</li>
            </ul>
        </Alert>
    )
}