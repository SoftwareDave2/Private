import {EventBoardForm} from '../../types'

type EventBoardPreviewProps = {
    form: EventBoardForm
}

const formatDateLabel = (value: string) => {
    if (!value) {
        return ''
    }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return value
    }
    const day = parsed.getDate().toString().padStart(2, '0')
    const month = (parsed.getMonth() + 1).toString().padStart(2, '0')
    const year = parsed.getFullYear().toString()
    return `${day}.${month}.${year}`
}

export function EventBoardPreview({ form }: EventBoardPreviewProps) {
    const events = Array.isArray(form.events)
        ? form.events
            .filter((event) =>
                (event.title ?? '').trim().length > 0
                || (event.date ?? '').trim().length > 0
                || (event.time ?? '').trim().length > 0,
            )
            .slice(0, 4)
        : []
    const isDenseLayout = events.length >= 4

    return (
        <div className={'rounded-2xl bg-white border-2 border-black p-4 text-black flex flex-col gap-2 overflow-hidden'}
             style={{ width: 400, height: 300 }}>
            {form.title.trim() && (
                <div>
                    <h3 className={'text-lg font-semibold text-black leading-tight truncate'}>{form.title.trim()}</h3>
                </div>
            )}
            <div className={'flex-1 overflow-hidden'}>
                {events.length > 0 ? (
                    <div className={`flex flex-col h-full ${events.length < 4 ? 'justify-start' : 'justify-between'} ${isDenseLayout ? 'gap-1' : 'gap-1.5'}`}>
                        {events.map((event) => {
                            const title = event.title.trim() || 'Titel festlegen'
                            const date = formatDateLabel(event.date.trim()) || 'Datum folgt'
                            const time = event.time.trim() || 'Zeit folgt'
                            const hasQrLink = event.qrLink.trim().length > 0

                            return (
                                <div key={event.id}
                                     className={`flex items-center justify-between rounded-lg border border-red-600/40 bg-white ${isDenseLayout ? 'px-2 py-1' : 'px-2.5 py-1.5'} ${isDenseLayout ? 'gap-1.5' : 'gap-2'}`}>
                                    <div className={`flex-1 min-w-0 ${isDenseLayout ? 'space-y-0.5' : 'space-y-0.5'}`}>
                                        <p className={`${isDenseLayout ? 'text-[0.78rem]' : 'text-[0.82rem]'} font-semibold text-black truncate`} title={title}>{title}</p>
                                        <p className={`${isDenseLayout ? 'text-[0.68rem]' : 'text-[0.72rem]'} text-black truncate`} title={`${date} · ${time}`}>
                                            {date} · {time}
                                        </p>
                                    </div>
                                    <div className={`flex items-center justify-center rounded-md uppercase text-center leading-tight px-1 border ${hasQrLink ? 'border-black bg-red-50 text-red-700' : 'border-dashed border-black text-black'} ${isDenseLayout ? 'h-10 w-10 text-[0.45rem]' : 'h-11 w-11 text-[0.48rem]'}`}>
                                        QR
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className={'flex h-full flex-col items-center justify-center gap-4 rounded-lg bg-white px-6 text-center'}>
                        <p className={'text-base font-semibold text-red-600'}>
                            Derzeit gibt es keine anstehenden Ereignisse
                        </p>
                        <div className={'flex flex-col items-center gap-2'}>
                            <div className={'h-20 w-20 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                                QR
                            </div>
                            <p className={'text-sm text-black'}>QR-Code scannen und neue Ereignisse hinzufügen</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
