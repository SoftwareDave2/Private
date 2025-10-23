import {Button, Input, Typography} from '@material-tailwind/react'
import {EventBoardEvent, EventBoardForm} from '../types'
import {getEventStartDateTime, isEventPast, sortEventsBySchedule} from '../utils/eventBoard'

type EventBoardFormSectionProps = {
    form: EventBoardForm
    onFormChange: (next: EventBoardForm) => void
    onOpenCalendar: () => void
    onEditEvent: (event: EventBoardEvent) => void
    onRemoveEvent: (eventId: number) => void
}

export function EventBoardFormSection({
    form,
    onFormChange,
    onOpenCalendar,
    onEditEvent,
    onRemoveEvent,
}: EventBoardFormSectionProps) {
    const handleFieldChange = (key: keyof EventBoardForm, value: string | EventBoardEvent[]) => {
        onFormChange({ ...form, [key]: value } as EventBoardForm)
    }
    const sortedEvents = sortEventsBySchedule(form.events)
    const totalEvents = sortedEvents.length
    const now = new Date()

    return (
        <div className={'space-y-4'}>
            <Input label={'Titel'} value={form.title}
                   onChange={(event) => handleFieldChange('title', event.target.value)} />
            <div className={'space-y-3'}>
                <Typography variant={'small'} color={'blue-gray'} className={'font-medium'}>
                    Ereignisse {totalEvents > 0 ? `(gesamt: ${totalEvents})` : ''}
                </Typography>
                <div className={'space-y-3'}>
                    {sortedEvents.map((event) => {
                        const startDateTime = getEventStartDateTime(event)
                        const hasSchedule = Boolean(startDateTime)
                        const pastEvent = hasSchedule && isEventPast(event, now)
                        const statusLabel = !hasSchedule ? 'Datum fehlt' : pastEvent ? 'Vergangen' : null
                        const cardStateClass = pastEvent
                            ? 'border-blue-gray-200 bg-blue-gray-50/70'
                            : hasSchedule
                                ? 'border-blue-gray-100 bg-white'
                                : 'border-amber-200/70 bg-amber-50/70'
                        return (
                            <div key={event.id}
                                 className={`grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center rounded-lg border ${cardStateClass} p-4`}>
                                <button type={'button'}
                                        className={'text-left w-full focus:outline-none'}
                                        onClick={() => onEditEvent(event)}>
                                    <p className={'font-semibold text-sm text-black'}>{event.title.trim() || 'Neues Ereignis'}</p>
                                    <p className={'text-xs text-blue-gray-500 mt-1'}>
                                        {(event.date.trim() || 'Datum festlegen')} · {(event.time.trim() || 'Uhrzeit festlegen')}
                                    </p>
                                    {statusLabel && (
                                        <p className={'mt-1 text-[0.68rem] uppercase tracking-wide text-blue-gray-500'}>
                                            {statusLabel}
                                        </p>
                                    )}
                                    {event.qrLink.trim() && (
                                        <p className={'text-xs text-blue-gray-500 mt-1 break-words'}>{event.qrLink}</p>
                                    )}
                                </button>
                                <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case justify-self-stretch sm:justify-self-end w-full sm:w-auto'}
                                        onClick={() => onRemoveEvent(event.id)}>
                                    Entfernen
                                </Button>
                            </div>
                        )
                    })}
                    {sortedEvents.length === 0 && (
                        <div className={'rounded-lg border border-dashed border-blue-gray-200 bg-white p-4 text-sm text-blue-gray-500'}>
                            Noch keine Ereignisse gespeichert. Nutzen Sie den Kalender, um neue Einträge anzulegen.
                        </div>
                    )}
                </div>
                <Button variant={'outlined'} size={'sm'} className={'normal-case w-full sm:w-auto'}
                        onClick={onOpenCalendar}>
                    Kalender öffnen
                </Button>
            </div>
        </div>
    )
}
