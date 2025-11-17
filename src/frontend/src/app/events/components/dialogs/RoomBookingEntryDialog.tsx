import React, { useEffect, useState } from 'react'

import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Typography} from '@material-tailwind/react'

type BookingDraft = {
    id: number
    title: string
    startTime: string
    endTime: string
}

type RoomBookingEntryDialogProps = {
    open: boolean
    draft: BookingDraft | null
    onClose: () => void
    onChange: (draft: BookingDraft) => void
    onSave: () => void
}

export function RoomBookingEntryDialog({ open, draft, onClose, onChange, onSave }: RoomBookingEntryDialogProps) {
    const handleFieldChange = (key: keyof BookingDraft, value: string) => {
        if (!draft) {
            return
        }
        onChange({
            ...draft,
            [key]: value,
        })
    }

  // Validierungszustand
  const [errors, setErrors] = useState({
    title: '',
    time: '',
    endTime: '',
  })
  const [isValid, setIsValid] = useState(false)

  // Validation läuft jedes Mal, wenn draft sich ändert
  useEffect(() => {
    if (!draft) {
      setErrors({ title: '', time: '', endTime: '' })
      setIsValid(false)
      return
    }

    const newErrors = { title: '', time: '', endTime: '' }
    let valid = true


    const title = (draft.title ?? '').trim()
    if (!title) {
      newErrors.title = 'Titel ist erforderlich.'
      valid = false
    } else if (title.length > 50) {
      newErrors.title = 'Titel darf höchstens 50 Zeichen haben.'
      valid = false
    }


    if (draft.startTime && draft.endTime) {
      const start = new Date(`1970-01-01T${draft.startTime}`)
      const end = new Date(`1970-01-01T${draft.endTime}`)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        if (isNaN(start.getTime())) newErrors.time = 'Ungültige Startzeit.'
        if (isNaN(end.getTime())) newErrors.endTime = 'Ungültige Endzeit.'
        valid = false
      } else if (end <= start) {
        newErrors.endTime = 'Endzeit muss nach der Startzeit liegen.'
        valid = false
      }
    }

    setErrors(newErrors)
    setIsValid(valid)
  }, [draft])



    return (
        <Dialog open={open} handler={onClose} size={'sm'}>
            <DialogHeader>Termin bearbeiten</DialogHeader>
            <DialogBody>
                {draft && (
                    <div className={'space-y-4'}>
                        <Input label={'Titel'} value={draft.title}
                               onChange={(inputEvent) => handleFieldChange('title', inputEvent.target.value)}
                               error={!!errors.title}
                               />
                               {errors.title && <Typography color="red">{errors.title}</Typography>}

                        <div className={'grid gap-3 sm:grid-cols-2'}>
                        <div>
                            <Input type={'time'} label={'Beginn'} value={draft.startTime}
                                   onChange={(inputEvent) => handleFieldChange('startTime', inputEvent.target.value)}
                                    error={!!errors.time}
                                    />
                             {errors.time && <Typography color="red">{errors.time}</Typography>}
                             </div>
                             <div>
                            <Input type={'time'} label={'Ende'} value={draft.endTime}
                                   onChange={(inputEvent) => handleFieldChange('endTime', inputEvent.target.value)}
                                    error={!!errors.endTime}
                            />
                            {errors.endTime && <Typography color="red">{errors.endTime}</Typography>}
                        </div>
                    </div>
                </div>
                )}
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={onSave}
                        disabled={!draft || !isValid}>
                    Speichern
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
