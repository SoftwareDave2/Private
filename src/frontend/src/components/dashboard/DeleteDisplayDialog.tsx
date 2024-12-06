import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"
import {DisplayData} from "@/types/displayData";
import SelectImage from "@/components/edit-display/SelectImage";
import React, {useState} from "react";

type DeleteDisplayDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDelete: () => void,
    onSave: (data: DisplayData) => void,
}

export function DeleteDisplayDialog({open, displayData, onClose, onDelete, onSave}: DeleteDisplayDialogProps) {

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

    async function removeDisplay(formdata: FormData){
        //"use server"
        //closeModalDelete();
        //closeModalEdit();
        //setSelectedDisplay(null);
        const id = formdata.get("id");
        const res = await fetch("http://localhost:8080/display/delete/"+id, {
                method: "DELETE"
            }
        );
        let erg = await res;
        console.log(erg)
        //revalidatePath("/edit-displays");
        //console.log(newUser);
    }




    return (
        <Dialog open={open}>
            <DialogHeader>Display {data.id} Wirklich löschen?</DialogHeader>
            <DialogBody>


                <form action={removeDisplay} className="mb-4">

                    <input name="id" className="hidden" value={data.id}
                           readOnly={true}/>
                    <br></br>
                    <Button type ="submit" variant={'filled'} className={'bg-primary text-white'} onClick={onDelete}>
                        Ja</Button>


                    <br></br>
                    <br></br>
                </form>

                {
                    /*
                <SelectImage selectedFilename={data.filename} onSelect={filenameChangeHandler}/>
                     */
                }


            </DialogBody>
            <DialogFooter className={'justify-between'}>
                {/*
                <Button variant={'filled'} className={'bg-primary text-white'} onClick={onDelete}>Display
                    Löschen</Button>
                */
                }

                <div className={'flex space-x-2'}>
                    <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                </div>
            </DialogFooter>
        </Dialog>
    )
}