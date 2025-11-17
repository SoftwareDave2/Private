import React, { useEffect, useState } from 'react'

import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Typography} from '@material-tailwind/react'

import {EventBoardEvent} from '../../types'

type EventBoardEventDialogProps = {
    open: boolean
    event: EventBoardEvent | null
    onClose: () => void
    onChange: (event: EventBoardEvent) => void
    onSave: () => void
}

export function EventBoardEventDialog({ open, event, onClose, onChange, onSave }: EventBoardEventDialogProps) {
    const handleFieldChange = (key: keyof EventBoardEvent, value: string) => {
        if (!event) {
            return
        }
        onChange({
            ...event,
            [key]: value,
        })
    }




//Validierungszustand
  const [errors, setErrors] = useState({
    title: '',
    date: '',
    time: '',
    endTime: '',
  })
  const [isValid, setIsValid] = useState(false)


  useEffect(() => {
    if (!event) {
      setErrors({ title: '', date: '', time: '', endTime: '' })
      setIsValid(false)
      return
    }

    const newErrors = { title: '', date: '', time: '', endTime: '' }
    let valid = true


    const title = (event.title ?? '').trim()
    if (!title) {
      newErrors.title = 'Titel ist erforderlich.'
      valid = false
    } else if (title.length > 50) {
      newErrors.title = 'Titel darf höchstens 50 Zeichen haben.'
      valid = false
    }

    if (!event.date) {
      newErrors.date = 'Datum ist erforderlich.'
      valid = false
    } else {
      const eventDate = new Date(event.date + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (isNaN(eventDate.getTime())) {
        newErrors.date = 'Ungültiges Datum.'
        valid = false
      } else if (eventDate < today) {
        newErrors.date = 'Datum darf nicht in der Vergangenheit liegen.'
        valid = false
      }
    }

    //Zeiten: falls beide vorhanden, Endzeit > Startzeit
    if (event.time && event.endTime) {
      // Parse times als Date mit selbem Referenztag
      const start = new Date(`1970-01-01T${event.time}`)
      const end = new Date(`1970-01-01T${event.endTime}`)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {

        newErrors.time = isNaN(start.getTime()) ? 'Ungültige Startzeit.' : ''
        newErrors.endTime = isNaN(end.getTime()) ? 'Ungültige Endzeit.' : ''
        valid = false
      } else if (end <= start) {
        newErrors.endTime = 'Endzeit muss nach der Startzeit liegen.'
        valid = false
      }
    }
    setErrors(newErrors)
    setIsValid(valid)
  }, [event])


    return (
        <Dialog open={open} handler={onClose} size={'sm'}>
            <DialogHeader>Ereignis bearbeiten</DialogHeader>
            <DialogBody>
                {event && (
                    <div className={'space-y-4'}>
                        <div>
                            <Input label={'Titel'} value={event.title}
                               onChange={(inputEvent) => handleFieldChange('title', inputEvent.target.value)}
                               maxLength = {50}
                            />
                            {errors.title && (
                                <Typography variant="small" color="red" className="mt-1">
                                {errors.title}
                                </Typography>
                            )}
                        </div>
                        <div>
                        <Input type={'date'} label={'Datum'} value={event.date}
                               onChange={(inputEvent) => handleFieldChange('date', inputEvent.target.value)} />
                             {errors.date && (
                                <Typography variant="small" color="red" className="mt-1">
                                {errors.date}
                                </Typography>
                             )}
                        </div>
                        <div>
                        <Input type={'time'} label={'Zeit'} value={event.time}
                               onChange={(inputEvent) => handleFieldChange('time', inputEvent.target.value)} />
                        </div>
                        <div>
                        <Input type={'time'} label={'Endzeit'} value={event.endTime || ''}
                               onChange={(inputEvent) => handleFieldChange('endTime', inputEvent.target.value)} />
                              {errors.endTime && (
                                  <Typography variant="small" color="red" className="mt-1">
                                  {errors.endTime}
                                  </Typography>
                              )}
                        </div>
                        <Input type={'url'} label={'Link für QR-Code'} value={event.qrLink}
                               onChange={(inputEvent) => handleFieldChange('qrLink', inputEvent.target.value)}
                               placeholder={'https://...'} />
                    </div>
                )}
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant="text" color="gray" size="sm" className="normal-case justify-self-stretch sm:justify-self-end w-full sm:w-auto"
                    onClick={() => {
                    if (event && onRemoveEvent)
                    onRemoveEvent(event.id)}}>
                    Entfernen
                </Button>
                <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={onSave}
                        disabled={!event || !isValid}>
                    Speichern
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
