import {DisplayData} from "@/types/displayData";

type DisplayStatusInfosProps = {
    displayData: DisplayData,
}

export default function DisplayStatusInfos({displayData}: DisplayStatusInfosProps) {
    return (
        <div>
            <div className={'flex justify-between gap-7'}>
                <span>Laufend seit:</span>
                <span className={'font-bold'}>01.01.1970 00:00 Uhr</span>
            </div>
            <div className={'flex justify-between gap-7'}>
                <span>Letzter Wechsel:</span>
                <span className={'font-bold'}>01.01.1970 00:00 Uhr</span>
            </div>
            <div className={'flex justify-between gap-7'}>
                <span>Nächster Wechsel:</span>
                <span className={'font-bold'}>01.01.1970 00:00 Uhr</span>
            </div>
        </div>
    )
}