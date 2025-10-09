import {DisplayTypeKey, DoorSignForm, EventBoardForm, NoticeBoardForm, RoomBookingForm} from '../../types'

import {DoorSignPreview} from './DoorSignPreview'
import {EventBoardPreview} from './EventBoardPreview'
import {NoticeBoardPreview} from './NoticeBoardPreview'
import {RoomBookingPreview} from './RoomBookingPreview'

type DisplayPreviewProps = {
    displayType: DisplayTypeKey
    doorSignForm: DoorSignForm
    eventBoardForm: EventBoardForm
    noticeBoardForm: NoticeBoardForm
    roomBookingForm: RoomBookingForm
    onRemoveRoomBookingEntry: (entryId: number) => void
}

export function DisplayPreview({
    displayType,
    doorSignForm,
    eventBoardForm,
    noticeBoardForm,
    roomBookingForm,
    onRemoveRoomBookingEntry,
}: DisplayPreviewProps) {
    switch (displayType) {
    case 'door-sign':
        return <DoorSignPreview form={doorSignForm} />
    case 'event-board':
        return <EventBoardPreview form={eventBoardForm} />
    case 'notice-board':
        return <NoticeBoardPreview form={noticeBoardForm} />
    case 'room-booking':
        return <RoomBookingPreview form={roomBookingForm} onRemoveEntry={onRemoveRoomBookingEntry} />
    default:
        return null
    }
}
