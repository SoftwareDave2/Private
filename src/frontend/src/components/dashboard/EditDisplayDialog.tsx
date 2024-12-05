import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"
import {DisplayData} from "@/types/displayData";
import SelectImage from "@/components/edit-display/SelectImage";
import React, {useState} from "react";

type EditDisplayDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDelete: () => void,
    onSave: (data: DisplayData) => void,
}

export function EditDisplayDialog({open, displayData, onClose, onDelete, onSave}: EditDisplayDialogProps) {

    const [data, setData] = useState<DisplayData>(displayData)

    const filenameChangeHandler = (filename: string) => {
        setData(prevState => ({
            ...prevState,
            filename: filename
        }))
    }

    const saveDisplayHandler = () => {
        onSave(data)
    }

    return (
        <Dialog open={open}>
            <DialogHeader>Display {data.id} Anpassen</DialogHeader>
            <DialogBody>

                <SelectImage selectedFilename={data.filename} onSelect={filenameChangeHandler} />

            </DialogBody>
            <DialogFooter className={'justify-between'}>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={onDelete}>Display Löschen</Button>
                <div className={'flex space-x-2'}>
                    <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                    <Button variant={'filled'} className={'bg-primary text-white'} onClick={saveDisplayHandler}>Speichern</Button>
                </div>
            </DialogFooter>
        </Dialog>
    )
}