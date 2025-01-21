import { Alert, Typography } from "@material-tailwind/react"
import ExclamationIcon from "@/components/shared/ExclamationIcon";

export default function CollisionDetectedAlert() {
    return (
        <Alert color={'amber'} icon={<ExclamationIcon />}
                className={'mb-5'}>
            <Typography className={'font-medium'}>
                Eine Kollision mit einem anderen Kalendereintrag wurde gefunden!
            </Typography>
            <Typography className={'font-bold text-sm'}>Bestehender Eintrag:</Typography>
            <Typography className={'font-light text-sm'}>
                <span className={'block ms-3'}>Testmeeting 123</span>
                <span className={'block ms-3'}>01.01.1970 01:00 - 02.01.1970 01:00</span>
            </Typography>
        </Alert>
    )
}