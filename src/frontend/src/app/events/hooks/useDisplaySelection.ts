import {useEffect, useMemo, useState} from 'react'
import {DisplayData} from '@/types/displayData'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'
import {DisplayTypeKey} from '../types'
import {fallbackPreviewDimensions} from '@/app/events/constants'

type UseDisplaySelectionResult = {
    displays: DisplayData[]
    filteredDisplays: DisplayData[]
    selectedDisplay: string
    setSelectedDisplay: (macAddress: string) => void
    isLoadingDisplays: boolean
    displayError: string
}

const resolveTargetSize = (
    type: DisplayTypeKey,
    sizeOverride?: { width: number; height: number } | null,
): { width: number; height: number } => {
    const fallbackSize = fallbackPreviewDimensions[type] ?? fallbackPreviewDimensions['door-sign']
    return {
        width: sizeOverride?.width ?? fallbackSize.width,
        height: sizeOverride?.height ?? fallbackSize.height,
    }
}

const dummyPool: DisplayData[] = [
    {
        id: -1,
        displayName: 'Dummy 400x300 #1',
        macAddress: '00:11:22:33:44:55',
        brand: 'Mock',
        model: 'Preview',
        width: 400,
        height: 300,
        orientation: 'landscape',
        filename: '',
        defaultFilename: '',
        runningSince: '',
        wakeTime: '',
        nextEventTime: '',
        battery_percentage: 100,
        timeOfBattery: '',
        errors: [],
    },
    {
        id: -2,
        displayName: 'Dummy 400x300 #2',
        macAddress: '00:11:22:33:44:66',
        brand: 'Mock',
        model: 'Preview',
        width: 400,
        height: 300,
        orientation: 'landscape',
        filename: '',
        defaultFilename: '',
        runningSince: '',
        wakeTime: '',
        nextEventTime: '',
        battery_percentage: 100,
        timeOfBattery: '',
        errors: [],
    },
    {
        id: -3,
        displayName: 'Dummy 296x128 #1',
        macAddress: '00:11:22:33:44:77',
        brand: 'Mock',
        model: 'Preview',
        width: 296,
        height: 128,
        orientation: 'landscape',
        filename: '',
        defaultFilename: '',
        runningSince: '',
        wakeTime: '',
        nextEventTime: '',
        battery_percentage: 100,
        timeOfBattery: '',
        errors: [],
    },
    {
        id: -4,
        displayName: 'Dummy 296x128 #2',
        macAddress: '00:11:22:33:44:88',
        brand: 'Mock',
        model: 'Preview',
        width: 296,
        height: 128,
        orientation: 'landscape',
        filename: '',
        defaultFilename: '',
        runningSince: '',
        wakeTime: '',
        nextEventTime: '',
        battery_percentage: 100,
        timeOfBattery: '',
        errors: [],
    },
    {
        id: -5,
        displayName: 'Dummy 250x122 #1',
        macAddress: '00:11:22:33:44:99',
        brand: 'Mock',
        model: 'Preview',
        width: 250,
        height: 122,
        orientation: 'landscape',
        filename: '',
        defaultFilename: '',
        runningSince: '',
        wakeTime: '',
        nextEventTime: '',
        battery_percentage: 100,
        timeOfBattery: '',
        errors: [],
    },
    {
        id: -6,
        displayName: 'Dummy 250x122 #2',
        macAddress: '00:11:22:33:44:AA',
        brand: 'Mock',
        model: 'Preview',
        width: 250,
        height: 122,
        orientation: 'landscape',
        filename: '',
        defaultFilename: '',
        runningSince: '',
        wakeTime: '',
        nextEventTime: '',
        battery_percentage: 100,
        timeOfBattery: '',
        errors: [],
    },
]

const OFFLINE_ERROR_CODE = 199

const isOffline = (display: DisplayData) =>
    Array.isArray(display.errors) && display.errors.some((err) => err.errorCode === OFFLINE_ERROR_CODE)

export const useDisplaySelection = (
    displayType: DisplayTypeKey,
    previewSize?: { width: number; height: number } | null,
): UseDisplaySelectionResult => {
    const backendApiUrl = getBackendApiUrl()
    const [displays, setDisplays] = useState<DisplayData[]>([])
    const [selectedDisplay, setSelectedDisplay] = useState<string>('')
    const [isLoadingDisplays, setIsLoadingDisplays] = useState<boolean>(true)
    const [displayError, setDisplayError] = useState<string>('')

    // Load Displays
    useEffect(() => {
        let isCancelled = false

        const fetchDisplays = async () => {
            setIsLoadingDisplays(true)
            setDisplayError('')

            try {
                const response = await authFetch(`${backendApiUrl}/display/all`)
                if (!response.ok) throw new Error('Konnte Displays nicht abrufen')

                const data = (await response.json()) as DisplayData[]
                if (isCancelled) return

                setDisplays(data)
                if (data.length > 0) {
                    setSelectedDisplay(data[0].macAddress)
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error(error)
                    setDisplayError('Displays konnten nicht geladen werden.')
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingDisplays(false)
                }
            }
        }

        fetchDisplays().catch(console.error)

        return () => {
            isCancelled = true
        }
    }, [backendApiUrl])

    // Filter displays
    const filteredDisplays = useMemo(() => {
        const targetSize = resolveTargetSize(displayType, previewSize)
        const matching = displays
            .filter((d) => !isOffline(d))
            .filter(
                (d) => d.width === targetSize.width && d.height === targetSize.height,
            )
        if (matching.length > 0) {
            return matching
        }
        return dummyPool.filter((d) => d.width === targetSize.width && d.height === targetSize.height)
    }, [displays, displayType, previewSize?.height, previewSize?.width])


    useEffect(() => {
        if (isLoadingDisplays) return

        if (filteredDisplays.length === 0) {
            if (selectedDisplay !== '') {
                setSelectedDisplay('')
            }
            return
        }

        const isCurrentSelectionAvailable = filteredDisplays.some(
            (display) => display.macAddress === selectedDisplay
        )

        if (!isCurrentSelectionAvailable) {
            setSelectedDisplay(filteredDisplays[0].macAddress)
        }
    }, [filteredDisplays, isLoadingDisplays, selectedDisplay])

    return {
        displays,
        filteredDisplays,
        selectedDisplay,
        setSelectedDisplay,
        isLoadingDisplays,
        displayError,
    }
}
