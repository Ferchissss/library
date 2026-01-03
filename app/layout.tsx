import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ViewModeProvider } from "@/components/view-mode-provider"
import "../styles/globals.css"
import { Toaster } from 'sonner'
import { NavigationMenu } from "@/components/navigation-menu"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nook - Personal Reading Platform",
  description: "Your personal space to manage and organize your readings",
  generator: "v0.dev",
  icons: {
    icon: '/icon.svg', 
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        <ViewModeProvider>
          <header className="border-b bg-background relative">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
              <NavigationMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </ViewModeProvider>
      </body>
    </html>
  )
}