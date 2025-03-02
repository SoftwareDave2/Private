import {DisplayData} from "@/types/displayData";
import React, {useEffect, useRef, useState} from "react";
import {Checkbox, Typography} from "@material-tailwind/react";

type DisplayFiltersProps = {
    selectedMacs: string[]
    onSelectedMacsChanged: (macs: string[]) => void
}

export default function DisplayFilters({selectedMacs, onSelectedMacsChanged}: DisplayFiltersProps) {

    const backendApiUrl = 'http://localhost:8080'

    const [displays, setDisplays] = useState<DisplayData[]>([])
    const hasFetched = useRef(false)

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        updateDisplays()
            .catch(err => console.error(err))
    }, [])

    const updateDisplays = async () => {
        const response = await fetch(backendApiUrl + '/display/all')
        setDisplays(await response.json() as DisplayData[])
    }

    const selectAllHandler = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = evt.target.checked
        if (isChecked) {
            const allMacs = displays.map(d => d.macAddress)
            onSelectedMacsChanged(allMacs)
        } else {
            onSelectedMacsChanged([])
        }
    }

    const selectHandler = (macAddress: string) => {
        const newSelectedMacs = selectedMacs.includes(macAddress)
            ? selectedMacs.filter(m => m !== macAddress)
            : [...selectedMacs, macAddress]
        onSelectedMacsChanged(newSelectedMacs)
    }

    return (
        <div className={'mt-[4rem]'}>
            <h2 className={'text-lg font-bold'}>Display Filter</h2>
            <Checkbox label={'Alle auswählen'} checked={selectedMacs.length === displays.length}
                      onChange={selectAllHandler}/>
            <hr className={'my-1 border-gray-400'} />
            <div className={'flex flex-col'}>
                {displays.map((d, index) =>
                    <Checkbox key={index}
                              label={
                                  <div>
                                      <Typography color={'blue-gray'} className={'leading-none'}>{d.displayName}</Typography>
                                      <Typography className={'text-xs'} color={'gray'} >{d.macAddress}</Typography>
                                  </div>
                              }
                              checked={selectedMacs.includes(d.macAddress)} className={'!p-0'}
                              onChange={() => selectHandler(d.macAddress)} /> )}
            </div>
        </div>
    )
}