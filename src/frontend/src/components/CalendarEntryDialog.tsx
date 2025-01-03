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




    // neue variante ohen die einzelnen change handler
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

    const filenameChangeHandler = (filename: string) =>
        setData(prevState => ({...prevState, image: filename}))


    const updateEvent = async (formdata: FormData) => {
        // Hinweis: die console.log(...) befehle werden in der Console im browser ausgeführt -> bei Safari: Entwickler -> javaScript-Konsole einblenden
        console.log("test log aus update event")

        const combinedStartDateTime = `${data.date}T${data.start}:00`;
        const combinedEndDateTime = `${data.date}T${data.end}:00`;
        console.log("combinedStartDateTime: "+ combinedStartDateTime)
        console.log("Image Name: "+ data.image)
        //console.log(formdata.get('allDay'))
        var ganzenTag = false
        if(formdata.get('allDay')){
            ganzenTag = true;
        }

        // var imageData = formdata.get('image');
        // var imageName = ""
        // if(imageData!= undefined){
        //     imageName = imageData.toString();
        // }
        // console.log("imageName"+imageName)


        try {
            const response = await fetch(backendApiUrl + '/event/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            /*
                body:
                    'title='+ data.title +
                    '&date=' + data.date +
                    '&start=' + data.start +
                    '&end=' + formdata.get('end') +
                    '&allDay=' + formdata.get('allDay') +
                    '&Image=' + data.image,

            */


                /*
                body:
                    'title=' + "test Meeting "+
                    '&allDay=' + "false" +
                    '&start=' + "2024-12-15T09:00:00" +
                    '&end=' + "2024-12-15T10:00:00" +
                    '&displayMac=' + "00:00:00:00:01"
                 */

                body:
                    'title=' + data.title +
                    '&allDay=' + ganzenTag +
                    '&start=' + combinedStartDateTime +
                    '&end=' + combinedEndDateTime +
                    '&displayMac=' + "00:00:00:00:01" +
                    '&image=' + data.image
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
                    <h2>Add Event</h2>
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
                    <div className={'mt-5'}>
                        <SelectImage selectedFilename={data.image} onSelect={filenameChangeHandler} />
                    </div>


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