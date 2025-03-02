import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"
import {useState} from 'react'
import {DisplayData} from "@/types/displayData";
import DisplayFrame from "@/components/dashboard/DisplayFrame";
import DisplayStatusInfos from "@/components/dashboard/DisplayStatusInfos";
import {EditDisplayDialog} from "@/components/dashboard/EditDisplayDialog";

type DisplayInfoDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDisplayDataUpdated: () => void,
}

export default function DisplayInfoDialog({open, displayData, onClose, onDisplayDataUpdated}: DisplayInfoDialogProps) {
    const backendApiUrl = 'http://localhost:8080'

    const [openEditDisplay, setOpenEditDisplay] = useState<boolean>(false)
    const [displayDataForEdit, setDisplayDataForEdit] = useState<DisplayData | null>(null)

    const toggleOpenEditDisplayHandler = () => setOpenEditDisplay(!openEditDisplay)

    const closeEditDisplayHandler = () => {
        toggleOpenEditDisplayHandler()
        setTimeout(() => setDisplayDataForEdit(null), 500)      // Wait until dialog close animation is over.
    }

    const editDisplayHandler = async () => {
        // Fetch new display data from server.
        try {
            const data = await fetch(backendApiUrl + '/display/all')
            const allDisplays = (await data.json()) as DisplayData[]
            const display = allDisplays.find(d => d.id === displayData.id)
            if (!display) {
                console.error('Selected display not found!')
                return
            }

            setDisplayDataForEdit(display)
            toggleOpenEditDisplayHandler()
        } catch (err) {
            console.error(err)
        }
    }

    const displayDataUpdated = () => {
        closeEditDisplayHandler()
        onDisplayDataUpdated()
    }

    return (
        <Dialog open={open} handler={onClose}>
            <DialogHeader>{displayData.displayName}</DialogHeader>
            <DialogBody>
                <div className={'flex gap-6'}>
                    <DisplayFrame displayData={displayData} />
                    <div>
                        <DisplayStatusInfos displayData={displayData} />
                        <div className={'flex gap-2'}>
                            <Button variant={"outlined"} className={'text-primary border-primary mt-4'} onClick={editDisplayHandler}>Edit Display</Button>
                            <Button variant={"outlined"} className={'text-primary border-primary mt-4'} onClick={() => { }}>Refresh Display</Button>
                        </div>
                    </div>
                </div>
                {displayDataForEdit &&
                    <EditDisplayDialog open={openEditDisplay} displayData={displayDataForEdit}
                                       onClose={closeEditDisplayHandler}
                                       onDataUpdated={displayDataUpdated} />}
            </DialogBody>
            <DialogFooter className={'space-x-2'}>
                <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                {/*<Button variant={'filled'} className={'bg-primary text-white'}>Standard Content</Button>*/}
                {/*<Button variant={'filled'} className={'bg-primary text-white'}>Kalender öffnen</Button>*/}
                <Button
                    variant={'filled'}
                    className={'bg-primary text-white'}
                    onClick={() => {
                        const macAddress = displayData.macAddress;


                        // Vorherige Auswahl löschen, damit nur eine MAC-Adresse gespeichert ist
                        localStorage.removeItem("selectedMACs");

                        // Neue MAC-Adresse speichern
                        localStorage.setItem("selectedMACs", JSON.stringify([macAddress]));

                        // Zur Kalenderseite navigieren
                        window.location.href = "http://localhost:3000/calendar";
                    }}
                >
                    Kalender öffnen
                </Button>
            </DialogFooter>
        </Dialog>
    )
}