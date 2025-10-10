import { useEffect, useMemo, useState } from 'react'
import { DisplayData } from '@/types/displayData'
import { getBackendApiUrl } from '@/utils/backendApiUrl'
import { authFetch } from '@/utils/authFetch'
import { DisplayTypeKey } from '../types'
import {previewDimensions} from "@/app/events/constants";

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
        const previewSize = previewDimensions[displayType] ?? previewDimensions['door-sign']
        return displays.filter(
            (d) => d.width === previewSize.width && d.height === previewSize.height
        )
    }, [displays, displayType])


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
