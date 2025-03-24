import {Button, Dialog, DialogBody, DialogFooter, Input} from '@material-tailwind/react'
import {useState} from 'react'

type SetNameDialogProps = {
    open: boolean,
    onClose: () => void,
    onSave: (name: string) => void,
}

export default function SetNameDialog({open, onClose, onSave}: SetNameDialogProps) {
    const [name, setName] = useState<string>('')

    const handleClose = () => {
        setName('')
        onClose()
    }

    const handleSave = () => {
        if (name.length > 2) {
            onSave(name)
        }
    }

    return (
        <Dialog open={open} size={'xs'} handler={handleClose}>
            <DialogBody>
                <Input value={name} label={'Name'} onChange={(e) => setName(e.target.value)}/>
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant={'outlined'} className={'text-primary border-primary'}
                        onClick={handleClose}>Cancel</Button>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={handleSave}
                        disabled={name.length <= 2}>
                    Speichern
                </Button>
            </DialogFooter>
        </Dialog>
    )
}