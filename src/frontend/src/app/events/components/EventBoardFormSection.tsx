import {Button, Input, Typography} from '@material-tailwind/react'
import {EventBoardEvent, EventBoardForm} from '../types'

type EventBoardFormSectionProps = {
    form: EventBoardForm
    onFormChange: (next: EventBoardForm) => void
    onOpenCalendar: () => void
}

const formatDateValue = (value: string) => {
    const trimmed = (value ?? '').trim()
    if (!trimmed) {
        return ''
    }
    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) {
        return trimmed
    }
    return parsed.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

const formatEventDateRange = (event: EventBoardEvent) => {
    const startLabel = formatDateValue(event.date)
    if (!startLabel) {
        return 'Datum offen'
    }
    const endLabel = formatDateValue(event.endDate)
    if (!endLabel || event.endDate.trim() === event.date.trim()) {
        return startLabel
    }
    return `${startLabel} – ${endLabel}`
}

export function EventBoardFormSection({
    form,
    onFormChange,
    onOpenCalendar,
}: EventBoardFormSectionProps) {
    const handleFieldChange = (key: keyof EventBoardForm, value: string) => {
        onFormChange({ ...form, [key]: value } as EventBoardForm)
    }

    const handleTitleChange = (value: string) => {
            const next = value.slice(0, 35)
            handleFieldChange('title', next)
    }
    const hasEvents = form.events.length > 0
    const titleValue = form.title ?? ''
    const titleLength = titleValue.length

    return (
        <div className={'space-y-4'}>
            <Input label={'Titel'} value={form.title}
                   onChange={(event) => handleFieldChange('title', event.target.value)}
                    maxLength={35}/>
            <div className="flex items-center mt-1 text-xs gap-2">
              <p className="text-blue-gray-500 flex-1 text-left">
                Maximal 35 Zeichen erlaubt
              </p>
            </div>
            <div className={'space-y-4 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-sm'}>
                <div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
                    <div>
                        <Typography variant={'small'} color={'blue-gray'} className={'font-medium'}>
                            Ereignisse verwalten
                        </Typography>
                        <p className={'text-xs text-blue-gray-500'}>
                            {form.events.length} Einträge geplant
                        </p>
                    </div>
                    <Button variant={'filled'} color={'red'} size={'sm'} className={'normal-case w-full sm:w-auto'}
                            onClick={onOpenCalendar}>
                        Kalender öffnen
                    </Button>
                </div>
                <div className={'rounded-xl border border-blue-gray-50 bg-blue-gray-50/60 p-3'}>
                    {hasEvents ? (
                        <div className={'space-y-2'}>
                            {[...form.events]
                                .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                                .map((event) => (
                                    <div key={event.id} className={'rounded-lg bg-white/80 p-3'}>
                                        <div className={'flex items-center justify-between gap-2'}>
                                            <p className={'text-sm font-semibold text-blue-gray-900'}>
                                                {event.title.trim() || 'Ohne Titel'}
                                            </p>
                                            {event.important && (
                                                <span className={'rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600'}>
                                                    Wichtig
                                                </span>
                                            )}
                                        </div>
                                        <p className={'text-xs text-blue-gray-500'}>
                                            {formatEventDateRange(event)} · {(() => {
                                                if (event.allDay) {
                                                    return 'Ganztägig'
                                                }
                                                const start = event.startTime.trim()
                                                const end = event.endTime.trim()
                                                if (start) {
                                                    return end ? `${start} – ${end}` : start
                                                }
                                                return 'Startzeit offen'
                                            })()}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className={'text-sm text-blue-gray-500'}>
                            Noch keine Ereignisse hinterlegt. Öffnen Sie den Kalender, um Termine anzulegen.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
