import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Select,
    Option
} from "@material-tailwind/react";
import { DisplayData } from "@/types/displayData";
import SelectImage from "@/components/edit-display/SelectImage";
import React, { useEffect, useState } from "react";
import { DeleteDisplayDialog } from "@/components/dashboard/DeleteDisplayDialog";
import { getBackendApiUrl } from "@/utils/backendApiUrl";

type EditDisplayDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDataUpdated: () => void,
};

export function EditDisplayDialog({ open, displayData, onClose, onDataUpdated }: EditDisplayDialogProps) {
    const backendApiUrl = getBackendApiUrl();

    const [data, setData] = useState<DisplayData>({
        ...displayData,
        displayName: displayData.displayName ?? ''
    });
    const [openDeleteDisplay, setOpenDeleteDisplay] = useState<boolean>(false);

    const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
    const [brandInputValue, setBrandInputValue] = useState<string>(data.brand);

    const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
    const [modelInputValue, setModelInputValue] = useState<string>(data.model);

    useEffect(() => {
        fetch(backendApiUrl + "/display/brands")
            .then((response) => response.json())
            .then((brands: string[]) => {
                console.log("Fetched brands:", brands);
                setBrandSuggestions(brands);
            })
            .catch((err) => console.error("Error fetching brands:", err));
    }, [backendApiUrl]);

    useEffect(() => {
        fetch(backendApiUrl + "/display/models")
            .then((response) => response.json())
            .then((models: string[]) => {
                console.log("Fetched models:", models);
                setModelSuggestions(models);
            })
            .catch((err) => console.error("Error fetching models:", err));
    }, [backendApiUrl]);

    const toggleOpenDeleteDisplayHandler = () => setOpenDeleteDisplay(!openDeleteDisplay);
    const orientationChangeHandler = (orientation: string | undefined) =>
        setData(prevState => ({ ...prevState, orientation: orientation ?? '' }));

    // New handler: When an image is selected as default, update both defaultFilename and defaultInternalName.
    const defaultImageChangeHandler = (selected: { filename: string, internalName: string }) =>
        setData(prevState => ({
            ...prevState,
            defaultFilename: selected.filename,
            defaultInternalName: selected.internalName,
        }));

    const displayNameChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData(prevState => ({ ...prevState, displayName: event.target.value }));
    };

    const displayDeletedHandler = () => {
        toggleOpenDeleteDisplayHandler();
        onDataUpdated();
    };

    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBrandInputValue(value);
        setData(prev => ({ ...prev, brand: value }));
    };

    const handleBrandFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setBrandInputValue("");
    };

    const handleBrandBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value.trim() === "") {
            setBrandInputValue(data.brand);
        }
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setModelInputValue(value);
        setData(prev => ({ ...prev, model: value }));
    };

    const handleModelFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setModelInputValue("");
    };

    const handleModelBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value.trim() === "") {
            setModelInputValue(data.model);
        }
    };

    const updateDisplay = async (formdata: FormData) => {
        console.log(data);
        try {
            const response = await fetch(backendApiUrl + '/display/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body:
                    'macAddress=' + data.macAddress +
                    '&displayName=' + data.displayName +
                    '&brand=' + data.brand +
                    '&model=' + data.model +
                    '&width=' + formdata.get('width') +
                    '&height=' + formdata.get('height') +
                    '&orientation=' + data.orientation +
                    '&defaultFilename=' + data.defaultFilename +
                    '&defaultInternalName=' + data.defaultInternalName,
            });
            const responseText = await response.text();
            console.log(responseText);
        } catch (err) {
            console.error(err);
        }

        onDataUpdated();
    };

    return (
        <Dialog open={open}>
            <DialogHeader>{data.displayName} Anpassen</DialogHeader>
            <form action={updateDisplay}>
                <DialogBody>
                    <div>
                        <Input label={'MAC Adresse'} value={data.macAddress} readOnly={true} />
                    </div>
                    <div className={'mt-5 flex gap-2'}>
                        <Input
                            label="Name"
                            name="displayName"
                            value={data.displayName ?? ''}
                            onChange={displayNameChangeHandler}
                        />
                    </div>

                    <div className="mt-5 flex gap-2 items-center">
                        <div className="w-full">
                            <label
                                htmlFor="brandInput"
                                className="block text-sm font-medium text-blue-gray-400 mb-1"
                            >
                                Displaymarke
                            </label>
                            <input
                                id="brandInput"
                                type="text"
                                name="brand"
                                value={brandInputValue}
                                onChange={handleBrandChange}
                                onFocus={handleBrandFocus}
                                onBlur={handleBrandBlur}
                                list="brandSuggestions"
                                className="mt-1 block w-full rounded-md border border-blue-gray-200 shadow-sm focus:border-black font-medium focus:ring-black sm:text-sm p-2 text-gray-700"
                            />
                        </div>
                        <datalist id="brandSuggestions">
                            {brandSuggestions.map((brand) => (
                                <option key={brand} value={brand} />
                            ))}
                        </datalist>

                        <div className="w-full">
                            <label
                                htmlFor="modelInput"
                                className="block text-sm font-medium text-blue-gray-400 mb-1"
                            >
                                Displaymodell
                            </label>
                            <input
                                id="modelInput"
                                type="text"
                                name="model"
                                value={modelInputValue}
                                onChange={handleModelChange}
                                onFocus={handleModelFocus}
                                onBlur={handleModelBlur}
                                list="modelSuggestions"
                                className="mt-1 block w-full rounded-md border border-blue-gray-200 shadow-sm focus:border-black font-medium focus:ring-black sm:text-sm p-2 text-gray-700"
                            />
                        </div>
                        <datalist id="modelSuggestions">
                            {modelSuggestions.map((model) => (
                                <option key={model} value={model} />
                            ))}
                        </datalist>
                    </div>

                    <div className={'mt-5 flex gap-2'}>
                        <Select label={'Orientierung'} value={data.orientation} name={'orientation'}
                                onChange={orientationChangeHandler}>
                            <Option value={'vertical'}>vertical</Option>
                            <Option value={'horizontal'}>horizontal</Option>
                        </Select>
                        <Input label={'Breite'} type={'number'} className={'min-w-[100px]'}
                               defaultValue={data.width}
                               name={'width'} />
                        <Input label={'Höhe'} type={'number'} className={'min-w-[100px]'}
                               defaultValue={data.height}
                               name={'height'} />
                    </div>
                    <div className={'mt-5'}>
                        {/* Updated: Use defaultImageChangeHandler so both defaultFilename and defaultInternalName update */}
                        <SelectImage selectedImage={data.defaultInternalName}
                                     screenWidth={data.width}
                                     screenHeight={data.height}
                                     screenOrientation={data.orientation}
                                     onSelect={defaultImageChangeHandler}
                        />
                    </div>
                </DialogBody>
                <DialogFooter className={'justify-between'}>
                    <Button type={'button'} variant={'filled'} className={'bg-primary text-white'}
                            onClick={toggleOpenDeleteDisplayHandler}>
                        Display Löschen
                    </Button>
                    <div className={'flex space-x-2'}>
                        <Button type={'button'} variant='outlined' className='text-primary border-primary'
                                onClick={onClose}>Cancel</Button>
                        <Button type={'submit'} variant={'filled'}
                                className={'bg-primary text-white'}>Speichern</Button>
                    </div>
                </DialogFooter>
            </form>
            <DeleteDisplayDialog open={openDeleteDisplay} displayData={data}
                                 onClose={toggleOpenDeleteDisplayHandler}
                                 onDisplayDeleted={displayDeletedHandler} />
        </Dialog>
    );
}
