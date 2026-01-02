import {Button, Input, Typography} from '@material-tailwind/react'
import {RoomBookingForm} from '../types'

type RoomBookingFormSectionProps = {
    form: RoomBookingForm
    onFormChange: (next: RoomBookingForm) => void
    onOpenCalendar: () => void
}

export function RoomBookingFormSection({
    form,
    onFormChange,
    onOpenCalendar,
}: RoomBookingFormSectionProps) {
    const handleFieldChange = (key: keyof RoomBookingForm, value: string) => {

        if (key === 'roomNumber') {
            value = value.slice(0, 10)
        }
        if (key === 'roomType') {
            value = value.slice(0, 50)
        }
        onFormChange({ ...form, [key]: value })
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

    const formatDateRange = (start: string, end: string) => {
        const startLabel = formatDateValue(start)
        if (!startLabel) {
            return 'Datum offen'
        }
        const endLabel = formatDateValue(end)
        if (!endLabel || start === end) {
            return startLabel
        }
        return `${startLabel} – ${endLabel}`
    }

    const formatEntryTimeLabel = (entry: RoomBookingForm['entries'][number]) => {
        if (entry.allDay) {
            return 'Ganztägig'
        }
        const start = (entry.startTime ?? '').trim()
        const end = (entry.endTime ?? '').trim()
        if (start && end) {
            return `${start} – ${end}`
        }
        if (start) {
            return start
        }
        if (end) {
            return `Bis ${end}`
        }
        const fallback = (entry.time ?? '').trim()
        return fallback || 'Uhrzeit festlegen'
    }

    const sortedEntries = [...form.entries].sort((a, b) => {
        const dateCompare = (a.date || '').localeCompare(b.date || '')
        if (dateCompare !== 0) {
            return dateCompare
        }
        return (a.startTime || '').localeCompare(b.startTime || '')
    })

    return (
        <div className={'space-y-4'}>
            <div className={'grid gap-3 sm:grid-cols-2'}>
                <Input label={'Raumnummer'} value={form.roomNumber} maxLength={10}
                       onChange={(event) => handleFieldChange('roomNumber', event.target.value)} />
                <Input label={'Raumtyp'} value={form.roomType} maxLength={25}
                       onChange={(event) => handleFieldChange('roomType', event.target.value)} />
            </div>
            <div className={'space-y-3'}>
                <div className={'space-y-4 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-sm'}>
                    <div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
                        <div>
                            <Typography variant={'small'} color={'blue-gray'} className={'font-medium'}>
                                Buchungen verwalten
                            </Typography>
                            <p className={'text-xs text-blue-gray-500'}>
                                {form.entries.length} Einträge geplant
                            </p>
                        </div>
                        <Button variant={'filled'} color={'red'} size={'sm'} className={'normal-case w-full sm:w-auto'}
                                onClick={onOpenCalendar}>
                            Kalender öffnen
                        </Button>
                    </div>
                    <div className={'rounded-xl border border-blue-gray-50 bg-blue-gray-50/60 p-3'}>
                        {sortedEntries.length > 0 ? (
                            <div className={'space-y-2'}>
                                {sortedEntries.map((entry) => (
                                    <div key={entry.id} className={'rounded-lg bg-white/80 p-3'}>
                                        <div className={'flex items-center justify-between gap-2'}>
                                            <p className={'text-sm font-semibold text-blue-gray-900'}>
                                                {entry.title.trim() || 'Ohne Titel'}
                                            </p>
                                            {entry.allDay && (
                                                <span className={'rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600'}>
                                                    Ganztägig
                                                </span>
                                            )}
                                        </div>
                                        <p className={'text-xs text-blue-gray-500'}>
                                            {formatDateRange(entry.date, entry.endDate)} · {formatEntryTimeLabel(entry)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={'text-sm text-blue-gray-500'}>
                                Noch keine Termine hinterlegt. Öffne den Kalender, um Buchungen anzulegen.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
