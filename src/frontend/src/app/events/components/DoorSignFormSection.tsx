import {Button, Input, Typography} from '@material-tailwind/react'
import {DoorSignForm, DoorSignPerson, DoorSignPersonStatus} from '../types'

type DoorSignFormSectionProps = {
    form: DoorSignForm
    statuses: { value: DoorSignPersonStatus; label: string }[]
    onFormChange: (next: DoorSignForm) => void
    onEditPerson: (person: DoorSignPerson) => void
    onAddPerson: () => void
    onRemovePerson: (personId: number) => void
    formatDate: (value: string) => string
}

export function DoorSignFormSection({
    form,
    statuses,
    onFormChange,
    onEditPerson,
    onAddPerson,
    onRemovePerson,
    formatDate,
}: DoorSignFormSectionProps) {
    const handleRoomNumberChange = (value: string) => {
        onFormChange({ ...form, roomNumber: value })
    }

    return (
        <div className={'space-y-4'}>
            <div className={'grid gap-3 sm:grid-cols-2'}>
                <Input label={'Raumnummer'} value={form.roomNumber}
                       onChange={(event) => handleRoomNumberChange(event.target.value)} />
                <Input label={'Zusätzlicher Hinweis'} value={form.footerNote}
                       onChange={(event) => onFormChange({ ...form, footerNote: event.target.value })} />
            </div>
            <div>
                <Typography variant={'small'} color={'blue-gray'} className={'mb-2 font-medium'}>
                    Personen auf dem Türschild (max. 3)
                </Typography>
                <div className={'space-y-4'}>
                    {form.people.map((person, index) => {
                        const statusDefinition = statuses.find((status) => status.value === person.status)
                        const statusLabel = statusDefinition?.label ?? 'Verfügbar'
                        const displayName = (person.name ?? '').trim().length > 0 ? person.name : `Person ${index + 1}`
                        const busyInfo = person.status === 'busy' && person.busyUntil
                            ? `Bis ${formatDate(person.busyUntil)}`
                            : ''

                        return (
                            <div key={person.id} className={'rounded-lg border border-blue-gray-100 bg-white p-4 shadow-sm'}>
                                <div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
                                    <button type={'button'}
                                            onClick={() => onEditPerson(person)}
                                            className={'w-full rounded-md bg-transparent text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500'}>
                                        <p className={'text-base font-semibold text-black'}>{displayName}</p>
                                        <p className={'text-sm text-blue-gray-500'}>
                                            Status: {statusLabel}
                                            {busyInfo && (
                                                <span className={'text-blue-gray-400'}> – {busyInfo}</span>
                                            )}
                                        </p>
                                    </button>
                                    <div className={'flex items-center gap-2'}>
                                        <Button variant={'outlined'} size={'sm'} className={'normal-case'}
                                                onClick={() => onEditPerson(person)}>
                                            Bearbeiten
                                        </Button>
                                        {form.people.length > 1 && (
                                            <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case'}
                                                    onClick={() => onRemovePerson(person.id)}>
                                                Entfernen
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <Button variant={'outlined'} size={'sm'} className={'normal-case mt-3'}
                        disabled={form.people.length >= 3}
                        onClick={onAddPerson}>
                    Weitere Person hinzufügen
                </Button>
            </div>
        </div>
    )
}
