import {Button, Input, Typography} from '@material-tailwind/react'
import {EventBoardForm} from '../types'

type EventBoardFormSectionProps = {
    form: EventBoardForm
    onFormChange: (next: EventBoardForm) => void
    onOpenCalendar: () => void
}

export function EventBoardFormSection({
    form,
    onFormChange,
    onOpenCalendar,
}: EventBoardFormSectionProps) {
    const handleFieldChange = (key: keyof EventBoardForm, value: string) => {
        onFormChange({ ...form, [key]: value } as EventBoardForm)
    }

    const hasEvents = form.events.length > 0

    return (
        <div className={'space-y-4'}>
            <Input label={'Titel'} value={form.title}
                   onChange={(event) => handleFieldChange('title', event.target.value)} />
            <div className={'space-y-4 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-sm'}>
                <div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
                    <div>
                        <Typography variant={'small'} color={'blue-gray'} className={'font-medium'}>
                            Ereignisse verwalten
                        </Typography>
                        <p className={'text-xs text-blue-gray-500'}>
                            {form.events.length} Einträge geplant
                        </p>
                    </div>
                    <Button variant={'filled'} color={'red'} size={'sm'} className={'normal-case w-full sm:w-auto'}
                            onClick={onOpenCalendar}>
                        Kalender öffnen
                    </Button>
                </div>
                <div className={'rounded-xl border border-blue-gray-50 bg-blue-gray-50/60 p-3'}>
                    {hasEvents ? (
                        <div className={'space-y-2'}>
                            {[...form.events]
                                .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                                .map((event) => (
                                    <div key={event.id} className={'rounded-lg bg-white/80 p-3'}>
                                        <p className={'text-sm font-semibold text-blue-gray-900'}>
                                            {event.title.trim() || 'Ohne Titel'}
                                        </p>
                                        <p className={'text-xs text-blue-gray-500'}>
                                            {(event.date.trim() || 'Datum offen')} · {(event.startTime.trim() || 'Startzeit offen')}
                                            {event.endTime.trim() ? ` – ${event.endTime.trim()}` : ''}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className={'text-sm text-blue-gray-500'}>
                            Noch keine Ereignisse hinterlegt. Öffnen Sie den Kalender, um Termine anzulegen.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
