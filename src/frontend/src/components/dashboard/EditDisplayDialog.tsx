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


    async function addDisplay(formdata: FormData){
        //"use server"
        //closeModalEdit();
        onSave(data)
        const macAddress = formdata.get("macAddress");
        const brand = formdata.get("brand");
        const model = formdata.get("model");
        const width = formdata.get("width");
        const height = formdata.get("height");
        const orientation = formdata.get("orientation");
        //const file = formdata.get("file");
        const filename = formdata.get("filename");
        // var  filename ="test.png";
        // if (file instanceof File) {
        //     filename = file.name;
        // }
        //const wakeTime = new Date().toISOString()
       // const wakeTime = "2024-12-01T12:30:00"

        const res = await fetch("http://localhost:8080/display/add", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded",
                    //Authorization: "Bearer YOUR_PRIVATE_KEY" // secure because it is server side code.
                },
                body:
                //'macAddress=00:1B:44:21:3A:B7&brand=Phillips&model=Tableux&width=1920&height=1080&orientation=vertical&filename=moon.png'
                    'macAddress='+ macAddress +
                    '&brand='+brand +
                    '&model='+model+
                    '&width='+ width +
                    '&height='+ height +
                    '&orientation='+ orientation +
                    '&filename='+ filename
                    //+ '&wakeTime=' + wakeTime
            }
        );
        //const newUser = await res.json();
        let erg = await res;
        console.log(erg)
        // revalidatePath("/edit-displays");
        //console.log(newUser);
    }





    return (
        <Dialog open={open}>
            <DialogHeader>Display {data.id} Anpassen</DialogHeader>
            <DialogBody>
                <p><strong>Mac Adresse:</strong> {data.macAddress}</p>

                <form action={addDisplay} className=" ">
                    <input name="macAddress" className="hidden" value={data.macAddress}
                           readOnly={true}/>
                    <br></br>

                    <div className=" ">
                        <label htmlFor="brand"
                               className="inline-block w-24 mb-4 mt-4 mr-2">Brand:</label>
                        <select id="brand" name="brand"
                                defaultValue={data.brand} required={true}
                                className="h-12 border border-gray-300 text-base rounded-lg bg-white appearance-none py-2.5 px-4 focus:outline-none ">
                            <option value="Phillips">Phillips</option>
                        </select>
                    </div>
                    <div className=" ">
                        <label htmlFor="model"
                               className="inline-block w-24 mb-4 mt-4 mr-2">Model:</label>
                        <select id="model" name="model"
                                defaultValue={data.model} required={true}
                                className="h-12 border border-gray-300 text-base rounded-lg bg-white appearance-none py-2.5 px-4 focus:outline-none ">
                            <option value="Tableaux">Tableaux</option>
                        </select>
                    </div>


                    <div className=" ">
                        <label htmlFor="orientation"
                               className="inline-block w-24 mb-4 mt-4 mr-2">Orientation:</label>
                        <select id="orientation" name="orientation"
                                defaultValue={data.orientation} required={true}
                                className="h-12 border border-gray-300 text-base rounded-lg bg-white appearance-none py-2.5 px-4 focus:outline-none ">
                            <option value="vertical">vertical</option>
                            <option value="horizontal">horizontal</option>
                        </select>
                    </div>
                    <br></br>
                    <label htmlFor="width" className="inline-block w-24">Width:</label>
                    <input type="number" id="width" min="0" placeholder="1920"
                           defaultValue={data.width}
                           name="width" required={true}
                           className="border p-2 mr-2 ml-2 mb-4"/>
                    <br></br>
                    <label htmlFor="height" className="inline-block w-24">Height:</label>
                    <input type="number" id="height" min="0" placeholder="1080"
                           defaultValue={data.height}
                           name="height"
                           required={true}
                           className="border p-2 mr-2 ml-2 mb-4"/>
                    <br></br>


                    {/*

                    <p><strong>Aktuelles Bild:</strong> {data.filename}</p>
                    <label htmlFor="file" className="inline-block w-24 mb-4 mt-4 ">Filename:</label>
                    <input type="file" id="file" name="file" className="text-sm  p-2 mr-2  mb-4"
                           accept="image/png, image/jpeg" required/>
                    <br></br>

                       */
                    }
                    <SelectImage selectedFilename={data.filename} onSelect={filenameChangeHandler}/>

                    <input name="filename" className="hidden" value={data.filename}
                           readOnly={true}/>

                    {/*
                                        <button type="submit"
                            className="mb-4 mt-4 bg-blue-500 text-white px-4 py-2 rounded">Änderungen
                        übernehmen
                    </button>

                    */
                    }
                    <br></br>
                    <br></br>


                    <Button type="submit" variant={'filled'} className={'bg-primary text-white'}
                            onClick={saveDisplayHandler}>Speichern</Button>
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
            <Button variant={'filled'} className={'bg-primary text-white'} onClick={onDelete}>Display
                    Löschen</Button>
                <div className={'flex space-x-2'}>
                    <Button variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>

                    {/*
                    <Button variant={'filled'} className={'bg-primary text-white'}
                            onClick={saveDisplayHandler}>Speichern</Button>

                    */
                    }

                </div>
            </DialogFooter>
        </Dialog>
    )
}