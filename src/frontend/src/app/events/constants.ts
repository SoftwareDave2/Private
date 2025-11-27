import {
    DisplayTypeKey,
    DoorSignForm,
    DoorSignPersonStatus,
    EventBoardForm,
    NoticeBoardForm,
    RoomBookingForm,
    TemplateTypeDefinition,
} from './types'

export const fallbackTemplateTypes: TemplateTypeDefinition[] = [
    { key: 'door-sign', label: 'Tuerschild', displayWidth: 400, displayHeight: 300 },
    { key: 'event-board', label: 'Ereignisse', displayWidth: 400, displayHeight: 300 },
    { key: 'notice-board', label: 'Hinweisschild', displayWidth: 296, displayHeight: 128 },
    { key: 'room-booking', label: 'Raumbuchung', displayWidth: 400, displayHeight: 300 },
]

export const fallbackPreviewDimensions: Record<DisplayTypeKey, { width: number; height: number }> =
    fallbackTemplateTypes.reduce((acc, type) => {
        if (typeof type.displayWidth === 'number' && typeof type.displayHeight === 'number') {
            acc[type.key] = { width: type.displayWidth, height: type.displayHeight }
        }
        return acc
    }, {} as Record<DisplayTypeKey, { width: number; height: number }>)

export const doorSignPersonStatuses: { value: DoorSignPersonStatus; label: string }[] = [
    { value: 'available', label: 'Verfügbar' },
    { value: 'busy', label: 'Beschäftigt' },
]

export const defaultDoorSignForm: DoorSignForm = {
    roomNumber: '',
    people: [{ id: 1, name: '', status: 'available', busyUntil: '' }],
    footerNote: 'Angestellte/r der Hochschuljobbörse.',
}

export const defaultEventBoardForm: EventBoardForm = {
    title: 'Events',
    events: [],
}

export const EVENT_BOARD_PREVIEW_LIMIT = 4

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
        { id: 1, title: '', startTime: '', endTime: '', allDay: false },
    ],
}

export const templateSamples: Record<DisplayTypeKey, string> = {
    'door-sign': `<!-- Door Sign Template -->
<section class="door-sign">
  <header>
    <h1>{{ roomNumber }}</h1>
    <span>{{ status }}</span>
  </header>
  <main>
    <ul>
      <li v-for="person in people">{{ person.name }}</li>
    </ul>
  </main>
</section>`,
    'event-board': `<!-- Event Board Template -->
<section class="event-board">
  <h1>{{ title }}</h1>
  <article v-for="event in events">
    <h2>{{ event.title }}</h2>
    <p>{{ event.date }} - {{ event.time }}</p>
  </article>
</section>`,
    'notice-board': `<!-- Notice Template -->
<section class="notice-board">
  <header>
    <h1>{{ title }}</h1>
    <time>{{ start }} - {{ end }}</time>
  </header>
  <p>{{ body }}</p>
</section>`,
    'room-booking': `<!-- Room Booking Template -->
<section class="room-booking">
  <header>
    <h1>{{ roomNumber }}</h1>
    <span>{{ roomType }}</span>
  </header>
  <ul>
    <li v-for="entry in entries">
      <strong>{{ entry.time }}</strong> - {{ entry.title }}
    </li>
  </ul>
</section>`,
}
