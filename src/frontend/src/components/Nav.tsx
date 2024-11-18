'use client'

import NavLinks from "./NavLinks"

export default function Nav() {


    return (
        <nav className={`flex justify-between items-center mb-5`}>
            <h1 className={`text-3xl text-red-700`}>Tablohm</h1>
            <NavLinks />
        </nav>
    )
}