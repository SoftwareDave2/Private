import React, { useEffect, useState } from 'react'
import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Option, Select, Typography} from '@material-tailwind/react'

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

    // Validierung der Variabeln
    const [errors, setErrors] = useState({ name: '', busyUntil: '' })
      const [isValid, setIsValid] = useState(false)

      useEffect(() => {
        if (!person) {
          setErrors({ name: '', busyUntil: '' })
          setIsValid(false)
          return
        }

        const newErrors = { name: '', busyUntil: '' }
        let valid = true


        const name = (person.name ?? '').trim()
        if (!name) {
          newErrors.name = 'Name ist erforderlich.'
          valid = false
        } else if (name.length > 35) {
          newErrors.name = 'Name darf höchstens 35 Zeichen haben.'
          valid = false
        }

        // busyUntil prüfen, nur falls status busy und ein Wert vorhanden ist
        if (person.status === 'busy' && person.busyUntil) {
          const busyDate = new Date(person.busyUntil)
          const now = new Date()
          if (isNaN(busyDate.getTime())) {
            newErrors.busyUntil = 'Ungültiges Datum/Zeitformat.'
            valid = false
          } else if (busyDate < now) {
            newErrors.busyUntil = 'Datum/Zeit darf nicht in der Vergangenheit liegen.'
            valid = false
          }
        }

        setErrors(newErrors)
        setIsValid(valid)
      }, [person])


    return (
        <Dialog open={open} handler={onClose} size={'sm'}>
            <DialogHeader>Person bearbeiten</DialogHeader>
            <DialogBody>
                {person && (
                    <div className={'space-y-4'}>
                        <div>
                        <Input label={'Name'} value={person.name} maxLength={35}
                               onChange={(event) => handleFieldChange('name', event.target.value)}
                               error={!!errors.name}/>
                        <div className="flex items-center justify-between">
                           {errors.name ? (
                              <Typography color="red" className="text-sm mt-1">
                                  {errors.name}
                              </Typography>
                           ) : (
                              <Typography color="gray" className="text-xs mt-1">
                               Max. 35 Zeichen
                              </Typography>
                           )}
                        </div>
                    </div>

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
                            <div>
                              <Input type={'datetime-local'} label={'Beschäftigt bis'}
                                   value={person.busyUntil}
                                   onChange={(event) => handleFieldChange('busyUntil', event.target.value)}
                                    error={!!errors.busyUntil}/>
                                 {errors.busyUntil && (
                                    <Typography color="red" className="text-sm mt-1">
                                        {errors.busyUntil}
                                    </Typography>
                                 )}
                            </div>
                        )}
                    </div>
                )}
            </DialogBody>

            <DialogFooter className={'space-x-2'}>
                <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={onSave}
                        disabled={!person || !isValid}>
                    Speichern
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
