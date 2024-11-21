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
        const filename = formdata.get("filename");
        const res = await fetch("http://localhost:8080/display/add", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded",
                    //Authorization: "Bearer YOUR_PRIVATE_KEY" // secure because it is server side code.
                },
                body: 'brand=Phillips&model=Tableux&width=1920&height=1080&orientation=vertical&filename='+filename
            }
        );
        //const newUser = await res.json();
        //await res.json();
        revalidatePath("/mock-displays");
        //console.log(newUser);
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
            <form action={addDisplay} className="mb-4">
                <input type="text" name="filename" required className="border p-2 mr-2"/>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add display</button>


            </form>
            <form action={removeDisplay} className="mb-4">
                <input type="text" name="id" required className="border p-2 mr-2"/>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">remove display</button>


            </form>

            <ul className="space-y-4 p-4">
                {displays.map((display: Display) => (
                    <li key={display.id} className="p-4 bg-white shadow-md rounded-lg text-grey-700">
                        Display id: {display.id} , Filepath: ({display.filename})
                    </li>
                ))}
            </ul>
        </div>


    );
}