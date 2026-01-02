import {BookingEntry, RoomBookingForm} from '../../types'

type RoomBookingPreviewProps = {
    form: RoomBookingForm
    onRemoveEntry: (entryId: number) => void
}

const parseDate = (value?: string) => {
    if (!value) {
        return null
    }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }
    return parsed
}

const formatDateLabel = (value?: string) => {
    const parsed = parseDate(value)
    if (!parsed) {
        return ''
    }
    return parsed.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

const formatDateRange = (start?: string, end?: string) => {
    const startLabel = formatDateLabel(start)
    if (!startLabel) {
        return 'Datum offen'
    }
    const endLabel = formatDateLabel(end)
    if (!endLabel || end === start) {
        return startLabel
    }
    return `${startLabel} - ${endLabel}`
}

const normalizeEntries = (entries: BookingEntry[]) =>
    entries
        .map((entry) => {
            const isAllDay = Boolean(entry.allDay)
            const baseStart = (entry.startTime ?? '').trim()
            const baseEnd = (entry.endTime ?? '').trim()
            let startTime = isAllDay ? '' : baseStart
            let endTime = isAllDay ? '' : baseEnd

            if (!startTime && !endTime && typeof entry.time === 'string') {
                const segments = entry.time
                    .split('-')
                    .map((segment) => segment.trim())
                    .filter((segment) => segment.length > 0)
                startTime = segments.length >= 1 ? segments[0] : ''
                endTime = segments.length >= 2 ? segments[1] : ''
            }

            const normalized = isAllDay
                ? 'Ganztägig'
                : startTime && endTime
                    ? `${startTime} - ${endTime}`
                    : startTime || endTime || ''

            const parsedDate = parseDate(entry.date)
            const ts = (() => {
                if (!parsedDate) return Number.POSITIVE_INFINITY
                const datePart = parsedDate.toISOString().split('T')[0]
                if (isAllDay) {
                    return new Date(`${datePart}T00:00:00`).getTime()
                }
                const timePart = startTime || '00:00'
                const candidate = new Date(`${datePart}T${timePart}:00`)
                return Number.isNaN(candidate.getTime()) ? parsedDate.getTime() : candidate.getTime()
            })()

            return {
                ...entry,
                normalizedTime: normalized,
                startTime,
                endTime,
                allDay: isAllDay,
                dateLabel: formatDateRange(entry.date, entry.endDate),
                startTimestamp: ts,
            }
        })
        .filter((entry) => (entry.title ?? '').trim().length > 0 || entry.normalizedTime.length > 0 || entry.allDay)
        .sort((a, b) => a.startTimestamp - b.startTimestamp)

export function RoomBookingPreview({ form }: RoomBookingPreviewProps) {
    const entriesSource = Array.isArray(form.entries) ? form.entries : []
    const parsedEntries = normalizeEntries(entriesSource).slice(0, 4)

    const roomNumberLabel = ((form.roomNumber || '').trim()) || '--'
    const roomTypeLabel = ((form.roomType || 'Besprechungsraum').trim()) || 'Besprechungsraum'

    if (parsedEntries.length === 0) {
        return (
            <div className={'rounded-2xl bg-white border-2 border-black p-5 flex flex-col text-black'} style={{ width: 400, height: 300 }}>
                <div className={'flex items-start justify-between'}>
                    <span className={'text-sm text-transparent'}>.</span>
                    <p className={'text-3xl font-semibold text-black leading-tight text-right min-w-[4rem]'}>{roomNumberLabel}</p>
                </div>
                <div className={'flex-1 flex items-center justify-center'}>
                    <div className={'w-full max-w-xs'}>
                        <p className={'text-base font-semibold text-black text-left'}>Keine anstehenden Termine</p>
                    </div>
                </div>
                <div className={'pt-3 flex justify-between items-end'}>
                    <p className={'text-sm font-semibold text-black truncate'}>{roomTypeLabel}</p>
                    <div className={'flex flex-col items-center space-y-2'}>
                        <div className={'h-16 w-16 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.55rem] uppercase'}>
                            QR
                        </div>
                        <p className={'text-xs text-black'}>Neue Termine hinzufügen</p>
                    </div>
                </div>
            </div>
        )
    }

    const activeEntry = parsedEntries[0]
    const secondaryEntries = parsedEntries.slice(1, 4)

    const activeTimeLabel = activeEntry.allDay
        ? 'Ganztägig'
        : activeEntry.normalizedTime
            ? `${activeEntry.normalizedTime} Uhr`
            : 'Keine Zeit'

    return (
        <div className={'rounded-2xl bg-white border-2 border-black p-5 flex flex-col gap-4 text-black'} style={{ width: 400, height: 300 }}>
            <div className={'flex items-start justify-between gap-4'}>
                <div className={'flex flex-col gap-3'}>
                    <div className={'grid gap-2'}>
                        <div className={'flex items-center justify-between'}>
                            <p className={'text-xs uppercase tracking-wide text-red-700 font-semibold'}>Anstehender/Aktiver Termin</p>
                        </div>
                        <div className={'mt-1 border border-black bg-white px-3 py-2 text-left w-48 h-24 flex flex-col justify-center'}>
                            <span className={'text-[11px] text-red-700 font-semibold truncate'}>{activeEntry.dateLabel || 'Datum offen'}</span>
                            <span className={'text-sm font-semibold text-red-700 truncate'}>{activeTimeLabel}</span>
                            <span className={'mt-1 text-xs text-black line-clamp-2'}>
                                {activeEntry?.title?.trim() || 'Kein Meeting ausgewählt'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={'flex flex-col items-end'}>
                    <p className={'text-5xl font-semibold text-black leading-tight text-right min-w-[4rem]'}>{roomNumberLabel}</p>
                    <p className={'text-xs text-black text-right'}>{roomTypeLabel}</p>
                </div>
            </div>
            <div className={'flex-1 min-h-0 pb-2'}>
                {secondaryEntries.length > 0 && (
                    <div className={'flex flex-1 flex-col bg-white px-3 pt-2 pb-4 space-y-1.5'}>
                        {secondaryEntries.map((entry, index) => {
                            const timeLabel = entry.allDay
                                ? 'Ganztägig'
                                : entry.startTime
                                    ? `${entry.startTime} Uhr`
                                    : entry.endTime
                                        ? `Bis ${entry.endTime} Uhr`
                                        : 'Uhrzeit offen'
                            const isLast = index === secondaryEntries.length - 1
                            return (
                                <div key={entry.id} className={'text-xs text-black leading-tight w-full'}>
                                    <p className={'font-semibold truncate'}>{entry.title?.trim() || 'Ohne Titel'}</p>
                                    <p className={'text-[11px] text-black/70'}>{entry.dateLabel || 'Datum offen'} | {timeLabel}</p>
                                    {!isLast && <div className={'h-px w-full bg-black/30 my-1'} />}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <div className={'mt-auto pt-3 flex justify-between items-end'}>
                <div />
                {parsedEntries.length <= 1 && (
                    <div className={'flex flex-col items-center space-y-2'}>
                        <div className={'h-16 w-16 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.55rem] uppercase'}>
                            QR
                        </div>
                        <p className={'text-xs text-black'}>Neue Termine hinzufügen</p>
                    </div>
                )}
            </div>
        </div>
    )
}
