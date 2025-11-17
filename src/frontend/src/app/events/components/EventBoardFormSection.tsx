import {Button, Input, Typography} from '@material-tailwind/react'
import {EventBoardEvent, EventBoardForm} from '../types'

type EventBoardFormSectionProps = {
    form: EventBoardForm
    onFormChange: (next: EventBoardForm) => void
    onAddEvent: () => void
    onEditEvent: (event: EventBoardEvent) => void
    onRemoveEvent: (eventId: number) => void
}

export function EventBoardFormSection({
    form,
    onFormChange,
    onAddEvent,
    onEditEvent,
    onRemoveEvent,
}: EventBoardFormSectionProps) {
    const handleFieldChange = (key: keyof EventBoardForm, value: string | EventBoardEvent[]) => {
        onFormChange({ ...form, [key]: value } as EventBoardForm)
    }

    return (
        <div className={'space-y-4'}>
            <Input label={'Titel'} value={form.title}
                   onChange={(event) => handleFieldChange('title', event.target.value)} />
            <div className={'space-y-3'}>

                <div className={'space-y-3'}>
                    {form.events.map((event) => (
                        <div key={event.id} className={'grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center rounded-lg border border-blue-gray-100 bg-white p-4'}>
                            <button type={'button'}
                                    className={'text-left w-full focus:outline-none'}
                                    onClick={() => onEditEvent(event)}>
                                <p className={'font-semibold text-sm text-black'}>{event.title.trim() || 'Neues Ereignis'}</p>
                                <p className={'text-xs text-blue-gray-500 mt-1'}>
                                    {(event.date.trim() || 'Datum festlegen')} · {(event.time.trim() || 'Uhrzeit festlegen')}
                                    {event.endTime?.trim() ? ` - ${event.endTime.trim()}` : ''}
                                </p>
                                {event.qrLink.trim() && (
                                    <p className={'text-xs text-blue-gray-500 mt-1 break-words'}>{event.qrLink}</p>
                                )}
                            </button>

                        </div>
                    ))}
                </div>
                <Button variant={'outlined'} size={'sm'} className={'normal-case w-full sm:w-auto'}
                        disabled={form.events.length >= 4}
                        onClick={onAddEvent}>
                    Ereignis hinzufügen
                </Button>
            </div>
        </div>
    )
}
