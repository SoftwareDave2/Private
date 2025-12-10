'use client'

import React, {useState, useEffect, useMemo} from 'react'
import PageHeader from '@/components/layout/PageHeader'
import DisplayFrame from '@/components/dashboard/DisplayFrame'
import {DisplayData} from '@/types/displayData'
import DisplayInfoDialog from '@/components/dashboard/DisplayInfoDialog'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'
import {Monitor, Search, Loader2, TrendingUp, Battery, AlertCircle} from 'lucide-react'

// Material Tailwind Select-Komponenten
import {Select, Option} from '@material-tailwind/react'

export default function Home() {
    const backendApiUrl = useMemo(() => getBackendApiUrl(), [])
    const [displays, setDisplays] = useState<DisplayData[]>([])
    const [displayDialogOpen, setDisplayDialogOpen] = useState<boolean>(false)
    const [selectedDisplay, setSelectedDisplay] = useState<DisplayData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [searchQuery, setSearchQuery] = useState<string>('')

    // Auswahl zwischen 'name' (alphabetisch) und 'custom' (freie Sortierung)
    const [sortingMode, setSortingMode] = useState<'name' | 'custom'>('name')
    const [batteryMode, setBatteryMode] = useState<'avg' | 'min'>('avg')
    // Enth├ñlt die Reihenfolge (Liste der Display-IDs) bei freier Sortierung
    const [customOrder, setCustomOrder] = useState<number[]>([])
    // Speichert den Index, an dem aktuell der Platzhalter (Drop Target) angezeigt wird
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

    // Beim ersten Laden: Sortiermodus aus dem Local Storage laden
    useEffect(() => {
        const storedMode = localStorage.getItem('sortingMode')
        if (storedMode === 'custom' || storedMode === 'name') {
            setSortingMode(storedMode)
        }
    }, [])

    // Immer wenn sich der Sortiermodus ├ñndert, im Local Storage speichern
    useEffect(() => {
        localStorage.setItem('sortingMode', sortingMode)
    }, [sortingMode])

    const buildDummyDisplays = (): DisplayData[] => {
        const makeDummy = (id: number, name: string, mac: string, width: number, height: number, battery_percentage: number): DisplayData => ({
            id,
            displayName: name,
            macAddress: mac,
            brand: 'Mock',
            model: 'Preview',
            width,
            height,
            orientation: width >= height ? 'landscape' : 'portrait',
            filename: '',
            defaultFilename: '',
            runningSince: '',
            wakeTime: '',
            nextEventTime: '',
            battery_percentage,
            timeOfBattery: '',
            errors: [],
        })

        return [
            makeDummy(-1, 'Dummy 400x300 #1', '00:11:22:33:44:55', 400, 300, 100),
            makeDummy(-2, 'Dummy 400x300 #2', '00:11:22:33:44:66', 400, 300, 75),
            makeDummy(-3, 'Dummy 296x128 #1', '00:11:22:33:44:77', 296, 128, 13),
            makeDummy(-4, 'Dummy 296x128 #2', '00:11:22:33:44:88', 296, 128, 50),
            makeDummy(-5, 'Dummy 250x122 #1', '00:11:22:33:44:99', 250, 122, 100),
            makeDummy(-6, 'Dummy 250x122 #2', '00:11:22:33:44:AA', 250, 122, 80),
        ]
    }

    // Daten vom Backend laden
    const fetchDisplays = async () => {
        setLoading(true)
        try {
            const data = await authFetch(backendApiUrl + '/display/all')
            const json = await data.json()
            const list = Array.isArray(json) ? json : []
            setDisplays(list.length > 0 ? list : buildDummyDisplays())
        } catch (err) {
            console.error('No connection to backend!', err)
            setDisplays(buildDummyDisplays())
        } finally {
            setLoading(false)
        }
    }

    const displayDialogHandler = () => setDisplayDialogOpen(!displayDialogOpen)

    useEffect(() => {
        fetchDisplays()
    }, [])

    const displayClickHandler = (id: number) => {
        const display = displays.find(d => d.id === id)
        if (!display) {
            console.log(`Selected display with id ${id} not found.`)
            return
        }
        setSelectedDisplay(display)
        displayDialogHandler()
    }

    const displayUpdatedHandler = async (macAddress: string) => {
        try {
            await fetchDisplays()
        } catch (err) {
            console.error(err)
        }
        displayDialogHandler()
    }

    // Beim Wechsel in den "custom"-Modus: Reihenfolge aus Local Storage laden bzw. initialisieren
    useEffect(() => {
        if (sortingMode === 'custom') {
            const storedOrder = localStorage.getItem('customDisplayOrder')
            if (storedOrder) {
                setCustomOrder(JSON.parse(storedOrder))
            } else {
                setCustomOrder(displays.map(d => d.id))
            }
        }
    }, [sortingMode, displays])

    // Synchronisation: Neue oder entfernte Displays in customOrder aufnehmen
    useEffect(() => {
        if (sortingMode === 'custom') {
            setCustomOrder(prevOrder => {
                const displayIds = displays.map(d => d.id)
                const newOrder = [...prevOrder]
                // Fehlende IDs erg├ñnzen
                displayIds.forEach(id => {
                    if (!newOrder.includes(id)) {
                        newOrder.push(id)
                    }
                })
                // IDs entfernen, die es nicht mehr gibt
                return newOrder.filter(id => displayIds.includes(id))
            })
        }
    }, [displays, sortingMode])

    // HTML5 Drag & Drop Handler

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString())
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault()
        setDropTargetIndex(index)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault()
        const dragIndexStr = e.dataTransfer.getData('text/plain')
        const dragIndex = parseInt(dragIndexStr, 10)
        if (isNaN(dragIndex)) return
        const newOrder = Array.from(customOrder)
        const [removed] = newOrder.splice(dragIndex, 1)
        newOrder.splice(dropIndex, 0, removed)
        setCustomOrder(newOrder)
        localStorage.setItem('customDisplayOrder', JSON.stringify(newOrder))
        setDropTargetIndex(null)
    }

    const handleDragEnd = () => {
        setDropTargetIndex(null)
    }

    // Calculate statistics
    const stats = useMemo(() => {
        const total = displays.length
        const online = displays.filter((d) => !d.errors || d.errors.length === 0).length
        const errors = displays.filter((d) => d.errors && d.errors.length > 0).length
        const batteries = displays.map((d) => d.battery_percentage ?? 0)
        const avgBattery = total > 0 ? Math.round(batteries.reduce((sum, value) => sum + value, 0) / total) : 0
        const minBattery = total > 0 ? Math.min(...batteries) : 0
        return {total, online, errors, avgBattery, minBattery}
    }, [displays])

    // Filter displays based on search query
    const filteredDisplays = useMemo(() => {
        if (!searchQuery.trim()) return displays
        const query = searchQuery.toLowerCase()
        return displays.filter(
            (d) =>
                d.displayName?.toLowerCase().includes(query) ||
                d.macAddress?.toLowerCase().includes(query) ||
                d.brand?.toLowerCase().includes(query) ||
                d.model?.toLowerCase().includes(query),
        )
    }, [displays, searchQuery])

    // Apply sorting to filtered displays
    const sortedDisplays = useMemo(() => {
        return [...filteredDisplays].sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
    }, [filteredDisplays])

    const customOrderedDisplays = useMemo(() => {
        if (customOrder.length > 0) {
            const ordered = customOrder.map((id) => filteredDisplays.find((d) => d.id === id)).filter(Boolean) as DisplayData[]
            const unordered = filteredDisplays.filter((d) => !customOrder.includes(d.id))
            return [...ordered, ...unordered]
        }
        return filteredDisplays
    }, [filteredDisplays, customOrder])

    return (
        <main className="min-h-screen space-y-8 pb-12">
            {/* Modern Header with Stats */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-red-50/30 p-6 shadow-lg">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                            <p className="mt-1 text-sm text-slate-600">Verwaltung Ihrer E-Paper Displays</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                label="Sortieren nach"
                                value={sortingMode}
                                onChange={(value) => setSortingMode(value as 'name' | 'custom')}
                                className="min-w-[180px]"
                            >
                                <Option value="name">Nach Name sortieren</Option>
                                <Option value="custom">Freie Sortierung</Option>
                            </Select>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Gesamt
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
                                    <p className="mt-1 text-xs text-slate-600">Displays</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <Monitor className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-green-300 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Online
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">{stats.online}</p>
                                    <p className="mt-1 text-xs text-slate-600">Aktiv</p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-3">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                                                <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-amber-300 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Batterie
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-amber-600">
                                        {batteryMode === 'avg' ? stats.avgBattery : stats.minBattery}%
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        {batteryMode === 'avg' ? 'Durchschnitt' : 'Niedrigster Stand'}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="rounded-lg bg-amber-50 p-3">
                                        <Battery className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setBatteryMode((prev) => (prev === 'avg' ? 'min' : 'avg'))}
                                        className="rounded-full border border-amber-200 px-3 py-1 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                                    >
                                        {batteryMode === 'avg' ? 'Zeige Minimum' : 'Zeige Durchschnitt'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-red-300 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Fehler
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-red-600">{stats.errors}</p>
                                    <p className="mt-1 text-xs text-slate-600">Mit Problemen</p>
                                </div>
                                <div className="rounded-lg bg-red-50 p-3">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Displays durchsuchen (Name, MAC-Adresse, Marke...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white/50">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-500" />
                        <p className="mt-4 text-sm font-semibold text-slate-700">Lade Displays...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && displays.length === 0 && (
                <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50">
                    <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                            <Monitor className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">Keine Displays gefunden</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Es wurden noch keine Displays registriert.
                        </p>
                    </div>
                </div>
            )}

            {/* No Search Results */}
            {!loading && displays.length > 0 && filteredDisplays.length === 0 && (
                <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50">
                    <div className="text-center">
                        <div className="mx-auto rounded-full bg-amber-100 p-6">
                            <Search className="h-12 w-12 text-amber-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">Keine Ergebnisse</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Keine Displays entsprechen Ihrer Suche: &quot;{searchQuery}&quot;
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-600 active:scale-95"
                        >
                            Suche zur├╝cksetzen
                        </button>
                    </div>
                </div>
            )}

            {/* Display Grid */}
            {!loading && filteredDisplays.length > 0 && (
                <>
                    {sortingMode === 'custom' ? (
                        <div
                            className="flex flex-wrap gap-6"
                            onDragOver={(e) => {
                                e.preventDefault()
                                setDropTargetIndex(customOrderedDisplays.length)
                            }}
                            onDrop={(e) => handleDrop(e, customOrderedDisplays.length)}
                        >
                            {customOrderedDisplays.map((display, index) => (
                                <React.Fragment key={display.id}>
                                    {dropTargetIndex === index && (
                                        <div className="flex h-[340px] w-[320px] flex-shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-red-300 bg-red-50/60 text-sm font-semibold text-red-600 shadow-sm">
                                            Hier ablegen
                                        </div>
                                    )}
                                    <div
                                        className="flex-shrink-0"
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <DisplayFrame
                                            displayData={display}
                                            clickable={true}
                                            onClick={() => displayClickHandler(display.id)}
                                        />
                                    </div>
                                </React.Fragment>
                            ))}
                            {dropTargetIndex === customOrderedDisplays.length && (
                                <div className="flex h-[340px] w-[320px] flex-shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-red-300 bg-red-50/60 text-sm font-semibold text-red-600 shadow-sm">
                                    Hier ablegen
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                            {sortedDisplays.map((display) => (
                                <div key={display.id} className="flex justify-center">
                                    <DisplayFrame
                                        displayData={display}
                                        clickable={true}
                                        onClick={() => displayClickHandler(display.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {selectedDisplay && (
                <DisplayInfoDialog
                    open={displayDialogOpen}
                    displayData={selectedDisplay}
                    onClose={displayDialogHandler}
                    onDisplayDataUpdated={() => displayUpdatedHandler(selectedDisplay.macAddress)}
                />
            )}
        </main>
    )
}

