// next js will automatically use this file (name convention error.tsx) to handle errors for the server component defined in page.tsx
"use client";

import {useEffect} from "react";

export default function Error({error}: {error : Error}){
    useEffect(()=>{
        console.log(error);
    }, [error]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl text-red-500">Error fetching user Data</div>


        </div>
    );


}