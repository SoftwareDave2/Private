import styles from './DisplayFrame.module.css'
import sampleImage from '../../app/images/Free-Stock-Photos-01 1.png'

type DisplayFrameProps = {
    id: number,
    width: number,
    height: number,
    orientation: string,
    filename: string,
}

export default function DisplayFrame({id, width, height, orientation, filename}: DisplayFrameProps) {
    return (
        <div className={`flex flex-col`}>
            <div className={`${styles.frame} border-gray-700 rounded`}>
                <img src={`/uploads/${filename}`} alt={''} className={`h-full object-fill`}/>
            </div>
            <span className={`${styles.name} text-gray-800`}>Display {id}</span>
        </div>
    )
}