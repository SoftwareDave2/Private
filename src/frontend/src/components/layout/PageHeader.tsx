'use client'

import {ReactNode} from "react";

type PageHeaderProps = {
    title: string,
    info: string,
    children?: ReactNode,
}

export default function PageHeader({title, info, children}: PageHeaderProps) {
    return (
        <div className={'border-2 border-transparent border-b-red-700 mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'}>
            <div className={'flex flex-col gap-1 text-left sm:flex-row sm:items-end sm:gap-4'}>
                <h1 className={'text-2xl font-semibold sm:text-3xl'}>{title}</h1>
                {info && (
                    <p className={'text-sm text-blue-gray-500 sm:text-xs sm:mb-1'}>{info}</p>
                )}
            </div>
            {children && (
                <div className={'flex flex-wrap items-center gap-2 sm:ml-auto'}>{children}</div>
            )}
        </div>
    )
}
