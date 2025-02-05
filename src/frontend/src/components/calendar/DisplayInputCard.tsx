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

    const getDisplay = () => {
        const displays = allDisplays
            .filter(d => d.macAddress === macAddress)
        return displays.length > 0 ? displays[0] : null
    }

    const displayWidth = () => getDisplay()?.width
    const displayHeight = () => getDisplay()?.height

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
                                    Display {d.id} <span className={'text-gray-600'}>({d.width}x{d.height})</span>
                                </Option>
                            )}
                        </Select>}
                </div>
                {macAddress.length > 0 &&
                    <SelectImage selectedFilename={image}
                                 width={displayWidth()}
                                 height={displayHeight()}
                                 onSelect={onImageChanged}
                                 onUnselect={() => onImageChanged("")} />}
            </CardBody>
        </Card>
    )
}