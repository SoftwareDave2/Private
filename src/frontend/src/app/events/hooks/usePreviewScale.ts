import {useEffect, useRef, useState, type MutableRefObject} from 'react'

import {DisplayTypeKey} from '../types'

type PreviewSize = {
    width: number
    height: number
}

type UsePreviewScaleResult = {
    containerRef: MutableRefObject<HTMLDivElement | null>
    previewScale: number
}

export const usePreviewScale = (previewSize: PreviewSize, displayType: DisplayTypeKey): UsePreviewScaleResult => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [previewScale, setPreviewScale] = useState(1)

    useEffect(() => {
        const container = containerRef.current
        if (!container) {
            return
        }

        const computeScale = () => {
            const availableWidth = container.clientWidth
            if (availableWidth <= 0) {
                return
            }
            const nextScale = Math.min(1, Math.max(0.5, availableWidth / previewSize.width))
            setPreviewScale((current) => {
                if (Math.abs(current - nextScale) < 0.01) {
                    return current
                }
                return nextScale
            })
        }

        computeScale()

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(() => computeScale())
            observer.observe(container)
            return () => observer.disconnect()
        }

        if (typeof window !== 'undefined') {
            const handleResize = () => computeScale()
            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }

        return undefined
    }, [previewSize.height, previewSize.width, displayType])

    return {
        containerRef,
        previewScale,
    }
}
