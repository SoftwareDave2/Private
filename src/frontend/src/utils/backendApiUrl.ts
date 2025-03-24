'use client'

export const getBackendApiUrl = (): string => {
    if (typeof window !== 'undefined') {
        const host = window.location.hostname
        return `http://${host}:8080`
    } else {
        // Fallback-Wert, wenn window nicht definiert ist
        return 'http://default-host:8080'
    }
}
