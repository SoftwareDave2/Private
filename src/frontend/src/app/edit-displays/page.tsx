// in dem beispiel mit mockapi.io durchgeführt, aber dafür müsste amn extra einen account machen:
// Link zum gesmaten YouTube Tutorial: https://www.youtube.com/watch?v=_EgI9WH8q1A
import {revalidatePath} from "next/cache";

import FormComponentAddDisplay from "@/components/FormComponentAddDisplay";
type Display = {
    id: number;
    brand: string;
    model: string;
    width: number;
    height: number;
    orientation: string;
    filename: string;
};


export default async function MockDisplays() {
    //await new Promise((resolve) => setTimeout(resolve, 2000));
    //const response = await fetch("der eigentliche Link, von dem die Liste der user gefetched wird");
    const response = await fetch("http://localhost:8080/display/all");
    const displays = await response.json();

    async function addDisplay(formdata: FormData){
        "use server"
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

        const res = await fetch("http://localhost:8080/display/add", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded",
                    //Authorization: "Bearer YOUR_PRIVATE_KEY" // secure because it is server side code.
                },
                body: 'brand='+brand +
                    '&model='+model+
                    '&width='+ width +
                    '&height='+ height +
                    '&orientation='+ orientation +
                    '&filename='+ filename
            }
        );
        //const newUser = await res.json();
        //await res.json();
        revalidatePath("/edit-displays");
        //console.log(newUser);
    }


    async function printData(formdata: FormData){
        "use server"
        const brand = formdata.get("brand");
        const model = formdata.get("model");
        const width = formdata.get("width");
        const height = formdata.get("height");
        const orientation = formdata.get("orientation");
        const filename = formdata.get("filename");

        const brand2 = formdata.get("brand2");
        const orientation2 = formdata.get("orientation2");
        const checkbox_test = formdata.get("checkbox_test");
        const comment_test = formdata.get("comment_test");
        const filename2 = formdata.get("filename2");

        console.log("Brand: "+ brand)
        console.log("Model: "+ model)
        console.log("Width: "+ width)
        console.log("Height: "+ height)
        console.log("Orientation: "+ orientation)
        console.log("Filename: "+ filename)
        console.log("Tests mit anderen Elememnten:")
        console.log("Brand2: "+ brand2)
        console.log("Orientation2: "+ orientation2)
        console.log("Checkbox Test: "+ checkbox_test)
        console.log("Comment Test: "+ comment_test)
        if (filename2 instanceof File) {
            console.log("Filename2:"+ filename2.name);
        }
    }




    async function removeDisplay(formdata: FormData){
        "use server"
        const id = formdata.get("id");
        const res = await fetch("http://localhost:8080/display/delete/"+id, {
                method: "DELETE"
            }
        );
        //await res.json();
        revalidatePath("/mock-displays");
        //console.log(newUser);
    }




    return (
        <div className="py-10">
            {/*
            <form action={addDisplay} className="mb-4">
                <input type="text" name="filename" required className="border p-2 mr-2"/>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add display</button>
            </form>
            */}

            <form action={addDisplay} className=" ">
                <label htmlFor="add_new_display" className="inline-block mr-2">Add a new Display:</label>
                <br></br>
                <label htmlFor="brand" className="inline-block w-24 mb-4 mt-4">Brand:</label>
                <label htmlFor="Phillips">Phillips:</label>
                <input type="radio" id="Phillips" value="Phillips" name="brand" required={true}
                       className="inline-block w-24 mb-4 mt-4" defaultChecked/>
                <br></br>
                <label htmlFor="model" className="inline-block w-24">Model:</label>
                <label htmlFor="Phillips">Tableaux:</label>
                <input type="radio" id="Tableaux" value="Tableaux" name="model" required={true}
                       className="inline-block w-24 mb-4 mt-4" defaultChecked/>
                <br></br>
                <div className=" ">
                    <label htmlFor="orientation" className="inline-block w-24 mb-4 mt-4 mr-2">Orientation:</label>
                    <select id="orientation" name="orientation" required={true}
                            className="h-12 border border-gray-300 text-base rounded-lg bg-white appearance-none py-2.5 px-4 focus:outline-none ">
                        <option value="vertical">vertical</option>
                        <option value="horizontal">horizontal</option>
                    </select>
                </div>
                <br></br>
                <label htmlFor="width" className="inline-block w-24">Width:</label>
                <input type="number" id="width" min="0" placeholder="1920" defaultValue="1920" name="width" required
                       className="border p-2 mr-2 ml-2 mb-4"/>
                <br></br>
                <label htmlFor="height" className="inline-block w-24">Height:</label>
                <input type="number" id="height" min="0" placeholder="1080" defaultValue="1080" name="height" required
                       className="border p-2 mr-2 ml-2 mb-4"/>
                <br></br>
                <label htmlFor="file" className="inline-block w-24 mb-4 mt-4 ">Filename:</label>
                <input type="file" id="file" name="file" className="text-sm  p-2 mr-2  mb-4"
                       accept="image/png, image/jpeg" required/>
                <br></br>
                <button type="submit" className="mb-4 mt-4 bg-blue-500 text-white px-4 py-2 rounded">Add Display
                </button>
                <br></br>
                <br></br>
            </form>


            <form action={removeDisplay} className="mb-4">
                <input type="text" name="id" placeholder="Id of the tablet" required className="border p-2 mr-2"/>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">remove display</button>
            </form>

            <ul className="space-y-4 p-4">
                {displays.map((display: Display) => (
                    <li key={display.id} className="p-4 bg-white shadow-md rounded-lg text-grey-700">
                        Display id: {display.id} <br></br>
                        Brand: {display.brand} <br></br>
                        Model: {display.model} <br></br>
                        Width: {display.width} <br></br>
                        Height: {display.height} <br></br>
                        Orientation: {display.orientation} <br></br>
                        Filename: {display.filename}
                    </li>
                ))}
            </ul>


            <form action={printData} className="mb-4">
                <br></br>
                <label htmlFor="Input_Type_tests" className="inline-block mr-2 mb-4">Input Type tests:</label>
                <br></br>
                <label htmlFor="brand" className="inline-block w-24">Brand:</label>
                <input type="text" id="brand" placeholder="Phillips" defaultValue="Phillips" name="brand" required
                       className="border p-2 mr-2 ml-2 mb-4"/>
                <br></br>
                <label htmlFor="model" className="inline-block w-24">Model:</label>
                <input type="text" id="model" placeholder="Tableux" defaultValue="Tableux" name="model" required
                       className="border p-2 mr-2 ml-2 mb-4"/>
                <br></br>
                <label htmlFor="width" className="inline-block w-24">Width:</label>
                <input type="number" id="width" min="0" placeholder="1920" defaultValue="1920" name="width" required
                       className="border p-2 mr-2 ml-2 mb-4"/>
                <br></br>
                <label htmlFor="height" className="inline-block w-24">Height:</label>
                <input type="number" id="height" min="0" placeholder="1080" defaultValue="1080" name="height" required
                       className="border p-2 mr-2 ml-2 mb-4"/>
                <br></br>
                <label htmlFor="orientation" className="inline-block w-24">Orientation:</label>
                <input type="text" id="orientation" placeholder="vertical" defaultValue="vertical" name="orientation"
                       required
                       className="border p-2 mr-2 ml-2 mb-4"/>
                <br></br>
                <label htmlFor="filename" className="inline-block w-24">Filename:</label>
                <input type="text" id="filename" placeholder="moon.png" defaultValue="moon.png" name="filename" required
                       className="border p-2 mr-2 ml-2 mb-4"/>
                <br></br>


                <label className="p-4 mr-2 ml-2 mb-4 mt-4">Tests mit anderen Elementen</label>
                <br></br>
                <label htmlFor="brand2" className="inline-block w-24 mb-4 mt-4">Brand2:</label>
                <label htmlFor="Phillips">Phillips:</label>
                <input type="radio" id="Phillips" value="Phillips" name="brand2" required={true}
                       className="inline-block w-24 mb-4 mt-4" defaultChecked/>
                <label htmlFor="Samsung">Samsung:</label>
                <input type="radio" id="Samsung" value="Samsung" name="brand2" required={true}
                       className="inline-block w-24 mb-4 mt-4"/>
                <br></br>
                <label htmlFor="orientation2" className="inline-block w-24 mb-4 mt-4">Orientation2:</label>
                <select id="orientation2" name="orientation2" required={true} className="mr-10 mb-4 mt-4">
                    <option value="vertical">vertical</option>
                    <option value="horizontal">horizontal</option>
                </select>
                <br></br>
                <label htmlFor="checkbox_test" className="inline-block w-24 mb-4 mt-4">Checkbox Test:</label>
                <input type="checkbox" id="checkbox_test" name="checkbox_test" className="mr-10 mb-4 mt-4"/>
                <br></br>
                <label htmlFor="comment_test" className="inline-block w-24 mb-4 mt-4">Comment Test:</label>
                <textarea id="comment_test" rows={3} cols={20} name="comment_test"
                          className="mr-10 mb-4 mt-4"></textarea>
                <br></br>
                <label htmlFor="filename2" className="inline-block w-24 mb-4 mt-4">Filename2:</label>
                <input type="file" id="filename2" name="filename2" accept="image/png, image/jpeg"/>

                <br></br>
                <button type="submit" className="mb-4 mt-4 bg-blue-500 text-white px-4 py-2 rounded">Print Data on
                    Console
                </button>
            </form>

        </div>


    );
}