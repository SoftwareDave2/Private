import {
    DisplayTypeKey,
    DoorSignForm,
    DoorSignPersonStatus,
    EventBoardForm,
    NoticeBoardForm,
    RoomBookingForm,
} from './types'

export const displayTypeOptions: { value: DisplayTypeKey; label: string }[] = [
    { value: 'door-sign', label: 'Türschild' },
    { value: 'event-board', label: 'Ereignisse' },
    { value: 'notice-board', label: 'Hinweisschild' },
    { value: 'room-booking', label: 'Raumbuchung' },
]

export const doorSignPersonStatuses: { value: DoorSignPersonStatus; label: string }[] = [
    { value: 'available', label: 'Verfügbar' },
    { value: 'busy', label: 'Beschäftigt' },
]

export const defaultDoorSignForm: DoorSignForm = {
    roomNumber: '',
    people: [
        { id: 1, name: '', status: 'available', busyUntil: '' },
    ],
    footerNote: 'Angestellte/r der Hochschuljobbörse.',
}

export const defaultEventBoardForm: EventBoardForm = {
    title: '',
    description: '',
    events: [
        { id: 1, title: '', date: '', time: '', qrLink: '' },
        { id: 2, title: '', date: '', time: '', qrLink: '' },
    ],
}

export const defaultNoticeBoardForm: NoticeBoardForm = {
    title: '',
    body: '',
    start: '',
    end: '',
}

export const defaultRoomBookingForm: RoomBookingForm = {
    roomNumber: '',
    roomType: 'Besprechungsraum',
    entries: [
        { id: 1, title: '', time: '' },
        { id: 2, title: '', time: '' },
    ],
}
