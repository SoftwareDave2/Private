import styles from './DisplayFrame.module.css'
import sampleImage from '../app/images/Free-Stock-Photos-01 1.png'

type DisplayFrameProps = {
    name: string,
}

export default function DisplayFrame({name}: DisplayFrameProps) {
    return (
        <div className={`flex flex-col`}>
            <div className={`${styles.frame} border-gray-700 rounded`}>
                <img src={sampleImage.src} alt={''} className={`h-full object-fill`}/>
            </div>
            <span className={`${styles.name} text-gray-800`}>{name}</span>
        </div>
    )
}