'use client'

import Link from "next/link"
import { usePathname } from 'next/navigation'

export default function NavLinks() {
    const navLinks = [
        {
            href: '/',
            name: 'Dashboard'
        },
        {
            href: '/calendar',
            name: 'Kalender'
        },
        {
            href: '/media',
            name: 'Mediathek'
        }
    ]
    const pathname = usePathname()

    return (
        <div className={`flex gap-3`}>
            {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                    <Link
                        className={`${isActive ? 'text-red-700' : 'text-black'}`}
                        href={link.href}
                        key={link.name}>
                        {link.name}
                    </Link>
                )
            })
            }
        </div>
    )
}