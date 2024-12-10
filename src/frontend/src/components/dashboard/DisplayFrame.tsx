import styles from './DisplayFrame.module.css'
import {DisplayData} from "@/types/displayData";
import Image from "@/components/shared/Image";

type DisplayFrameProps = {
    displayData: DisplayData,
    clickable?: boolean,
    onClick?: () => void,
}

export default function DisplayFrame({displayData, clickable, onClick}: DisplayFrameProps) {

    const clickHandler = () => {
        if (clickable && onClick) {
            onClick()
        }
    }

    return (
        <div className={`flex flex-col ${clickable ? 'cursor-pointer' : null}`} onClick={clickHandler}>
            <div className={`${styles.frame} border-gray-700 rounded`}>
                <Image filename={displayData.filename} className={`h-full object-fill`} />
            </div>
            <span className={`${styles.name} text-gray-800`}>Display {displayData.id}</span>
        </div>
    )
}