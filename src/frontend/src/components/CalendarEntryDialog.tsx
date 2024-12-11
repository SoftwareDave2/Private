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

import SelectImage from "@/components/edit-display/SelectImage";
import React, {useState} from "react";
import {EventDetails} from "@/types/eventDetails";

type CalendarEntryDialogProps = {
    open: boolean,
    eventDetails: EventDetails,
    onClose: () => void,
    onDataUpdated: () => void,
}

export function CalendarEntryDialog({open, eventDetails, onClose, onDataUpdated}: CalendarEntryDialogProps) {

    const backendApiUrl = 'http://localhost:8080'

    const [data, setData] = useState<EventDetails>(eventDetails)


    const titleChangeHandler = (title: string | undefined) =>
        setData(prevState => ({...prevState, title: title ?? ''}))
    const dateChangeHandler = (date: string | undefined) =>
        setData(prevState => ({...prevState, date: date ?? ''}))
    const startChangeHandler = (start: string | undefined) =>
        setData(prevState => ({...prevState, start: start ?? ''}))
    const endChangeHandler = (end: string | undefined) =>
        setData(prevState => ({...prevState, end: end ?? ''}))
    const allDayChangeHandler = (allDay: boolean | undefined) =>
        setData(prevState => ({...prevState, allDay: allDay ?? false }))
    const imageChangeHandler = (image: string) =>
        setData(prevState => ({...prevState, image: image ?? ''}))



    const updateEvent = async (formdata: FormData) => {
        try {
            const response = await fetch(backendApiUrl + '/display/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body:
                    'title='+ data.title +
                    '&date=' + data.date +
                    '&start=' + data.start +
                    '&end=' + formdata.get('end') +
                    '&allDay=' + formdata.get('allDay') +
                    '&Image=' + data.image,

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
            <DialogHeader>Display {data.title} Anpassen</DialogHeader>
            <form action={updateEvent}>
                <DialogBody>
                    <div>
                        <Input label={'Title'} value={data.title} readOnly={true}  />
                    </div>
                    <div className={'mt-5 flex gap-2'}>
                        <Select label={'Titel'} value={data.title} name={'title'} onChange={titleChangeHandler}>
                            <Option key={'Philips'} value={'Philips'}>Philips</Option>
                        </Select>
                        <Select label={'Date'} value={data.date} name={'date'} onChange={dateChangeHandler}>
                            <Option value={'Tableaux'}>Tableaux</Option>
                        </Select>
                    </div>
                    <div className={'mt-5 flex gap-2'}>
                        <Select label={'start'} value={data.start} name={'start'} onChange={startChangeHandler}>
                            <Option value={'vertical'}>vertical</Option>
                        </Select>
                        <Input label={'Breite'} type={'number'} className={'min-w-[100px]'} defaultValue={data.width}
                               name={'width'}/>
                        <Input label={'Höhe'} type={'number'} className={'min-w-[100px]'} defaultValue={data.height}
                               name={'height'}/>
                    </div>
                    <div className={'mt-5'}>
                        <SelectImage selectedFilename={data.image} onSelect={imageChangeHandler}/>
                    </div>
                </DialogBody>
                <DialogFooter className={'justify-between'}>

                    <div className={'flex space-x-2'}>
                        <Button type={'button'} variant='outlined' className='text-primary border-primary' onClick={onClose}>Cancel</Button>
                        <Button type={'submit'} variant={'filled'} className={'bg-primary text-white'}>Speichern</Button>
                    </div>
                </DialogFooter>
            </form>
        </Dialog>
    )
}