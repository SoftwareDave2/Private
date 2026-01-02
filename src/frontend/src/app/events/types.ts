export type DisplayTypeKey =
    | 'door-sign'
    | 'event-board'
    | 'notice-board'
    | 'room-booking'
    | (string & {})

export type TemplateTypeDefinition = {
    key: DisplayTypeKey
    label: string
    displayWidth?: number | null
    displayHeight?: number | null
}

export type DoorSignPersonStatus = 'available' | 'busy'

export type DoorSignPerson = {
    id: number
    name: string
    status: DoorSignPersonStatus
    busyUntil: string
}

export type DoorSignForm = {
    roomNumber: string
    people: DoorSignPerson[]
    footerNote: string
}

export type EventBoardEvent = {
    id: number
    title: string
    date: string
    endDate: string
    startTime: string
    endTime: string
    allDay: boolean
    important: boolean
    qrLink: string
}

export type EventBoardForm = {
    title: string
    events: EventBoardEvent[]
}

export type NoticeBoardForm = {
    title: string
    body: string
    qrContent?: string
    start: string
    end: string
}

export type BookingEntry = {
    id: number
    title: string
    date: string
    endDate: string
    startTime: string
    endTime: string
    allDay: boolean
    time?: string
}

export type RoomBookingForm = {
    roomNumber: string
    roomType: string
    entries: BookingEntry[]
}
