import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'

export const checkFileNameExists = async (fileName: string): Promise<boolean> => {
    const backendApiUrl = getBackendApiUrl()
    try {
        const response = await authFetch(`${backendApiUrl}/image/exists?filename=${encodeURIComponent(fileName)}`)
        if (!response.ok) {
            throw new Error('Fehler bei der Überprüfung des Dateinamens.')
        }
        const data = await response.json()
        return data.exists
    } catch (error) {
        console.error('Fehler beim Prüfen des Dateinamens:', error)
        return false
    }
}
