import ExclamationIcon from "@/components/shared/ExclamationIcon";
import {Alert, Typography} from "@material-tailwind/react";

type SaveEventErrorAlertProps = {
    errorMsg: string[]
}

export default function SaveEventErrorAlert({errorMsg}: SaveEventErrorAlertProps) {
    return (
        <Alert color={'amber'} icon={<ExclamationIcon />}
               className={'mb-5'}>
            <Typography className={'font-medium'}>
                Ein Fehler beim Speichern des Events ist aufgetreten!
            </Typography>
            <ul className={'ms-3 list-disc list-inside'}>
                {errorMsg.map(m =>
                    <li className={'font-light text-sm'}>{m}</li>
                )}
            </ul>
        </Alert>
    )
}