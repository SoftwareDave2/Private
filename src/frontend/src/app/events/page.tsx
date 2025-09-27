'use client'

import {useEffect, useState} from 'react'
import {Card, CardBody, Checkbox, Input, Option, Select, Typography, Button} from '@material-tailwind/react'
import PageHeader from '@/components/layout/PageHeader'
import {DisplayData} from '@/types/displayData'
import {getBackendApiUrl} from '@/utils/backendApiUrl'

type DisplayTypeKey = 'door-sign' | 'event-board' | 'notice-board' | 'room-booking'

type DoorSignForm = {
    roomNumber: string
    roomType: string
    names: string[]
    status: 'frei' | 'belegt' | 'reserviert'
    statusUntil: string
    unassigned: boolean
}

type EventBoardForm = {
    title: string
    eventCount: string
    description: string
    start: string
    end: string
}

type NoticeBoardForm = {
    title: string
    body: string
    showQr: boolean
    qrContent: string
    start: string
    end: string
}

type BookingEntry = {
    id: number
    title: string
    time: string
}

type RoomBookingForm = {
    heading: string
    subtitle: string
    entries: BookingEntry[]
}

const displayTypeOptions: { value: DisplayTypeKey; label: string }[] = [
    { value: 'door-sign', label: 'Türschild' },
    { value: 'event-board', label: 'Ereignisse' },
    { value: 'notice-board', label: 'Hinweisschild' },
    { value: 'room-booking', label: 'Raumbuchung' },
]

const doorSignStatuses: { value: DoorSignForm['status']; label: string; badgeClass: string }[] = [
    { value: 'frei', label: 'Frei', badgeClass: 'bg-white text-black border border-black' },
    { value: 'belegt', label: 'Belegt', badgeClass: 'bg-red-600 text-white' },
    { value: 'reserviert', label: 'Reserviert', badgeClass: 'bg-white text-red-600 border border-red-600' },
]

const defaultDoorSignForm: DoorSignForm = {
    roomNumber: '',
    roomType: '',
    names: [''],
    status: 'frei',
    statusUntil: '',
    unassigned: false,
}

const defaultEventBoardForm: EventBoardForm = {
    title: '',
    eventCount: '0',
    description: '',
    start: '',
    end: '',
}

const defaultNoticeBoardForm: NoticeBoardForm = {
    title: '',
    body: '',
    showQr: true,
    qrContent: '',
    start: '',
    end: '',
}

const defaultRoomBookingForm: RoomBookingForm = {
    heading: 'Heute im Raum',
    subtitle: '',
    entries: [
        { id: 1, title: '', time: '' },
        { id: 2, title: '', time: '' },
    ],
}

export default function EventsPage() {
    const backendApiUrl = getBackendApiUrl()

    const [displays, setDisplays] = useState<DisplayData[]>([])
    const [selectedDisplay, setSelectedDisplay] = useState<string>('')
    const [displayType, setDisplayType] = useState<DisplayTypeKey>('door-sign')
    const [doorSignForm, setDoorSignForm] = useState<DoorSignForm>(defaultDoorSignForm)
    const [eventBoardForm, setEventBoardForm] = useState<EventBoardForm>(defaultEventBoardForm)
    const [noticeBoardForm, setNoticeBoardForm] = useState<NoticeBoardForm>(defaultNoticeBoardForm)
    const [roomBookingForm, setRoomBookingForm] = useState<RoomBookingForm>(defaultRoomBookingForm)
    const [isLoadingDisplays, setIsLoadingDisplays] = useState<boolean>(true)
    const [displayError, setDisplayError] = useState<string>('')

    useEffect(() => {
        const fetchDisplays = async () => {
            try {
                const response = await fetch(backendApiUrl + '/display/all')
                if (!response.ok) {
                    throw new Error('Konnte Displays nicht abrufen')
                }
                const data = await response.json() as DisplayData[]
                setDisplays(data)
                if (data.length > 0) {
                    setSelectedDisplay(data[0].macAddress)
                }
            } catch (err) {
                console.error(err)
                setDisplayError('Displays konnten nicht geladen werden.')
            } finally {
                setIsLoadingDisplays(false)
            }
        }

        fetchDisplays()
            .catch((err) => console.error(err))
    }, [backendApiUrl])

    useEffect(() => {
        setDoorSignForm(defaultDoorSignForm)
        setEventBoardForm(defaultEventBoardForm)
        setNoticeBoardForm(defaultNoticeBoardForm)
        setRoomBookingForm(defaultRoomBookingForm)
    }, [displayType])

    const addDoorSignNameField = () => {
        setDoorSignForm((prev) => {
            if (prev.names.length >= 3) {
                return prev
            }
            return { ...prev, names: [...prev.names, ''] }
        })
    }

    const removeDoorSignNameField = (index: number) => {
        setDoorSignForm((prev) => {
            if (prev.names.length <= 1) {
                return prev
            }
            const newNames = prev.names.filter((_, idx) => idx !== index)
            return { ...prev, names: newNames }
        })
    }

    const updateBookingEntry = (entryId: number, key: keyof BookingEntry, value: string) => {
        setRoomBookingForm((prev) => ({
            ...prev,
            entries: prev.entries.map((entry) =>
                entry.id === entryId ? { ...entry, [key]: value } : entry,
            ),
        }))
    }

    const addBookingEntry = () => {
        setRoomBookingForm((prev) => {
            if (prev.entries.length >= 4) {
                return prev
            }
            const nextId = prev.entries.length === 0 ? 1 : Math.max(...prev.entries.map((entry) => entry.id)) + 1
            return {
                ...prev,
                entries: [...prev.entries, { id: nextId, title: '', time: '' }],
            }
        })
    }

    const removeBookingEntry = (entryId: number) => {
        setRoomBookingForm((prev) => {
            if (prev.entries.length <= 1) {
                return prev
            }
            return {
                ...prev,
                entries: prev.entries.filter((entry) => entry.id !== entryId),
            }
        })
    }

    const renderFormFields = () => {
        switch (displayType) {
        case 'door-sign':
            return (
                <div className={'space-y-4'}>
                    <div className={'grid gap-4 sm:grid-cols-2'}>
                        <Input label={'Raumnummer'} value={doorSignForm.roomNumber}
                               onChange={(event) => setDoorSignForm({ ...doorSignForm, roomNumber: event.target.value })} />
                        <Input label={'Raumtyp'} value={doorSignForm.roomType}
                               onChange={(event) => setDoorSignForm({ ...doorSignForm, roomType: event.target.value })} />
                    </div>
                    <div>
                        <Typography variant={'small'} color={'blue-gray'} className={'mb-2 font-medium'}>
                            Anzuzeigende Namen (max. 3)
                        </Typography>
                        <div className={'space-y-3'}>
                            {doorSignForm.names.map((name, index) => (
                                <div key={index} className={'flex items-center gap-3'}>
                                    <Input label={`Name ${index + 1}`} value={name}
                                           onChange={(event) => {
                                               const newNames = [...doorSignForm.names]
                                               newNames[index] = event.target.value
                                               setDoorSignForm({ ...doorSignForm, names: newNames })
                                           }} />
                                    {doorSignForm.names.length > 1 && (
                                        <Button variant={'text'} color={'gray'} size={'sm'}
                                                className={'normal-case'}
                                                onClick={() => removeDoorSignNameField(index)}>
                                            Entfernen
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className={'mt-3'}>
                            <Button variant={'outlined'} size={'sm'}
                                    disabled={doorSignForm.names.length >= 3}
                                    onClick={addDoorSignNameField} className={'normal-case'}>
                                Weiteren Namen hinzufügen
                            </Button>
                        </div>
                    </div>
                    <div className={'grid gap-4 sm:grid-cols-2'}>
                        <div>
                            <Select label={'Status'} value={doorSignForm.status}
                                    onChange={(value) => value && setDoorSignForm({ ...doorSignForm, status: value as DoorSignForm['status'] })}>
                                {doorSignStatuses.map((status) => (
                                    <Option key={status.value} value={status.value}>{status.label}</Option>
                                ))}
                            </Select>
                        </div>
                        <Input type={doorSignForm.status === 'frei' ? 'date' : 'datetime-local'}
                               label={'Status gültig bis'} value={doorSignForm.statusUntil}
                               onChange={(event) => setDoorSignForm({ ...doorSignForm, statusUntil: event.target.value })} />
                    </div>
                    <Checkbox label={'Raum aktuell unzugeteilt'} checked={doorSignForm.unassigned}
                              onChange={(event) => setDoorSignForm({ ...doorSignForm, unassigned: event.target.checked })} />
                </div>
            )
        case 'event-board':
            return (
                <div className={'space-y-4'}>
                    <Input label={'Titel'} value={eventBoardForm.title}
                           onChange={(event) => setEventBoardForm({ ...eventBoardForm, title: event.target.value })} />
                    <div className={'grid gap-4 sm:grid-cols-2'}>
                        <Input type={'number'} label={'Anzahl der Events'}
                               value={eventBoardForm.eventCount}
                               onChange={(event) => setEventBoardForm({ ...eventBoardForm, eventCount: event.target.value })} />
                        <Input type={'datetime-local'} label={'Ablaufzeit'} value={eventBoardForm.end}
                               onChange={(event) => setEventBoardForm({ ...eventBoardForm, end: event.target.value })} />
                    </div>
                    <div>
                        <label className={'block text-sm font-medium text-blue-gray-700 mb-2'}>
                            Beschreibung
                        </label>
                        <textarea className={'w-full rounded-md border border-blue-gray-100 bg-white p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-0'}
                                  rows={4}
                                  value={eventBoardForm.description}
                                  onChange={(event) => setEventBoardForm({ ...eventBoardForm, description: event.target.value })}
                                  placeholder={'Kurzbeschreibung des Events oder weiterführende Infos'} />
                    </div>
                    <Input type={'datetime-local'} label={'Startzeit'} value={eventBoardForm.start}
                           onChange={(event) => setEventBoardForm({ ...eventBoardForm, start: event.target.value })} />
                </div>
            )
        case 'notice-board':
            return (
                <div className={'space-y-4'}>
                    <Input label={'Titel'} value={noticeBoardForm.title}
                           onChange={(event) => setNoticeBoardForm({ ...noticeBoardForm, title: event.target.value })} />
                    <div>
                        <label className={'block text-sm font-medium text-blue-gray-700 mb-2'}>
                            Freitext
                        </label>
                        <textarea className={'w-full rounded-md border border-blue-gray-100 bg-white p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-0'}
                                  rows={4}
                                  value={noticeBoardForm.body}
                                  onChange={(event) => setNoticeBoardForm({ ...noticeBoardForm, body: event.target.value })}
                                  placeholder={'Hinweise, Wegbeschreibungen oder Ansprechpartner:innen'} />
                    </div>
                    <div className={'grid gap-4 sm:grid-cols-2'}>
                        <Input type={'datetime-local'} label={'Start'} value={noticeBoardForm.start}
                               onChange={(event) => setNoticeBoardForm({ ...noticeBoardForm, start: event.target.value })} />
                        <Input type={'datetime-local'} label={'Ende'} value={noticeBoardForm.end}
                               onChange={(event) => setNoticeBoardForm({ ...noticeBoardForm, end: event.target.value })} />
                    </div>
                    <Checkbox label={'QR-Code anzeigen'} checked={noticeBoardForm.showQr}
                              onChange={(event) => setNoticeBoardForm({ ...noticeBoardForm, showQr: event.target.checked })} />
                    {noticeBoardForm.showQr && (
                        <Input label={'QR-Inhalt (URL oder Text)'} value={noticeBoardForm.qrContent}
                               onChange={(event) => setNoticeBoardForm({ ...noticeBoardForm, qrContent: event.target.value })} />
                    )}
                </div>
            )
        case 'room-booking':
            return (
                <div className={'space-y-4'}>
                    <Input label={'Überschrift'} value={roomBookingForm.heading}
                           onChange={(event) => setRoomBookingForm({ ...roomBookingForm, heading: event.target.value })} />
                    <Input label={'Unterzeile'} value={roomBookingForm.subtitle}
                           onChange={(event) => setRoomBookingForm({ ...roomBookingForm, subtitle: event.target.value })} />
                    <div className={'space-y-3'}>
                        <Typography variant={'small'} color={'blue-gray'} className={'font-medium'}>
                            Gezeigte Termine (max. 4 Einträge)
                        </Typography>
                        {roomBookingForm.entries.map((entry, index) => (
                            <div key={entry.id} className={'grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center'}>
                                <div className={'grid gap-3 sm:grid-cols-2'}>
                                    <Input label={`Titel ${index + 1}`} value={entry.title}
                                           onChange={(event) => updateBookingEntry(entry.id, 'title', event.target.value)} />
                                    <Input label={'Zeit (z. B. 09:30 - 10:15)'} value={entry.time}
                                           onChange={(event) => updateBookingEntry(entry.id, 'time', event.target.value)} />
                                </div>
                                <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case justify-self-start sm:justify-self-end'}
                                        disabled={roomBookingForm.entries.length <= 1}
                                        onClick={() => removeBookingEntry(entry.id)}>
                                    Entfernen
                                </Button>
                            </div>
                        ))}
                        <Button variant={'outlined'} size={'sm'} className={'normal-case'}
                                disabled={roomBookingForm.entries.length >= 4}
                                onClick={addBookingEntry}>
                            Termin hinzufügen
                        </Button>
                    </div>
                </div>
            )
        default:
            return null
        }
    }

    const formattedDate = (value: string) => {
        if (!value) {
            return '—'
        }
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
            return value
        }
        return date.toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const renderPreview = () => {
        switch (displayType) {
        case 'door-sign': {
            const statusDefinition = doorSignStatuses.find((status) => status.value === doorSignForm.status)
            const badgeClass = statusDefinition?.badgeClass ?? 'bg-white text-black border border-black'
            const names = doorSignForm.names.filter((name) => name.trim().length > 0)

            return (
                <div className={'rounded-2xl bg-white text-black border-2 border-black p-6 shadow-sm flex flex-col gap-5'}>
                    <div className={'flex items-start justify-between gap-3'}>
                        <div>
                            <p className={'text-xs uppercase tracking-wide text-red-700'}>Raum</p>
                            <p className={'text-4xl font-semibold'}>{doorSignForm.roomNumber || '—'}</p>
                            <p className={'text-sm mt-1'}>{doorSignForm.roomType || 'Raumtyp'}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${badgeClass}`}>
                            {statusDefinition?.label ?? 'Status'}
                        </span>
                    </div>
                    {doorSignForm.unassigned ? (
                        <div className={'rounded-xl border border-dashed border-black p-4 text-center text-sm'}>
                            Raum aktuell nicht zugeteilt – Raumnummer wird angezeigt
                        </div>
                    ) : (
                        <div className={'grid gap-2'}>
                            {names.length === 0 && (
                                <p className={'text-sm'}>Hier erscheinen die gebuchten Personen.</p>
                            )}
                            {names.map((name, index) => (
                                <div key={index} className={'rounded-lg border border-black bg-white px-4 py-2 text-base font-medium'}>
                                    {name}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className={'text-xs'}>Status gültig bis: {formattedDate(doorSignForm.statusUntil)}</div>
                    <div className={'flex justify-end'}>
                        <div className={'h-12 w-12 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                            QR
                        </div>
                    </div>
                </div>
            )
        }
        case 'event-board': {
            const eventCount = parseInt(eventBoardForm.eventCount || '0', 10)
            const safeEventCount = Number.isNaN(eventCount) ? 0 : Math.max(eventCount, 0)

            return (
                <div className={'rounded-2xl bg-white border-2 border-black p-6 text-black flex flex-col gap-5'}>
                    <div>
                        <p className={'text-xs uppercase tracking-wide text-red-700 mb-1'}>Ereignisse</p>
                        <h3 className={'text-3xl font-semibold text-black'}>{eventBoardForm.title || 'Neues Event'}</h3>
                    </div>
                    <p className={'text-sm text-black'}>{eventBoardForm.description || 'Nutzen Sie diesen Bereich für Kurzbeschreibungen oder Highlights zum Event.'}</p>
                    <div className={'flex flex-wrap items-center gap-4 text-sm text-black'}>
                        <span className={'rounded-full border border-red-600 px-3 py-1 text-red-600 font-medium'}>
                            {safeEventCount} geplante Ereignisse
                        </span>
                        <span>Start: {formattedDate(eventBoardForm.start)}</span>
                        <span>Ablauf: {formattedDate(eventBoardForm.end)}</span>
                    </div>
                    <div className={'flex justify-end'}>
                        <div className={'h-12 w-12 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                            QR
                        </div>
                    </div>
                </div>
            )
        }
        case 'notice-board':
            return (
                <div className={'rounded-2xl bg-white text-black border-2 border-black p-6 shadow-sm flex flex-col gap-5'}>
                    <div>
                        <p className={'text-xs uppercase tracking-wide text-red-700 mb-1'}>Hinweis</p>
                        <h3 className={'text-3xl font-semibold text-black'}>{noticeBoardForm.title || 'Neuer Hinweis'}</h3>
                    </div>
                    <p className={'text-sm leading-6 text-black whitespace-pre-line'}>
                        {noticeBoardForm.body || 'Nutzen Sie diesen Bereich für Wegbeschreibung, Hinweise oder Sicherheitsinformationen.'}
                    </p>
                    <div className={'grid gap-2 text-xs text-black'}>
                        <span>Start: {formattedDate(noticeBoardForm.start)}</span>
                        <span>Ende: {formattedDate(noticeBoardForm.end)}</span>
                    </div>
                    <div className={'flex justify-end'}>
                        {noticeBoardForm.showQr ? (
                            <div className={'h-12 w-12 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                                QR
                            </div>
                        ) : (
                            <span className={'text-xs text-red-600'}>Kein QR-Code</span>
                        )}
                    </div>
                </div>
            )
        case 'room-booking':
            return (
                <div className={'rounded-2xl bg-white p-6 border-2 border-black flex flex-col gap-5 text-black'}>
                    <div>
                        <p className={'text-xs uppercase tracking-wide text-red-700 mb-1'}>Raumbuchung</p>
                        <h3 className={'text-3xl font-semibold text-black'}>{roomBookingForm.heading || 'Raumnutzung'}</h3>
                        {roomBookingForm.subtitle && (
                            <p className={'text-sm mt-1'}>{roomBookingForm.subtitle}</p>
                        )}
                    </div>
                    <div className={'space-y-2'}>
                        {roomBookingForm.entries.filter((entry) => entry.title.trim().length > 0 || entry.time.trim().length > 0).length === 0 && (
                            <p className={'text-sm'}>Fügen Sie Termine hinzu, um anstehende Meetings darzustellen.</p>
                        )}
                        {roomBookingForm.entries.map((entry) => (
                            <div key={entry.id} className={'flex items-baseline justify-between rounded-lg border border-black bg-white px-4 py-3'}>
                                <span className={'text-sm font-medium text-black'}>{entry.title || 'Titel'}</span>
                                <span className={'text-xs text-red-700 ml-4'}>{entry.time || 'Uhrzeit'}</span>
                            </div>
                        ))}
                    </div>
                    <div className={'flex justify-end'}>
                        <div className={'h-12 w-12 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                            QR
                        </div>
                    </div>
                </div>
            )
        default:
            return null
        }
    }

    return (
        <div className={'space-y-6'}>
            <PageHeader title={'Events'} info={'Konfigurieren Sie Inhalte für die Displays in der Keßlerstraße'} />
            <div className={'grid gap-6 lg:grid-cols-2'}>
                <Card className={'border border-blue-gray-100 shadow-sm'}>
                    <CardBody className={'space-y-6'}>
                        <div className={'grid gap-4 sm:grid-cols-2'}>
                            <div>
                                <Select label={'Display auswählen'} value={selectedDisplay}
                                        onChange={(value) => value && setSelectedDisplay(value)}
                                        disabled={isLoadingDisplays || displays.length === 0}>
                                    {displays.map((display) => (
                                        <Option key={display.macAddress} value={display.macAddress}>
                                            {display.displayName || display.macAddress}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Select label={'Displayart'} value={displayType}
                                        onChange={(value) => value && setDisplayType(value as DisplayTypeKey)}>
                                    {displayTypeOptions.map((option) => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {displayError && (
                            <div className={'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'}>
                                {displayError}
                            </div>
                        )}

                        {renderFormFields()}
                    </CardBody>
                </Card>

                <Card className={'border border-blue-gray-100 shadow-sm'}>
                    <CardBody>
                        <div className={'mb-4 flex items-center justify-between text-xs text-red-700 uppercase tracking-wide'}>
                            <span>Live-Vorschau</span>
                            <span>{displayTypeOptions.find((option) => option.value === displayType)?.label}</span>
                        </div>
                        {renderPreview()}
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
