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

const buildDummyDisplay = (
    type: DisplayTypeKey,
    sizeOverride: { width: number; height: number } | null | undefined,
    index: number,
): DisplayData => {
    const previewSize = resolveTargetSize(type, sizeOverride)
    const mac = index === 0 ? '00:11:22:33:44:55' : '00:11:22:33:44:66'
    return {
        displayName: `Dummy Display ${index + 1}`,
        macAddress: mac,
        id: -1 - index,
        brand: 'Mock',
        model: 'Preview',
        width: previewSize.width,
        height: previewSize.height,
        orientation: 'landscape',
        filename: '',
        defaultFilename: '',
        runningSince: '',
        wakeTime: '',
        nextEventTime: '',
        battery_percentage: 100,
        timeOfBattery: '',
        errors: [],
    }
}

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
        const matching = displays.filter(
            (d) => d.width === targetSize.width && d.height === targetSize.height,
        )
        if (matching.length > 0) {
            return matching
        }
        return [buildDummyDisplay(displayType, previewSize, 0), buildDummyDisplay(displayType, previewSize, 1)]
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
