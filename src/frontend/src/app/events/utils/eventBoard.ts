import {EventBoardEvent} from '../types'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const pad = (value: number) => value.toString().padStart(2, '0')

const parseDateParts = (value: string | undefined | null) => {
    if (!value) {
        return null
    }
    const trimmed = value.trim()
    if (!trimmed) {
        return null
    }
    const segments = trimmed.split('-')
    if (segments.length !== 3) {
        return null
    }
    const [yearStr, monthStr, dayStr] = segments
    const year = Number.parseInt(yearStr, 10)
    const month = Number.parseInt(monthStr, 10)
    const day = Number.parseInt(dayStr, 10)
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return null
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null
    }
    return { year, month, day }
}

const parseTimeParts = (value: string | undefined | null) => {
    if (!value) {
        return null
    }
    const trimmed = value.trim()
    if (!trimmed) {
        return null
    }
    const segments = trimmed.split(':')
    if (segments.length < 2) {
        return null
    }
    const [hoursStr, minutesStr] = segments
    const hours = Number.parseInt(hoursStr, 10)
    const minutes = Number.parseInt(minutesStr, 10)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null
    }
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null
    }
    return { hours, minutes }
}

export const toIsoLocalString = (date: Date) => {
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export const getEventStartDateTime = (event: EventBoardEvent): Date | null => {
    const dateParts = parseDateParts(event.date)
    if (!dateParts) {
        return null
    }
    const timeParts = parseTimeParts(event.time) ?? { hours: 0, minutes: 0 }
    return new Date(dateParts.year, dateParts.month - 1, dateParts.day, timeParts.hours, timeParts.minutes, 0, 0)
}

export const getEventDisplayEndDateTime = (event: EventBoardEvent): Date | null => {
    const start = getEventStartDateTime(event)
    if (!start) {
        return null
    }
    return new Date(start.getTime() + DAY_IN_MS)
}

export const isEventUpcoming = (event: EventBoardEvent, reference: Date = new Date()) => {
    const end = getEventDisplayEndDateTime(event)
    if (!end) {
        return true
    }
    return end.getTime() >= reference.getTime()
}

export const isEventPast = (event: EventBoardEvent, reference: Date = new Date()) => !isEventUpcoming(event, reference)

const getStartTimestamp = (event: EventBoardEvent) => {
    const start = getEventStartDateTime(event)
    if (!start) {
        return Number.POSITIVE_INFINITY
    }
    return start.getTime()
}

export const sortEventsBySchedule = (events: EventBoardEvent[]) =>
    [...events].sort((a, b) => {
        const diff = getStartTimestamp(a) - getStartTimestamp(b)
        if (diff === 0) {
            return (a.id ?? 0) - (b.id ?? 0)
        }
        return diff
    })

export const EVENT_BOARD_DISPLAY_LIMIT = 4

export const getUpcomingEvents = (
    events: EventBoardEvent[],
    limit: number = EVENT_BOARD_DISPLAY_LIMIT,
    reference: Date = new Date(),
) => {
    const sorted = sortEventsBySchedule(events)
    const filtered = sorted.filter((event) => {
        const hasSchedule = getEventStartDateTime(event)
        if (!hasSchedule) {
            return false
        }
        return isEventUpcoming(event, reference)
    })
    if (limit <= 0) {
        return filtered
    }
    return filtered.slice(0, limit)
}

export const getNextUpcomingEvent = (events: EventBoardEvent[], reference: Date = new Date()) => {
    const [next] = getUpcomingEvents(events, 1, reference)
    return next ?? null
}

export const normalizeEvent = (event: EventBoardEvent): EventBoardEvent => ({
    id: event.id,
    title: (event.title ?? '').trim(),
    date: event.date ?? '',
    time: event.time ?? '',
    qrLink: (event.qrLink ?? '').trim(),
})

export const createTemplateSubItem = (event: EventBoardEvent) => {
    const start = getEventStartDateTime(event)
    const end = getEventDisplayEndDateTime(event)
    const title = (event.title ?? '').trim()
    const qrLink = (event.qrLink ?? '').trim()

    return {
        title: title || undefined,
        start: start ? toIsoLocalString(start) : undefined,
        end: end ? toIsoLocalString(end) : undefined,
        highlighted: undefined,
        notes: undefined,
        qrCodeUrl: qrLink || undefined,
    }
}
