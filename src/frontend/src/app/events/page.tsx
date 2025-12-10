'use client'

import {useEffect, useState, Suspense, useMemo} from 'react'
import {Button, Card, CardBody, Option, Select} from '@material-tailwind/react'
import { useSearchParams } from 'next/navigation'

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
    TemplateTypeDefinition,
} from './types'
import {
    defaultDoorSignForm,
    defaultEventBoardForm,
    defaultNoticeBoardForm,
    defaultRoomBookingForm,
    doorSignPersonStatuses,
    fallbackPreviewDimensions,
    fallbackTemplateTypes,
    templateSamples,
} from './constants'
import {DoorSignFormSection} from './components/DoorSignFormSection'
import {EventBoardFormSection} from './components/EventBoardFormSection'
import {NoticeBoardFormSection} from './components/NoticeBoardFormSection'
import {RoomBookingFormSection} from './components/RoomBookingFormSection'
import {DisplayPreview} from './components/previews/DisplayPreview'
import {DoorSignPersonDialog} from './components/dialogs/DoorSignPersonDialog'
import {EventBoardCalendarDialog} from './components/dialogs/EventBoardCalendarDialog'
import {RoomBookingEntryDialog} from './components/dialogs/RoomBookingEntryDialog'
import {TemplateCodeDialog} from './components/dialogs/TemplateCodeDialog'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'
import {useDisplaySelection} from './hooks/useDisplaySelection'
import {usePreviewScale} from './hooks/usePreviewScale'
import {useTemplateTypes} from './hooks/useTemplateTypes'

type TemplateDisplayDataRequest = {
    templateType: DisplayTypeKey
    displayMac: string
    eventStart?: string | null
    eventEnd?: string | null
    fields: Record<string, unknown>
    subItems?: Array<{
        title?: string | null
        start?: string | null
        end?: string | null
        highlighted?: boolean | null
        busy?: boolean | null
        qrCodeUrl?: string | null
        allDay?: boolean | null
    }>
}

const TEST_DISPLAY_MAC = '00:11:22:33:44:55'

type BookingDraft = {
    id: number
    title: string
    startTime: string
    endTime: string
    allDay: boolean
}

type DisplayPayloadForms = {
    doorSignForm: DoorSignForm
    eventBoardForm: EventBoardForm
    noticeBoardForm: NoticeBoardForm
    roomBookingForm: RoomBookingForm
}

type TemplateDisplaySubItem = {
    title?: string | null
    start?: string | null
    end?: string | null
    highlighted?: boolean | null
    busy?: boolean | null
    qrCodeUrl?: string | null
    allDay?: boolean | null
}

type TemplateDisplayDataResponse = {
    templateType: DisplayTypeKey
    displayMac: string
    eventStart?: string | null
    eventEnd?: string | null
    fields: Record<string, unknown>
    subItems?: TemplateDisplaySubItem[]
}

type DisplayContentPayload = {
    fields: Record<string, unknown>
    subItems?: TemplateDisplayDataRequest['subItems']
    eventStart?: string | null
    eventEnd?: string | null
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

const formatDateTimeForBackend = (value: string | null | undefined) => {
    if (!value) {
        return null
    }
    const trimmed = value.trim()
    if (!trimmed) {
        return null
    }

    let candidate = trimmed
    if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
        candidate = `${candidate}T00:00:00`
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(candidate)) {
        candidate = `${candidate}:00`
    } else if (/^\d{2}:\d{2}$/.test(candidate)) {
        const reference = new Date()
        const pad = (segment: number) => segment.toString().padStart(2, '0')
        const datePart = `${reference.getFullYear()}-${pad(reference.getMonth() + 1)}-${pad(reference.getDate())}`
        candidate = `${datePart}T${candidate}:00`
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(candidate)) {
        candidate = `${candidate.replace(' ', 'T')}:00`
    }

    const parsed = new Date(candidate)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }
    return toLocalDateTimeString(parsed)
}

const shiftIsoDateByDays = (value: string, dayOffset: number) => {
    const trimmed = (value ?? '').trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return null
    }
    const base = new Date(`${trimmed}T00:00:00`)
    if (Number.isNaN(base.getTime())) {
        return null
    }
    base.setDate(base.getDate() + dayOffset)
    const pad = (segment: number) => segment.toString().padStart(2, '0')
    return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`
}

const isAllDayRange = (start?: string | null, end?: string | null) => {
    if (!start || !end) {
        return false
    }
    const [startDatePart, startTimePart] = start.split('T')
    const [endDatePart, endTimePart] = end.split('T')
    if (!startDatePart || !startTimePart || !endDatePart || !endTimePart) {
        return false
    }
    if (!startTimePart.startsWith('00:00') || !endTimePart.startsWith('00:00')) {
        return false
    }
    const nextDay = shiftIsoDateByDays(startDatePart, 1)
    return nextDay !== null && nextDay === endDatePart
}

const formatDateAndTimeForBackend = (dateValue?: string, timeValue?: string) => {
    const date = (dateValue ?? '').trim()
    const time = (timeValue ?? '').trim()

    if (!date && !time) {
        return null
    }
    if (!date) {
        return formatDateTimeForBackend(time)
    }
    if (!time) {
        return formatDateTimeForBackend(`${date}T00:00`)
    }
    return formatDateTimeForBackend(`${date}T${time}`)
}

const pickBoundaryDateTime = (values: Array<string | null | undefined>, boundary: 'earliest' | 'latest') => {
    const normalized = values
        .map((value) => {
            if (!value) {
                return null
            }
            const parsed = new Date(value)
            if (Number.isNaN(parsed.getTime())) {
                return null
            }
            return { value, timestamp: parsed.getTime() }
        })
        .filter((entry): entry is { value: string; timestamp: number } => entry !== null)

    if (normalized.length === 0) {
        return undefined
    }

    const selected = normalized.reduce((current, candidate) => {
        if (boundary === 'earliest') {
            return candidate.timestamp < current.timestamp ? candidate : current
        }
        return candidate.timestamp > current.timestamp ? candidate : current
    })

    return selected.value
}

const extractTimeRange = (value: string) => {
    const segments = value
        .split('-')
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0)

    return {
        startTime: segments.length >= 1 ? segments[0] : '',
        endTime: segments.length >= 2 ? segments[1] : '',
    }
}

const cloneDoorSignForm = (form: DoorSignForm): DoorSignForm => ({
    ...form,
    people: Array.isArray(form.people) ? form.people.map((person) => ({ ...person })) : [],
})

const cloneEventBoardForm = (form: EventBoardForm): EventBoardForm => ({
    ...form,
    events: Array.isArray(form.events)
        ? form.events.map((event) => ({
            ...event,
            date: typeof event.date === 'string' ? event.date : '',
            endDate:
                typeof event.endDate === 'string'
                    ? event.endDate
                    : typeof event.date === 'string'
                        ? event.date
                        : '',
            allDay: Boolean(event.allDay),
            important: Boolean(event.important),
        }))
        : [],
})

const cloneNoticeBoardForm = (form: NoticeBoardForm): NoticeBoardForm => ({
    ...form,
})

const cloneRoomBookingForm = (form: RoomBookingForm): RoomBookingForm => ({
    ...form,
    entries: Array.isArray(form.entries) ? form.entries.map((entry) => ({ ...entry })) : [],
})

const getIsoDateParts = (value?: string | null) => {
    if (!value) {
        return { date: '', time: '' }
    }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return { date: '', time: '' }
    }
    const pad = (segment: number) => segment.toString().padStart(2, '0')
    return {
        date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
        time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
    }
}

const formatTimeOnly = (value?: string | null) => {
    if (!value) {
        return ''
    }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return ''
    }
    const pad = (segment: number) => segment.toString().padStart(2, '0')
    return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}

const hydrateDoorSignForm = (data: TemplateDisplayDataResponse): DoorSignForm => {
    const roomNumber = typeof data.fields.roomNumber === 'string' ? data.fields.roomNumber : ''
    const footerNote = typeof data.fields.footerNote === 'string' ? data.fields.footerNote : ''
    const normalizedPeople = (data.subItems ?? [])
        .filter((item) => (item.title ?? '').trim().length > 0)
        .slice(0, 3)
        .map((item, index) => ({
            id: index + 1,
            name: (item.title ?? '').trim(),
            status: item.busy ? 'busy' : 'available',
            busyUntil: item.busy && item.end ? item.end : '',
        }))

    return {
        roomNumber,
        footerNote,
        people:
            normalizedPeople.length > 0
                ? normalizedPeople
                : cloneDoorSignForm(defaultDoorSignForm).people,
    }
}

const hydrateEventBoardForm = (data: TemplateDisplayDataResponse): EventBoardForm => {
    const events = (data.subItems ?? []).map((item, index) => {
        const dateSource = item.start ?? item.end ?? data.eventStart
        const { date } = getIsoDateParts(dateSource)
        const { date: endDate } = getIsoDateParts(item.end ?? data.eventEnd ?? dateSource)
        const isAllDay = item.allDay ?? isAllDayRange(item.start, item.end)
        return {
            id: index + 1,
            title: (item.title ?? '').trim(),
            date,
            endDate: endDate || date,
            startTime: formatTimeOnly(item.start),
            endTime: formatTimeOnly(item.end),
            allDay: isAllDay,
            important: Boolean(item.highlighted),
            qrLink: (item.qrCodeUrl ?? '').trim(),
        }
    })

    return {
        title: typeof data.fields.title === 'string' ? data.fields.title : defaultEventBoardForm.title,
        events,
    }
}

const hydrateNoticeBoardForm = (data: TemplateDisplayDataResponse): NoticeBoardForm => ({
    title: typeof data.fields.title === 'string' ? data.fields.title : '',
    body: typeof data.fields.body === 'string' ? data.fields.body : '',
    start: data.eventStart ?? '',
    end: data.eventEnd ?? '',
    qrContent: typeof data.fields.qrContent === 'string' ? data.fields.qrContent : undefined,
})

const hydrateRoomBookingForm = (data: TemplateDisplayDataResponse): RoomBookingForm => {
    const entries = (data.subItems ?? []).map((item, index) => {
        const isAllDay = Boolean(item.allDay)
        const startTime = isAllDay ? '' : formatTimeOnly(item.start)
        const endTime = isAllDay ? '' : formatTimeOnly(item.end)
        return {
            id: index + 1,
            title: (item.title ?? '').trim(),
            startTime,
            endTime,
            allDay: isAllDay,
        }
    })

    return {
        roomNumber: typeof data.fields.roomNumber === 'string' ? data.fields.roomNumber : '',
        roomType: typeof data.fields.roomType === 'string' ? data.fields.roomType : '',
        entries: entries.length > 0 ? entries : cloneRoomBookingForm(defaultRoomBookingForm).entries,
    }
}

const buildDoorSignPayload = (form: DoorSignForm): DisplayContentPayload => {
    const peopleSource = Array.isArray(form.people) ? form.people : []
    const subItems: NonNullable<TemplateDisplayDataRequest['subItems']>[number][] = []

    peopleSource.forEach((person) => {
        const name = (person.name ?? '').trim()
        if (!name) {
            return
        }

        const busyEndRaw = person.status === 'busy' ? formatDateTimeForBackend(person.busyUntil) : null
        let isBusy = person.status === 'busy'

        if (isBusy && busyEndRaw) {
            const busyEndDate = new Date(busyEndRaw)
            if (!Number.isNaN(busyEndDate.getTime()) && busyEndDate.getTime() <= Date.now()) {
                isBusy = false
            }
        }

        subItems.push({
            title: name,
            start: null,
            end: isBusy ? busyEndRaw : null,
            highlighted: isBusy,
            busy: isBusy,
        })
    })

    return {
        fields: {
            roomNumber: (form.roomNumber ?? '').trim(),
            footerNote: (form.footerNote ?? '').trim(),
        },
        subItems: subItems.length > 0 ? subItems : undefined,
        eventEnd: null,
    }
}

const buildEventBoardPayload = (form: EventBoardForm): DisplayContentPayload => {
    const eventsSource = Array.isArray(form.events) ? form.events : []
    const subItems: NonNullable<TemplateDisplayDataRequest['subItems']>[number][] = []

    eventsSource.forEach((event) => {
        const title = (event.title ?? '').trim()
        const date = (event.date ?? '').trim()
        const endDateValue = (event.endDate ?? '').trim()
        const startTime = (event.startTime ?? '').trim()
        const endTime = (event.endTime ?? '').trim()
        const qrLink = (event.qrLink ?? '').trim()
        const isAllDay = Boolean(event.allDay)
        const normalizedEndDate = endDateValue && date && endDateValue >= date ? endDateValue : date
        const start = formatDateAndTimeForBackend(date, startTime)
        let end = formatDateAndTimeForBackend(normalizedEndDate, endTime)

        if (isAllDay && normalizedEndDate) {
            const nextDay = shiftIsoDateByDays(normalizedEndDate, 1)
            if (nextDay) {
                end = formatDateAndTimeForBackend(nextDay, undefined)
            }
        }

        if (!title && !date && !startTime && !endTime && !qrLink && !event.allDay) {
            return
        }

        subItems.push({
            title: title || null,
            start: start ?? null,
            end: end ?? null,
            qrCodeUrl: qrLink || undefined,
            highlighted: event.important || undefined,
            allDay: isAllDay || undefined,
        })
    })

    return {
        fields: {
            title: (form.title ?? '').trim(),
        },
        subItems: subItems.length > 0 ? subItems : undefined,
    }
}

const buildNoticeBoardPayload = (form: NoticeBoardForm): DisplayContentPayload => {
    const start = formatDateTimeForBackend(form.start)
    const end = formatDateTimeForBackend(form.end)

    return {
        fields: {
            title: (form.title ?? '').trim(),
            body: (form.body ?? '').trim(),
            qrContent: (form.qrContent ?? '').trim(),
        },
        eventStart: start === null ? null : start ?? undefined,
        eventEnd: end === null ? null : end ?? undefined,
    }
}

const buildRoomBookingPayload = (form: RoomBookingForm): DisplayContentPayload => {
    const entriesSource = Array.isArray(form.entries) ? form.entries : []
    const subItems: NonNullable<TemplateDisplayDataRequest['subItems']>[number][] = []

    entriesSource.forEach((entry) => {
        const title = (entry.title ?? '').trim()
        const allDay = Boolean(entry.allDay)
        let startTime = (entry.startTime ?? '').trim()
        let endTime = (entry.endTime ?? '').trim()

        if (!startTime && !endTime && typeof entry.time === 'string') {
            const { startTime: parsedStart, endTime: parsedEnd } = extractTimeRange(entry.time)
            startTime = parsedStart
            endTime = parsedEnd
        }

        if (!title && !startTime && !endTime && !allDay) {
            return
        }

        const start = allDay ? null : formatDateTimeForBackend(startTime)
        const end = allDay ? null : formatDateTimeForBackend(endTime)
        const shouldHighlight = subItems.length === 0

        subItems.push({
            title: title || null,
            start: start ?? null,
            end: end ?? null,
            highlighted: shouldHighlight,
            allDay,
        })
    })

    const startBoundary = pickBoundaryDateTime(subItems.map((item) => item.start), 'earliest')
    const endBoundary = pickBoundaryDateTime(subItems.map((item) => item.end), 'latest')

    const payload: DisplayContentPayload = {
        fields: {
            roomNumber: (form.roomNumber ?? '').trim(),
            roomType: (form.roomType ?? '').trim(),
        },
        subItems: subItems.length > 0 ? subItems : undefined,
    }

    if (startBoundary !== undefined) {
        payload.eventStart = startBoundary
    }

    if (endBoundary !== undefined) {
        payload.eventEnd = endBoundary
    }

    return payload
}

const buildDisplayContent = (displayType: DisplayTypeKey, forms: DisplayPayloadForms): DisplayContentPayload => {
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
        return {
            fields: {},
        }
    }
}

const buildDisplayRequest = (
    displayType: DisplayTypeKey,
    displayMac: string,
    forms: DisplayPayloadForms,
): TemplateDisplayDataRequest => {
    const content = buildDisplayContent(displayType, forms)
    const defaultStart = toLocalDateTimeString(new Date())
    const eventStart = content.eventStart === undefined ? defaultStart : content.eventStart
    const eventEnd = content.eventEnd === undefined ? null : content.eventEnd

    const request: TemplateDisplayDataRequest = {
        templateType: displayType,
        displayMac,
        eventStart,
        eventEnd,
        fields: content.fields,
    }

    if (content.subItems) {
        request.subItems = content.subItems
    }

    return request
}

const resolveTemplateLabel = (type: DisplayTypeKey, templateTypes: TemplateTypeDefinition[]) =>
    templateTypes.find((option) => option.key === type)?.label
    ?? fallbackTemplateTypes.find((option) => option.key === type)?.label
    ?? type

const resolvePreviewSize = (type: DisplayTypeKey, templateTypes: TemplateTypeDefinition[]) => {
    const fallbackSize = fallbackPreviewDimensions[type] ?? fallbackPreviewDimensions['door-sign']
    const selectedType = templateTypes.find((option) => option.key === type)
    return {
        width: selectedType?.displayWidth ?? fallbackSize.width,
        height: selectedType?.displayHeight ?? fallbackSize.height,
    }
}

const toLocalDateTimeString = (date: Date) => {
    const pad = (value: number) => value.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
        date.getMinutes(),
    )}:${pad(date.getSeconds())}`
}

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60 * 1000)

//Funktion zum Testen des Datentransfers zwischen Frontend und Backend API (Bitte entfernen im Finalen Design)

const buildTestDisplayDataPayload = (displayType: DisplayTypeKey, mac: string): TemplateDisplayDataRequest => {
    const now = new Date()
    const inOneMinute = addMinutes(now, 1)
    const inThirty = addMinutes(now, 30)
    const inSixty = addMinutes(now, 60)
    const inNinety = addMinutes(now, 90)
    const inTwoHours = addMinutes(now, 120)
    const inFourHours = addMinutes(now, 240)

    switch (displayType) {
    case 'door-sign':
        return {
            templateType: displayType,
            displayMac: mac,
            fields: {
                roomNumber: 'A-101',
                footerNote: 'Ansprechpartner: Hochschuljobbörse',
            },
            subItems: [
                {
                    title: 'Anna Schneider',
                    start: null,
                    end: null,
                    highlighted: false,
                    busy: false,
                },
                {
                    title: 'Ben Maier',
                    start: toLocalDateTimeString(now),
                    end: toLocalDateTimeString(inTwoHours),
                    highlighted: true,
                    busy: true,
                },
            ],
        }
    case 'event-board':
        return {
            templateType: displayType,
            displayMac: mac,
            eventStart: toLocalDateTimeString(now),
            eventEnd: toLocalDateTimeString(inFourHours),
            fields: {
                title: 'Heute im OHM',
                description: 'Anstehende Veranstaltungen',
            },
            subItems: [
                {
                    title: 'Infoveranstaltung KI',
                    start: toLocalDateTimeString(now),
                    end: toLocalDateTimeString(inOneMinute),
                    qrCodeUrl: 'https://ohm.example/events/ki',
                },
                {
                    title: 'Laborführung',
                    start: toLocalDateTimeString(inSixty),
                    end: toLocalDateTimeString(inTwoHours),
                    qrCodeUrl: 'https://ohm.example/events/labor',
                },
            ],
        }
    case 'notice-board':
        return {
            templateType: displayType,
            displayMac: mac,
            eventStart: toLocalDateTimeString(now),
            eventEnd: toLocalDateTimeString(inOneMinute),
            fields: {
                title: 'Wartungsarbeiten',
                body: 'Am Campus finden zwischen 14:00 und 16:00 Uhr Wartungsarbeiten statt.',
                qrContent: 'https://ohm.example/notice/details',
            },
        }
    case 'room-booking':
        return {
            templateType: displayType,
            displayMac: mac,
            fields: {
                roomNumber: 'R2.042',
                roomType: 'Besprechungsraum',
            },
            subItems: [
                {
                    title: 'Projektmeeting',
                    start: toLocalDateTimeString(now),
                    end: toLocalDateTimeString(inThirty),
                    highlighted: true,
                },
                {
                    title: 'Sprint Planning',
                    start: toLocalDateTimeString(inThirty),
                    end: toLocalDateTimeString(inNinety),
                    highlighted: false,
                },
            ],
        }
    default:
        return {
            templateType: displayType,
            displayMac: mac,
            fields: {},
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function EventsPageContent() {
    const searchParams = useSearchParams()
    const preselectedMac = searchParams.get('display_mac')
    const preselectedType = searchParams.get('display_type') as DisplayTypeKey

    const isValidType = displayTypeOptions.some(opt => opt.value === preselectedType)
    const initialDisplayType = isValidType ? preselectedType : 'door-sign'
    const backendApiUrl = getBackendApiUrl()
    const [displayType, setDisplayType] = useState<DisplayTypeKey>(initialDisplayType)

    const [doorSignForm, setDoorSignForm] = useState<DoorSignForm>(() => cloneDoorSignForm(defaultDoorSignForm))
    const [eventBoardForm, setEventBoardForm] = useState<EventBoardForm>(() => cloneEventBoardForm(defaultEventBoardForm))
    const [noticeBoardForm, setNoticeBoardForm] = useState<NoticeBoardForm>(() => cloneNoticeBoardForm(defaultNoticeBoardForm))
    const [roomBookingForm, setRoomBookingForm] = useState<RoomBookingForm>(() => cloneRoomBookingForm(defaultRoomBookingForm))

    const [isPersonDialogOpen, setIsPersonDialogOpen] = useState<boolean>(false)
    const [personDraft, setPersonDraft] = useState<DoorSignPerson | null>(null)
    const [isEventCalendarOpen, setIsEventCalendarOpen] = useState<boolean>(false)
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState<boolean>(false)
    const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null)
    const [isTemplateEditDialogOpen, setIsTemplateEditDialogOpen] = useState<boolean>(false)
    const [isTemplateCreateDialogOpen, setIsTemplateCreateDialogOpen] = useState<boolean>(false)
    const [templateEditorContent, setTemplateEditorContent] = useState<string>('')
    const [templateCreatorContent, setTemplateCreatorContent] = useState<string>('')
    const [isSendInProgress, setIsSendInProgress] = useState<boolean>(false)
    const [isTestSendInProgress, setIsTestSendInProgress] = useState<boolean>(false)
    const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [isDisplayDataLoading, setIsDisplayDataLoading] = useState<boolean>(false)
    const [displayDataLoadError, setDisplayDataLoadError] = useState<string | null>(null)
    const { templateTypes, isLoadingTemplateTypes, templateTypeError } = useTemplateTypes()

    const previewSize = useMemo(
        () => resolvePreviewSize(displayType, templateTypes),
        [displayType, templateTypes],
    )
    const {
        filteredDisplays,
        selectedDisplay,
        setSelectedDisplay,
        isLoadingDisplays,
        displayError,
    } = useDisplaySelection(displayType, previewSize)

    useEffect(() => {
        if (preselectedMac && !selectedDisplay && !isLoadingDisplays) {
            // Only select if the MAC exists in the loaded list
                if (filteredDisplays.some(d => d.macAddress === preselectedMac)) {
                    setSelectedDisplay(preselectedMac)
                }
            }
    }, [preselectedMac, selectedDisplay, isLoadingDisplays, filteredDisplays, setSelectedDisplay])

    const previewSize = previewDimensions[displayType] ?? previewDimensions['door-sign']
    const { containerRef: previewContainerRef, previewScale } = usePreviewScale(previewSize, displayType)

    const resetFormsForDisplayType = (type: DisplayTypeKey) => {
        setDoorSignForm(cloneDoorSignForm(defaultDoorSignForm))
        setEventBoardForm(cloneEventBoardForm(defaultEventBoardForm))
        setNoticeBoardForm(cloneNoticeBoardForm(defaultNoticeBoardForm))
        setRoomBookingForm(cloneRoomBookingForm(defaultRoomBookingForm))
    }

    useEffect(() => {
        if (templateTypes.length === 0) {
            return
        }
        const isKnownType = templateTypes.some((type) => type.key === displayType)
        if (!isKnownType) {
            const fallbackType = templateTypes[0].key as DisplayTypeKey
            setDisplayType(fallbackType)
            resetFormsForDisplayType(fallbackType)
        }
    }, [templateTypes, displayType])

    const applyTemplateDataFromBackend = (data: TemplateDisplayDataResponse, expectedType: DisplayTypeKey) => {
        const nextType = (data.templateType as DisplayTypeKey | undefined) ?? 'door-sign'
        if (nextType !== expectedType) {
            return
        }
        switch (nextType) {
        case 'door-sign':
            setDoorSignForm(hydrateDoorSignForm(data))
            setEventBoardForm(cloneEventBoardForm(defaultEventBoardForm))
            setNoticeBoardForm(cloneNoticeBoardForm(defaultNoticeBoardForm))
            setRoomBookingForm(cloneRoomBookingForm(defaultRoomBookingForm))
            break
        case 'event-board':
            setDoorSignForm(cloneDoorSignForm(defaultDoorSignForm))
            setEventBoardForm(hydrateEventBoardForm(data))
            setNoticeBoardForm(cloneNoticeBoardForm(defaultNoticeBoardForm))
            setRoomBookingForm(cloneRoomBookingForm(defaultRoomBookingForm))
            break
        case 'notice-board':
            setDoorSignForm(cloneDoorSignForm(defaultDoorSignForm))
            setEventBoardForm(cloneEventBoardForm(defaultEventBoardForm))
            setNoticeBoardForm(hydrateNoticeBoardForm(data))
            setRoomBookingForm(cloneRoomBookingForm(defaultRoomBookingForm))
            break
        case 'room-booking':
            setDoorSignForm(cloneDoorSignForm(defaultDoorSignForm))
            setEventBoardForm(cloneEventBoardForm(defaultEventBoardForm))
            setNoticeBoardForm(cloneNoticeBoardForm(defaultNoticeBoardForm))
            setRoomBookingForm(hydrateRoomBookingForm(data))
            break
        default:
            setDoorSignForm(cloneDoorSignForm(defaultDoorSignForm))
            setEventBoardForm(cloneEventBoardForm(defaultEventBoardForm))
            setNoticeBoardForm(cloneNoticeBoardForm(defaultNoticeBoardForm))
            setRoomBookingForm(cloneRoomBookingForm(defaultRoomBookingForm))
            break
        }
        setDisplayType(nextType)
    }

    useEffect(() => {
        if (!selectedDisplay) {
            return
        }

        const expectedType = displayType
        setIsEventCalendarOpen(false)
        let isCancelled = false
        const controller = new AbortController()

        const fetchActiveDisplayData = async () => {
            setIsDisplayDataLoading(true)
            setDisplayDataLoadError(null)
            try {
                const response = await authFetch(
                    `${backendApiUrl}/oepl/display-data/display/${selectedDisplay}/active`,
                    { signal: controller.signal },
                )

                if (isCancelled) {
                    return
                }

                if (response.status === 204) {
                    return
                }

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(errorText || `HTTP ${response.status}`)
                }

                const payload = (await response.json()) as TemplateDisplayDataResponse
                if (!isCancelled) {
                    applyTemplateDataFromBackend(payload, expectedType)
                }
            } catch (error) {
                if (isCancelled) {
                    return
                }
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
                setDisplayDataLoadError(`Aktive Displaydaten konnten nicht geladen werden: ${message}`)
            } finally {
                if (!isCancelled) {
                    setIsDisplayDataLoading(false)
                }
            }
        }

        fetchActiveDisplayData().catch(console.error)

        return () => {
            isCancelled = true
            controller.abort()
        }
    }, [selectedDisplay, backendApiUrl, displayType])

    const openPersonDialog = (person: DoorSignPerson) => {
        setPersonDraft({ ...person })
        setIsPersonDialogOpen(true)
    }

    const closePersonDialog = () => {
        setIsPersonDialogOpen(false)
        setPersonDraft(null)
    }

    const openEventCalendar = () => setIsEventCalendarOpen(true)
    const closeEventCalendar = () => setIsEventCalendarOpen(false)

    const openBookingDialog = (entry: BookingEntry) => {
        const isAllDay = Boolean(entry.allDay)
        let startTime = (entry.startTime ?? '').trim()
        let endTime = (entry.endTime ?? '').trim()
        if (!startTime && !endTime && typeof entry.time === 'string') {
            const parts = entry.time
                .split('-')
                .map((part) => part.trim())
                .filter((part) => part.length > 0)
            startTime = parts.length >= 1 ? parts[0] : ''
            endTime = parts.length >= 2 ? parts[1] : ''
        }
        if (isAllDay) {
            startTime = ''
            endTime = ''
        }
        setBookingDraft({
            id: entry.id,
            title: entry.title,
            startTime,
            endTime,
            allDay: isAllDay,
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

    const upsertEventBoardEvent = (nextEvent: EventBoardEvent) => {
        setEventBoardForm((prev) => {
            const exists = prev.events.some((event) => event.id === nextEvent.id)
            const updatedEvents = exists
                ? prev.events.map((event) => (event.id === nextEvent.id ? nextEvent : event))
                : [...prev.events, nextEvent]
            return {
                ...prev,
                events: updatedEvents,
            }
        })
    }

    const removeEventBoardEvent = (eventId: number) => {
        setEventBoardForm((prev) => ({
            ...prev,
            events: prev.events.filter((event) => event.id !== eventId),
        }))
    }

    const addBookingEntry = () => {
        let createdEntry: BookingEntry | null = null
        setRoomBookingForm((prev) => {
            if (prev.entries.length >= 4) {
                return prev
            }
            const nextId = prev.entries.length === 0 ? 1 : Math.max(...prev.entries.map((entry) => entry.id)) + 1
            createdEntry = { id: nextId, title: '', startTime: '', endTime: '', allDay: false }
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

    const saveBookingDialog = () => {
        if (!bookingDraft) {
            return
        }
        const start = bookingDraft.allDay ? '' : bookingDraft.startTime.trim()
        const end = bookingDraft.allDay ? '' : bookingDraft.endTime.trim()
        const timeLabel = bookingDraft.allDay
            ? 'Ganztägig'
            : start && end
                ? `${start} - ${end}`
                : start || end
        setRoomBookingForm((prev) => ({
            ...prev,
            entries: prev.entries.map((entry) =>
                entry.id === bookingDraft.id
                    ? {
                        ...entry,
                        title: bookingDraft.title,
                        startTime: start,
                        endTime: end,
                        allDay: bookingDraft.allDay,
                        time: timeLabel ?? '',
                    }
                    : entry,
            ),
        }))
        closeBookingDialog()
    }

    const handleSendToDisplay = async () => {
        setSendFeedback(null)
        setIsSendInProgress(true)
        const normalizedDisplayMac = typeof selectedDisplay === 'string' ? selectedDisplay.trim() : ''
        const targetDisplayMac = normalizedDisplayMac.length > 0 ? normalizedDisplayMac : TEST_DISPLAY_MAC
        const usingDummyDisplay = normalizedDisplayMac.length === 0
        const payload = buildDisplayRequest(displayType, targetDisplayMac, {
            doorSignForm,
            eventBoardForm,
            noticeBoardForm,
            roomBookingForm,
        })

        try {
            const response = await authFetch(`${backendApiUrl}/oepl/display-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorText = await response.text()
                const description = errorText.trim() || `HTTP ${response.status}`
                throw new Error(description)
            }

            setSendFeedback({
                type: 'success',
                message: usingDummyDisplay
                    ? `Das Event wurde erfolgreich an das Dummy-Display (${targetDisplayMac}) gesendet.`
                    : 'Das Event wurde erfolgreich an das Display gesendet.',
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
            setSendFeedback({
                type: 'error',
                message: usingDummyDisplay
                    ? `Fehler beim Senden an das Dummy-Display (${targetDisplayMac}): ${message}`
                    : `Fehler beim Senden an das Display: ${message}`,
            })
        } finally {
            setIsSendInProgress(false)
        }
    }

    //Funktion zum Testen des Datentransfers zwischen Frontend und Backend API (Bitte entfernen im Finalen Design)

    const handleSendTestData = async () => {
        const mac = TEST_DISPLAY_MAC
        const usingDummyDisplay = true

        const payload = buildTestDisplayDataPayload(displayType, mac)
        setSendFeedback(null)
        setIsTestSendInProgress(true)

        try {
            const response = await authFetch(`${backendApiUrl}/oepl/display-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || `HTTP ${response.status}`)
            }

            const baseMessage = 'Testdaten wurden erfolgreich an das Backend gesendet.'
            setSendFeedback({
                type: 'success',
                message: usingDummyDisplay ? `${baseMessage} (Dummy-Display ${mac} verwendet.)` : baseMessage,
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
            setSendFeedback({
                type: 'error',
                message: usingDummyDisplay
                    ? `Fehler beim Senden der Testdaten (Dummy-Display): ${message}`
                    : `Fehler beim Senden der Testdaten: ${message}`,
            })
        } finally {
            setIsTestSendInProgress(false)
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleDisplaySelectChange = (value: string | undefined) => {
        if (typeof value === 'string') {
            setSelectedDisplay(value)
        }
    }

    const handleDisplayTypeChange = (value: string | undefined) => {
        if (typeof value === 'string') {
            const nextType = value as DisplayTypeKey
            setDisplayType(nextType)
            resetFormsForDisplayType(nextType)
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
                    onOpenCalendar={openEventCalendar}
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
            return (
                <div className={'rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800'}>
                    Für diesen Template Typen ist noch kein Formular verfügbar.
                </div>
            )
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
                                        onChange={handleDisplayTypeChange}
                                        disabled={templateTypes.length === 0}>
                                    {templateTypes.map((option) => (
                                        <Option key={option.key} value={option.key}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {templateTypeError && (
                            <div className={'rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'}>
                                {templateTypeError}
                            </div>
                        )}

                        {displayError && (
                            <div className={'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'}>
                                {displayError}
                            </div>
                        )}

                        {isDisplayDataLoading && (
                            <div className={'rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'}>
                                Aktive Displaydaten werden geladen...
                            </div>
                        )}

                        {displayDataLoadError && (
                            <div className={'rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'}>
                                {displayDataLoadError}
                            </div>
                        )}

                        {renderFormFields()}
                    </CardBody>
                </Card>

                <Card className={'w-full max-w-full border border-blue-gray-100 shadow-sm'}>
                    <CardBody className={'space-y-6 p-4 sm:p-6'}>
                        <div className={'flex flex-col gap-1 text-left text-xs uppercase tracking-wide text-red-700 sm:flex-row sm:items-center sm:justify-between'}>
                            <span>Live-Vorschau</span>
                            <span className={'font-semibold sm:text-right'}>{resolveTemplateLabel(displayType, templateTypes)}</span>
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
                                <Button
                                    variant={'outlined'}
                                    color={'green'}
                                    className={'normal-case w-full xl:w-auto'}
                                    disabled={isTestSendInProgress || isLoadingDisplays}
                                    onClick={handleSendTestData}
                                >
                                    {isTestSendInProgress ? 'Test wird gesendet...' : 'Testdaten an Backend senden'}
                                </Button>
                            </div>
                            <Button
                                variant={'filled'}
                                color={'green'}
                                className={'normal-case w-full xl:w-auto'}
                                disabled={isSendInProgress || isLoadingDisplays}
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
                description={`Bearbeiten Sie den Beispielcode für ${resolveTemplateLabel(displayType, templateTypes)}.`}
                value={templateEditorContent}
                onChange={setTemplateEditorContent}
                onClose={closeTemplateEditDialog}
                onConfirm={closeTemplateEditDialog}
            />

            <TemplateCodeDialog
                open={isTemplateCreateDialogOpen}
                title={'Template erstellen'}
                description={`Erstellen Sie ein neues Template für ${resolveTemplateLabel(displayType, templateTypes)}.`}
                value={templateCreatorContent}
                onChange={setTemplateCreatorContent}
                onClose={closeTemplateCreateDialog}
                onConfirm={closeTemplateCreateDialog}
            />

            <EventBoardCalendarDialog
                open={isEventCalendarOpen}
                events={eventBoardForm.events}
                onClose={closeEventCalendar}
                onSaveEvent={upsertEventBoardEvent}
                onDeleteEvent={removeEventBoardEvent}
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
