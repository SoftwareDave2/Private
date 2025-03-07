import {DisplayData} from "@/types/displayData";
import {Checkbox} from "@material-tailwind/react";
import React from "react";

type DisplayStatusInfosProps = {
    displayData: DisplayData,
}

export default function DisplayStatusInfos({displayData}: DisplayStatusInfosProps) {


    function to_timestring(dateformat: string){
        let date_formatted = dateformat ?
            new Date(dateformat).toLocaleString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(',', '') + " Uhr"
            : "Zeitpunkt unbekannt";
        return date_formatted;
    }






    return (
        <div>
            <div className={'flex justify-between gap-7'}>
                <span>Laufend seit:</span>
                <span className={'font-bold'}>{to_timestring(displayData.runningSince) || "unbekannt"}</span>
            </div>
            <div className={'flex justify-between gap-7'}>
                <span>Aufweckzeitpunkt:</span>

                <span className={'font-bold'}>{to_timestring(displayData.wakeTime)}</span>

            </div>
            <div className={'flex justify-between gap-7'}>
                <span>Nächstes Event:</span>
                <span className={'font-bold'}>{to_timestring(displayData.nextEventTime) || "unbekannt"}</span>
            </div>
            <div className={'flex justify-between gap-7'}>
                <span> Akkustand: </span>
                <span className={'font-bold'}>{displayData.battery_percentage + "% am " + to_timestring(displayData.timeOfBattery)}</span>
            </div>
            {/*displayData.error != null && displayData.error != ""  && (
                <div className={'flex justify-between gap-7'}>
                    <span> Error: </span>
                    <span
                        className={'font-bold text-red-500'}>{displayData.error}</span>
                </div>
            )*/}
            {displayData.errors && displayData.errors.length > 0 && (
                <div>
                    {displayData.errors.map((err, index) => (
                        <div key={index} className="flex justify-between gap-7">
                            <span>Error:</span>
                            <span className="font-bold text-red-500">{err.errorMessage}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}