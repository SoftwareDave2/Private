'use client'

import {useEffect, useState} from 'react'
import {Card, CardBody, Checkbox, Input, Option, Select, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter} from '@material-tailwind/react'
import PageHeader from '@/components/layout/PageHeader'
import {DisplayData} from '@/types/displayData'
import {getBackendApiUrl} from '@/utils/backendApiUrl'

type DisplayTypeKey = 'door-sign' | 'event-board' | 'notice-board' | 'room-booking'

type DoorSignPersonStatus = 'available' | 'busy'

type DoorSignPerson = {
    id: number
    name: string
    status: DoorSignPersonStatus
    busyUntil: string
}

type DoorSignForm = {
    roomNumber: string
    people: DoorSignPerson[]
    footerNote: string
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

const doorSignPersonStatuses: { value: DoorSignPersonStatus; label: string }[] = [
    { value: 'available', label: 'Verfügbar' },
    { value: 'busy', label: 'Beschäftigt' },
]

const defaultDoorSignForm: DoorSignForm = {
    roomNumber: '',
    people: [
        { id: 1, name: '', status: 'available', busyUntil: '' },
    ],
    footerNote: '',
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
    const [isPersonDialogOpen, setIsPersonDialogOpen] = useState<boolean>(false)
    const [personDraft, setPersonDraft] = useState<DoorSignPerson | null>(null)

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

    const openPersonDialog = (person: DoorSignPerson) => {
        setPersonDraft({ ...person })
        setIsPersonDialogOpen(true)
    }

    const closePersonDialog = () => {
        setIsPersonDialogOpen(false)
        setPersonDraft(null)
    }

    const addDoorSignPerson = () => {
        let createdPerson: DoorSignPerson | null = null
        setDoorSignForm((prev) => {
            if (prev.people.length >= 3) {
                return prev
            }
            const nextId = prev.people.length === 0 ? 1 : Math.max(...prev.people.map((person) => person.id)) + 1
            createdPerson = { id: nextId, name: '', status: 'available', busyUntil: '' }
            return {
                ...prev,
                people: [...prev.people, createdPerson],
            }
        })
        if (createdPerson) {
            openPersonDialog(createdPerson)
        }
    }

    const removeDoorSignPerson = (personId: number) => {
        setDoorSignForm((prev) => {
            if (prev.people.length <= 1) {
                return prev
            }
            return {
                ...prev,
                people: prev.people.filter((person) => person.id !== personId),
            }
        })
    }

    const updateDoorSignPerson = (personId: number, updates: Partial<DoorSignPerson>) => {
        setDoorSignForm((prev) => ({
            ...prev,
            people: prev.people.map((person) =>
                person.id === personId
                    ? (() => {
                        const nextPerson = { ...person, ...updates }
                        if (updates.status && updates.status !== 'busy') {
                            nextPerson.busyUntil = ''
                        }
                        if (nextPerson.status !== 'busy') {
                            nextPerson.busyUntil = ''
                        }
                        return nextPerson
                    })()
                    : person,
            ),
        }))
    }

    const savePersonDialog = () => {
        if (!personDraft) {
            return
        }
        updateDoorSignPerson(personDraft.id, {
            name: personDraft.name,
            status: personDraft.status,
            busyUntil: personDraft.status === 'busy' ? personDraft.busyUntil : '',
        })
        closePersonDialog()
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
                    <Input label={'Raumnummer'} value={doorSignForm.roomNumber}
                           onChange={(event) => setDoorSignForm({ ...doorSignForm, roomNumber: event.target.value })} />
                    <div>
                        <Typography variant={'small'} color={'blue-gray'} className={'mb-2 font-medium'}>
                            Personen auf dem Türschild (max. 3)
                        </Typography>
                        <div className={'space-y-4'}>
                            {doorSignForm.people.map((person, index) => {
                                const statusDefinition = doorSignPersonStatuses.find((status) => status.value === person.status)
                                const statusLabel = statusDefinition?.label ?? 'Verfügbar'
                                const displayName = (person.name ?? '').trim().length > 0 ? person.name : `Person ${index + 1}`
                                const busyInfo = person.status === 'busy' && person.busyUntil
                                    ? `Bis ${formattedDate(person.busyUntil)}`
                                    : ''

                                return (
                                    <div key={person.id} className={'rounded-lg border border-blue-gray-100 bg-white p-4 shadow-sm'}>
                                        <div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
                                            <button type={'button'}
                                                    onClick={() => openPersonDialog(person)}
                                                    className={'w-full rounded-md bg-transparent text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500'}>
                                                <p className={'text-base font-semibold text-black'}>{displayName}</p>
                                                <p className={'text-sm text-blue-gray-500'}>
                                                    Status: {statusLabel}
                                                    {busyInfo && (
                                                        <span className={'text-blue-gray-400'}> – {busyInfo}</span>
                                                    )}
                                                </p>
                                            </button>
                                            <div className={'flex items-center gap-2'}>
                                                <Button variant={'outlined'} size={'sm'} className={'normal-case'}
                                                        onClick={() => openPersonDialog(person)}>
                                                    Bearbeiten
                                                </Button>
                                                {doorSignForm.people.length > 1 && (
                                                    <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case'}
                                                            onClick={() => removeDoorSignPerson(person.id)}>
                                                        Entfernen
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={'mt-3'}>
                            <Button variant={'outlined'} size={'sm'}
                                    disabled={doorSignForm.people.length >= 3}
                                    onClick={addDoorSignPerson} className={'normal-case'}>
                                Weitere Person hinzufügen
                            </Button>
                        </div>
                    </div>
                    <Input label={'Unterer Text'} value={doorSignForm.footerNote}
                           onChange={(event) => setDoorSignForm({ ...doorSignForm, footerNote: event.target.value })}
                           placeholder={'Kurzer Hinweis am unteren Rand'} />
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
            const peopleSource = Array.isArray(doorSignForm.people) ? doorSignForm.people : []
            const peopleWithNames = peopleSource.filter((person) => (person.name ?? '').trim().length > 0)
            const hasBusyPerson = peopleSource.some((person) => person.status === 'busy')
            const availabilityLabel = hasBusyPerson ? 'Beschäftigt' : 'Verfügbar'
            const statusClasses = hasBusyPerson ? 'bg-red-600 text-white border border-red-700' : 'bg-white text-black border border-black'
            const footerNote = typeof doorSignForm.footerNote === 'string' ? doorSignForm.footerNote : ''
            const footerContent = footerNote.trim()
                || 'Zusätzlicher Hinweis'

            const isMinimalState = peopleWithNames.length === 0 && footerNote.trim().length === 0

            return (
                <div className={'flex flex-col rounded-xl border-2 border-black bg-white text-black'} style={{ width: 400, height: 300 }}>
                    <div className={'flex flex-1 gap-10'}>
                        <div className={'flex flex-1 items-center px-6'}>
                            <div className={'w-full'}>
                        {isMinimalState ? (
                            <div className={'rounded-md border border-dashed border-black px-4 py-3 text-center text-sm font-medium'}>
                                Raum aktuell unzugeteilt
                            </div>
                        ) : peopleWithNames.length === 0 ? (
                                    <p className={'text-sm'}>Namen erscheinen hier.</p>
                                ) : (
                                    <ul className={'space-y-3'}>
                                        {peopleWithNames.map((person) => (
                                            <li key={person.id} className={`text-base font-semibold ${person.status === 'busy' ? 'text-red-600' : ''}`}>
                                                {person.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className={'flex w-40 flex-col items-end px-6 pt-6 pb-4'}>
                            <div className={'text-right'}>
                                <p className={'text-5xl font-bold leading-none whitespace-nowrap overflow-hidden text-ellipsis'}>{doorSignForm.roomNumber || '—'}</p>
                            </div>
                            {!isMinimalState && (
                                <div className={`mt-5 inline-flex items-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm ${statusClasses}`}>
                                    {availabilityLabel}
                                </div>
                            )}
                        </div>
                    </div>
                    {isMinimalState && (
                        <div className={'border-t border-black px-6 py-3 text-xs leading-relaxed'}>
                            <div className={'flex items-center justify-between'}>
                                <span className={'font-medium'}>Raumzuweisung verfügbar</span>
                                <div className={'h-12 w-12 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                                    QR
                                </div>
                            </div>
                        </div>
                    )}
                    {!isMinimalState && footerContent && (
                        <div className={'border-t border-black px-6 py-3 text-xs leading-relaxed'}>
                            <span>{footerContent}</span>
                        </div>
                    )}
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

            <Dialog open={isPersonDialogOpen} handler={closePersonDialog} size={'sm'}>
                <DialogHeader>Person bearbeiten</DialogHeader>
                <DialogBody>
                    {personDraft && (
                        <div className={'space-y-4'}>
                            <Input label={'Name'} value={personDraft.name}
                                   onChange={(event) => setPersonDraft({ ...personDraft, name: event.target.value })} />
                            <Select label={'Status'} value={personDraft.status}
                                    onChange={(value) => {
                                        if (!value || !personDraft) {
                                            return
                                        }
                                        const nextStatus = value as DoorSignPersonStatus
                                        setPersonDraft({
                                            ...personDraft,
                                            status: nextStatus,
                                            busyUntil: nextStatus === 'busy' ? personDraft.busyUntil : '',
                                        })
                                    }}>
                                {doorSignPersonStatuses.map((status) => (
                                    <Option key={status.value} value={status.value}>{status.label}</Option>
                                ))}
                            </Select>
                            {personDraft.status === 'busy' && (
                                <Input type={'datetime-local'} label={'Beschäftigt bis'}
                                       value={personDraft.busyUntil}
                                       onChange={(event) => setPersonDraft({ ...personDraft, busyUntil: event.target.value })} />
                            )}
                        </div>
                    )}
                </DialogBody>
                <DialogFooter className={'space-x-2'}>
                    <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={closePersonDialog}>
                        Abbrechen
                    </Button>
                    <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={savePersonDialog}
                            disabled={!personDraft}>
                        Speichern
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
