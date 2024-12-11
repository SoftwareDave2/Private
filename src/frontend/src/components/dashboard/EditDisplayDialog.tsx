import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Select,
    Option
} from "@material-tailwind/react"
import {DisplayData} from "@/types/displayData";
import SelectImage from "@/components/edit-display/SelectImage";
import React, {useState} from "react";
import {DeleteDisplayDialog} from "@/components/dashboard/DeleteDisplayDialog";

type EditDisplayDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDataUpdated: () => void,
}

export function EditDisplayDialog({open, displayData, onClose, onDataUpdated}: EditDisplayDialogProps) {

    const backendApiUrl = 'http://localhost:8080'

    const [data, setData] = useState<DisplayData>(displayData)
    const [openDeleteDisplay, setOpenDeleteDisplay] = useState<boolean>(false)

    const toggleOpenDeleteDisplayHandler = () => setOpenDeleteDisplay(!openDeleteDisplay)

    const brandChangeHandler = (brand: string | undefined) =>
        setData(prevState => ({...prevState, brand: brand ?? ''}))
    const modelChangeHandler = (model: string | undefined) =>
        setData(prevState => ({...prevState, model: model ?? ''}))
    const orientationChangeHandler = (orientation: string | undefined) =>
        setData(prevState => ({...prevState, orientation: orientation ?? ''}))
    const filenameChangeHandler = (filename: string) =>
        setData(prevState => ({...prevState, filename: filename}))

    const displayDeletedHandler = () => {
        toggleOpenDeleteDisplayHandler()
        onDataUpdated()
    }

    const updateDisplay = async (formdata: FormData) => {
        try {
            const response = await fetch(backendApiUrl + '/display/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body:
                    'macAddress='+ data.macAddress +
                    '&brand=' + data.brand +
                    '&model=' + data.model +
                    '&width=' + formdata.get('width') +
                    '&height=' + formdata.get('height') +
                    '&orientation=' + data.orientation +
                    '&filename=' + data.filename,
            })
            const responseText = await response.text()
            console.log(responseText)
        } catch (err) {
            console.error(err)
        }

        onDataUpdated()
    }

    return (
        <Dialog open={open}>
            <DialogHeader>Display {data.id} Anpassen</DialogHeader>
            <form action={updateDisplay}>
                <DialogBody>
                    <div>
                        <Input label={'MAC Adresse'} value={data.macAddress} readOnly={true}  />
                    </div>
                    <div className={'mt-5 flex gap-2'}>
                        <Select label={'Displaymarke'} value={data.brand} name={'brand'} onChange={brandChangeHandler}>
                            <Option key={'Philips'} value={'Philips'}>Philips</Option>
                        </Select>
                        <Select label={'Displaymodell'} value={data.model} name={'model'} onChange={modelChangeHandler}>
                            <Option value={'Tableaux'}>Tableaux</Option>
                        </Select>
                    </div>
                    <div className={'mt-5 flex gap-2'}>
                        <Select label={'Orientierung'} value={data.orientation} name={'orientation'} onChange={orientationChangeHandler}>
                            <Option value={'vertical'}>vertical</Option>
                        </Select>
                        <Input label={'Breite'} type={'number'} className={'min-w-[100px]'} defaultValue={data.width}
                               name={'width'}/>
                        <Input label={'Höhe'} type={'number'} className={'min-w-[100px]'} defaultValue={data.height}
                               name={'height'}/>
                    </div>
                    <div className={'mt-5'}>
                        <SelectImage selectedFilename={data.filename} onSelect={filenameChangeHandler}/>
                    </div>
                </DialogBody>
                <DialogFooter className={'justify-between'}>
                    <Button type={'button'} variant={'filled'} className={'bg-primary text-white'}
                            onClick={toggleOpenDeleteDisplayHandler}>
                        Display Löschen
                    </Button>
                    <div className={'flex space-x-2'}>
                        <Button type={'button'} variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                        <Button type={'submit'} variant={'filled'} className={'bg-primary text-white'}>Speichern</Button>
                    </div>
                </DialogFooter>
            </form>
            <DeleteDisplayDialog open={openDeleteDisplay} displayData={data}
                                 onClose={toggleOpenDeleteDisplayHandler}
                                 onDisplayDeleted={displayDeletedHandler} />
        </Dialog>
    )
}