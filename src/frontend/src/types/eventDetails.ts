export type EventDetails = {
    id: string
    title: string
    allDay: boolean
    start: string
    end: string
    image: string
    rrule?: string;
    display: {
        macAddress: string
    }
};