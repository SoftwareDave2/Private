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

    // ursprüngliche variante mit den einzelnen change handlern
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

    // neie variante ohen die einzelnen change handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        // Falls es ein Checkbox-Feld ist, setzen wir `checked` statt `value`
        if (type === 'checkbox') {
            setData({
                ...data,
                [name]: checked
            });
        } else {
            setData({
                ...data,
                [name]: value
            });
        }
    };



    const updateEvent = async (formdata: FormData) => {
        console.log("test log aus update event")

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
        eventDetails.title= data.title
        eventDetails.date = data.date
        eventDetails.start = data.start
        eventDetails.end = data.end
        eventDetails.allDay = data.allDay
        onDataUpdated()
    }

    return (
        <Dialog open={open}>
            <DialogHeader>Display {data.title} Anpassen</DialogHeader>
            <form action={updateEvent}>
                <DialogBody>
                    <div>
                        <h2>Add Event</h2>
                        <form>
                            <div>
                                <label htmlFor="title">Title:</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    onChange={handleInputChange}
                                    placeholder="Event Title"
                                />
                            </div>

                            <div>
                                <label htmlFor="date">Date:</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={data.date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {!data.allDay && (
                                <>
                                    <div>
                                        <label htmlFor="start">Start Time:</label>
                                        <input
                                            type="time"
                                            name="start"
                                            value={data.start}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="end">End Time:</label>
                                        <input
                                            type="time"
                                            name="end"
                                            value={data.end}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="allDay"
                                        checked={data.allDay}
                                        onChange={handleInputChange}
                                    />
                                    All Day Event
                                </label>
                            </div>
                        </form>
                    </div>


                    {/**
                     <div>
                     <Input label={'Title'} value={data.title} readOnly={true}/>
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

                     </div>

                     **/}


                </DialogBody>
                <DialogFooter className={'justify-between'}>

                    <div className={'flex space-x-2'}>
                        <Button type={'button'} variant='outlined' className='text-primary border-primary'
                                onClick={onClose}>Cancel</Button>
                        <Button type={'submit'} variant={'filled'}
                                className={'bg-primary text-white'}>Speichern</Button>
                    </div>
                </DialogFooter>
            </form>
        </Dialog>
    )
}