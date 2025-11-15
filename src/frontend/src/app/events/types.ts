export type DisplayTypeKey = 'door-sign' | 'event-board' | 'notice-board' | 'room-booking'

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
