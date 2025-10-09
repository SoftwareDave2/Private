import {useEffect, useMemo, useState} from 'react'

import {DisplayData} from '@/types/displayData'
import {getBackendApiUrl} from '@/utils/backendApiUrl'

import {DisplayTypeKey} from '../types'

type UseDisplaySelectionResult = {
    displays: DisplayData[]
    filteredDisplays: DisplayData[]
    selectedDisplay: string
    setSelectedDisplay: (macAddress: string) => void
    isLoadingDisplays: boolean
    displayError: string
}

export const useDisplaySelection = (displayType: DisplayTypeKey): UseDisplaySelectionResult => {
    const backendApiUrl = getBackendApiUrl()
    const [displays, setDisplays] = useState<DisplayData[]>([])
    const [selectedDisplay, setSelectedDisplay] = useState<string>('')
    const [isLoadingDisplays, setIsLoadingDisplays] = useState<boolean>(true)
    const [displayError, setDisplayError] = useState<string>('')

    useEffect(() => {
        let isCancelled = false

        const fetchDisplays = async () => {
            try {
                const response = await fetch(backendApiUrl + '/display/all')
                if (!response.ok) {
                    throw new Error('Konnte Displays nicht abrufen')
                }
                const data = await response.json() as DisplayData[]
                if (isCancelled) {
                    return
                }
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

        setIsLoadingDisplays(true)
        setDisplayError('')
        fetchDisplays()
            .catch((error) => console.error(error))

        return () => {
            isCancelled = true
        }
    }, [backendApiUrl])

    const filteredDisplays = useMemo(() => {
        if (displayType === 'event-board') {
            return displays.filter((display) => display.width === 400 && display.height === 300)
        }
        return displays
    }, [displayType, displays])

    useEffect(() => {
        if (isLoadingDisplays) {
            return
        }

        if (filteredDisplays.length === 0) {
            if (selectedDisplay !== '') {
                setSelectedDisplay('')
            }
            return
        }

        const isCurrentSelectionAvailable = filteredDisplays.some((display) => display.macAddress === selectedDisplay)
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
