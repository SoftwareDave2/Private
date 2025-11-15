import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Switch, Typography} from '@material-tailwind/react'

type BookingDraft = {
    id: number
    title: string
    startTime: string
    endTime: string
    allDay: boolean
}

type RoomBookingEntryDialogProps = {
    open: boolean
    draft: BookingDraft | null
    onClose: () => void
    onChange: (draft: BookingDraft) => void
    onSave: () => void
}

export function RoomBookingEntryDialog({ open, draft, onClose, onChange, onSave }: RoomBookingEntryDialogProps) {
    const handleFieldChange = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => {
        if (!draft) {
            return
        }
        onChange({
            ...draft,
            [key]: value,
        })
    }

    const handleAllDayToggle = (checked: boolean) => {
        if (!draft) {
            return
        }
        onChange({
            ...draft,
            allDay: checked,
            startTime: checked ? '' : draft.startTime,
            endTime: checked ? '' : draft.endTime,
        })
    }

    return (
        <Dialog open={open} handler={onClose} size={'sm'}>
            <DialogHeader>Termin bearbeiten</DialogHeader>
            <DialogBody>
                {draft && (
                    <div className={'space-y-4'}>
                        <Input label={'Titel'} value={draft.title}
                               onChange={(inputEvent) => handleFieldChange('title', inputEvent.target.value)} />
                        <div className={'grid gap-3 sm:grid-cols-2'}>
                            <Input type={'time'} label={'Beginn'} value={draft.startTime} disabled={draft.allDay}
                                   onChange={(inputEvent) => handleFieldChange('startTime', inputEvent.target.value)} />
                            <Input type={'time'} label={'Ende'} value={draft.endTime} disabled={draft.allDay}
                                   onChange={(inputEvent) => handleFieldChange('endTime', inputEvent.target.value)} />
                        </div>
                        <div className={'flex items-center justify-between'}>
                            <Typography variant={'small'} className={'text-xs font-medium text-blue-gray-600'}>
                                Ganztägig
                            </Typography>
                            <Switch label={''} ripple={false} crossOrigin={''} checked={draft.allDay}
                                    onChange={(event) => handleAllDayToggle(event.target.checked)} />
                        </div>
                    </div>
                )}
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={onSave}
                        disabled={!draft}>
                    Speichern
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
