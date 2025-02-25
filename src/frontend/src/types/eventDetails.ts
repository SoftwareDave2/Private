export type EventDetails = {
    id: number
    groupId: string
    title: string
    allDay: boolean
    start: string
    end: string
    rrule?: string;
    displayImages: EventDisplayDetails[]
    recurrenceType?: "keine" | "täglich" | "wöchentlich",
    recurrenceStartDate?: string,
    recurrenceEndDate?: string,
    recurrenceStartTime?: string,
    recurrenceEndTime?: string,
    recurrenceWeekdays?: number[]
};

export type EventDisplayDetails = {
    displayMac: string
    image: string
}