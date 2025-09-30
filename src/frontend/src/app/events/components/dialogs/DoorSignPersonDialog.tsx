import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Option, Select} from '@material-tailwind/react'

import {DoorSignPerson, DoorSignPersonStatus} from '../../types'

type PersonStatusOption = {
    value: DoorSignPersonStatus
    label: string
}

type DoorSignPersonDialogProps = {
    open: boolean
    person: DoorSignPerson | null
    statuses: PersonStatusOption[]
    onClose: () => void
    onChange: (person: DoorSignPerson) => void
    onSave: () => void
}

export function DoorSignPersonDialog({
    open,
    person,
    statuses,
    onClose,
    onChange,
    onSave,
}: DoorSignPersonDialogProps) {
    const handleFieldChange = (key: keyof DoorSignPerson, value: string | DoorSignPersonStatus) => {
        if (!person) {
            return
        }

        if (key === 'status') {
            const nextStatus = value as DoorSignPersonStatus
            onChange({
                ...person,
                status: nextStatus,
                busyUntil: nextStatus === 'busy' ? person.busyUntil : '',
            })
            return
        }

        onChange({
            ...person,
            [key]: value,
        })
    }

    return (
        <Dialog open={open} handler={onClose} size={'sm'}>
            <DialogHeader>Person bearbeiten</DialogHeader>
            <DialogBody>
                {person && (
                    <div className={'space-y-4'}>
                        <Input label={'Name'} value={person.name}
                               onChange={(event) => handleFieldChange('name', event.target.value)} />
                        <Select label={'Status'} value={person.status}
                                onChange={(value) => {
                                    if (!value) {
                                        return
                                    }
                                    handleFieldChange('status', value as DoorSignPersonStatus)
                                }}>
                            {statuses.map((status) => (
                                <Option key={status.value} value={status.value}>{status.label}</Option>
                            ))}
                        </Select>
                        {person.status === 'busy' && (
                            <Input type={'datetime-local'} label={'Beschäftigt bis'}
                                   value={person.busyUntil}
                                   onChange={(event) => handleFieldChange('busyUntil', event.target.value)} />
                        )}
                    </div>
                )}
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={onSave}
                        disabled={!person}>
                    Speichern
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
