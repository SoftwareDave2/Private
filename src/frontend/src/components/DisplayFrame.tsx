import styles from './DisplayFrame.module.css'
//import sampleImage from '../app/images/Free-Stock-Photos-01 1.png'
//import sampleImage from '../../../../uploads/beach.jpg'



type DisplayFrameProps = {
    name: string,
}

export default function DisplayFrame({name}: DisplayFrameProps) {

    const imageUrl = "https://images.app.goo.gl/jb3cH3VjFpLKZhcZ9";


    return (
        <div className={`flex flex-col`}>
            <div className={`${styles.frame} border-gray-700 rounded`}>
                <img src={imageUrl} alt={'Bild von URL'} className={`h-full object-fill`}/>
            </div>
            <span className={`${styles.name} text-gray-800`}>{name}</span>
        </div>
    )
}

// <img src={sampleImage.src} alt={'Bild von URL'} className={`h-full object-fill`}/>