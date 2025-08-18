import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"
import ToasterProvider from "@/components/providers/ToasterProvider"

// Use system fonts instead of Google Fonts to avoid connection issues
const systemFonts = {
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],
  serif: [
    'Playfair Display',
    'Georgia',
    'Times New Roman',
    'serif'
  ]
}

export const metadata: Metadata = {
  title: "Humjoli - Wedding Event Management",
  description: "Bringing Dreams to Life with Dreamy Wedding Planning Services",
  keywords: "wedding planning, event management, dhol, music, decorations, catering",
  authors: [{ name: "Humjoli Events" }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className="font-sans antialiased bg-white text-gray-900 transition-colors duration-200"
        style={{
          fontFamily: systemFonts.sans.join(', ')
        }}
      >
        <SessionProvider>
          {children}
          <ToasterProvider />
        </SessionProvider>
      </body>
    </html>
  )
}
