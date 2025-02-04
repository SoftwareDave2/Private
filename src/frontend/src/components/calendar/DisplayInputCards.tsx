import {EventDisplayDetails} from "@/types/eventDetails";
import React, {useEffect, useRef, useState} from "react";
import AddIcon from "@/components/shared/AddIcon";
import {Button} from "@material-tailwind/react";
import {DisplayInputCard} from "@/components/calendar/DisplayInputCard";
import {DisplayData} from "@/types/displayData";

type DisplayInputCards = {
    displayDetails: EventDisplayDetails[]
}

export default function DisplayInputCards({displayDetails}: DisplayInputCards) {

    const backendApiUrl = 'http://localhost:8080'

    const [displays, setDisplays] = useState<EventDisplayDetails[]>(displayDetails)
    const [allDisplays, setAllDisplays] = useState<DisplayData[]>([])
    const hasFetched = useRef(false)

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        updateAllDisplays()
            .then(() => {})
            .catch(err => console.error(err))
    }, [])

    const allowAddDisplay = () => {
        const emptyDisplays = displays.filter(d => d.macAddress.length === 0).length
        return emptyDisplays == 0
    }

    const updateAllDisplays = async () => {
        const response = await fetch(backendApiUrl + '/display/all')
        setAllDisplays((await response.json()) as DisplayData[])
    }

    const addDisplayHandler = () => {
        setDisplays([...displays, { macAddress:  "", image: "" }])
    }

    const displayChangedHandler = (prevMacAddress: string, newMacAddress: string) => {
        if (!prevMacAddress) {
            prevMacAddress = ""
        }

        setDisplays(displays.map(d =>
            d.macAddress === prevMacAddress
                ? {...d, macAddress: newMacAddress} : d))
    }

    const imageChangedHandler = (macAddress: string, image: string) => {
        setDisplays(displays.map(d =>
            d.macAddress === macAddress
            ? {...d, image: image} : d))
    }

    return (
        <>
            <div className={'mt-5'}>
                {displays.map((d, index) =>
                    <DisplayInputCard key={index} availableDisplays={allDisplays}
                                      macAddress={d.macAddress} image={d.image}
                                      onMacAddressChanged={(macAddress) => displayChangedHandler(d.macAddress, macAddress)}
                                      onImageChanged={(image) => imageChangedHandler(d.macAddress, image)} />
                )}
            </div>
            <div className={'mt-3'}>
                <Button size={'sm'} variant={'outlined'}
                                    className={'text-blue-gray-400 border-blue-gray-200'}
                                    onClick={addDisplayHandler}
                                    disabled={!allowAddDisplay()}>
                    <AddIcon /> Display hinzufügen
                </Button>
            </div>
        </>
    )
}