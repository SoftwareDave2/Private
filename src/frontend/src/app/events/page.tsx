'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import {Card, CardBody, Input, Option, Select, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter} from '@material-tailwind/react'
import PageHeader from '@/components/layout/PageHeader'
import {DisplayData} from '@/types/displayData'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {
    DisplayTypeKey,
    DoorSignForm,
    DoorSignPerson,
    DoorSignPersonStatus,
    EventBoardEvent,
    EventBoardForm,
    NoticeBoardForm,
    BookingEntry,
    RoomBookingForm,
} from './types'
import {
    defaultDoorSignForm,
    defaultEventBoardForm,
    defaultNoticeBoardForm,
    defaultRoomBookingForm,
    displayTypeOptions,
    doorSignPersonStatuses,
} from './constants'
import {DoorSignFormSection} from './components/DoorSignFormSection'
import {EventBoardFormSection} from './components/EventBoardFormSection'
import {NoticeBoardFormSection} from './components/NoticeBoardFormSection'
import {RoomBookingFormSection} from './components/RoomBookingFormSection'

const templateSamples: Record<DisplayTypeKey, string> = {
    'door-sign': `<!-- Türschild Template -->
<section class="door-sign">
  <header>
    <h1>{{ roomNumber }}</h1>
    <span>{{ status }}</span>
  </header>
  <main>
    <ul>
      <li v-for="person in people">{{ person.name }}</li>
    </ul>
  </main>
</section>`,
    'event-board': `<!-- Ereignistafel Template -->
<section class="event-board">
  <h1>{{ title }}</h1>
  <article v-for="event in events">
    <h2>{{ event.title }}</h2>
    <p>{{ event.date }} · {{ event.time }}</p>
  </article>
</section>`,
    'notice-board': `<!-- Hinweis-Template -->
<section class="notice-board">
  <header>
    <h1>{{ title }}</h1>
    <time>{{ start }} – {{ end }}</time>
  </header>
  <p>{{ body }}</p>
</section>`,
    'room-booking': `<!-- Raumbuchung Template -->
<section class="room-booking">
  <header>
    <h1>{{ roomNumber }}</h1>
    <span>{{ roomType }}</span>
  </header>
  <ul>
    <li v-for="entry in entries">
      <strong>{{ entry.time }}</strong> – {{ entry.title }}
    </li>
  </ul>
</section>`,
}

const previewDimensions: Record<DisplayTypeKey, { width: number; height: number }> = {
    'door-sign': { width: 400, height: 300 },
    'event-board': { width: 400, height: 300 },
    'notice-board': { width: 296, height: 128 },
    'room-booking': { width: 400, height: 300 },
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
    const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false)
    const [eventDraft, setEventDraft] = useState<EventBoardEvent | null>(null)
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState<boolean>(false)
    const [bookingDraft, setBookingDraft] = useState<{ id: number; title: string; startTime: string; endTime: string } | null>(null)
    const [isTemplateEditDialogOpen, setIsTemplateEditDialogOpen] = useState<boolean>(false)
    const [isTemplateCreateDialogOpen, setIsTemplateCreateDialogOpen] = useState<boolean>(false)
    const [templateEditorContent, setTemplateEditorContent] = useState<string>('')
    const [templateCreatorContent, setTemplateCreatorContent] = useState<string>('')
    const [isSendInProgress, setIsSendInProgress] = useState<boolean>(false)
    const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const filteredDisplays = useMemo(() => {
        if (displayType === 'event-board') {
            return displays.filter((display) => display.width === 400 && display.height === 300)
        }
        return displays
    }, [displayType, displays])

    const previewContainerRef = useRef<HTMLDivElement | null>(null)
    const [previewScale, setPreviewScale] = useState(1)
    const previewSize = previewDimensions[displayType] ?? previewDimensions['door-sign']

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

    useEffect(() => {
        const container = previewContainerRef.current
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
    }, [previewSize.height, previewSize.width, displayType])

    const openPersonDialog = (person: DoorSignPerson) => {
        setPersonDraft({ ...person })
        setIsPersonDialogOpen(true)
    }

    const closePersonDialog = () => {
        setIsPersonDialogOpen(false)
        setPersonDraft(null)
    }

    const openEventDialog = (event: EventBoardEvent) => {
        setEventDraft({ ...event })
        setIsEventDialogOpen(true)
    }

    const closeEventDialog = () => {
        setIsEventDialogOpen(false)
        setEventDraft(null)
    }

    const openBookingDialog = (entry: BookingEntry) => {
        const raw = typeof entry.time === 'string' ? entry.time : ''
        const parts = raw.split('-').map((part) => part.trim()).filter((part) => part.length > 0)
        const startTime = parts.length >= 1 ? parts[0] : ''
        const endTime = parts.length >= 2 ? parts[1] : ''
        setBookingDraft({
            id: entry.id,
            title: entry.title,
            startTime,
            endTime,
        })
        setIsBookingDialogOpen(true)
    }

    const closeBookingDialog = () => {
        setIsBookingDialogOpen(false)
        setBookingDraft(null)
    }

    const resolveDisplayLabel = (type: DisplayTypeKey) => displayTypeOptions.find((option) => option.value === type)?.label ?? type

    const openTemplateEditDialog = () => {
        setTemplateEditorContent(templateSamples[displayType] ?? '')
        setIsTemplateEditDialogOpen(true)
    }

    const closeTemplateEditDialog = () => {
        setIsTemplateEditDialogOpen(false)
    }

    const openTemplateCreateDialog = () => {
        const label = resolveDisplayLabel(displayType)
        const baseTemplate = templateSamples[displayType] ?? '<!-- Neues Template -->'
        setTemplateCreatorContent(`// Neues Template für ${label}\n\n${baseTemplate}`)
        setIsTemplateCreateDialogOpen(true)
    }

    const closeTemplateCreateDialog = () => {
        setIsTemplateCreateDialogOpen(false)
    }

    const buildDisplayPayload = () => {
        switch (displayType) {
        case 'door-sign': {
            const peopleSource = Array.isArray(doorSignForm.people) ? doorSignForm.people : []
            const normalizedPeople = peopleSource.map((person) => ({
                id: person.id,
                name: (person.name ?? '').trim(),
                status: person.status,
                busyUntil: person.status === 'busy' ? (person.busyUntil ?? '') : '',
            }))
            return {
                roomNumber: (doorSignForm.roomNumber ?? '').trim(),
                people: normalizedPeople,
                footerNote: (doorSignForm.footerNote ?? '').trim(),
            }
        }
        case 'event-board': {
            const eventsSource = Array.isArray(eventBoardForm.events) ? eventBoardForm.events : []
            const normalizedEvents = eventsSource.map((event) => ({
                id: event.id,
                title: (event.title ?? '').trim(),
                date: event.date ?? '',
                time: event.time ?? '',
                qrLink: (event.qrLink ?? '').trim(),
            }))
            return {
                title: (eventBoardForm.title ?? '').trim(),
                description: (eventBoardForm.description ?? '').trim(),
                events: normalizedEvents,
            }
        }
        case 'notice-board':
            return {
                title: (noticeBoardForm.title ?? '').trim(),
                body: (noticeBoardForm.body ?? '').trim(),
                qrContent: (noticeBoardForm.qrContent ?? '').trim(),
                start: noticeBoardForm.start ?? '',
                end: noticeBoardForm.end ?? '',
            }
        case 'room-booking': {
            const entriesSource = Array.isArray(roomBookingForm.entries) ? roomBookingForm.entries : []
            const normalizedEntries = entriesSource.map((entry) => ({
                id: entry.id,
                title: (entry.title ?? '').trim(),
                time: entry.time ?? '',
            }))
            return {
                roomNumber: (roomBookingForm.roomNumber ?? '').trim(),
                roomType: (roomBookingForm.roomType ?? '').trim(),
                entries: normalizedEntries,
            }
        }
        default:
            return {}
        }
    }

    const handleSendToDisplay = () => {
        if (!selectedDisplay) {
            setSendFeedback({ type: 'error', message: 'Bitte wählen Sie zuerst ein Display aus.' })
            return
        }

        setSendFeedback(null)
        setIsSendInProgress(true)
        const payload = buildDisplayPayload()
        console.log('Prepared display payload', {
            macAddress: selectedDisplay,
            displayType,
            payload,
        })
        setTimeout(() => {
            setSendFeedback({ type: 'success', message: 'Die Live-Vorschau wurde (Demo) erfolgreich an das Display übermittelt.' })
            setIsSendInProgress(false)
        }, 400)
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

    const addEventBoardEvent = () => {
        let createdEvent: EventBoardEvent | null = null
        setEventBoardForm((prev) => {
            if (prev.events.length >= 4) {
                return prev
            }
            const nextId = prev.events.length === 0 ? 1 : Math.max(...prev.events.map((event) => event.id)) + 1
            createdEvent = { id: nextId, title: '', date: '', time: '', qrLink: '' }
            return {
                ...prev,
                events: [...prev.events, createdEvent],
            }
        })
        if (createdEvent) {
            openEventDialog(createdEvent)
        }
    }

    const removeEventBoardEvent = (eventId: number) => {
        setEventBoardForm((prev) => ({
            ...prev,
            events: prev.events.filter((event) => event.id !== eventId),
        }))
    }

    const updateEventBoardEvent = (eventId: number, updates: Partial<EventBoardEvent>) => {
        setEventBoardForm((prev) => ({
            ...prev,
            events: prev.events.map((event) =>
                event.id === eventId
                    ? { ...event, ...updates }
                    : event,
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

    const saveEventDialog = () => {
        if (!eventDraft) {
            return
        }
        updateEventBoardEvent(eventDraft.id, {
            title: eventDraft.title,
            date: eventDraft.date,
            time: eventDraft.time,
            qrLink: eventDraft.qrLink,
        })
        closeEventDialog()
    }

    const saveBookingDialog = () => {
        if (!bookingDraft) {
            return
        }
        const start = bookingDraft.startTime.trim()
        const end = bookingDraft.endTime.trim()
        const timeLabel = start && end ? `${start} - ${end}` : start || end
        setRoomBookingForm((prev) => ({
            ...prev,
            entries: prev.entries.map((entry) =>
                entry.id === bookingDraft.id
                    ? { ...entry, title: bookingDraft.title, time: timeLabel }
                    : entry,
            ),
        }))
        closeBookingDialog()
    }

    const addBookingEntry = () => {
        let createdEntry: BookingEntry | null = null
        setRoomBookingForm((prev) => {
            if (prev.entries.length >= 4) {
                return prev
            }
            const nextId = prev.entries.length === 0 ? 1 : Math.max(...prev.entries.map((entry) => entry.id)) + 1
            createdEntry = { id: nextId, title: '', time: '' }
            return {
                ...prev,
                entries: [...prev.entries, createdEntry],
            }
        })
        if (createdEntry) {
            openBookingDialog(createdEntry)
        }
    }

    const removeBookingEntry = (entryId: number) => {
        if (bookingDraft && bookingDraft.id === entryId) {
            closeBookingDialog()
        }
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
                <DoorSignFormSection
                    form={doorSignForm}
                    statuses={doorSignPersonStatuses}
                    onFormChange={setDoorSignForm}
                    onEditPerson={openPersonDialog}
                    onAddPerson={addDoorSignPerson}
                    onRemovePerson={removeDoorSignPerson}
                    formatDate={formattedDate}
                />
            )
        case 'event-board':
            return (
                <EventBoardFormSection
                    form={eventBoardForm}
                    onFormChange={setEventBoardForm}
                    onAddEvent={addEventBoardEvent}
                    onEditEvent={openEventDialog}
                    onRemoveEvent={removeEventBoardEvent}
                />
            )
        case 'notice-board':
            return (
                <NoticeBoardFormSection
                    form={noticeBoardForm}
                    onFormChange={setNoticeBoardForm}
                />
            )
        case 'room-booking':
            return (
                <RoomBookingFormSection
                    form={roomBookingForm}
                    onFormChange={setRoomBookingForm}
                    onAddEntry={addBookingEntry}
                    onEditEntry={openBookingDialog}
                    onRemoveEntry={removeBookingEntry}
                />
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
            const showStatusBadge = peopleWithNames.length > 0
            const emptyAssignmentMessage = (
                <div className={'rounded-md border border-black px-4 py-3 text-center text-sm font-medium'}>
                    Raum aktuell unzugeteilt
                </div>
            )

            return (
                <div className={'flex flex-col rounded-xl border-2 border-black bg-white text-black'} style={{ width: 400, height: 300 }}>
                    <div className={'flex flex-1 gap-10'}>
                        <div className={'flex flex-1 items-center px-6'}>
                            <div className={'w-full'}>
                                {isMinimalState || peopleWithNames.length === 0 ? (
                                    emptyAssignmentMessage
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
                            {showStatusBadge && (
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
                        <div className={'border-t border-black px-6 py-3 text-sm leading-relaxed font-medium'}>
                            <span>{footerContent}</span>
                        </div>
                    )}
                </div>
            )
        }
        case 'event-board': {
            const formatDateLabel = (value: string) => {
                if (!value) {
                    return ''
                }
                const parsed = new Date(value)
                if (Number.isNaN(parsed.getTime())) {
                    return value
                }
                const day = parsed.getDate().toString().padStart(2, '0')
                const month = (parsed.getMonth() + 1).toString().padStart(2, '0')
                const year = parsed.getFullYear().toString()
                return `${day}.${month}.${year}`
            }

            const events = Array.isArray(eventBoardForm.events)
                ? eventBoardForm.events
                    .filter((event) =>
                        (event.title ?? '').trim().length > 0
                        || (event.date ?? '').trim().length > 0
                        || (event.time ?? '').trim().length > 0,
                    )
                    .slice(0, 4)
                : []
            const isDenseLayout = events.length >= 4
            return (
                <div className={'rounded-2xl bg-white border-2 border-black p-4 text-black flex flex-col gap-2 overflow-hidden'}
                     style={{ width: 400, height: 300 }}>
                    {eventBoardForm.title.trim() && (
                        <div>
                            <h3 className={'text-lg font-semibold text-black leading-tight truncate'}>{eventBoardForm.title.trim()}</h3>
                        </div>
                    )}
                    <div className={'flex-1 overflow-hidden'}>
                        {events.length > 0 ? (
                            <div className={`flex flex-col h-full ${events.length < 4 ? 'justify-start' : 'justify-between'} ${isDenseLayout ? 'gap-1' : 'gap-1.5'}`}>
                                {events.map((event) => {
                                    const title = event.title.trim() || 'Titel festlegen'
                                    const date = formatDateLabel(event.date.trim()) || 'Datum folgt'
                                    const time = event.time.trim() || 'Zeit folgt'
                                    const hasQrLink = event.qrLink.trim().length > 0

                                    return (
                                        <div key={event.id}
                                             className={`flex items-center justify-between rounded-lg border border-red-600/40 bg-white ${isDenseLayout ? 'px-2 py-1' : 'px-2.5 py-1.5'} ${isDenseLayout ? 'gap-1.5' : 'gap-2'}`}>
                                            <div className={`flex-1 min-w-0 ${isDenseLayout ? 'space-y-0.5' : 'space-y-0.5'}`}>
                                                <p className={`${isDenseLayout ? 'text-[0.78rem]' : 'text-[0.82rem]'} font-semibold text-black truncate`} title={title}>{title}</p>
                                                <p className={`${isDenseLayout ? 'text-[0.68rem]' : 'text-[0.72rem]'} text-black truncate`} title={`${date} · ${time}`}>
                                                    {date} · {time}
                                                </p>
                                            </div>
                                            <div className={`flex items-center justify-center rounded-md uppercase text-center leading-tight px-1 border ${hasQrLink ? 'border-black bg-red-50 text-red-700' : 'border-dashed border-black text-black'} ${isDenseLayout ? 'h-10 w-10 text-[0.45rem]' : 'h-11 w-11 text-[0.48rem]'}`}>
                                                QR
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className={'flex h-full flex-col items-center justify-center gap-4 rounded-lg bg-white px-6 text-center'}>
                                <p className={'text-base font-semibold text-red-600'}>
                                    Derzeit gibt es keine anstehenden Ereignisse
                                </p>
                                <div className={'flex flex-col items-center gap-2'}>
                                    <div className={'h-20 w-20 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                                        QR
                                    </div>
                                    <p className={'text-sm text-black'}>QR-Code scannen und neue Ereignisse hinzufügen</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
        case 'notice-board':
            return (
                <div className={'rounded-xl bg-white text-black border-2 border-black p-2.5 flex h-full flex-col'}
                     style={{ width: 296, height: 128 }}>
                    {noticeBoardForm.title.trim().length > 0 || noticeBoardForm.body.trim().length > 0 ? (
                        <>
                            <div className={'flex-1 min-h-0 space-y-1 overflow-hidden'}>
                                {noticeBoardForm.title.trim() && (
                                    <h3 className={'text-lg font-semibold text-black leading-tight truncate'}>{noticeBoardForm.title}</h3>
                                )}
                                {noticeBoardForm.body.trim() && (
                                    <p className={'text-[0.95rem] leading-snug whitespace-pre-line line-clamp-3'}>{noticeBoardForm.body}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className={'flex h-full flex-col items-center justify-center gap-3 text-center px-4'}>
                            <p className={'text-base font-semibold text-black leading-tight'}>Zum Beschreiben QR-Code scannen</p>
                            <div className={'h-16 w-16 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.6rem] uppercase'}>
                                QR
                            </div>
                        </div>
                    )}
                </div>
            )
        case 'room-booking': {
            const entriesSource = Array.isArray(roomBookingForm.entries)
                ? roomBookingForm.entries
                : []
            const parsedEntries = entriesSource
                .filter((entry) => (entry.title ?? '').trim().length > 0 || (entry.time ?? '').trim().length > 0)
                .map((entry) => {
                    const raw = typeof entry.time === 'string' ? entry.time : ''
                    const segments = raw.split('-').map((segment) => segment.trim()).filter((segment) => segment.length > 0)
                    const startTime = segments.length >= 1 ? segments[0] : ''
                    const endTime = segments.length >= 2 ? segments[1] : ''
                    const normalized = startTime && endTime ? `${startTime} - ${endTime}` : raw || startTime || endTime
                    return {
                        ...entry,
                        normalizedTime: normalized,
                        startTime,
                        endTime,
                    }
                })

            const roomNumberLabel = ((roomBookingForm.roomNumber || '').trim()) || '—'
            const roomTypeLabel = ((roomBookingForm.roomType || 'Besprechungsraum').trim()) || 'Besprechungsraum'

            if (parsedEntries.length === 0) {
                return (
                    <div className={'rounded-2xl bg-white border-2 border-black p-5 flex flex-col text-black'} style={{ width: 400, height: 300 }}>
                        <div className={'flex items-start justify-between'}>
                            <span className={'text-sm text-transparent'}>.</span>
                            <p className={'text-3xl font-semibold text-black leading-tight text-right min-w-[4rem]'}>{roomNumberLabel}</p>
                        </div>
                        <div className={'flex-1 flex items-center justify-center'}>
                            <div className={'w-full max-w-xs'}>
                                <p className={'text-base font-semibold text-black text-left'}>Keine anstehenden Termine</p>
                            </div>
                        </div>
                        <div className={'pt-3 flex justify-between items-end'}>
                            <p className={'text-sm font-semibold text-black truncate'}>{roomTypeLabel}</p>
                            <div className={'flex flex-col items-center space-y-2'}>
                                <div className={'h-16 w-16 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.55rem] uppercase'}>
                                    QR
                                </div>
                                <p className={'text-xs text-black'}>Neue Termine hinzufügen</p>
                            </div>
                        </div>
                    </div>
                )
            }

            const activeEntry = parsedEntries[0]
            const secondaryEntries = parsedEntries.slice(1, 4)

            return (
                <div className={'rounded-2xl bg-white border-2 border-black p-5 flex flex-col gap-4 text-black'} style={{ width: 400, height: 300 }}>
                    <div className={'flex items-start justify-between gap-4'}>
                        <div className={'flex flex-col gap-3'}>
                            <div className={'grid gap-2'}>
                                <div className={'flex items-center justify-between'}>
                                    <p className={'text-xs uppercase tracking-wide text-red-700 font-semibold'}>Aktiver Termin</p>
                                    <Button variant={'text'} color={'gray'} size={'sm'} className={'normal-case'}
                                            onClick={() => removeBookingEntry(activeEntry.id)}>
                                        Entfernen
                                    </Button>
                                </div>
                                <div className={'mt-1 rounded-lg border border-black bg-white px-3 py-2 text-left w-40 h-20 flex flex-col justify-center'}>
                                    <span className={'text-sm font-semibold text-black truncate'}>
                                        {activeEntry?.normalizedTime ? `${activeEntry.normalizedTime} Uhr` : 'Keine Zeit'}
                                    </span>
                                    <span className={'mt-1 text-xs text-black line-clamp-2'}>
                                        {activeEntry?.title?.trim() || 'Kein Meeting ausgewählt'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className={'text-3xl font-semibold text-black leading-tight text-right min-w-[4rem]'}>{roomNumberLabel}</p>
                    </div>
                    <div className={'flex-1 min-h-0'}>
                        {secondaryEntries.length > 0 && (
                            <div className={'flex flex-1 flex-col bg-white px-3 pt-3 pb-6 space-y-2'}>
                                {secondaryEntries.map((entry, index) => {
                                    const labelText = `Ab ${entry.startTime ? `${entry.startTime} Uhr` : 'sofort'}: ${(entry.title ?? '').trim()}`
                                    const isLast = index === secondaryEntries.length - 1
                                    return (
                                        <div key={entry.id} className={'text-sm text-black leading-snug w-full'}>
                                            <p>{labelText}</p>
                                            {!isLast && <div className={'h-px w-full bg-black/30 my-1'} />}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    <div className={'mt-auto pt-3 flex justify-between items-end'}>
                        <p className={'text-sm font-semibold text-black truncate'}>{roomTypeLabel}</p>
                        {parsedEntries.length <= 1 && (
                            <div className={'flex flex-col items-center space-y-2'}>
                                <div className={'h-16 w-16 rounded-lg border border-dashed border-black flex items-center justify-center text-[0.55rem] uppercase'}>
                                    QR
                                </div>
                                <p className={'text-xs text-black'}>Neue Termine hinzufügen</p>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
        default:
            return null
        }
    }

    const previewContent = renderPreview()

    return (
        <div className={'space-y-6 px-4 sm:px-0 w-full max-w-full overflow-x-hidden'}>
            <PageHeader title={'Events'} info={'Konfigurieren Sie Inhalte für die Displays in der Keßlerstraße'} />
            <div className={'flex flex-col gap-6 xl:grid xl:grid-cols-2 w-full max-w-full'}>
                <Card className={'w-full max-w-full border border-blue-gray-100 shadow-sm'}>
                    <CardBody className={'space-y-6 p-4 sm:p-6'}>
                        <div className={'grid gap-4 sm:grid-cols-2'}>
                            <div>
                                <Select label={'Display auswählen'} value={selectedDisplay}
                                        onChange={(value) => value && setSelectedDisplay(value)}
                                        disabled={isLoadingDisplays || filteredDisplays.length === 0}>
                                    {filteredDisplays.map((display) => (
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

                <Card className={'w-full max-w-full border border-blue-gray-100 shadow-sm'}>
                    <CardBody className={'space-y-6 p-4 sm:p-6'}>
                        <div className={'flex flex-col gap-1 text-left text-xs uppercase tracking-wide text-red-700 sm:flex-row sm:items-center sm:justify-between'}>
                            <span>Live-Vorschau</span>
                            <span className={'font-semibold sm:text-right'}>{displayTypeOptions.find((option) => option.value === displayType)?.label}</span>
                        </div>
                        {previewContent && (
                            <div ref={previewContainerRef} className={'w-full overflow-x-hidden'}>
                                <div className={'flex justify-center sm:justify-start'}>
                                    <div
                                        style={{
                                            width: previewSize.width * previewScale,
                                            height: previewSize.height * previewScale,
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: previewSize.width,
                                                height: previewSize.height,
                                                transform: `scale(${previewScale})`,
                                                transformOrigin: 'top left',
                                            }}
                                        >
                                            {previewContent}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className={'flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'}>
                            <div className={'flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:flex-wrap'}>
                                <Button variant={'outlined'} color={'gray'} className={'normal-case w-full xl:w-auto'} onClick={openTemplateEditDialog}>
                                    Template bearbeiten
                                </Button>
                                <Button variant={'filled'} color={'red'} className={'normal-case w-full xl:w-auto'} onClick={openTemplateCreateDialog}>
                                    Template erstellen
                                </Button>
                            </div>
                            <Button
                                variant={'filled'}
                                color={'green'}
                                className={'normal-case w-full xl:w-auto'}
                                disabled={isSendInProgress || isLoadingDisplays || !selectedDisplay}
                                onClick={handleSendToDisplay}
                            >
                                {isSendInProgress ? 'Wird gesendet…' : 'An Display senden'}
                            </Button>
                        </div>
                        {sendFeedback && (
                            <div className={`rounded-md border px-4 py-3 text-sm ${sendFeedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                {sendFeedback.message}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            <Dialog open={isTemplateEditDialogOpen} handler={closeTemplateEditDialog} size={'xl'}>
                <DialogHeader>Template bearbeiten</DialogHeader>
                <DialogBody className={'space-y-4'}>
                    <Typography variant={'small'} color={'blue-gray'} className={'font-normal'}>
                        Bearbeiten Sie den Beispielcode für {resolveDisplayLabel(displayType)}.
                    </Typography>
                    <textarea
                        value={templateEditorContent}
                        onChange={(event) => setTemplateEditorContent(event.target.value)}
                        className={'min-h-[320px] w-full rounded-md border border-blue-gray-100 bg-blue-gray-50/40 p-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'}
                        spellCheck={false}
                    />
                </DialogBody>
                <DialogFooter className={'space-x-2'}>
                    <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={closeTemplateEditDialog}>
                        Abbrechen
                    </Button>
                    <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={closeTemplateEditDialog}>
                        Template speichern
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={isTemplateCreateDialogOpen} handler={closeTemplateCreateDialog} size={'xl'}>
                <DialogHeader>Template erstellen</DialogHeader>
                <DialogBody className={'space-y-4'}>
                    <Typography variant={'small'} color={'blue-gray'} className={'font-normal'}>
                        Erstellen Sie ein neues Template für {resolveDisplayLabel(displayType)}.
                    </Typography>
                    <textarea
                        value={templateCreatorContent}
                        onChange={(event) => setTemplateCreatorContent(event.target.value)}
                        className={'min-h-[320px] w-full rounded-md border border-blue-gray-100 bg-blue-gray-50/40 p-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'}
                        spellCheck={false}
                    />
                </DialogBody>
                <DialogFooter className={'space-x-2'}>
                    <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={closeTemplateCreateDialog}>
                        Abbrechen
                    </Button>
                    <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={closeTemplateCreateDialog}>
                        Template speichern
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={isEventDialogOpen} handler={closeEventDialog} size={'sm'}>
                <DialogHeader>Ereignis bearbeiten</DialogHeader>
                <DialogBody>
                    {eventDraft && (
                        <div className={'space-y-4'}>
                            <Input label={'Titel'} value={eventDraft.title}
                                   onChange={(event) => setEventDraft({ ...eventDraft, title: event.target.value })} />
                            <div className={'grid gap-3 sm:grid-cols-2'}>
                                <Input type={'date'} label={'Datum'} value={eventDraft.date}
                                       onChange={(event) => setEventDraft({ ...eventDraft, date: event.target.value })} />
                                <Input type={'time'} label={'Uhrzeit'} value={eventDraft.time}
                                       onChange={(event) => setEventDraft({ ...eventDraft, time: event.target.value })} />
                            </div>
                            <Input type={'url'} label={'Link für QR-Code'} value={eventDraft.qrLink}
                                   onChange={(event) => setEventDraft({ ...eventDraft, qrLink: event.target.value })}
                                   placeholder={'https://...'} />
                        </div>
                    )}
                </DialogBody>
                <DialogFooter className={'space-x-2'}>
                    <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={closeEventDialog}>
                        Abbrechen
                    </Button>
                    <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={saveEventDialog}
                            disabled={!eventDraft}>
                        Speichern
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={isBookingDialogOpen} handler={closeBookingDialog} size={'sm'}>
                <DialogHeader>Termin bearbeiten</DialogHeader>
                <DialogBody>
                    {bookingDraft && (
                        <div className={'space-y-4'}>
                            <Input label={'Titel'} value={bookingDraft.title}
                                   onChange={(event) => setBookingDraft({ ...bookingDraft, title: event.target.value })} />
                            <div className={'grid gap-3 sm:grid-cols-2'}>
                                <Input type={'time'} label={'Beginn'} value={bookingDraft.startTime}
                                       onChange={(event) => setBookingDraft({ ...bookingDraft, startTime: event.target.value })} />
                                <Input type={'time'} label={'Ende'} value={bookingDraft.endTime}
                                       onChange={(event) => setBookingDraft({ ...bookingDraft, endTime: event.target.value })} />
                            </div>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter className={'space-x-2'}>
                    <Button variant={'text'} color={'gray'} className={'normal-case'} onClick={closeBookingDialog}>
                        Abbrechen
                    </Button>
                    <Button variant={'filled'} color={'red'} className={'normal-case'} onClick={saveBookingDialog}
                            disabled={!bookingDraft}>
                        Speichern
                    </Button>
                </DialogFooter>
            </Dialog>

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
