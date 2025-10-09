'use client'

import {ReactNode, useEffect, useMemo, useState} from 'react'
import {usePathname, useRouter} from 'next/navigation'
import {getBackendApiUrl} from '@/utils/backendApiUrl'

const PUBLIC_ROUTES = ['/login', '/register']

type AuthGuardProps = {
    children: ReactNode
}

const isPublicRoute = (pathname: string) =>
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

export default function AuthGuard({children}: AuthGuardProps) {
    const router = useRouter()
    const pathname = usePathname()
    const backendApiUrl = useMemo(() => getBackendApiUrl(), [])
    const [isChecking, setIsChecking] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState(false)

    const clearSession = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authTokenExpiresAt')
        document.cookie = 'authToken=; path=/; max-age=0'
        window.dispatchEvent(new Event('auth-change'))
    }

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        if (isPublicRoute(pathname)) {
            setIsAuthorized(true)
            setIsChecking(false)
            return
        }

        const verifySession = async () => {
            setIsChecking(true)
            const token = localStorage.getItem('authToken')

            if (!token) {
                clearSession()
                router.replace('/login')
                setIsAuthorized(false)
                setIsChecking(false)
                return
            }

            try {
                const response = await fetch(`${backendApiUrl}/auth/verify`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    setIsAuthorized(true)
                } else {
                    clearSession()
                    router.replace('/login')
                    setIsAuthorized(false)
                }
            } catch (err) {
                console.error('Fehler bei der Sitzungsprüfung:', err)
                clearSession()
                router.replace('/login')
                setIsAuthorized(false)
            } finally {
                setIsChecking(false)
            }
        }

        verifySession()
    }, [backendApiUrl, pathname, router])

    if (isPublicRoute(pathname)) {
        return <>{children}</>
    }

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center text-slate-500">
                Anmeldung wird überprüft...
            </div>
        )
    }

    if (!isAuthorized) {
        return null
    }

    return <>{children}</>
}
