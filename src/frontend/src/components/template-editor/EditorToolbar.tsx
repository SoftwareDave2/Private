import {Button, Input, Option, Select} from "@material-tailwind/react";
import React, {ChangeEvent} from "react";

type EditorToolbarProps = {
    fontFamily: string,
    fontSize: number,
    isBold: boolean,
    color: string,
    onFontFamilyChange: (fontFamily: string) => void
    onFontSizeChange: (fontSize: number) => void
    onSetBoldChange: (isBold: boolean) => void
    onColorChange: (color: string) => void
    onBackgroundUpload: (img: File) => void
}

export default function EditorToolbar({ fontFamily, fontSize, isBold, color, onFontFamilyChange, onFontSizeChange,
                                      onSetBoldChange, onColorChange, onBackgroundUpload}: EditorToolbarProps) {

    const handleBoldClicked = () => {
        onSetBoldChange(!isBold)
    }

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            onBackgroundUpload(file)
        }
    }

    return (
        <div className={'border rounded p-4 shadow-sm mb-4 max-w-[45rem]'}>
            <div className={'w-100 flex gap-2'}>
                <Select label={'Schriftart'} value={fontFamily}
                        onChange={(val) => onFontFamilyChange(val ?? '')} className={'min-w-0'}>
                    <Option value='Arial'>Arial</Option>
                    <Option value='Helvetica'>Helvetica</Option>
                    <Option value='Times New Roman'>Times New Roman</Option>
                    <Option value='Courier New'>Courier New</Option>
                </Select>
                <Input label='Schriftgröße' type={'text'} value={fontSize} className={'min-w-0'}
                       onChange={(e) => onFontSizeChange(parseInt(e.target.value))} />
                <Button variant={'text'} color={'gray'} className={`border border-transparent ${isBold ? 'bg-gray-300 border-gray-800' : ''} font-bold text-lg py-0`}
                        onClick={handleBoldClicked}>F</Button>
                <Input label={'Farbe'} type={'color'} value={color} className={'min-w-1'}
                       onChange={(e) => onColorChange(e.target.value)} />
            </div>
            <div className={'block mt-3'}>
                <Input label={'Hintergrundbild'} type={'file'} accept={'image/*'} onChange={handleImageUpload} />
            </div>
        </div>
    )
}