export type EventDetails = {
    id: number
    title: string
    allDay: boolean
    start: string
    end: string
    rrule?: string;
    displayImages: EventDisplayDetails[]
};

export type EventDisplayDetails = {
    displayMac: string
    image: string
}