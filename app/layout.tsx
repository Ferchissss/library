import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ViewModeProvider } from "@/components/view-mode-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Database, BookOpen, Users, BarChart3, Quote, Trophy, BookMarked, Plus } from "lucide-react"
import Link from "next/link"
import "./globals.css"
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mi Biblioteca - Plataforma de Lectura Personal",
  description: "Tu espacio personal para gestionar y organizar tus lecturas",
  generator: "v0.dev",
}

const menuItems = [
  {
    title: "Mi Biblioteca",
    url: "/",
    icon: Database,
    color: "#f8f3fc",
  },
  {
    title: "Géneros",
    url: "/genres",
    icon: BookOpen,
    color: "#fcf1f6",
  },
  {
    title: "Autores",
    url: "/authors",
    icon: Users,
    color: "#e7f3f8",
  },
  {
    title: "Estadísticas",
    url: "/stats",
    icon: BarChart3,
    color: "#fdebec",
  },
  {
    title: "Citas",
    url: "/quotes",
    icon: Quote,
    color: "#edf3ec",
  },
  {
    title: "Desafíos",
    url: "/challenges",
    icon: Trophy,
    color: "#fbecdd",
  },
  {
    title: "Series",
    url: "/series",
    icon: BookMarked,
    color: "#fbf3dd",
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Toaster position="top-right" />
          <ViewModeProvider>
            {/* Desktop Header Menu - visible on large screens */}
            <div className="hidden lg:block">
              <header className="border-b bg-background">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg">Mi Biblioteca</span>
                  </div>

                  <nav className="flex items-center gap-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.title}
                        href={item.url}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-accent text-sm"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <div className="p-1.5 rounded-md" style={{ backgroundColor: item.color }}>
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                        <span>{item.title}</span>
                      </Link>
                    ))}
                    <div className="mx-2 h-6 w-px bg-border" />
                  </nav>
                </div>
              </header>
              <main className="flex-1 overflow-auto">{children}</main>
            </div>

            {/* Mobile Sidebar - visible on small screens */}
            <div className="lg:hidden">
              <SidebarProvider>
                <Sidebar>
                  <SidebarHeader className="border-b">
                    <div className="flex items-center gap-2 px-2 py-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      <span className="font-semibold text-lg">Mi Biblioteca</span>
                    </div>
                  </SidebarHeader>
                  <SidebarContent>
                    <SidebarGroup>
                      <SidebarGroupLabel>Navegación</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {menuItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild>
                                <Link
                                  href={item.url}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent"
                                  style={{ backgroundColor: `${item.color}20` }}
                                >
                                  <div className="p-2 rounded-md" style={{ backgroundColor: item.color }}>
                                    <item.icon className="h-4 w-4" />
                                  </div>
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                      <SidebarGroupLabel>Acciones</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </SidebarContent>
                </Sidebar>
                <SidebarInset>
                  <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="ml-auto">
                      {/* Aquí puedes agregar elementos del header como búsqueda, perfil, etc. */}
                    </div>
                  </header>
                  <main className="flex-1 overflow-auto">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            </div>
          </ViewModeProvider>
        </Providers>
      </body>
    </html>
  )
}
