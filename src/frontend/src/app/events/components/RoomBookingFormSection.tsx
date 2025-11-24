import {Button, Input, Typography} from '@material-tailwind/react'
import {BookingEntry, RoomBookingForm} from '../types'

type RoomBookingFormSectionProps = {
    form: RoomBookingForm
    onFormChange: (next: RoomBookingForm) => void
    onAddEntry: () => void
    onEditEntry: (entry: BookingEntry) => void
    onRemoveEntry: (entryId: number) => void
}

export function RoomBookingFormSection({
    form,
    onFormChange,
    onAddEntry,
    onEditEntry,
    onRemoveEntry,
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

    const formatEntryTimeLabel = (entry: BookingEntry) => {
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
            return end
        }
        const fallback = (entry.time ?? '').trim()
        return fallback || 'Uhrzeit festlegen'
    }

    return (
        <div className={'space-y-4'}>
            <div className={'grid gap-3 sm:grid-cols-2'}>
                <Input label={'Raumnummer'} value={form.roomNumber} maxLength={10}
                       onChange={(event) => handleFieldChange('roomNumber', event.target.value)} />
                <Input label={'Raumtyp'} value={form.roomType} maxLength={50}
                       onChange={(event) => handleFieldChange('roomType', event.target.value)} />
            </div>
            <div className={'space-y-3'}>
                <Typography variant={'small'} color={'blue-gray'} className={'font-medium'}>
                    Gezeigte Termine (max. 4 Einträge)
                </Typography>
                <div className={'space-y-3'}>
                    {form.entries.map((entry) => (
                        <div key={entry.id} className={'grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center rounded-lg border border-blue-gray-100 bg-white p-4'}>
                            <button type={'button'} className={'text-left w-full focus:outline-none'} onClick={() => onEditEntry(entry)}>
                                <p className={'font-semibold text-sm text-black'}>{entry.title.trim() || 'Neuer Termin'}</p>
                                <p className={'text-xs text-blue-gray-500 mt-1'}>
                                    {formatEntryTimeLabel(entry)}
                                </p>
                            </button>
                            <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case justify-self-stretch sm:justify-self-end w-full sm:w-auto'}
                                    disabled={form.entries.length <= 1}
                                    onClick={() => onRemoveEntry(entry.id)}>
                                Entfernen
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant={'outlined'} size={'sm'} className={'normal-case w-full sm:w-auto'}
                        disabled={form.entries.length >= 4}
                        onClick={onAddEntry}>
                    Termin hinzufügen
                </Button>
            </div>
        </div>
    )
}
