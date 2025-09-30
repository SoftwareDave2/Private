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

export const templateSamples: Record<DisplayTypeKey, string> = {
    'door-sign': `<!-- Türschild Template -->
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
    'event-board': `<!-- Ereignistafel Template -->
<section class="event-board">
  <h1>{{ title }}</h1>
  <article v-for="event in events">
    <h2>{{ event.title }}</h2>
    <p>{{ event.date }} · {{ event.time }}</p>
  </article>
</section>`,
    'notice-board': `<!-- Hinweis-Template -->
<section class="notice-board">
  <header>
    <h1>{{ title }}</h1>
    <time>{{ start }} – {{ end }}</time>
  </header>
  <p>{{ body }}</p>
</section>`,
    'room-booking': `<!-- Raumbuchung Template -->
<section class="room-booking">
  <header>
    <h1>{{ roomNumber }}</h1>
    <span>{{ roomType }}</span>
  </header>
  <ul>
    <li v-for="entry in entries">
      <strong>{{ entry.time }}</strong> – {{ entry.title }}
    </li>
  </ul>
</section>`,
}

export const previewDimensions: Record<DisplayTypeKey, { width: number; height: number }> = {
    'door-sign': { width: 400, height: 300 },
    'event-board': { width: 400, height: 300 },
    'notice-board': { width: 296, height: 128 },
    'room-booking': { width: 400, height: 300 },
}
