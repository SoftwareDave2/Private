import styles from './DisplayFrame.module.css'
import { DisplayData } from "@/types/displayData";
import Image from "@/components/shared/Image";

type DisplayFrameProps = {
    displayData: DisplayData,
    clickable?: boolean,
    onClick?: () => void,
}

export default function DisplayFrame({ displayData, clickable, onClick }: DisplayFrameProps) {
    const clickHandler = () => {
        if (clickable && onClick) {
            onClick();
        }
    };

    return (
        <div className={`flex flex-col ${clickable ? 'cursor-pointer' : ''}`} onClick={clickHandler}>
            <div className={`${styles.frame} border-gray-700 rounded relative`}>
                <Image internalName={displayData.internalName} className="h-full object-fill" />
                {displayData.errors && displayData.errors.length > 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-500 p-1 rounded-bl">
                        <span className="text-black text-xl font-bold">⚠️</span>
                    </div>
                )}
            </div>
            <div className="flex justify-between w-full">
                <span className={`${styles.name} text-gray-800`}>{displayData.displayName}</span>
                <span className={`${styles.name} text-gray-800`}>{displayData.battery_percentage}%</span>
            </div>
        </div>
    );
}
