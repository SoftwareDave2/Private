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
  const TITLE_MAX = 50
  const BODY_MAX = 500
  const BODY_MAX_LINEBREAKS = 2 // maximal 2 Zeilenumbrüche => max. 3 Absätze

  useEffect(() => {
    const newErrors = { title: '', body: '', end: '' }


    const title = (form.title ?? '').trim()
    if (!title) {
      newErrors.title = 'Titel ist erforderlich.'
    } else if (title.length > TITLE_MAX) {
      newErrors.title = `Titel darf höchstens ${TITLE_MAX} Zeichen haben.`
    }


    const body = form.body ?? ''
    if (body.length > BODY_MAX) {
      newErrors.body = `Freitext darf höchstens ${BODY_MAX} Zeichen haben.`
    } else {
      // Count line breaks
      const lineBreakCount = (body.match(/\n/g) || []).length
      if (lineBreakCount > BODY_MAX_LINEBREAKS) {
        newErrors.body = `Maximal ${BODY_MAX_LINEBREAKS} Zeilenumbrüche erlaubt (also ca. 3 Absätze).`
      }
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
  const onBodyChange = (value: string) => {
    handleChange('body', value.slice(0, BODY_MAX))
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
                <label className={'block text-sm font-medium text-blue-gray-700 mb-2'}>
                    Freitext
                </label>
                <textarea className={'w-full rounded-md border border-blue-gray-100 bg-white p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-0'}
                          rows={4}
                          value={form.body}
                          onChange={(event) => handleChange('body', event.target.value)}
                          placeholder={'Hinweise, Wegbeschreibungen oder Ansprechpartner:innen'}
                          maxLength={BODY_MAX}/>
                <div className="flex justify-between items-center mt-1">
                          <Typography variant="small" className={`text-xs ${errors.body ? 'text-red-600' : 'text-blue-gray-500'}`}>
                            {errors.body ? errors.body : `Maximal ${BODY_MAX} Zeichen, max. ${BODY_MAX_LINEBREAKS} Zeilenumbrüche`}
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
