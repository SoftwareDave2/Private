import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"
import {DisplayData} from "@/types/displayData";
import DisplayFrame from "@/components/dashboard/DisplayFrame";
import DisplayStatusInfos from "@/components/dashboard/DisplayStatusInfos";

type DisplayInfoDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
}

export default function DisplayInfoDialog({open, displayData, onClose}: DisplayInfoDialogProps) {
    return (
        <>
            <Dialog open={open} handler={onClose}>
                <DialogHeader>Display {displayData.id}</DialogHeader>
                <DialogBody>
                    <div className={'flex gap-6'}>
                        <DisplayFrame displayData={displayData} />
                        <div>
                            <DisplayStatusInfos displayData={displayData} />
                            <div className={'flex gap-2'}>
                                <Button variant={"outlined"} className={'text-primary border-primary mt-4'} onClick={() => { }}>Edit Display</Button>
                                <Button variant={"outlined"} className={'text-primary border-primary mt-4'} onClick={() => { }}>Refresh Display</Button>
                            </div>
                        </div>
                    </div>

                </DialogBody>
                <DialogFooter className={'space-x-2'}>
                    <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                    <Button variant={'filled'} className={'bg-primary text-white'}>Standard Content</Button>
                    <Button variant={'filled'} className={'bg-primary text-white'}>Kalender öffnen</Button>
                </DialogFooter>
            </Dialog>
        </>
    )
}