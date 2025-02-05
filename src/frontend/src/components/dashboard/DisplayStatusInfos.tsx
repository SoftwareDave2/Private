import {DisplayData} from "@/types/displayData";

type DisplayStatusInfosProps = {
    displayData: DisplayData,
}

export default function DisplayStatusInfos({displayData}: DisplayStatusInfosProps) {



    const formattedDate = displayData.wakeTime ?
        new Date(displayData.wakeTime).toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(',', '') + " Uhr"
        : "Zeitpunkt unbekannt";



    return (
        <div>
            <div className={'flex justify-between gap-7'}>
                <span>Laufend seit:</span>
                <span className={'font-bold'}>01.01.1970 00:00 Uhr</span>
            </div>
            <div className={'flex justify-between gap-7'}>
                <span>Letzter Wechsel:</span>
                <span className={'font-bold'}>{formattedDate}</span>
                {//<span className={'font-bold'}>01.01.1970 00:00 Uhr</span>
                     }
            </div>
            <div className={'flex justify-between gap-7'}>
                <span>Nächster Wechsel:</span>
                <span className={'font-bold'}>01.01.1970 00:00 Uhr</span>
            </div>
        </div>
    )
}