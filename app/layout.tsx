// app/layout.tsx
import type { Metadata } from "next"
import { Inter, Kranky, Limelight } from "next/font/google"
import "@/styles/globals.css"
import { Toaster } from "sonner"

// Configura las fuentes con variables
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", 
})

const kranky = Kranky({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kranky", 
})
const limelight = Limelight({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-limelight", 
})

export const metadata: Metadata = {
  title: "Nook - Personal Reading Platform",
  description: "Your personal space to manage and organize your readings",
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${kranky.variable} ${limelight.variable}`}>
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}