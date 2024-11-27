'use client'

import PageHeader from "@/components/PageHeader";
import PageHeaderButton from "@/components/PageHeaderButton";
import React from "react";

export default function Media() {
    return (
        <main>
            <PageHeader title={'Mediathek'} info={''}>
                <PageHeaderButton onClick={() => { }}>Hochladen</PageHeaderButton>
            </PageHeader>
        </main>
    )
}