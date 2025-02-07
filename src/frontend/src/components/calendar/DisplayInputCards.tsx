import {EventDisplayDetails} from "@/types/eventDetails";
import React, {useEffect, useRef, useState} from "react";
import AddIcon from "@/components/shared/AddIcon";
import {Button} from "@material-tailwind/react";
import {DisplayInputCard} from "@/components/calendar/DisplayInputCard";
import {DisplayData} from "@/types/displayData";

type DisplayInputCards = {
    displays: EventDisplayDetails[]
    onSetDisplays: (displays: EventDisplayDetails[]) => void
}

export default function DisplayInputCards({displays, onSetDisplays}: DisplayInputCards) {

    const backendApiUrl = 'http://localhost:8080'

    const [allDisplays, setAllDisplays] = useState<DisplayData[]>([])
    const hasFetched = useRef(false)

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        updateAllDisplays()
            .then(() => {})
            .catch(err => console.error(err))
    }, [])

    const usedDisplays = () => displays
        .filter(d => d.displayMac.length > 0)
        .map(d => d.displayMac)

    const allowAddDisplay = () => {
        const emptyDisplays = displays.filter(d => d.displayMac.length === 0).length
        return emptyDisplays == 0
    }

    const updateAllDisplays = async () => {
        const response = await fetch(backendApiUrl + '/display/all')
        setAllDisplays((await response.json()) as DisplayData[])
    }

    const addDisplayHandler = () =>
        onSetDisplays([...displays, { displayMac:  "", image: "" }])

    const displayChangedHandler = (prevMacAddress: string, newMacAddress: string) => {
        if (!prevMacAddress) {
            prevMacAddress = ""
        }

        onSetDisplays(displays.map(d =>
            d.displayMac === prevMacAddress
                ? {...d, displayMac: newMacAddress} : d))
    }

    const imageChangedHandler = (macAddress: string, image: string) =>
        onSetDisplays(displays.map(d =>
            d.displayMac === macAddress
                ? {...d, image: image} : d))

    const removedHandler = (macAddress: string) =>
        onSetDisplays(displays.filter(d =>
            d.displayMac !== macAddress))

    return (
        <>
            <div className={'mt-5'}>
                {displays.map((d, index) =>
                    <DisplayInputCard key={index} allDisplays={allDisplays}
                                      usedDisplays={usedDisplays()}
                                      macAddress={d.displayMac} image={d.image}
                                      onDisplayChanged={(macAddress) => displayChangedHandler(d.displayMac, macAddress)}
                                      onImageChanged={(image) => imageChangedHandler(d.displayMac, image)}
                                      onRemoved={() => removedHandler(d.displayMac)} />
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