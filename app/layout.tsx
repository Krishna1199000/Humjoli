import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"
import ToasterProvider from "@/components/providers/ToasterProvider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Humjoli - Wedding Event Management",
  description: "Bringing Dreams to Life with Dreamy Wedding Planning Services",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
          <ToasterProvider />
        </SessionProvider>
      </body>
    </html>
  )
}
