import {Button} from '@material-tailwind/react'

import {BookingEntry, RoomBookingForm} from '../../types'

type RoomBookingPreviewProps = {
    form: RoomBookingForm
    onRemoveEntry: (entryId: number) => void
}

const normalizeEntries = (entries: BookingEntry[]) => entries
    .filter((entry) => (entry.title ?? '').trim().length > 0 || (entry.time ?? '').trim().length > 0)
    .map((entry) => {
        const raw = typeof entry.time === 'string' ? entry.time : ''
        const segments = raw.split('-').map((segment) => segment.trim()).filter((segment) => segment.length > 0)
        const startTime = segments.length >= 1 ? segments[0] : ''
        const endTime = segments.length >= 2 ? segments[1] : ''
        const normalized = startTime && endTime ? `${startTime} - ${endTime}` : raw || startTime || endTime
        return {
            ...entry,
            normalizedTime: normalized,
            startTime,
            endTime,
        }
    })

export function RoomBookingPreview({ form, onRemoveEntry }: RoomBookingPreviewProps) {
    const entriesSource = Array.isArray(form.entries) ? form.entries : []
    const parsedEntries = normalizeEntries(entriesSource)

    const roomNumberLabel = ((form.roomNumber || '').trim()) || '—'
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

    return (
        <div className={'rounded-2xl bg-white border-2 border-black p-5 flex flex-col gap-4 text-black'} style={{ width: 400, height: 300 }}>
            <div className={'flex items-start justify-between gap-4'}>
                <div className={'flex flex-col gap-3'}>
                    <div className={'grid gap-2'}>
                        <div className={'flex items-center justify-between'}>
                            <p className={'text-xs uppercase tracking-wide text-red-700 font-semibold'}>Aktiver Termin</p>
                            <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case'}
                                    onClick={() => onRemoveEntry(activeEntry.id)}>
                                Entfernen
                            </Button>
                        </div>
                        <div className={'mt-1 rounded-lg border border-black bg-white px-3 py-2 text-left w-40 h-20 flex flex-col justify-center'}>
                            <span className={'text-sm font-semibold text-black truncate'}>
                                {activeEntry?.normalizedTime ? `${activeEntry.normalizedTime} Uhr` : 'Keine Zeit'}
                            </span>
                            <span className={'mt-1 text-xs text-black line-clamp-2'}>
                                {activeEntry?.title?.trim() || 'Kein Meeting ausgewählt'}
                            </span>
                        </div>
                    </div>
                </div>
                <p className={'text-3xl font-semibold text-black leading-tight text-right min-w-[4rem]'}>{roomNumberLabel}</p>
            </div>
            <div className={'flex-1 min-h-0'}>
                {secondaryEntries.length > 0 && (
                    <div className={'flex flex-1 flex-col bg-white px-3 pt-3 pb-6 space-y-2'}>
                        {secondaryEntries.map((entry, index) => {
                            const labelText = `Ab ${entry.startTime ? `${entry.startTime} Uhr` : 'sofort'}: ${(entry.title ?? '').trim()}`
                            const isLast = index === secondaryEntries.length - 1
                            return (
                                <div key={entry.id} className={'text-sm text-black leading-snug w-full'}>
                                    <p>{labelText}</p>
                                    {!isLast && <div className={'h-px w-full bg-black/30 my-1'} />}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <div className={'mt-auto pt-3 flex justify-between items-end'}>
                <p className={'text-sm font-semibold text-black truncate'}>{roomTypeLabel}</p>
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
