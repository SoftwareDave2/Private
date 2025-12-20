import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Typography} from '@material-tailwind/react'

type TemplateCodeDialogProps = {
    open: boolean
    title: string
    description: string
    value: string
    onChange: (value: string) => void
    onClose: () => void
    onConfirm: () => void
    confirmLabel?: string
    isConfirming?: boolean
}

export function TemplateCodeDialog({
    open,
    title,
    description,
    value,
    onChange,
    onClose,
    onConfirm,
    confirmLabel,
    isConfirming = false,
}: TemplateCodeDialogProps) {
    return (
        <Dialog open={open} handler={onClose} size={'xl'}>
            <DialogHeader>{title}</DialogHeader>
            <DialogBody className={'space-y-4'}>
                <Typography variant={'small'} color={'blue-gray'} className={'font-normal'}>
                    {description}
                </Typography>
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={'min-h-[320px] w-full rounded-md border border-blue-gray-100 bg-blue-gray-50/40 p-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'}
                    spellCheck={false}
                />
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={onClose}>
                    Abbrechen
                </Button>
                <Button
                    variant={'filled'}
                    color={'red'}
                    className={'normal-case'}
                    onClick={onConfirm}
                    disabled={isConfirming}
                >
                    {isConfirming ? 'Speichere…' : confirmLabel ?? 'Template speichern'}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
