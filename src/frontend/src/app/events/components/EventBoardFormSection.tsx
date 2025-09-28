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
            <div>
                <label className={'block text-sm font-medium text-blue-gray-700 mb-2'}>
                    Beschreibung
                </label>
                <textarea className={'w-full rounded-md border border-blue-gray-100 bg-white p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-0'}
                          rows={3}
                          value={form.description || ''}
                          onChange={(event) => handleFieldChange('description', event.target.value)}
                          placeholder={'Kurzer Einführungstext für die Ereignisliste'} />
            </div>
            <div className={'space-y-3'}>
                <Typography variant={'small'} color={'blue-gray'} className={'font-medium'}>
                    Ereignisse (max. 4 Einträge)
                </Typography>
                <div className={'space-y-3'}>
                    {form.events.map((event) => (
                        <div key={event.id} className={'grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center rounded-lg border border-blue-gray-100 bg-white p-4'}>
                            <button type={'button'}
                                    className={'text-left w-full focus:outline-none'}
                                    onClick={() => onEditEvent(event)}>
                                <p className={'font-semibold text-sm text-black'}>{event.title.trim() || 'Neues Ereignis'}</p>
                                <p className={'text-xs text-blue-gray-500 mt-1'}>
                                    {(event.date.trim() || 'Datum festlegen')} · {(event.time.trim() || 'Uhrzeit festlegen')}
                                </p>
                                {event.qrLink.trim() && (
                                    <p className={'text-xs text-blue-gray-500 mt-1 break-words'}>{event.qrLink}</p>
                                )}
                            </button>
                            <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case justify-self-start sm:justify-self-end'}
                                    onClick={() => onRemoveEvent(event.id)}>
                                Entfernen
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant={'outlined'} size={'sm'} className={'normal-case'}
                        disabled={form.events.length >= 4}
                        onClick={onAddEvent}>
                    Ereignis hinzufügen
                </Button>
            </div>
        </div>
    )
}
