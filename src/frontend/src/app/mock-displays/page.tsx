// in dem beispiel mit mockapi.io durchgeführt, aber dafür müsste amn extra einen account machen:
// Link zum gesmaten YouTube Tutorial: https://www.youtube.com/watch?v=_EgI9WH8q1A
import {revalidatePath} from "next/cache";
type Display = {
    id: number;
    brand: string;
    model: string;
    filename: string;
};

export default async function MockUsers() {
    //await new Promise((resolve) => setTimeout(resolve, 2000));
    //const response = await fetch("der eigentliche Link, von dem die Liste der user gefetched wird");
    const response = await fetch("http://localhost:8080/display/all");
    const displays = await response.json();

    async function addUser(formdata: FormData){
        "use server"
        const name = formdata.get("name");
        const res = await fetch("http://localhost:8080/display/add", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded",
                    //Authorization: "Bearer YOUR_PRIVATE_KEY" // secure because it is server side code.
                },
                body: 'brand=Phillips&model=Tableux&width=1920&height=1080&orientation=vertical&filename='+name
            }
        );
        const newUser = await res.json();
        revalidatePath("/mock-displays");
        //console.log(newUser);
    }





    return (
        <div className="py-10">
            <form action = {addUser} className="mb-4">
                <input type="text" name="name" required className="border p-2 mr-2"/>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add display</button>


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