import {Button, Card, CardBody, Option, Select} from "@material-tailwind/react";
import {DisplayData} from "@/types/displayData";
import SelectImage from "@/components/edit-display/SelectImage";
import React from "react";

type DisplayInputCardProps = {
    availableDisplays: DisplayData[]
    macAddress: string
    image: string
    onMacAddressChanged: (macAddress: string) => void
    onImageChanged: (image: string) => void
}

export function DisplayInputCard({availableDisplays, macAddress, image, onMacAddressChanged, onImageChanged}: DisplayInputCardProps) {

    const displayChangedHandler = (macAddress: string | undefined) => {
        if (macAddress) {
            onMacAddressChanged(macAddress)
        }
    }

    return (
        <Card className={'border border-blue-gray-200 shadow-sm mt-4'}>
            <CardBody className={'p-4 flex justify-between'}>
                <div className={'max-w-[9rem]'}>
                    <Select label={'Display'} value={macAddress} onChange={displayChangedHandler}>
                        {availableDisplays.map((d, index) =>
                            <Option key={index} value={d.macAddress}>Display {d.id}</Option>
                        )}
                    </Select>
                </div>
                {macAddress.length > 0 &&
                    <SelectImage selectedFilename={image} onSelect={onImageChanged}/>}
            </CardBody>
        </Card>
    )
}