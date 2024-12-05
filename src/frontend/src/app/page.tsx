'use client'

import React, {useState, useEffect} from 'react'
import PageHeader from "@/components/layout/PageHeader";
import DisplayFrame from "@/components/dashboard/DisplayFrame";
import { DisplayData } from "@/types/displayData"
import getConfig from 'next/config'
import PageHeaderButton from "@/components/layout/PageHeaderButton";
import SelectImage from "@/components/edit-display/SelectImage";


export default function Home() {

    //const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
    const backendApiUrl = 'http://localhost:8080'

    const [displays, setDisplays] = useState<DisplayData[]>([])
    const [filename, setFilename] = useState<string>('')

    const fetchDisplays = async () => {
        const data = await fetch(backendApiUrl + '/display/all')
        const json = await data.json()
        setDisplays(json)
    }

    useEffect(() => {
        fetchDisplays()
            .then(() => { console.log('Displays updated!') })
            .catch((err) => { console.error('No connection to backend!', err)})


    }, [])

    return (
      <main>
          <PageHeader title={'Dashboard'} info={`${displays.length} Bildschirme laufen - 0 Bildschirme gestoppt`}>
              <PageHeaderButton onClick={() => { }}>Add Display</PageHeaderButton>
          </PageHeader>
          <div className={`flex gap-4 flex-wrap`}>
              {displays.map(display =>
                  <DisplayFrame key={display.id} id={display.id} width={display.width} height={display.height} orientation={display.orientation} filename={display.filename} />
              )}
          </div>

          <div className={`mt-5`}>
              <SelectImage selectedFilename={filename} onSelect={(filename) => setFilename(filename)} />
          </div>

      </main>
  );
}
