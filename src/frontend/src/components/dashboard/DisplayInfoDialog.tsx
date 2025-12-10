import {Button, Dialog, DialogHeader, DialogBody, DialogFooter, Tabs, TabsHeader, TabsBody, Tab, TabPanel} from '@material-tailwind/react'
import {useState} from 'react'
import {DisplayData} from '@/types/displayData'
import DisplayFrame from '@/components/dashboard/DisplayFrame'
import DisplayStatusInfos from '@/components/dashboard/DisplayStatusInfos'
import {EditDisplayDialog} from '@/components/dashboard/EditDisplayDialog'
import {getBackendApiUrl} from '@/utils/backendApiUrl'
import {authFetch} from '@/utils/authFetch'
import { QRCodeSVG } from 'qrcode.react'
import {Edit, Calendar, X, Monitor, Cpu, Settings, Info, QrCode, X} from 'lucide-react'

type DisplayInfoDialogProps = {
    open: boolean
    displayData: DisplayData
    onClose: () => void
    onDisplayDataUpdated: () => void
}

export default function DisplayInfoDialog({open, displayData, onClose, onDisplayDataUpdated}: DisplayInfoDialogProps) {
    const backendApiUrl = getBackendApiUrl()

    const [openQrDialog, setOpenQrDialog] = useState(false)

    const [openEditDisplay, setOpenEditDisplay] = useState<boolean>(false)
    const [displayDataForEdit, setDisplayDataForEdit] = useState<DisplayData | null>(null)
    const [activeTab, setActiveTab] = useState('overview')

    const toggleOpenEditDisplayHandler = () => setOpenEditDisplay((prev) => !prev)

    const closeEditDisplayHandler = () => {
        toggleOpenEditDisplayHandler()
        setTimeout(() => setDisplayDataForEdit(null), 400)
    }

    const editDisplayHandler = async () => {
        try {
            const data = await authFetch(backendApiUrl + '/display/all')
            const allDisplays = (await data.json()) as DisplayData[]
            const targetDisplay = allDisplays.find((d) => d.id === displayData.id)
            if (!targetDisplay) {
                console.error('Selected display not found!')
                return
            }

            setDisplayDataForEdit(targetDisplay)
            toggleOpenEditDisplayHandler()
        } catch (err) {
            console.error(err)
        }
    }

    const displayDataUpdated = () => {
        closeEditDisplayHandler()
        onDisplayDataUpdated()
    }

    const qrUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/events?display_mac=${displayData.macAddress}&display_type=${displayData.displayType || 'door-sign'}`
        : ''

         const navigateToCalendar = () => {
                const macAddress = displayData.macAddress
                localStorage.removeItem('selectedMACs')
                localStorage.setItem('selectedMACs', JSON.stringify([macAddress]))
                window.location.href = '/calendar'
            }


    return (
        <>
            <Dialog open={open} handler={onClose} size={'xl'} className="bg-white shadow-2xl">
                {/* Custom Header with Gradient */}
                <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-slate-50 via-white to-red-50 px-6 py-6">
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg">
                                    <Monitor className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {displayData.displayName?.trim() || 'Unbenanntes Display'}
                                    </h2>
                                    <p className="mt-1 font-mono text-sm text-slate-600">{displayData.macAddress}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                                            Online
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {displayData.brand} · {displayData.model}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-red-400/20 to-red-600/20 blur-3xl"></div>
                </div>

                <DialogBody className="px-6 py-6">
                    <Tabs value={activeTab} className="overflow-visible">
                        <TabsHeader
                            className="bg-slate-100/80 p-1"
                            indicatorProps={{
                                className: 'bg-white shadow-md',
                            }}
                        >
                            <Tab value="overview" onClick={() => setActiveTab('overview')} className="text-xs font-semibold">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    <span>Übersicht</span>
                                </div>
                            </Tab>
                            <Tab value="technical" onClick={() => setActiveTab('technical')} className="text-xs font-semibold">
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4" />
                                    <span>Technisch</span>
                                </div>
                            </Tab>
                            <Tab value="settings" onClick={() => setActiveTab('settings')} className="text-xs font-semibold">
                                <div className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    <span>Einstellungen</span>
                                </div>
                            </Tab>
                        </TabsHeader>
                        <TabsBody animate={{
                            initial: {y: 250},
                            mount: {y: 0},
                            unmount: {y: 250},
                        }}>
                            <TabPanel value="overview" className="px-0 pt-6">
                                <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
                                    {/* Display Preview */}
                                    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                                        <div className="aspect-[4/3] overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 shadow-inner">
                                            <img
                                                src={`/uploads/${displayData.filename}`}
                                                alt="Display Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            {[
                                                {label: 'Marke', value: displayData.brand},
                                                {label: 'Modell', value: displayData.model},
                                                {label: 'Auflösung', value: `${displayData.width}×${displayData.height}`},
                                                {label: 'Datei', value: displayData.filename},
                                            ].map((item) => (
                                                <div key={item.label} className="rounded-lg bg-white p-3 text-center shadow-sm">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        {item.label}
                                                    </p>
                                                    <p className="mt-1 truncate text-sm font-bold text-slate-900">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status Info */}
                                    <DisplayStatusInfos displayData={displayData} />
                                </div>
                            </TabPanel>

                            <TabPanel value="technical" className="px-0 pt-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {[
                                        {label: 'Display ID', value: displayData.id},
                                        {label: 'MAC-Adresse', value: displayData.macAddress},
                                        {label: 'Marke', value: displayData.brand},
                                        {label: 'Modell', value: displayData.model},
                                        {label: 'Breite', value: `${displayData.width}px`},
                                        {label: 'Höhe', value: `${displayData.height}px`},
                                        {label: 'Orientierung', value: displayData.orientation},
                                        {label: 'Aktuelle Datei', value: displayData.filename},
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                        >
                                            <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                            <span className="font-mono text-sm font-semibold text-slate-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabPanel>

                            <TabPanel value="settings" className="px-0 pt-6">
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                                        <p className="mt-1 text-xs text-slate-600">
                                            Schnelle Aktionen für dieses Display
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <Button
                                                onClick={editDisplayHandler}
                                                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 capitalize shadow-md shadow-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/40"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span>Display bearbeiten</span>
                                            </Button>
                                            <Button
                                                onClick={navigateToCalendar}
                                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 capitalize shadow-md shadow-blue-600/30 transition-all hover:shadow-lg hover:shadow-blue-600/40"
                                            >
                                                <Calendar className="h-4 w-4" />
                                                <span>Kalender öffnen</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabsBody>
                    </Tabs>

                    {displayDataForEdit && (
                        <EditDisplayDialog
                            open={openEditDisplay}
                            displayData={displayDataForEdit}
                            onClose={closeEditDisplayHandler}
                            onDataUpdated={displayDataUpdated}
                        />
                    )}
                </DialogBody>
<DialogFooter className="border-t border-slate-200 bg-slate-50">
                    <Button variant="text" onClick={onClose} className="capitalize text-slate-700">
                        Schließen
                    </Button>
                </DialogFooter>
            </Dialog>
           <Dialog open={openQrDialog} handler={() => setOpenQrDialog(false)} size="sm" className="bg-white">
               <DialogHeader className="justify-between">
                   <span className="text-xl font-bold text-slate-900">QR Code für {displayData.displayName}</span>
                   <button onClick={() => setOpenQrDialog(false)} className="text-slate-400 hover:text-slate-900">
                       <X className="h-5 w-5" />
                   </button>
               </DialogHeader>
               <DialogBody className="flex flex-col items-center gap-6 py-8">
                   <p className="text-center text-slate-600">
                       Scanne diesen Code, um die Konfiguration<br/> für dieses Display direkt zu öffnen.
                   </p>
                   <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                       <QRCodeSVG
                           value={qrUrl}
                           size={200}
                           level="M"
                           includeMargin={true}
                       />
                   </div>
                   <div className="w-full px-4">
                       <label className="mb-1 block text-xs font-semibold text-slate-500">Ziel-URL</label>
                       <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                           <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-700 font-mono">
                               {qrUrl}
                           </code>
                       </div>
                   </div>
               </DialogBody>
               <DialogFooter>
                   <Button variant="text" onClick={() => setOpenQrDialog(false)} className="capitalize text-slate-700">
                       Schließen
                   </Button>
               </DialogFooter>
           </Dialog>
        </>
    )
}
