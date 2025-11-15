import {DisplayData} from '@/types/displayData'
import {Clock, Calendar, Battery, AlertTriangle, Zap} from 'lucide-react'

type DisplayStatusInfosProps = {
    displayData: DisplayData
}

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return 'Zeitpunkt unbekannt'
    }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return 'Zeitpunkt unbekannt'
    }
    return `${parsed.toLocaleDateString('de-DE')} ${parsed.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    })} Uhr`
}

export default function DisplayStatusInfos({displayData}: DisplayStatusInfosProps) {
    const statusItems = [
        {
            icon: Clock,
            label: 'Laufend seit',
            value: formatDateTime(displayData.runningSince),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            icon: Zap,
            label: 'Aufweckzeitpunkt',
            value: formatDateTime(displayData.wakeTime),
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
        },
        {
            icon: Calendar,
            label: 'Nächstes Event',
            value: formatDateTime(displayData.nextEventTime),
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            icon: Battery,
            label: 'Akkustand',
            value: `${displayData.battery_percentage}% · ${formatDateTime(displayData.timeOfBattery)}`,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
    ]

    return (
        <div className="space-y-4">
            {/* Status Cards */}
            <div className="grid gap-3">
                {statusItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <div
                            key={item.label}
                            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`rounded-lg p-2 ${item.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${item.color}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {item.label}
                                    </dt>
                                    <dd className="mt-1 text-sm font-bold text-slate-900">{item.value}</dd>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Error Section */}
            {displayData.errors && displayData.errors.length > 0 && (
                <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-red-100 p-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-red-700">Fehler erkannt</h4>
                            <ul className="mt-2 space-y-2">
                                {displayData.errors.map((err, index) => (
                                    <li
                                        key={`${err.errorCode}-${index}`}
                                        className="flex items-start gap-2 text-sm text-red-800"
                                    >
                                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-600"></span>
                                        <span className="leading-relaxed">{err.errorMessage}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
