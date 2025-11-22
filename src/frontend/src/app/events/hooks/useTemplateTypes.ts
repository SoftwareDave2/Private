import {useEffect, useState} from 'react'

import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'
import {fallbackTemplateTypes} from '../constants'
import {TemplateTypeDefinition} from '../types'

type UseTemplateTypesResult = {
    templateTypes: TemplateTypeDefinition[]
    isLoadingTemplateTypes: boolean
    templateTypeError: string | null
}

const normalizeTemplateType = (type: TemplateTypeDefinition): TemplateTypeDefinition | null => {
    if (!type || typeof type.key !== 'string' || type.key.trim().length === 0) {
        return null
    }
    const key = type.key as TemplateTypeDefinition['key']
    const label = typeof type.label === 'string' && type.label.trim().length > 0 ? type.label : key
    const displayWidth = typeof type.displayWidth === 'number' ? type.displayWidth : undefined
    const displayHeight = typeof type.displayHeight === 'number' ? type.displayHeight : undefined
    return { key, label, displayWidth, displayHeight }
}

export const useTemplateTypes = (): UseTemplateTypesResult => {
    const backendApiUrl = getBackendApiUrl()
    const [templateTypes, setTemplateTypes] = useState<TemplateTypeDefinition[]>(fallbackTemplateTypes)
    const [isLoadingTemplateTypes, setIsLoadingTemplateTypes] = useState<boolean>(true)
    const [templateTypeError, setTemplateTypeError] = useState<string | null>(null)

    useEffect(() => {
        let isCancelled = false
        const controller = new AbortController()

        const fetchTemplateTypes = async () => {
            setIsLoadingTemplateTypes(true)
            setTemplateTypeError(null)

            try {
                const response = await authFetch(`${backendApiUrl}/oepl/template-types`, { signal: controller.signal })
                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(errorText || `HTTP ${response.status}`)
                }
                const payload = (await response.json()) as TemplateTypeDefinition[]
                if (isCancelled) return

                const normalized = Array.isArray(payload)
                    ? payload
                        .map((type) => normalizeTemplateType(type))
                        .filter((type): type is TemplateTypeDefinition => type !== null)
                    : []

                setTemplateTypes(normalized.length > 0 ? normalized : fallbackTemplateTypes)
            } catch (error) {
                if (isCancelled) return
                const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
                setTemplateTypeError(`Template-Typen konnten nicht geladen werden: ${message}`)
                setTemplateTypes((current) => (current && current.length > 0 ? current : fallbackTemplateTypes))
            } finally {
                if (!isCancelled) {
                    setIsLoadingTemplateTypes(false)
                }
            }
        }

        fetchTemplateTypes().catch(console.error)

        return () => {
            isCancelled = true
            controller.abort()
        }
    }, [backendApiUrl])

    return {
        templateTypes,
        isLoadingTemplateTypes,
        templateTypeError,
    }
}
