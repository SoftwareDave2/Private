'use client'

import PageHeader from "@/components/layout/PageHeader";
import PageHeaderButton from "@/components/layout/PageHeaderButton";
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