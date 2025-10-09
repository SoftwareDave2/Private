import {Input} from '@material-tailwind/react'
import {NoticeBoardForm} from '../types'

type NoticeBoardFormSectionProps = {
    form: NoticeBoardForm
    onFormChange: (next: NoticeBoardForm) => void
}

export function NoticeBoardFormSection({ form, onFormChange }: NoticeBoardFormSectionProps) {
    const handleChange = (key: keyof NoticeBoardForm, value: string) => {
        onFormChange({ ...form, [key]: value })
    }

    return (
        <div className={'space-y-4'}>
            <Input label={'Titel'} value={form.title}
                   onChange={(event) => handleChange('title', event.target.value)} />
            <div>
                <label className={'block text-sm font-medium text-blue-gray-700 mb-2'}>
                    Freitext
                </label>
                <textarea className={'w-full rounded-md border border-blue-gray-100 bg-white p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-0'}
                          rows={4}
                          value={form.body}
                          onChange={(event) => handleChange('body', event.target.value)}
                          placeholder={'Hinweise, Wegbeschreibungen oder Ansprechpartner:innen'} />
            </div>
            <div className={'grid gap-4 sm:grid-cols-2'}>
                <Input type={'datetime-local'} label={'Start'} value={form.start}
                       onChange={(event) => handleChange('start', event.target.value)} />
                <Input type={'datetime-local'} label={'Ende'} value={form.end}
                       onChange={(event) => handleChange('end', event.target.value)} />
            </div>
        </div>
    )
}
