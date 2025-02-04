import {Card, CardBody, Option, Select} from "@material-tailwind/react";
import {DisplayData} from "@/types/displayData";
import SelectImage from "@/components/edit-display/SelectImage";
import React from "react";

type DisplayInputCardProps = {
    allDisplays: DisplayData[]
    usedDisplays: string[]
    macAddress: string
    image: string
    onDisplayChanged: (macAddress: string) => void
    onImageChanged: (image: string) => void
}

export function DisplayInputCard(
    {allDisplays, usedDisplays, macAddress, image, onDisplayChanged, onImageChanged}: DisplayInputCardProps) {

    const displayChangedHandler = (mac: string | undefined) => {
        if (mac) {
            onDisplayChanged(mac)
        }
    }

    return (
        <Card className={'border border-blue-gray-200 shadow-sm mt-4'}>
            <CardBody className={'p-4 flex justify-between'}>
                <div className={'max-w-[9rem]'}>
                    {allDisplays.length > 0 &&
                        <Select label={'Display'} value={macAddress}
                                onChange={displayChangedHandler}>
                            {allDisplays.map((d, index) =>
                                <Option key={index} value={d.macAddress}
                                        disabled={usedDisplays.includes(d.macAddress) && d.macAddress != macAddress}>
                                    Display {d.id}
                                </Option>
                            )}
                        </Select>}
                </div>
                {macAddress.length > 0 &&
                    <SelectImage selectedFilename={image} onSelect={onImageChanged}/>}
            </CardBody>
        </Card>
    )
}