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
import {getBackendApiUrl} from "@/utils/backendApiUrl";
import {authFetch} from "@/utils/authFetch";
import {Monitor, Save, Trash2, Tag, Image as ImageIcon, Settings} from "lucide-react";

type EditDisplayDialogProps = {
    open: boolean,
    displayData: DisplayData,
    onClose: () => void,
    onDataUpdated: () => void,
}

export function EditDisplayDialog({open, displayData, onClose, onDataUpdated}: EditDisplayDialogProps) {

    // const host = window.location.hostname;
    // const backendApiUrl = 'http://' + host + ':8080';
    const backendApiUrl = getBackendApiUrl();

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
        authFetch(backendApiUrl + "/display/brands")
            .then((response) => response.json())
            .then((brands: string[]) => {
                console.log("Fetched brands:", brands);
                setBrandSuggestions(brands);
            })
            .catch((err) => console.error("Error fetching brands:", err));
    }, [backendApiUrl]);



    // Beim Initialisieren: Abrufen der Marken vom Backend
    useEffect(() => {
        authFetch(backendApiUrl + "/display/models")
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
    const defaultFilenameChangeHandler = (defaultFilename: string) =>
        setData(prevState => ({...prevState, defaultFilename: defaultFilename}))
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
            const response = await authFetch(backendApiUrl + '/display/add', {
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
                    '&defaultFilename=' + data.defaultFilename,
            })
            const responseText = await response.text()
            console.log(responseText)
        } catch (err) {
            console.error(err)
        }

        onDataUpdated()
    }




    return (
        <Dialog open={open} size="lg" className="bg-white shadow-2xl">
            {/* Modern Header */}
            <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-6">
                <div className="relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                            <Monitor className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900">Display bearbeiten</h2>
                            <p className="mt-1 font-mono text-sm text-slate-600">{data.macAddress}</p>
                        </div>
                    </div>
                </div>
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/20 blur-3xl"></div>
            </div>

            <form action={updateDisplay}>
                <DialogBody className="space-y-6 px-6 py-6">
                    {/* Display Name - Prominent */}
                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="h-5 w-5 text-blue-600" />
                            <label htmlFor="displayNameInput" className="text-sm font-bold uppercase tracking-wider text-blue-700">
                                Display-Name
                            </label>
                        </div>
                        <input
                            id="displayNameInput"
                            type="text"
                            name="displayName"
                            value={data.displayName ?? ''}
                            onChange={displayNameChangeHandler}
                            placeholder="z.B. Konferenzraum 1, Eingang, Büro 203..."
                            className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-3 text-lg font-semibold text-slate-900 shadow-sm transition-all placeholder:text-slate-400 placeholder:font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <p className="mt-2 text-xs text-slate-600">
                            Geben Sie einen aussagekräftigen Namen für dieses Display ein
                        </p>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-slate-600" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                Technische Details
                            </h3>
                        </div>

                        <div>
                            <Input label={'MAC Adresse'} value={data.macAddress} readOnly={true} disabled />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label
                                htmlFor="brandInput"
                                className="block text-sm font-semibold text-slate-700 mb-2"
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
                                className="block w-full rounded-lg border-2 border-slate-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium text-sm p-3 text-slate-900 transition-all"
                            />
                            <datalist id="brandSuggestions">
                                {brandSuggestions.map((brand) => (
                                    <option key={brand} value={brand}/>
                                ))}
                            </datalist>
                        </div>

                        <div className="flex-1">
                            <label
                                htmlFor="modelInput"
                                className="block text-sm font-semibold text-slate-700 mb-2"
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
                                className="block w-full rounded-lg border-2 border-slate-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium text-sm p-3 text-slate-900 transition-all"
                            />
                            <datalist id="modelSuggestions">
                                {modelSuggestions.map((model) => (
                                    <option key={model} value={model}/>
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Select label={'Orientierung'} value={data.orientation} name={'orientation'}
                                onChange={orientationChangeHandler}>
                            <Option value={'vertical'}>Vertikal</Option>
                            <Option value={'horizontal'}>Horizontal</Option>
                        </Select>
                        <Input label={'Breite (px)'} type={'number'}
                               defaultValue={data.width}
                               name={'width'}/>
                        <Input label={'Höhe (px)'} type={'number'}
                               defaultValue={data.height}
                               name={'height'}/>
                    </div>

                    {/* Image Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-slate-600" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                Standard-Bild
                            </h3>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                            <SelectImage selectedFilename={data.defaultFilename}
                                         screenWidth={data.width}
                                         selectedDisplayMac={data.macAddress}
                                         screenHeight={data.height}
                                         screenOrientation={data.orientation}
                                         onSelect={defaultFilenameChangeHandler}
                            />
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter className="justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <Button
                        type="button"
                        variant="filled"
                        onClick={toggleOpenDeleteDisplayHandler}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 capitalize shadow-md shadow-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/40"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Display Löschen</span>
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={onClose}
                            className="border-slate-300 capitalize text-slate-700 transition-all hover:bg-slate-100"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            variant="filled"
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 capitalize shadow-md shadow-blue-600/30 transition-all hover:shadow-lg hover:shadow-blue-600/40"
                        >
                            <Save className="h-4 w-4" />
                            <span>Speichern</span>
                        </Button>
                    </div>
                </DialogFooter>
            </form>
            <DeleteDisplayDialog open={openDeleteDisplay} displayData={data}
                                 onClose={toggleOpenDeleteDisplayHandler}
                                 onDisplayDeleted={displayDeletedHandler}/>
        </Dialog>
    )
}
