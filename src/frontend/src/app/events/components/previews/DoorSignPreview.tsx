import {DoorSignForm} from '../../types'

type DoorSignPreviewProps = {
    form: DoorSignForm
}

export function DoorSignPreview({ form }: DoorSignPreviewProps) {
    const peopleSource = Array.isArray(form.people) ? form.people : []
    const peopleWithNames = peopleSource.filter((person) => (person.name ?? '').trim().length > 0)
    const hasBusyPerson = peopleSource.some((person) => person.status === 'busy')
    const availabilityLabel = hasBusyPerson ? 'nicht stören' : 'Verfügbar'
    const statusClasses = hasBusyPerson ? 'bg-red-600 text-white border border-red-700' : 'bg-white text-black border border-black'
    const footerNote = typeof form.footerNote === 'string' ? form.footerNote : ''
    const footerContent = footerNote.trim() || 'Raumzuweisung verfügbar unter:'

    const isMinimalState = peopleWithNames.length === 0 && footerNote.trim().length === 0
    const showStatusBadge = peopleWithNames.length > 0

    const emptyAssignmentMessage = (
        <div className={'rounded-md border border-black px-4 py-3 text-center text-sm font-medium'}>
            Raum aktuell unzugeteilt
        </div>
    )

    return (
        <div className={'flex flex-col rounded-xl border-2 border-black bg-white text-black'} style={{ width: 400, height: 300 }}>
                 {hasBusyPerson && (
                   <div className="absolute top-4 left-4 z-10">
                     <div className="inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide bg-red-600 text-white shadow-sm border border-red-700">
                       {availabilityLabel}
                     </div>
                   </div>
                 )}
                 <div className="absolute top-4 right-6 z-10 text-right">
                   <p className="text-5xl font-bold leading-none tracking-tight">{form.roomNumber?.toString() || '—'}</p>
                 </div>
                 <div className="flex flex-1 items-start px-8 pt-20">
                   <div className="w-full max-w-[50%]">
                     {isMinimalState ? (
                       <div className="inline-block rounded border border-black px-2 py-1 text-left text-2xl font-medium">
                         Raum aktuell unzugeteilt
                       </div>
                     ) : (
                       <ul className="space-y-3">
                         {peopleWithNames.map((person) => (
                           <li
                             key={person.id}
                             className={`text-2xl ${person.status === 'busy' ? 'text-red-600 font-semibold' : 'text-black font-normal'}`}
                           >
                             {person.name}
                           </li>
                         ))}
                       </ul>
                     )}
                   </div>
                 </div>
                 <div className="mt-auto">
                   <div className="border-t" style={{ borderTopWidth: 3, borderColor: 'rgba(220,38,38,0.9)' }} /> {/* roter Strich */}
                   <div className="flex items-center justify-between px-6 py-3">
                     <div className="text-sm text-black font-medium">
                       {footerContent ? footerContent : ''}
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="h-14 w-14 rounded-lg border border-black flex items-center justify-center text-[0.6rem] uppercase">
                         QR
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )
           }
