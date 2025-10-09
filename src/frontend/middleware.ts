import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/favicon.ico']

export function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl

    const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
        || pathname.startsWith('/_next')
        || pathname.includes('.')

    if (isPublic) {
        return NextResponse.next()
    }

    const token = request.cookies.get('authToken')
    if (!token) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
