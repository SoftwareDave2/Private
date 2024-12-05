'use client'

import React, {useState, useEffect} from 'react'
import PageHeader from "@/components/layout/PageHeader";
import DisplayFrame from "@/components/dashboard/DisplayFrame";
import { DisplayData } from "@/types/displayData"
import getConfig from 'next/config'
import PageHeaderButton from "@/components/layout/PageHeaderButton";
import SelectImage from "@/components/edit-display/SelectImage";
import DisplayInfoDialog from "@/components/dashboard/DisplayInfoDialog";


export default function Home() {

    //const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
    const backendApiUrl = 'http://localhost:8080'

    const [displays, setDisplays] = useState<DisplayData[]>([])
    const [filename, setFilename] = useState<string>('')
    const [displayDialogOpen, setDisplayDialogOpen] = useState<boolean>(false)
    const [selectedDisplay, setSelectedDisplay] = useState<DisplayData | null>(null)

    const fetchDisplays = async () => {
        const data = await fetch(backendApiUrl + '/display/all')
        const json = await data.json()
        setDisplays(json)
    }

    const displayDialogHandler = () => setDisplayDialogOpen(!displayDialogOpen)

    useEffect(() => {
        fetchDisplays()
            .then(() => { console.log('Displays updated!') })
            .catch((err) => { console.error('No connection to backend!', err)})


    }, [])

    const displayClickHandler = (id: number) => {
        const display = displays.find(d => d.id === id)
        if (!display) {
            console.log(`Selected display with id ${id} not found.`)
            return
        }
        console.log('Open display', display)
        setSelectedDisplay(display)

        displayDialogHandler()
    }

    return (
      <main>
          <PageHeader title={'Dashboard'} info={`${displays.length} Bildschirme laufen - 0 Bildschirme gestoppt`}>
              <PageHeaderButton onClick={() => { }}>Add Display</PageHeaderButton>
          </PageHeader>
          <div className={`flex gap-4 flex-wrap`}>
              {displays.map(display =>
                  <DisplayFrame key={display.id} displayData={display} clickable={true} onClick={() => displayClickHandler(display.id)} />
              )}
          </div>

          <div className={`mt-5`}>
              <SelectImage selectedFilename={filename} onSelect={(filename) => setFilename(filename)} />
          </div>

          {selectedDisplay &&
              <DisplayInfoDialog open={displayDialogOpen} displayData={selectedDisplay} onClose={displayDialogHandler} />}
      </main>
  );
}
