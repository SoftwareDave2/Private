import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrierung | TH Nürnberg Portal",
  description:
    "Erstellen Sie ein neues Konto für das TH Nürnberg Portal - Technische Hochschule Nürnberg Georg Simon Ohm",
  keywords: "TH Nürnberg, Portal, Registrierung, Konto erstellen, Anmeldung",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
