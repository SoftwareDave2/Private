import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input} from '@material-tailwind/react'

import {EventBoardEvent} from '../../types'

type EventBoardEventDialogProps = {
    open: boolean
    event: EventBoardEvent | null
    onClose: () => void
    onChange: (event: EventBoardEvent) => void
    onSave: () => void
}

export function EventBoardEventDialog({ open, event, onClose, onChange, onSave }: EventBoardEventDialogProps) {
    const handleFieldChange = (key: keyof EventBoardEvent, value: string) => {
        if (!event) {
            return
        }
        onChange({
            ...event,
            [key]: value,
        })
    }

    return (
        <Dialog open={open} handler={onClose} size={'sm'}>
            <DialogHeader>Ereignis bearbeiten</DialogHeader>
            <DialogBody>
                {event && (
                    <div className={'space-y-4'}>
                        <Input label={'Titel'} value={event.title}
                               onChange={(inputEvent) => handleFieldChange('title', inputEvent.target.value)} />
                        <Input type={'date'} label={'Datum'} value={event.date}
                               onChange={(inputEvent) => handleFieldChange('date', inputEvent.target.value)} />
                        <Input type={'time'} label={'Zeit'} value={event.time}
                               onChange={(inputEvent) => handleFieldChange('time', inputEvent.target.value)} />
                        <Input type={'time'} label={'Endzeit'} value={event.endTime || ''}
                               onChange={(inputEvent) => handleFieldChange('endTime', inputEvent.target.value)} />
                        <Input type={'url'} label={'Link für QR-Code'} value={event.qrLink}
                               onChange={(inputEvent) => handleFieldChange('qrLink', inputEvent.target.value)}
                               placeholder={'https://...'} />
                    </div>
                )}
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={onSave}
                        disabled={!event}>
                    Speichern
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
