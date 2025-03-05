import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Select,
    Option
} from "@material-tailwind/react"
import {DisplayData} from "@/types/displayData";
import SelectImage from "@/components/edit-display/SelectImage";
import React, {useEffect, useState} from "react";
import {DeleteDisplayDialog} from "@/components/dashboard/DeleteDisplayDialog";

type EditDisplayDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDataUpdated: () => void,
}

export function EditDisplayDialog({open, displayData, onClose, onDataUpdated}: EditDisplayDialogProps) {

    const host = window.location.hostname;
const backendApiUrl = 'http://' + host + ':8080';

    const [data, setData] = useState<DisplayData>({
        ...displayData,
        displayName: displayData.displayName ?? '' // Fallback-Wert setzen
    });
    const [openDeleteDisplay, setOpenDeleteDisplay] = useState<boolean>(false)

    const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
    // Separater State für den Wert des Brand-Inputs, um diesen temporär leeren zu können
    const [brandInputValue, setBrandInputValue] = useState<string>(data.brand);

    const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
    // Separater State für den Wert des Brand-Inputs, um diesen temporär leeren zu können
    const [modelInputValue, setModelInputValue] = useState<string>(data.model);


    // Beim Initialisieren: Abrufen der Marken vom Backend
    useEffect(() => {
        fetch(backendApiUrl + "/display/brands")
            .then((response) => response.json())
            .then((brands: string[]) => {
                console.log("Fetched brands:", brands);
                setBrandSuggestions(brands);
            })
            .catch((err) => console.error("Error fetching brands:", err));
    }, [backendApiUrl]);



    // Beim Initialisieren: Abrufen der Marken vom Backend
    useEffect(() => {
        fetch(backendApiUrl + "/display/models")
            .then((response) => response.json())
            .then((models: string[]) => {
                console.log("Fetched models:", models);
                setModelSuggestions(models);
            })
            .catch((err) => console.error("Error fetching models:", err));
    }, [backendApiUrl]);




    const toggleOpenDeleteDisplayHandler = () => setOpenDeleteDisplay(!openDeleteDisplay)
    const orientationChangeHandler = (orientation: string | undefined) =>
        setData(prevState => ({...prevState, orientation: orientation ?? ''}))
    const filenameChangeHandler = (filename: string) =>
        setData(prevState => ({...prevState, filename: filename}))
    const displayNameChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData(prevState => ({ ...prevState, displayName: event.target.value }));
    };

    const displayDeletedHandler = () => {
        toggleOpenDeleteDisplayHandler()
        onDataUpdated()
    }

    // Wenn sich der Wert im Input ändert, wird sowohl der lokale State als auch data.brand aktualisiert.
    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBrandInputValue(value);
        setData((prev) => ({ ...prev, brand: value }));
    };

    // Beim Fokussieren wird der Input temporär geleert,
    // damit der Browser alle Vorschläge anzeigt.
    const handleBrandFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setBrandInputValue("");
    };

    // Beim Verlassen (Blur) wird geprüft, ob das Feld leer ist.
    // Falls ja, wird der bisherige Wert wiederhergestellt.
    const handleBrandBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value.trim() === "") {
            setBrandInputValue(data.brand);
        }
    };




    // Wenn sich der Wert im Input ändert, wird sowohl der lokale State als auch data.brand aktualisiert.
    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setModelInputValue(value);
        setData((prev) => ({ ...prev, model: value }));
    };

    // Beim Fokussieren wird der Input temporär geleert,
    // damit der Browser alle Vorschläge anzeigt.
    const handleModelFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setModelInputValue("");
    };

    // Beim Verlassen (Blur) wird geprüft, ob das Feld leer ist.
    // Falls ja, wird der bisherige Wert wiederhergestellt.
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
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body:
                    'macAddress='+ data.macAddress +
                    '&displayName='+ data.displayName +
                    '&brand=' + data.brand +
                    '&model=' + data.model +
                    '&width=' + formdata.get('width') +
                    '&height=' + formdata.get('height') +
                    '&orientation=' + data.orientation +
                    '&filename=' + data.filename,
            })
            const responseText = await response.text()
            console.log(responseText)
        } catch (err) {
            console.error(err)
        }

        onDataUpdated()
    }




    return (
        <Dialog open={open}>
            <DialogHeader>Display {data.id} Anpassen</DialogHeader>
            <form action={updateDisplay}>
                <DialogBody>
                    <div>
                        <Input label={'MAC Adresse'} value={data.macAddress} readOnly={true}/>
                    </div>
                    <div className={'mt-5 flex gap-2'}>
                        {/*<Select label={'Displaymarke'} value={data.brand} name={'brand'} onChange={brandChangeHandler}>
                            <Option key={'Philips'} value={'Philips'}>Philips</Option>
                        </Select> */}
                        <Input
                            label="Name"
                            name="displayName"
                            value={data.displayName ?? ''}
                            onChange={displayNameChangeHandler}
                        />

                    </div>

                    <div className="mt-5 flex gap-2 items-center">
                        {/* Hier wird das native Input-Feld verwendet */}
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
                                <option key={brand} value={brand}/>
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
                                <option key={model} value={model}/>
                            ))}
                        </datalist>
                    </div>


                    <div className={'mt-5 flex gap-2'}>
                        <Select label={'Orientierung'} value={data.orientation} name={'orientation'}
                                onChange={orientationChangeHandler}>
                            <Option value={'vertical'}>vertical</Option>
                        </Select>
                        <Input label={'Breite'} type={'number'} className={'min-w-[100px]'}
                               defaultValue={data.width}
                               name={'width'}/>
                        <Input label={'Höhe'} type={'number'} className={'min-w-[100px]'}
                               defaultValue={data.height}
                               name={'height'}/>
                    </div>
                    <div className={'mt-5'}>
                        <SelectImage selectedFilename={data.filename}
                                     width={data.width}
                                     height={data.height}
                                     onSelect={filenameChangeHandler}
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
                                 onDisplayDeleted={displayDeletedHandler}/>
        </Dialog>
    )
}