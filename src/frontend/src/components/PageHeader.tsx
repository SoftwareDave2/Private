import {ReactNode} from "react";

type PageHeaderProps = {
    title: string,
    info: string,
    children?: ReactNode,
}

export default function PageHeader({title, info, children}: PageHeaderProps) {
    return (
        <div className={`border-2 border-transparent border-b-red-700 flex justify-between items-center mb-4`}>
            <div className={`flex items-end gap-4`}>
                <h1 className={'text-3xl'}>{title}</h1>
                <p className={`text-xs mb-1`}>{info}</p>
            </div>
            {children}
        </div>
    )
}