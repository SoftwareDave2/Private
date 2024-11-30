// with Server we can use async await directly in the component
// server Components are the preferred Choice fpr data fetching, since offer reduced bundle size, lower latency, improved SEO, direct Access to backend ressources and the ability to secure sensitive data
type Display = {
    id: number;
    brand: string;
    model: string;
    filename: string;

};




export default async function UsersServer(){
    await new Promise((resolve) =>setTimeout(resolve, 2000));
    const response = await fetch("http://localhost:8080/display/all");
    const users = await response.json();
    return(
        <ul className= "space-y-4 p-4">
            {users.map((display: Display) => (
                <li key = {display.id} className= "p-4 bg-white shadow-md rounded-lg text-grey-700">
                    {display.id} ({display.filename})
                </li>
            ))}
        </ul>
    );
}