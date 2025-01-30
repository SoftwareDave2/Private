import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"
import {DisplayData} from "@/types/displayData";
import React from "react";

type DeleteDisplayDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDisplayDeleted: () => void,
}

export function DeleteDisplayDialog({open, displayData, onClose, onDisplayDeleted}: DeleteDisplayDialogProps) {

    const backendApiUrl = 'http://localhost:8080'

    const deleteDisplayHandler = async () => {
        try {
            const response = await fetch(backendApiUrl + '/display/delete/' + displayData.macAddress, {
                method: 'DELETE'}
            )
            const responseText = await response.text()
            console.log(responseText)

            onDisplayDeleted()
        } catch (err) {
            console.error(err)
            onClose()
        }
    }

    return (
        <Dialog open={open} size={'xs'} handler={onClose}>
            <DialogHeader>Display {displayData.id} löschen?</DialogHeader>
            <DialogBody>
                <p>Möchten Sie das Display <strong>Display {displayData.id}</strong> wirklich löschen?</p>
            </DialogBody>
            <DialogFooter className={'justify-between'}>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={deleteDisplayHandler}>Display Löschen</Button>
                <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
            </DialogFooter>
        </Dialog>
    )
}