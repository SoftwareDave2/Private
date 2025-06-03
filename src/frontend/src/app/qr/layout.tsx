import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tablohm - E-Ink Display Mietsystem | TH Nürnberg",
  description:
    "Miete moderne E-Ink Displays an der TH Nürnberg. Präsentiere deine Anzeigen, Umfragen oder Bachelorarbeit direkt dort, wo deine Zielgruppe ist.",
  keywords:
    "E-Ink Display, TH Nürnberg, Mieten, Anzeigen, Bachelorarbeit, Umfragen, Hochschule",
};

export default function QRLayout({ children }: { children: React.ReactNode }) {
  // Kein Nav Component - die Landingpage hat ihren eigenen Header
  return <div className="min-h-screen">{children}</div>;
}
