export type EventDetails = {
    title: string;
    date: string;
    start: string;
    end: string;
    allDay: boolean;
    image: string | undefined; // Typ für das Bild (Base64 oder URL)
};