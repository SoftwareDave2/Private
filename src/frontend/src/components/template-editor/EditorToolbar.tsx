import {Button, Input, Option, Select} from '@material-tailwind/react'
import React, {ChangeEvent} from 'react'

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

export default function EditorToolbar({
                                          fontFamily, fontSize, isBold, color, onFontFamilyChange, onFontSizeChange,
                                          onSetBoldChange, onColorChange, onBackgroundUpload,
                                      }: EditorToolbarProps) {

    const handleFontSizeChanged = (val: string | undefined) => {
        if (!val) {
            return
        }
        const fs = parseInt(val)
        if (fs) {
            onFontSizeChange(fs)
        }
    }

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
        <div className={'border  rounded p-4 shadow mb-4 max-w-[45rem]'}>
            <div className={'w-100 flex gap-2'}>
                <Select label={'Schriftart'} value={fontFamily}
                        onChange={(val) => onFontFamilyChange(val ?? '')}>
                    <Option value="Arial">Arial</Option>
                    <Option value="Helvetica">Helvetica</Option>
                    <Option value="Times New Roman">Times New Roman</Option>
                    <Option value="Courier New">Courier New</Option>
                </Select>
                <Select label={'Schriftgröße'} value={fontSize + ''} onChange={(val) => handleFontSizeChanged(val)}>
                    <Option value="5">5</Option>
                    <Option value="">6</Option>
                    <Option value="7">7</Option>
                    <Option value="8">8</Option>
                    <Option value="9">9</Option>
                    <Option value="10">10</Option>
                    <Option value="12">12</Option>
                    <Option value="14">14</Option>
                    <Option value="16">16</Option>
                    <Option value="18">18</Option>
                    <Option value="20">20</Option>
                    <Option value="22">22</Option>
                    <Option value="24">24</Option>
                    <Option value="26">26</Option>
                    <Option value="28">28</Option>
                    <Option value="30">30</Option>
                    <Option value="35">35</Option>
                    <Option value="40">40</Option>
                    <Option value="45">45</Option>
                </Select>
                <Button variant={'text'} color={'gray'}
                        className={`border border-transparent ${isBold ? 'bg-gray-300 border-gray-800' : ''} font-bold text-lg py-0`}
                        onClick={handleBoldClicked}>F</Button>
                <Input label={'Farbe'} type={'color'} value={color}
                       onChange={(e) => onColorChange(e.target.value)}/>
            </div>
            <div className={'block mt-3'}>
                <Input label={'Hintergrundbild'} type={'file'} accept={'image/*'} onChange={handleImageUpload}/>
            </div>
        </div>
    )
}