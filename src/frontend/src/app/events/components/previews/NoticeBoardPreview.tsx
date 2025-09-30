import {NoticeBoardForm} from '../../types'

type NoticeBoardPreviewProps = {
    form: NoticeBoardForm
}

export function NoticeBoardPreview({ form }: NoticeBoardPreviewProps) {
    const hasContent = form.title.trim().length > 0 || form.body.trim().length > 0

    return (
        <div className={'rounded-xl bg-white text-black border-2 border-black p-2.5 flex h-full flex-col'}
             style={{ width: 296, height: 128 }}>
            {hasContent ? (
                <div className={'flex-1 min-h-0 space-y-1 overflow-hidden'}>
                    {form.title.trim() && (
                        <h3 className={'text-lg font-semibold text-black leading-tight truncate'}>{form.title}</h3>
                    )}
                    {form.body.trim() && (
                        <p className={'text-[0.95rem] leading-snug whitespace-pre-line line-clamp-3'}>{form.body}</p>
                    )}
                </div>
            ) : (
                <div className={'flex h-full flex-col items-center justify-center gap-3 text-center px-4'}>
                    <p className={'text-base font-semibold text-black leading-tight'}>Zum Beschreiben QR-Code scannen</p>
                    <div className={'h-16 w-16 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                        QR
                    </div>
                </div>
            )}
        </div>
    )
}
