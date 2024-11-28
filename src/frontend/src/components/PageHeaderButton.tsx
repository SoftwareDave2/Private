import React, {EventHandler} from "react";
import {Button} from "@material-tailwind/react"
import type {children} from "@material-tailwind/react/types/components/button";

type PageHeaderButtonProps = {
    onClick: EventHandler<any>,
    children: children,
}

export default function PageHeaderButton({onClick, children}: PageHeaderButtonProps) {
    return (
        <Button variant="outlined" className="rounded-full py-1 text-xs font-light text-transform-none" size="sm" onClick={onClick}>
            {children}
        </Button>
    )
}