'use client'

import React, {useState, useEffect, useMemo} from 'react'
import PageHeader from '@/components/layout/PageHeader'
import DisplayFrame from '@/components/dashboard/DisplayFrame'
import {DisplayData} from '@/types/displayData'
import DisplayInfoDialog from '@/components/dashboard/DisplayInfoDialog'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'

// Material Tailwind Select-Komponenten
import {Select, Option} from '@material-tailwind/react'

export default function Home() {
    const backendApiUrl = useMemo(() => getBackendApiUrl(), [])
    const [displays, setDisplays] = useState<DisplayData[]>([])
    const [displayDialogOpen, setDisplayDialogOpen] = useState<boolean>(false)
    const [selectedDisplay, setSelectedDisplay] = useState<DisplayData | null>(null)

    // Auswahl zwischen 'name' (alphabetisch) und 'custom' (freie Sortierung)
    const [sortingMode, setSortingMode] = useState<'name' | 'custom'>('name')
    // Enthält die Reihenfolge (Liste der Display-IDs) bei freier Sortierung
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

    // Immer wenn sich der Sortiermodus ändert, im Local Storage speichern
    useEffect(() => {
        localStorage.setItem('sortingMode', sortingMode)
    }, [sortingMode])

    // Daten vom Backend laden
    const fetchDisplays = async () => {
        const data = await authFetch(backendApiUrl + '/display/all')
        const json = await data.json()
        setDisplays(json)
    }

    const displayDialogHandler = () => setDisplayDialogOpen(!displayDialogOpen)

    useEffect(() => {
        fetchDisplays()
            .then(() => console.log('Displays updated!'))
            .catch((err) => console.error('No connection to backend!', err))
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

    // Automatische Sortierung (alphabetisch) – falls displayName null oder "" ist, wird "" verwendet
    const sortedDisplays = useMemo(() => {
        return [...displays].sort((a, b) =>
            (a.displayName || '').localeCompare(b.displayName || ''),
        )
    }, [displays])

    // Benutzerdefinierte Reihenfolge basierend auf customOrder
    const customOrderedDisplays = useMemo(() => {
        if (customOrder.length > 0) {
            const ordered = customOrder.map(id => displays.find(d => d.id === id)).filter(Boolean) as DisplayData[]
            const unordered = displays.filter(d => !customOrder.includes(d.id))
            return [...ordered, ...unordered]
        }
        return displays
    }, [displays, customOrder])

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
                // Fehlende IDs ergänzen
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

    return (
        <main>
            <PageHeader
                title={'Dashboard'}
                info={`${displays.length} Bildschirme laufen - 0 Bildschirme gestoppt`}
            >
                {/* Material Tailwind Select für die Sortierung, rechtsbündig und kleiner Button */}
                <div className="flex items-center transform -translate-y-1 justify-end">
                    <Select
                        label="Sortieren nach"
                        value={sortingMode}
                        onChange={(value) => setSortingMode(value as 'name' | 'custom')}
                        className="text-xs"
                    >
                        <Option value="name">Nach Name sortieren</Option>
                        <Option value="custom">Freie Sortierung</Option>
                    </Select>
                </div>
            </PageHeader>

            {/* Anzeige je nach Sortiermodus */}
            {sortingMode === 'custom' ? (
                <div
                    className="flex gap-4 flex-wrap"
                    onDragOver={(e) => {
                        e.preventDefault()
                        setDropTargetIndex(customOrderedDisplays.length)
                    }}
                    onDrop={(e) => handleDrop(e, customOrderedDisplays.length)}
                >
                    {customOrderedDisplays.map((display, index) => (
                        <React.Fragment key={display.id}>
                            {dropTargetIndex === index && (
                                <div
                                    className="w-[100px] h-[100px] border-2 border-dashed border-blue-500 flex items-center justify-center">
                                    Hier einfügen
                                </div>
                            )}
                            <div
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
                        <div
                            className="w-[100px] h-[100px] border-2 border-dashed border-blue-500 flex items-center justify-center">
                            Hier einfügen
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex gap-4 flex-wrap">
                    {sortedDisplays.map(display => (
                        <DisplayFrame
                            key={display.id}
                            displayData={display}
                            clickable={true}
                            onClick={() => displayClickHandler(display.id)}
                        />
                    ))}
                </div>
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
