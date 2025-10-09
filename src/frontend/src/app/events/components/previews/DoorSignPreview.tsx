import {DoorSignForm} from '../../types'

type DoorSignPreviewProps = {
    form: DoorSignForm
}

export function DoorSignPreview({ form }: DoorSignPreviewProps) {
    const peopleSource = Array.isArray(form.people) ? form.people : []
    const peopleWithNames = peopleSource.filter((person) => (person.name ?? '').trim().length > 0)
    const hasBusyPerson = peopleSource.some((person) => person.status === 'busy')
    const availabilityLabel = hasBusyPerson ? 'Beschäftigt' : 'Verfügbar'
    const statusClasses = hasBusyPerson ? 'bg-red-600 text-white border border-red-700' : 'bg-white text-black border border-black'
    const footerNote = typeof form.footerNote === 'string' ? form.footerNote : ''
    const footerContent = footerNote.trim() || 'Zusätzlicher Hinweis'

    const isMinimalState = peopleWithNames.length === 0 && footerNote.trim().length === 0
    const showStatusBadge = peopleWithNames.length > 0

    const emptyAssignmentMessage = (
        <div className={'rounded-md border border-black px-4 py-3 text-center text-sm font-medium'}>
            Raum aktuell unzugeteilt
        </div>
    )

    return (
        <div className={'flex flex-col rounded-xl border-2 border-black bg-white text-black'} style={{ width: 400, height: 300 }}>
            <div className={'flex flex-1 gap-10'}>
                <div className={'flex flex-1 items-center px-6'}>
                    <div className={'w-full'}>
                        {isMinimalState || peopleWithNames.length === 0 ? (
                            emptyAssignmentMessage
                        ) : (
                            <ul className={'space-y-3'}>
                                {peopleWithNames.map((person) => (
                                    <li key={person.id} className={`text-base font-semibold ${person.status === 'busy' ? 'text-red-600' : ''}`}>
                                        {person.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className={'flex w-40 flex-col items-end px-6 pt-6 pb-4'}>
                    <div className={'text-right'}>
                        <p className={'text-5xl font-bold leading-none whitespace-nowrap overflow-hidden text-ellipsis'}>{form.roomNumber || '—'}</p>
                    </div>
                    {showStatusBadge && (
                        <div className={`mt-5 inline-flex items-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm ${statusClasses}`}>
                            {availabilityLabel}
                        </div>
                    )}
                </div>
            </div>
            {isMinimalState && (
                <div className={'border-t border-black px-6 py-3 text-xs leading-relaxed'}>
                    <div className={'flex items-center justify-between'}>
                        <span className={'font-medium'}>Raumzuweisung verfügbar</span>
                        <div className={'h-12 w-12 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                            QR
                        </div>
                    </div>
                </div>
            )}
            {!isMinimalState && footerContent && (
                <div className={'border-t border-black px-6 py-3 text-sm leading-relaxed font-medium'}>
                    <span>{footerContent}</span>
                </div>
            )}
        </div>
    )
}
