'use client'

import React, {useState, useEffect} from 'react'
import PageHeader from "@/components/PageHeader";
import DisplayFrame from "@/components/DisplayFrame";
import { DisplayData } from "@/types/displayData"
import getConfig from 'next/config'
import PageHeaderButton from "@/components/PageHeaderButton";
import ModalEditDisplay from "@/components/ModalEditDisplay";
import ModalDeleteDisplay from "@/components/ModalDeleteDisplay";


export default function Home() {

    //const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
    const backendApiUrl = 'http://localhost:8080'

    const [displays, setDisplays] = useState<DisplayData[]>([])
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [selectedDisplay, setSelectedDisplay] = useState<DisplayData | null>(null); // State für das angeklickte Display

    const fetchDisplays = async () => {
        const data = await fetch(backendApiUrl + '/display/all')
        const json = await data.json()
        setDisplays(json)
    }

    useEffect(() => {
        fetchDisplays()
            .then(() => { console.log('Displays updated!') })
            .catch((err) => { console.error('No connection to backend!', err)})
    }, [])

    const openModalEditWithDisplay = (display: DisplayData) => {
        setSelectedDisplay(display); // Set the selected display
        setIsModalEditOpen(true); // Open the modal
    };

    const openModalDeleteWithDisplay = (display: DisplayData) => {
        setSelectedDisplay(display); // Set the selected display
        setIsModalDeleteOpen(true); // Open the modal
    };

    const closeModalEdit = () => {
        setIsModalEditOpen(false); // Close the modal
        setSelectedDisplay(null); // Reset the selected display
    };

    const closeModalDelete = () => {
        setIsModalDeleteOpen(false); // Close the modal
        //setSelectedDisplay(null); // Reset the selected display
    };



    async function addDisplay(formdata: FormData){
        //"use server"
        closeModalEdit();
        const macAddress = formdata.get("macAddress");
        const brand = formdata.get("brand");
        const model = formdata.get("model");
        const width = formdata.get("width");
        const height = formdata.get("height");
        const orientation = formdata.get("orientation");
        const file = formdata.get("file");
        var  filename ="test.png";
        if (file instanceof File) {
            filename = file.name;
        }
        //const wakeTime = new Date().toISOString()
        const wakeTime = "2024-12-01T12:30:00"

        const res = await fetch("http://localhost:8080/display/add", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded",
                    //Authorization: "Bearer YOUR_PRIVATE_KEY" // secure because it is server side code.
                },
                body:
                //'macAddress=00:1B:44:21:3A:B7&brand=Phillips&model=Tableux&width=1920&height=1080&orientation=vertical&filename=moon.png'
                    'macAddress='+ macAddress +
                    '&brand='+brand +
                    '&model='+model+
                    '&width='+ width +
                    '&height='+ height +
                    '&orientation='+ orientation +
                    '&filename='+ filename
                    + '&wakeTime=' + wakeTime
            }
        );
        //const newUser = await res.json();
        let erg = await res;
        console.log(erg)
        // revalidatePath("/edit-displays");
        //console.log(newUser);
    }


    async function removeDisplay(formdata: FormData){
        //"use server"
        closeModalDelete();
        closeModalEdit();
        setSelectedDisplay(null);
        const id = formdata.get("id");
        const res = await fetch("http://localhost:8080/display/delete/"+id, {
                method: "DELETE"
            }
        );
        let erg = await res.json();
        console.log(erg)
        //revalidatePath("/edit-displays");
        //console.log(newUser);
    }








    return (
        <main>
            <PageHeader title={'Dashboard'} info={`${displays.length} Bildschirme laufen - 0 Bildschirme gestoppt`}>
                <PageHeaderButton onClick={() => {
                }}>Add Display</PageHeaderButton>
            </PageHeader>
            <div className={`flex gap-4 flex-wrap`}>
                {displays.map(display =>
                    <DisplayFrame key={display.id} id={display.id} width={display.width} height={display.height}
                                  orientation={display.orientation} filename={display.filename}/>
                )}
            </div>


            <div className="py-10">
                <ul className="space-y-4 p-4">
                    {displays.map((display: DisplayData) => (
                        <li
                            key={display.id}
                            className="p-4 bg-white shadow-md rounded-lg text-grey-700"
                        >
                            Mac Adresse: {display.macAddress} <br/>
                            Display id: {display.id} <br/>
                            Brand: {display.brand} <br/>
                            Model: {display.model} <br/>
                            Width: {display.width} <br/>
                            Height: {display.height} <br/>
                            Orientation: {display.orientation} <br/>
                            Filename: {display.filename} <br/>
                            Wake Time: {display.wakeTime} <br/>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    openModalEditWithDisplay(display);
                                }}
                            >
                                <input
                                    name="macAddress"
                                    className="hidden"
                                    value={display.macAddress}
                                    readOnly
                                />
                                <button
                                    type="submit"
                                    className="mb-4 mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Bearbeiten
                                </button>
                            </form>




                        </li>
                    ))}
                </ul>

                {/* ModalEditDisplay-Komponente, wird angezeigt wenn isModalEditOpen true ist */}
                <ModalEditDisplay isOpen={isModalEditOpen} onClose={closeModalEdit}>
                    {/* Hier wird der Inhalt des Modals übergeben */}
                    {selectedDisplay && (
                        <div>
                            {/*
                            <h3 className="text-xl font-bold mb-4">Display Details</h3>
                            <p><strong>Mac Adresse:</strong> {selectedDisplay.macAddress}</p>
                            <p><strong>Display ID:</strong> {selectedDisplay.id}</p>
                            <p><strong>Brand:</strong> {selectedDisplay.brand}</p>
                            <p><strong>Model:</strong> {selectedDisplay.model}</p>
                            <p><strong>Width:</strong> {selectedDisplay.width}</p>
                            <p><strong>Height:</strong> {selectedDisplay.height}</p>
                            <p><strong>Orientation:</strong> {selectedDisplay.orientation}</p>
                            <p><strong>Filename:</strong> {selectedDisplay.filename}</p>
                            <p><strong>Wake Time:</strong> {selectedDisplay.wakeTime}</p>
                            */}


                            <form action={addDisplay} className=" ">
                                <input name="macAddress" className="hidden" value={selectedDisplay.macAddress}
                                       readOnly={true}/>
                                <br></br>

                                <div className=" ">
                                    <label htmlFor="brand"
                                           className="inline-block w-24 mb-4 mt-4 mr-2">Brand:</label>
                                    <select id="brand" name="brand"
                                            defaultValue={selectedDisplay.brand} required={true}
                                            className="h-12 border border-gray-300 text-base rounded-lg bg-white appearance-none py-2.5 px-4 focus:outline-none ">
                                        <option value="Phillips">Phillips</option>
                                    </select>
                                </div>
                                <div className=" ">
                                    <label htmlFor="model"
                                           className="inline-block w-24 mb-4 mt-4 mr-2">Model:</label>
                                    <select id="model" name="model"
                                            defaultValue={selectedDisplay.model} required={true}
                                            className="h-12 border border-gray-300 text-base rounded-lg bg-white appearance-none py-2.5 px-4 focus:outline-none ">
                                        <option value="Tableaux">Tableaux</option>
                                    </select>
                                </div>


                                <div className=" ">
                                    <label htmlFor="orientation"
                                           className="inline-block w-24 mb-4 mt-4 mr-2">Orientation:</label>
                                    <select id="orientation" name="orientation"
                                            defaultValue={selectedDisplay.orientation} required={true}
                                            className="h-12 border border-gray-300 text-base rounded-lg bg-white appearance-none py-2.5 px-4 focus:outline-none ">
                                        <option value="vertical">vertical</option>
                                        <option value="horizontal">horizontal</option>
                                    </select>
                                </div>
                                <br></br>
                                <label htmlFor="width" className="inline-block w-24">Width:</label>
                                <input type="number" id="width" min="0" placeholder="1920"
                                       defaultValue={selectedDisplay.width}
                                       name="width" required
                                       className="border p-2 mr-2 ml-2 mb-4"/>
                                <br></br>
                                <label htmlFor="height" className="inline-block w-24">Height:</label>
                                <input type="number" id="height" min="0" placeholder="1080"
                                       defaultValue={selectedDisplay.height}
                                       name="height"
                                       required
                                       className="border p-2 mr-2 ml-2 mb-4"/>
                                <br></br>

                                <p><strong>Aktuelles Bild:</strong> {selectedDisplay.filename}</p>
                                <label htmlFor="file" className="inline-block w-24 mb-4 mt-4 ">Filename:</label>
                                <input type="file" id="file" name="file" className="text-sm  p-2 mr-2  mb-4"
                                       accept="image/png, image/jpeg" required/>
                                <br></br>
                                <button type="submit"
                                        className="mb-4 mt-4 bg-blue-500 text-white px-4 py-2 rounded">Änderungen
                                    übernehmen
                                </button>
                                <br></br>
                                <br></br>
                            </form>


                            <form className=" "
                                  onSubmit={(e) => {
                                      e.preventDefault();
                                      openModalDeleteWithDisplay(selectedDisplay);
                                  }}
                            >
                                <input
                                    name="macAddress"
                                    className="hidden"
                                    value={selectedDisplay.macAddress}
                                    readOnly
                                />
                                <button
                                    type="submit"
                                    className="mb-4 mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Display löschen
                                </button>
                            </form>


                        </div>


                    )}
                </ModalEditDisplay>

                {/* ModalEditDisplay-Komponente, wird angezeigt wenn isModalEditOpen true ist */}
                <ModalDeleteDisplay isOpen={isModalDeleteOpen} onClose={closeModalDelete}>
                    {/* Hier wird der Inhalt des Modals übergeben */}
                    {selectedDisplay && (
                        <div>
                            <h1 className="text-xl font-bold mb-4">Willst du das
                                Display {selectedDisplay.id} wirklich löschen?</h1>
                            <h3 className="text-xl font-bold mb-4">Display Details</h3>
                            <p><strong>Mac Adresse:</strong> {selectedDisplay.macAddress}</p>
                            <p><strong>Display ID:</strong> {selectedDisplay.id}</p>
                            <p><strong>Brand:</strong> {selectedDisplay.brand}</p>
                            <p><strong>Model:</strong> {selectedDisplay.model}</p>
                            <p><strong>Width:</strong> {selectedDisplay.width}</p>
                            <p><strong>Height:</strong> {selectedDisplay.height}</p>
                            <p><strong>Orientation:</strong> {selectedDisplay.orientation}</p>
                            <p><strong>Filename:</strong> {selectedDisplay.filename}</p>
                            <p><strong>Wake Time:</strong> {selectedDisplay.wakeTime}</p>


                            <form action={removeDisplay} className="mb-4">

                                <input name="id" className="hidden" value={selectedDisplay.id}
                                       readOnly={true}/>
                                <br></br>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Ja
                                </button>
                                <br></br>
                                <br></br>
                            </form>
                        </div>

                    )}
                </ModalDeleteDisplay>


            </div>


        </main>
    );
}
