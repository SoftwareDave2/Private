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
        onFormChange({ ...form, [key]: value })
    }

    return (
        <div className={'space-y-4'}>
            <div className={'grid gap-3 sm:grid-cols-2'}>
                <Input label={'Raumnummer'} value={form.roomNumber}
                       onChange={(event) => handleFieldChange('roomNumber', event.target.value)} />
                <Input label={'Raumtyp'} value={form.roomType}
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
                                    {entry.time.trim() || 'Uhrzeit festlegen'}
                                </p>
                            </button>
                            <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case justify-self-start sm:justify-self-end'}
                                    disabled={form.entries.length <= 1}
                                    onClick={() => onRemoveEntry(entry.id)}>
                                Entfernen
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant={'outlined'} size={'sm'} className={'normal-case'}
                        disabled={form.entries.length >= 4}
                        onClick={onAddEntry}>
                    Termin hinzufügen
                </Button>
            </div>
        </div>
    )
}
