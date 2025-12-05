'use client'

import React, {useState, useEffect, FormEvent} from 'react'
import {Input, Button, Checkbox} from '@material-tailwind/react'
import PageHeader from '@/components/layout/PageHeader'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import SaveDialog from '@/components/config/SaveDialog'
import {DayTimeConfig, Config} from '@/types/config'
import {authFetch} from '@/utils/authFetch'

type HistoryItem = {
    id: number
    templateType: string
    displayMac: string
    title: string
    start?: string
    end?: string
    expiredAt?: string
    highlighted?: boolean
}

export default function ConfigPage() {
    const backendApiUrl = getBackendApiUrl()
    const defaultWeekdayTimes: { [day: string]: DayTimeConfig } = {
        Montag: {enabled: true, startTime: '08:00', endTime: '18:00'},
        Dienstag: {enabled: true, startTime: '08:00', endTime: '18:00'},
        Mittwoch: {enabled: true, startTime: '08:00', endTime: '18:00'},
        Donnerstag: {enabled: true, startTime: '08:00', endTime: '18:00'},
        Freitag: {enabled: true, startTime: '08:00', endTime: '18:00'},
        Samstag: {enabled: false, startTime: '08:00', endTime: '18:00'},
        Sonntag: {enabled: false, startTime: '08:00', endTime: '18:00'},
    }

    const [config, setConfig] = useState<Config | null>(null)
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [historyError, setHistoryError] = useState<string>('')
    const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false)

    const days = [
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag',
        'Sonntag',
    ]

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await authFetch(backendApiUrl + '/config/get')
                if (response.ok) {
                    const data = await response.json()
                    const weekdayTimes = data.weekdayTimes || defaultWeekdayTimes
                    const mergedWeekdayTimes = {...defaultWeekdayTimes, ...weekdayTimes}
                    setConfig({
                        displayIntervalDay: data.wakeIntervalDay.toString(),
                        vorlaufzeit: data.leadTime.toString(),
                        nachlaufzeit: data.followUpTime.toString(),
                        deleteAfterDays: data.deleteAfterDays.toString(),
                        weekdayTimes: mergedWeekdayTimes,
                    })
                } else if (response.status === 404) {
                    console.error('Keine Konfiguration gefunden. Es werden Standardwerte verwendet.')
                    setConfig({
                        displayIntervalDay: '30',
                        vorlaufzeit: '10',
                        nachlaufzeit: '5',
                        deleteAfterDays: '30',
                        weekdayTimes: defaultWeekdayTimes,
                    })
                } else {
                    console.error('Fehler beim Abrufen der Konfiguration:', response.statusText)
                }
            } catch (error) {
                console.error('Fehler beim Abrufen der Konfiguration:', error)
            }
        }

        fetchConfig()
    }, [])

    const toggleWeekday = (day: string) => {
        if (!config) return
        const currentDayConfig = config.weekdayTimes?.[day] || defaultWeekdayTimes[day]
        setConfig({
            ...config,
            weekdayTimes: {
                ...config.weekdayTimes,
                [day]: {
                    ...currentDayConfig,
                    enabled: !currentDayConfig.enabled,
                },
            },
        })
    }

    const handleDayTimeChange = (
        day: string,
        field: 'startTime' | 'endTime',
        value: string,
    ) => {
        if (!config) return
        const currentDayConfig = config.weekdayTimes?.[day] || defaultWeekdayTimes[day]
        setConfig({
            ...config,
            weekdayTimes: {
                ...config.weekdayTimes,
                [day]: {
                    ...currentDayConfig,
                    [field]: value,
                },
            },
        })
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!config) return

        for (const day of days) {
            const dayConfig = config.weekdayTimes?.[day] || defaultWeekdayTimes[day]
            if (dayConfig.enabled && dayConfig.startTime >= dayConfig.endTime) {
                setSaveMessage(`Fehler: Bei ${day} muss die Startzeit vor der Endzeit liegen.`)
                setShowSaveDialog(true)
                return
            }
        }

        const updatedConfig = {
            wakeIntervalDay: parseFloat(config.displayIntervalDay),
            leadTime: parseFloat(config.vorlaufzeit),
            followUpTime: parseFloat(config.nachlaufzeit),
            deleteAfterDays: parseInt(config.deleteAfterDays, 10),
            weekdayTimes: config.weekdayTimes,
        }

        console.log('Neue Konfiguration:', updatedConfig)

        try {
            const response = await authFetch(backendApiUrl + '/config/post', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedConfig),
            })

            if (response.ok) {
                const data = await response.json()
                const weekdayTimes = data.weekdayTimes || config.weekdayTimes
                const mergedWeekdayTimes = {...defaultWeekdayTimes, ...weekdayTimes}
                setConfig({
                    displayIntervalDay: data.wakeIntervalDay.toString(),
                    vorlaufzeit: data.leadTime.toString(),
                    nachlaufzeit: data.followUpTime.toString(),
                    deleteAfterDays: data.deleteAfterDays.toString(),
                    weekdayTimes: mergedWeekdayTimes,
                })
                setSaveMessage('Konfiguration erfolgreich gespeichert!')
            } else {
                setSaveMessage('Fehler beim Speichern der Konfiguration!')
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Konfiguration:', error)
            setSaveMessage('Fehler beim Speichern der Konfiguration!')
        }

        setShowSaveDialog(true)
    }

    const fetchHistory = async () => {
        setIsHistoryLoading(true)
        setHistoryError('')
        try {
            const response = await authFetch(`${backendApiUrl}/oepl/display-data/history?limit=50`)
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `HTTP ${response.status}`)
            }
            const data = (await response.json()) as HistoryItem[]
            setHistory(Array.isArray(data) ? data : [])
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
            setHistoryError(`Historie konnte nicht geladen werden: ${message}`)
        } finally {
            setIsHistoryLoading(false)
        }
    }

    if (config === null) {
        return (
            <main>
                <PageHeader title="Konfiguration" info=""/>
                <div className="max-w-xl mx-auto p-4">Lade Konfiguration...</div>
            </main>
        )
    }

    return (
        <main>
            <PageHeader title="Konfiguration" info=""/>
            <div className="max-w-4xl mx-auto p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Linke Spalte: Wochentage – jetzt breiter */}
                        <div className="w-full md:w-1/2 flex-shrink-0 min-w-[400px]">
                            <span className="block mb-2 font-bold">Wochentage:</span>
                            <ul>
                                {days.map((day) => {
                                    const dayConfig =
                                        config.weekdayTimes?.[day] || defaultWeekdayTimes[day]
                                    return (
                                        <li key={day} className="mb-2 border rounded p-4">
                                            <div className="flex items-center">
                                                <Checkbox
                                                    id={day}
                                                    label={day}
                                                    checked={dayConfig.enabled}
                                                    onChange={() => toggleWeekday(day)}
                                                />
                                            </div>
                                            {dayConfig.enabled && (
                                                <div className="mt-2 flex flex-col md:flex-row gap-2">
                                                    <Input
                                                        className="w-full"
                                                        label="Startzeit"
                                                        type="time"
                                                        name={`${day}-startTime`}
                                                        required
                                                        value={dayConfig.startTime}
                                                        onChange={(e) =>
                                                            handleDayTimeChange(day, 'startTime', e.target.value)
                                                        }
                                                    />
                                                    <Input
                                                        className="w-full"
                                                        label="Endzeit"
                                                        type="time"
                                                        name={`${day}-endTime`}
                                                        required
                                                        value={dayConfig.endTime}
                                                        onChange={(e) =>
                                                            handleDayTimeChange(day, 'endTime', e.target.value)
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        {/* Rechte Spalte: Weitere Eingabefelder */}

                        <div className="w-full md:w-1/2 flex flex-col gap-4 relative top-10">
                            <Input
                                label="Aufweck-Intervall Tagsüber (in Minuten)"
                                type="number"
                                name="displayIntervalDay"
                                step="0.1"
                                required
                                value={config.displayIntervalDay}
                                onChange={(e) =>
                                    setConfig({...config, displayIntervalDay: e.target.value})
                                }
                            />
                            <Input
                                label="Vorlaufzeit (Minuten)"
                                type="number"
                                name="vorlaufzeit"
                                required
                                value={config.vorlaufzeit}
                                onChange={(e) =>
                                    setConfig({...config, vorlaufzeit: e.target.value})
                                }
                            />
                            <Input
                                label="Nachlaufzeit (Minuten)"
                                type="number"
                                name="nachlaufzeit"
                                required
                                value={config.nachlaufzeit}
                                onChange={(e) =>
                                    setConfig({...config, nachlaufzeit: e.target.value})
                                }
                            />
                            <Input
                                label="Tage bis zur Löschung ungenutzter Bilder von den Displays"
                                type="number"
                                name="deleteAfterDays"
                                required
                                value={config.deleteAfterDays}
                        onChange={(e) =>
                            setConfig({...config, deleteAfterDays: e.target.value})
                        }
                    />
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Ereignishistorie</p>
                                <p className="text-xs text-slate-600">Vergangene Event-Board Einträge ansehen</p>
                            </div>
                            <Button
                                size="sm"
                                className="bg-red-500 text-white normal-case"
                                onClick={fetchHistory}
                                disabled={isHistoryLoading}
                            >
                                {isHistoryLoading ? 'Laden...' : 'Historie anzeigen'}
                            </Button>
                        </div>
                        {historyError && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                {historyError}
                            </div>
                        )}
                        {history.length > 0 && (
                            <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700 space-y-2">
                                {history.map((item) => (
                                    <div key={`${item.id}-${item.displayMac}-${item.expiredAt ?? ''}`} className="border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold">{item.title || 'Ohne Titel'}</span>
                                            {item.highlighted && (
                                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600">
                                                    Wichtig
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-600 space-y-1 mt-1">
                                            <div>MAC: {item.displayMac}</div>
                                            {item.start && <div>Start: {item.start}</div>}
                                            {item.end && <div>Ende: {item.end}</div>}
                                            {item.expiredAt && <div>Abgelaufen: {item.expiredAt}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!historyError && !isHistoryLoading && history.length === 0 && (
                            <p className="text-xs text-slate-500">Noch keine Historie geladen.</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <Button type="submit" className="bg-primary text-white" fullWidth>
                    Speichern
                        </Button>
                    </div>
                </form>
            </div>

            <SaveDialog open={showSaveDialog} message={saveMessage} onClose={() => setShowSaveDialog(false)}/>
        </main>
    )
}
