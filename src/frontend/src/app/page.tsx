import PageHeader from "@/components/PageHeader";
import DisplayFrame from "@/components/DisplayFrame";
import Fetch_picture from "@/components/Fetch_picture";

export default function Home() {
    let displays = [
        { name: 'Display 1' },
        { name: 'Display 2' },
        { name: 'Display 3' },
        { name: 'Display 4' },
        { name: 'Display 5' },
        { name: 'Display 6' },
        { name: 'Display 7' },
        { name: 'Display 8' },
    ]

    return (
      <main>
          <PageHeader title={'Dashboard'} info={'9 Bildschirme laufen - 0 Bildschirme gestoppt'}>
          </PageHeader>
          <div className={`flex gap-4 flex-wrap`}>
              {displays.map(display => <DisplayFrame key={display.name} name={display.name} />)}
          </div>
          < Fetch_picture />
      </main>
  );
}
