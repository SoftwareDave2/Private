'use client'

import {useEffect, useMemo, useRef} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, {DateClickArg} from '@fullcalendar/interaction'
import {EventClickArg} from '@fullcalendar/core'
import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Typography} from '@material-tailwind/react'

import {EventBoardEvent} from '../../types'

type EventBoardCalendarDialogProps = {
    open: boolean
    events: EventBoardEvent[]
    selectedEvent: EventBoardEvent | null
    mode: 'create' | 'edit' | null
    focusDate: string | null
    onClose: () => void
    onDateSelect: (date: string) => void
    onEventSelect: (eventId: number) => void
    onFieldChange: (key: keyof EventBoardEvent, value: string) => void
    onSave: () => void
    onDelete: () => void
    onClearSelection: () => void
}

const toCalendarEvent = (event: EventBoardEvent) => {
    const trimmedDate = event.date.trim()
    if (!trimmedDate) {
        return null
    }
    const trimmedTime = event.time.trim()
    const hasTime = trimmedTime.length > 0
    const start = hasTime ? `${trimmedDate}T${trimmedTime}` : trimmedDate

    return {
        id: String(event.id),
        title: event.title.trim() || 'Unbenanntes Ereignis',
        start,
        allDay: !hasTime,
    }
}

export function EventBoardCalendarDialog({
    open,
    events,
    selectedEvent,
    mode,
    focusDate,
    onClose,
    onDateSelect,
    onEventSelect,
    onFieldChange,
    onSave,
    onDelete,
    onClearSelection,
}: EventBoardCalendarDialogProps) {
    const calendarRef = useRef<FullCalendar | null>(null)
    const selectedDate = selectedEvent?.date?.trim() ?? null
    const focusedDate = focusDate?.trim() ?? null

    useEffect(() => {
        if (!open) {
            return
        }
        const targetDate = selectedDate || focusedDate
        if (!targetDate) {
            return
        }
        const calendarInstance = calendarRef.current
        if (calendarInstance && typeof calendarInstance.getApi === 'function') {
            const api = calendarInstance.getApi()
            api.gotoDate(targetDate)
        }
    }, [open, focusedDate, selectedDate])

    const calendarEvents = useMemo(
        () => events.map(toCalendarEvent).filter((event): event is NonNullable<ReturnType<typeof toCalendarEvent>> => Boolean(event)),
        [events],
    )

    const handleDateClick = (info: DateClickArg) => {
        onDateSelect(info.dateStr)
    }

    const handleEventClick = (info: EventClickArg) => {
        info.jsEvent.preventDefault()
        const id = Number.parseInt(info.event.id, 10)
        if (Number.isNaN(id)) {
            return
        }
        onEventSelect(id)
    }

    const showForm = Boolean(mode && selectedEvent)

    return (
        <>
            <Dialog open={open} handler={onClose} size={'xl'} className={'max-h-[90vh]'}>
                <DialogHeader>Kalender</DialogHeader>
                <DialogBody className={'space-y-6 overflow-y-auto'}>
                    <div className={'grid gap-6 lg:grid-cols-[1.5fr_1fr]'}>
                        <div className={'min-h-[420px]'}>
                            <div className={'event-board-calendar'}>
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView={'dayGridMonth'}
                                    locale={'de'}
                                    headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                                    buttonText={{ today: 'Heute' }}
                                    events={calendarEvents}
                                    dateClick={handleDateClick}
                                    eventClick={handleEventClick}
                                    height={'auto'}
                                    fixedWeekCount={false}
                                    dayMaxEventRows={2}
                                    dayCellClassNames={(info) => {
                                        const current = info.dateStr
                                        const targetDate = selectedDate || focusedDate
                                        if (targetDate && current === targetDate) {
                                            return ['event-board-calendar__day-selected']
                                        }
                                        return []
                                    }}
                                />
                            </div>
                        </div>
                        <div className={'flex flex-col gap-4'}>
                            {showForm && selectedEvent ? (
                                <div className={'space-y-4'}>
                                    <Typography variant={'h6'} className={'text-base font-semibold text-blue-gray-800'}>
                                        {mode === 'create' ? 'Ereignis erstellen' : 'Ereignis bearbeiten'}
                                    </Typography>
                                    <Input
                                        label={'Titel'}
                                        value={selectedEvent.title}
                                        onChange={(event) => onFieldChange('title', event.target.value)}
                                    />
                                    <Input
                                        type={'date'}
                                        label={'Datum'}
                                        value={selectedEvent.date}
                                        onChange={(event) => onFieldChange('date', event.target.value)}
                                    />
                                    <Input
                                        type={'time'}
                                        label={'Uhrzeit'}
                                        value={selectedEvent.time}
                                        onChange={(event) => onFieldChange('time', event.target.value)}
                                    />
                                    <Input
                                        type={'url'}
                                        label={'Link für QR-Code'}
                                        value={selectedEvent.qrLink}
                                        onChange={(event) => onFieldChange('qrLink', event.target.value)}
                                        placeholder={'https://...'}
                                    />
                                    <div className={'flex justify-end gap-2'}>
                                        {mode === 'edit' && (
                                            <Button variant={'text'} color={'red'} className={'normal-case'} onClick={onDelete}>
                                                Löschen
                                            </Button>
                                        )}
                                        <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClearSelection}>
                                            Abbrechen
                                        </Button>
                                        <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={onSave} disabled={!selectedEvent}>
                                            Speichern
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className={'rounded-lg border border-blue-gray-100 bg-blue-gray-50 p-4 text-sm text-blue-gray-600'}>
                                    Klicken Sie auf einen Tag, um ein neues Ereignis zu erstellen, oder wählen Sie ein bestehendes Ereignis im Kalender aus, um es zu bearbeiten.
                                </div>
                            )}
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClose}>
                        Schließen
                    </Button>
                </DialogFooter>
            </Dialog>
            <style jsx global>{`
                .event-board-calendar .fc-daygrid-day {
                    transition: background-color 0.2s ease, border-color 0.2s ease;
                    cursor: pointer;
                    border-radius: 6px;
                }

                .event-board-calendar .fc-daygrid-day-frame {
                    border-radius: inherit;
                }

                .event-board-calendar .fc-daygrid-day:hover {
                    background-color: rgba(248, 113, 113, 0.1);
                }

                .event-board-calendar .event-board-calendar__day-selected,
                .event-board-calendar .event-board-calendar__day-selected:hover {
                    background-color: rgba(248, 113, 113, 0.18);
                    box-shadow: inset 0 0 0 2px rgba(239, 68, 68, 0.6);
                }

                .event-board-calendar .event-board-calendar__day-selected .fc-daygrid-day-frame {
                    background-color: transparent;
                }
            `}</style>
        </>
    )
}
