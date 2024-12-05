import styles from './DisplayFrame.module.css'
import {DisplayData} from "@/types/displayData";

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
                <img src={`/uploads/${displayData.filename}`} alt={''} className={`h-full object-fill`}/>
            </div>
            <span className={`${styles.name} text-gray-800`}>Display {displayData.id}</span>
        </div>
    )
}