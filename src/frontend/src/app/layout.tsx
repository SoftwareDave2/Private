import type { Metadata } from "next";
import localFont from "next/font/local";
import Nav from "@/components/layout/Nav"
import "./globals.css";
import AuthGuard from "@/components/auth/AuthGuard";

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tablohm"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} container mx-auto p-4 antialiased`}
      >
        <AuthGuard>
          <Nav />
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
