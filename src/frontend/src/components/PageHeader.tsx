type PageHeaderProps = {
    title: string,
    info: string,
}

export default function PageHeader({title, info}: PageHeaderProps) {
    return (
        <div className={`border-2 border-transparent border-b-red-700 flex justify-between items-center mb-4`}>
            <div className={`flex items-end gap-4`}>
                <h1 className={'text-3xl'}>{title}</h1>
                <p className={`text-xs`}>{info}</p>
            </div>
        </div>
    )
}