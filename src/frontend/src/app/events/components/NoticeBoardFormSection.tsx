import React, { useEffect, useState } from 'react'
import {Input, Typography} from '@material-tailwind/react'
import {NoticeBoardForm} from '../types'

type NoticeBoardFormSectionProps = {
    form: NoticeBoardForm
    onFormChange: (next: NoticeBoardForm) => void
}

export function NoticeBoardFormSection({ form, onFormChange }: NoticeBoardFormSectionProps) {
    const handleChange = (key: keyof NoticeBoardForm, value: string) => {
        onFormChange({ ...form, [key]: value })
    }

 const [errors, setErrors] = useState({
    title: '',
    body: '',
    end: '',
  })

  // Konstanten / Limits -> hier ggf. ändern
  const TITLE_MAX = 35
  const LINE_MAX = 25
  const BODY_MAX = 50


    const [line1, setLine1] = useState('')
    const [line2, setLine2] = useState('')

    useEffect(() => {
        const parts = (form.body ?? '').split('\n')
        setLine1(parts[0] ?? '')
        setLine2(parts[1] ?? '')
      }, [form.body])

    const sanitizeLine = (s: string) =>
    s.replace(/[\n\r\t]/g, '').slice(0, LINE_MAX)

  // Kombiniert zwei Zeilen zu form.body
    const updateCombinedBody = (newL1: string, newL2: string) => {
    const safeL1 = sanitizeLine(newL1)
    const safeL2 = sanitizeLine(newL2)

    setLine1(safeL1)
    setLine2(safeL2)

    const combined = safeL2 ? `${safeL1}\n${safeL2}` : safeL1
    handleChange('body', combined.slice(0, BODY_MAX))
  }

    const onLine1Change = (value: string) => {
    updateCombinedBody(value, line2)
  }

    const onLine2Change = (value: string) => {
    updateCombinedBody(line1, value)
  }

  useEffect(() => {
    const newErrors = { title: '', body: '', end: '' }


    const title = (form.title ?? '').trim()
    if (!title) {
      newErrors.title = 'Titel ist erforderlich.'
    } else if (title.length > TITLE_MAX) {
      newErrors.title = `Titel darf höchstens ${TITLE_MAX} Zeichen haben.`
    }

    if (form.end && form.end.trim().length > 0) {
      const parsedEnd = new Date(form.end)
      if (Number.isNaN(parsedEnd.getTime())) {
        newErrors.end = 'Ungültiges Enddatum.'
      } else {
        const now = new Date()
        if (parsedEnd < now) {
          newErrors.end = 'Enddatum darf nicht in der Vergangenheit liegen.'
        }

        // Falls ein Startdatum angegeben ist, sicherstellen: end >= start
        if (form.start && form.start.trim().length > 0) {
          const parsedStart = new Date(form.start)
          if (Number.isNaN(parsedStart.getTime())) {
          } else {
            if (parsedEnd < parsedStart) {
              newErrors.end = 'Enddatum darf nicht vor dem Startdatum liegen.'
            }
          }
        }
      }
    }

    setErrors(newErrors)
  }, [form])


  const onTitleChange = (value: string) => {
    handleChange('title', value.slice(0, TITLE_MAX))
  }

  const onEndChange = (value: string) => {
    handleChange('end', value)
  }

    return (
        <div className={'space-y-4'}>
        <div>
            <Input label={'Titel'} value={form.title}
                   onChange={(event) => handleChange('title', event.target.value)}
                    maxLength={TITLE_MAX}
                    error={!!errors.title}/>
            <div className="flex justify-between items-center mt-1">
                      <Typography variant="small" className={`text-xs ${errors.title ? 'text-red-600' : 'text-blue-gray-500'}`}>
                        {errors.title ? errors.title : `Maximal ${TITLE_MAX} Zeichen`}
                      </Typography>
                      <Typography variant="small" className="text-xs text-blue-gray-400">
                        {(form.title ?? '').length}/{TITLE_MAX}
                      </Typography>
                    </div>
            </div>
        <div>
        <label className="block text-sm font-medium text-blue-gray-700 mb-2">
          Freitext (2 Zeilen)
        </label>

        <div className="space-y-2">
          <Input
            label="Zeile 1"
            value={line1}
            onChange={(e) => onLine1Change(e.target.value)}
            maxLength={LINE_MAX}
            error={!!errors.body}
          />

          <Input
            label="Zeile 2"
            value={line2}
            onChange={(e) => onLine2Change(e.target.value)}
            maxLength={LINE_MAX}
            error={!!errors.body}
          />
        </div>

        <div className="flex justify-between items-center mt-1">
          <Typography
            variant="small"
            className={`text-xs ${errors.body ? 'text-red-600' : 'text-blue-gray-500'}`}
          >
            {errors.body ? errors.body : `Maximal 2 Zeilen, je ${LINE_MAX} Zeichen`}
          </Typography>
          <Typography variant="small" className="text-xs text-blue-gray-400">
            {(form.body ?? '').length}/{BODY_MAX}
          </Typography>
        </div>
      </div>

            <div className={'grid gap-4 sm:grid-cols-2'}>
                <Input type={'datetime-local'} label={'Start'} value={form.start}
                       onChange={(event) => handleChange('start', event.target.value)} />
                 <div>
                <Input type={'datetime-local'} label={'Ende'} value={form.end}
                       onChange={(event) => handleChange('end', event.target.value)}
                       error={!!errors.end}/>
                {errors.end && (
                            <Typography color="red" className="text-sm mt-1">
                              {errors.end}
                            </Typography>
                          )}
                </div>
            </div>
        </div>
    )
}
