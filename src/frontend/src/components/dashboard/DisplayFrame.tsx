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
        if (clickable && onClick) onClick();
    };

    // calculate ratio
    const aspectRatio = displayData.width / displayData.height;

    // max height
    const maxHeight = 100; // adaptable
    const scaledWidth = maxHeight * aspectRatio;

    return (
        <div className={`flex flex-col ${clickable ? 'cursor-pointer' : ''}`} onClick={clickHandler}>
            <div
                className={`border-gray-700 rounded relative`}
                style={{
                    width: `${scaledWidth}px`,
                    height: `${maxHeight}px`,
                    borderWidth: '.4rem'
                }}
            >
                <Image filename={displayData.filename} className="h-full w-full object-fill" />
                {displayData.errors && displayData.errors.length > 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-500 p-1 rounded-bl">
                        <span className="text-black text-xl font-bold">⚠️</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between w-full">
                <span className={`text-gray-800 text-xs`}>{displayData.displayName}</span>
                <span className={`text-gray-800 text-xs`}>{displayData.battery_percentage}%</span>
            </div>
        </div>
    );
}
