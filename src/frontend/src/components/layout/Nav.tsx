'use server'

import NavLinks from "./NavLinks"

export default async function Nav() {

    return (
        <nav className={`flex justify-between items-center mb-5`}>
            <h1 className={`text-3xl text-primary`}>Tablohm</h1>
            <NavLinks />
        </nav>
    )
}