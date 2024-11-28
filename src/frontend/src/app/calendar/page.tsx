'use client'

import PageHeader from "@/components/PageHeader";
import PageHeaderButton from "@/components/PageHeaderButton";
import React from "react";

export default function Calendar() {
    return (
        <main>
            <PageHeader title={'Kalender'} info={''}>
                <PageHeaderButton onClick={() => { }}>Event Hinzufügen</PageHeaderButton>
            </PageHeader>
        </main>
    )
}