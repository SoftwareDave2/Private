import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anmeldung | TH Nürnberg Portal",
  description:
    "Anmeldung für das TH Nürnberg Portal - Technische Hochschule Nürnberg Georg Simon Ohm",
  keywords: "TH Nürnberg, Portal, Login, Anmeldung, Technische Hochschule",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
