import {DisplayData} from '@/types/displayData'
import Image from '@/components/shared/Image'
import {Battery, Monitor, Wifi, AlertCircle, Calendar, Edit} from 'lucide-react'

type DisplayFrameProps = {
    displayData: DisplayData
    clickable?: boolean
    onClick?: () => void
}

const getBatteryColor = (percentage: number) => {
    if (percentage >= 60) return 'text-green-600'
    if (percentage >= 30) return 'text-amber-600'
    return 'text-red-600'
}

const getBatteryBg = (percentage: number) => {
    if (percentage >= 60) return 'bg-green-50 border-green-200'
    if (percentage >= 30) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
}

export default function DisplayFrame({displayData, clickable, onClick}: DisplayFrameProps) {
    const clickHandler = () => {
        if (clickable && onClick) {
            onClick()
        }
    }

    const aspectRatio =
        displayData.width > 0 && displayData.height > 0 ? displayData.width / displayData.height : 16 / 9

    const hasErrors = Array.isArray(displayData.errors) && displayData.errors.length > 0
    const batteryColor = getBatteryColor(displayData.battery_percentage)
    const batteryBg = getBatteryBg(displayData.battery_percentage)

    return (
        <div
            className={`group relative flex w-full max-w-xs flex-col gap-3.5 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-2xl hover:shadow-red-100/50 ${
                clickable ? 'cursor-pointer' : ''
            }`}
            onClick={clickHandler}
        >
            {/* Status Badge - Top Right */}
            <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                {hasErrors ? (
                    <div className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 shadow-sm backdrop-blur-sm">
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Error</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 shadow-sm backdrop-blur-sm">
                        <Wifi className="h-3 w-3 text-green-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Online</span>
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 pt-8">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 flex-shrink-0 text-slate-600" />
                        <h3 className="truncate text-base font-bold text-slate-900">
                            {displayData.displayName?.trim() || 'Unbenanntes Display'}
                        </h3>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {displayData.brand} · {displayData.model}
                    </p>
                </div>
            </div>

            {/* Display Preview */}
            <div className="relative overflow-hidden rounded-xl border-2 border-slate-200/80 bg-slate-100 shadow-inner ring-1 ring-slate-900/5 transition-all duration-300 group-hover:border-red-300 group-hover:shadow-lg" style={{aspectRatio: `${aspectRatio}`}}>
                <Image filename={displayData.filename} className="h-full w-full object-cover" />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-slate-900/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Quick Action Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white active:scale-95">
                            <Edit className="h-3.5 w-3.5" />
                            <span>Bearbeiten</span>
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white active:scale-95">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Kalender</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Battery & Info Section */}
            <div className="flex items-center justify-between gap-3">
                <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${batteryBg}`}>
                    <Battery className={`h-3.5 w-3.5 ${batteryColor}`} />
                    <span className={`text-xs font-bold ${batteryColor}`}>{displayData.battery_percentage}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{displayData.orientation}</span>
                    <span>·</span>
                    <span>
                        {displayData.width}×{displayData.height}
                    </span>
                </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-[10px] text-slate-400">
                <span className="truncate font-mono">{displayData.macAddress}</span>
                <span className="truncate pl-2">{displayData.filename}</span>
            </div>

            {/* Hover Glow Effect */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-red-400/0 via-red-400/0 to-red-400/0 opacity-0 transition-opacity duration-300 group-hover:from-red-400/5 group-hover:via-red-400/0 group-hover:to-red-400/10 group-hover:opacity-100" />
        </div>
    )
}
