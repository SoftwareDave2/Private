'use client'

import {useEffect, useState} from 'react'
import {Button, Card, CardBody, Option, Select} from '@material-tailwind/react'

import PageHeader from '@/components/layout/PageHeader'

import {
    DisplayTypeKey,
    DoorSignForm,
    DoorSignPerson,
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
    previewDimensions,
    templateSamples,
} from './constants'
import {DoorSignFormSection} from './components/DoorSignFormSection'
import {EventBoardFormSection} from './components/EventBoardFormSection'
import {NoticeBoardFormSection} from './components/NoticeBoardFormSection'
import {RoomBookingFormSection} from './components/RoomBookingFormSection'
import {DisplayPreview} from './components/previews/DisplayPreview'
import {DoorSignPersonDialog} from './components/dialogs/DoorSignPersonDialog'
import {EventBoardEventDialog} from './components/dialogs/EventBoardEventDialog'
import {RoomBookingEntryDialog} from './components/dialogs/RoomBookingEntryDialog'
import {TemplateCodeDialog} from './components/dialogs/TemplateCodeDialog'
import {useDisplaySelection} from './hooks/useDisplaySelection'
import {usePreviewScale} from './hooks/usePreviewScale'

type BookingDraft = {
    id: number
    title: string
    startTime: string
    endTime: string
}

type DisplayPayloadForms = {
    doorSignForm: DoorSignForm
    eventBoardForm: EventBoardForm
    noticeBoardForm: NoticeBoardForm
    roomBookingForm: RoomBookingForm
}

const formatDoorSignDate = (value: string) => {
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

const buildDoorSignPayload = (form: DoorSignForm) => {
    const peopleSource = Array.isArray(form.people) ? form.people : []
    const normalizedPeople = peopleSource.map((person) => ({
        id: person.id,
        name: (person.name ?? '').trim(),
        status: person.status,
        busyUntil: person.status === 'busy' ? (person.busyUntil ?? '') : '',
    }))
    return {
        roomNumber: (form.roomNumber ?? '').trim(),
        people: normalizedPeople,
        footerNote: (form.footerNote ?? '').trim(),
    }
}

const buildEventBoardPayload = (form: EventBoardForm) => {
    const eventsSource = Array.isArray(form.events) ? form.events : []
    const normalizedEvents = eventsSource.map((event) => ({
        id: event.id,
        title: (event.title ?? '').trim(),
        date: event.date ?? '',
        time: event.time ?? '',
        endTime: event.endTime ?? '',
        qrLink: (event.qrLink ?? '').trim(),
    }))
    return {
        title: (form.title ?? '').trim(),
        description: (form.description ?? '').trim(),
        events: normalizedEvents,
    }
}

const buildNoticeBoardPayload = (form: NoticeBoardForm) => ({
    title: (form.title ?? '').trim(),
    body: (form.body ?? '').trim(),
    qrContent: (form.qrContent ?? '').trim(),
    start: form.start ?? '',
    end: form.end ?? '',
})

const buildRoomBookingPayload = (form: RoomBookingForm) => {
    const entriesSource = Array.isArray(form.entries) ? form.entries : []
    const normalizedEntries = entriesSource.map((entry) => ({
        id: entry.id,
        title: (entry.title ?? '').trim(),
        time: entry.time ?? '',
    }))
    return {
        roomNumber: (form.roomNumber ?? '').trim(),
        roomType: (form.roomType ?? '').trim(),
        entries: normalizedEntries,
    }
}

const buildDisplayPayload = (displayType: DisplayTypeKey, forms: DisplayPayloadForms) => {
    switch (displayType) {
    case 'door-sign':
        return buildDoorSignPayload(forms.doorSignForm)
    case 'event-board':
        return buildEventBoardPayload(forms.eventBoardForm)
    case 'notice-board':
        return buildNoticeBoardPayload(forms.noticeBoardForm)
    case 'room-booking':
        return buildRoomBookingPayload(forms.roomBookingForm)
    default:
        return {}
    }
}

const resolveDisplayLabel = (type: DisplayTypeKey) =>
    displayTypeOptions.find((option) => option.value === type)?.label ?? type

export default function EventsPage() {
    const [displayType, setDisplayType] = useState<DisplayTypeKey>('door-sign')
    const [doorSignForm, setDoorSignForm] = useState<DoorSignForm>(defaultDoorSignForm)
    const [eventBoardForm, setEventBoardForm] = useState<EventBoardForm>(defaultEventBoardForm)
    const [noticeBoardForm, setNoticeBoardForm] = useState<NoticeBoardForm>(defaultNoticeBoardForm)
    const [roomBookingForm, setRoomBookingForm] = useState<RoomBookingForm>(defaultRoomBookingForm)

    const [isPersonDialogOpen, setIsPersonDialogOpen] = useState<boolean>(false)
    const [personDraft, setPersonDraft] = useState<DoorSignPerson | null>(null)
    const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false)
    const [eventDraft, setEventDraft] = useState<EventBoardEvent | null>(null)
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState<boolean>(false)
    const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null)
    const [isTemplateEditDialogOpen, setIsTemplateEditDialogOpen] = useState<boolean>(false)
    const [isTemplateCreateDialogOpen, setIsTemplateCreateDialogOpen] = useState<boolean>(false)
    const [templateEditorContent, setTemplateEditorContent] = useState<string>('')
    const [templateCreatorContent, setTemplateCreatorContent] = useState<string>('')
    const [isSendInProgress, setIsSendInProgress] = useState<boolean>(false)
    const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const {
        filteredDisplays,
        selectedDisplay,
        setSelectedDisplay,
        isLoadingDisplays,
        displayError,
    } = useDisplaySelection(displayType)

    const previewSize = previewDimensions[displayType] ?? previewDimensions['door-sign']
    const { containerRef: previewContainerRef, previewScale } = usePreviewScale(previewSize, displayType)

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
            endTime: eventDraft.endTime,
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

    const handleSendToDisplay = () => {
        if (!selectedDisplay) {
            setSendFeedback({ type: 'error', message: 'Bitte wählen Sie zuerst ein Display aus.' })
            return
        }

        setSendFeedback(null)
        setIsSendInProgress(true)
        const payload = buildDisplayPayload(displayType, {
            doorSignForm,
            eventBoardForm,
            noticeBoardForm,
            roomBookingForm,
        })
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

    const handleDisplaySelectChange = (value: string | undefined) => {
        if (typeof value === 'string') {
            setSelectedDisplay(value)
        }
    }

    const handleDisplayTypeChange = (value: string | undefined) => {
        if (typeof value === 'string') {
            setDisplayType(value as DisplayTypeKey)
        }
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
                    formatDate={formatDoorSignDate}
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

    const previewContent = (
        <DisplayPreview
            displayType={displayType}
            doorSignForm={doorSignForm}
            eventBoardForm={eventBoardForm}
            noticeBoardForm={noticeBoardForm}
            roomBookingForm={roomBookingForm}
            onRemoveRoomBookingEntry={removeBookingEntry}
        />
    )

    return (
        <div className={'space-y-6 px-4 sm:px-0 w-full max-w-full overflow-x-hidden'}>
            <PageHeader title={'Events'} info={'Konfigurieren Sie Inhalte für die Displays in der Keßlerstraße'} />
            <div className={'flex flex-col gap-6 xl:grid xl:grid-cols-2 w-full max-w-full'}>
                <Card className={'w-full max-w-full border border-blue-gray-100 shadow-sm'}>
                    <CardBody className={'space-y-6 p-4 sm:p-6'}>
                        <div className={'grid gap-4 sm:grid-cols-2'}>
                            <div>
                                <Select label={'Display auswählen'} value={selectedDisplay}
                                        onChange={handleDisplaySelectChange}
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
                                        onChange={handleDisplayTypeChange}>
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

            <TemplateCodeDialog
                open={isTemplateEditDialogOpen}
                title={'Template bearbeiten'}
                description={`Bearbeiten Sie den Beispielcode für ${resolveDisplayLabel(displayType)}.`}
                value={templateEditorContent}
                onChange={setTemplateEditorContent}
                onClose={closeTemplateEditDialog}
                onConfirm={closeTemplateEditDialog}
            />

            <TemplateCodeDialog
                open={isTemplateCreateDialogOpen}
                title={'Template erstellen'}
                description={`Erstellen Sie ein neues Template für ${resolveDisplayLabel(displayType)}.`}
                value={templateCreatorContent}
                onChange={setTemplateCreatorContent}
                onClose={closeTemplateCreateDialog}
                onConfirm={closeTemplateCreateDialog}
            />

            <EventBoardEventDialog
                open={isEventDialogOpen}
                event={eventDraft}
                onClose={closeEventDialog}
                onChange={(nextEvent) => setEventDraft(nextEvent)}
                onSave={saveEventDialog}
            />

            <RoomBookingEntryDialog
                open={isBookingDialogOpen}
                draft={bookingDraft}
                onClose={closeBookingDialog}
                onChange={(nextDraft) => setBookingDraft(nextDraft)}
                onSave={saveBookingDialog}
            />

            <DoorSignPersonDialog
                open={isPersonDialogOpen}
                person={personDraft}
                statuses={doorSignPersonStatuses}
                onClose={closePersonDialog}
                onChange={(nextPerson) => setPersonDraft(nextPerson)}
                onSave={savePersonDialog}
            />
        </div>
    )
}
