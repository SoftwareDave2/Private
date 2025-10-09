import {Button, Dialog, DialogHeader, DialogBody, DialogFooter} from "@material-tailwind/react"
import {DisplayData} from "@/types/displayData";
import React from "react";
import {getBackendApiUrl} from "@/utils/backendApiUrl";
import {authFetch} from "@/utils/authFetch";

type DeleteDisplayDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDisplayDeleted: () => void,
}

export function DeleteDisplayDialog({open, displayData, onClose, onDisplayDeleted}: DeleteDisplayDialogProps) {

    // const host = window.location.hostname;
    // const backendApiUrl = 'http://' + host + ':8080';
    const backendApiUrl = getBackendApiUrl();

    const deleteDisplayHandler = async () => {
        try {
            const response = await authFetch(backendApiUrl + '/display/delete/' + displayData.macAddress, {
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
            <DialogHeader>{displayData.displayName} löschen?</DialogHeader>
            <DialogBody>
                <p>Möchten Sie das Display <strong>{displayData.displayName}</strong> wirklich löschen?</p>
            </DialogBody>
            <DialogFooter className={'justify-between'}>
                <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={deleteDisplayHandler}>Display Löschen</Button>
            </DialogFooter>
        </Dialog>
    )
}
