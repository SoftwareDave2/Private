import {Card, CardBody, IconButton, Option, Select} from "@material-tailwind/react";
import {DisplayData} from "@/types/displayData";
import SelectImage from "@/components/edit-display/SelectImage";
import React from "react";
import CloseIcon from "@/components/shared/CloseIcon";

type DisplayInputCardProps = {
    allDisplays: DisplayData[]
    usedDisplays: string[]
    macAddress: string
    image: string
    onDisplayChanged: (macAddress: string) => void
    onImageChanged: (image: string) => void
    onRemoved: () => void
}

export function DisplayInputCard(
    {allDisplays, usedDisplays, macAddress, image, onDisplayChanged, onImageChanged, onRemoved}: DisplayInputCardProps) {

    const displayChangedHandler = (mac: string | undefined) => {
        if (mac) {
            onDisplayChanged(mac)
        }
    }

    return (
        <Card className={'border border-blue-gray-200 shadow-sm mt-4'}>
            <CardBody className={'p-4 pe-7 flex justify-between relative'}>
                <div className={'absolute top-[-.5rem] right-[-.5rem]'}>
                    <IconButton className={'p-0 text-xs border border-blue-gray-200 bg-white text-gray-500 !shadow-none'}
                                type={'button'} size={'sm'} onClick={onRemoved}>
                        <CloseIcon />
                    </IconButton>
                </div>
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