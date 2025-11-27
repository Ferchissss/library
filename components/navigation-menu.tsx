// components/navigation-menu.tsx
'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BookOpen, Tag, Users, BarChart3, Quote, Trophy, Layers,
  Menu, X 
} from "lucide-react"

const menuItems = [
  {
    title: "My Library",
    url: "/",
    icon: BookOpen,
    color: "#f8f3fc",
    darkColor: "#8b5cf6",
  },
  {
    title: "Genres",
    url: "/genres",
    icon: Tag,
    color: "#fcf1f6",
    darkColor: "#ec4899",
  },
  {
    title: "Authors",
    url: "/authors",
    icon: Users,
    color: "#e7f3f8",
    darkColor: "#0ea5e9",
  },
  {
    title: "Statistics",
    url: "/stats",
    icon: BarChart3,
    color: "#fdebec",
    darkColor: "#ef4444",
  },
  {
    title: "Quotes",
    url: "/quotes",
    icon: Quote,
    color: "#edf3ec",
    darkColor: "#22c55e",
  },
  {
    title: "Challenges",
    url: "/challenges",
    icon: Trophy,
    color: "#fbecdd",
    darkColor: "#f59e0b",
  },
  {
    title: "Series",
    url: "/series",
    icon: Layers,
    color: "#fbf3dd",
    darkColor: "#eab308",
  },
]

export function NavigationMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Menú Desktop - solo reducido el padding del contenedor */}
      <nav className="hidden md:flex items-center gap-2 p-1 rounded-lg overflow-x-auto max-w-full" // ← Cambiado p-3 a p-2
        style={{ backgroundColor: `${menuItems[0].color}30` }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.url || 
            (item.url !== "/" && pathname.startsWith(item.url))
          
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all hover:shadow-md flex-shrink-0 ${
                isActive ? 'scale-105 shadow-md' : ''
              }`}
              style={{
                backgroundColor: item.color,
                borderLeft: `3px solid ${item.darkColor}`,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <item.icon 
                className={`${isActive ? 'h-5 w-5' : 'h-4 w-4'}`} 
                style={{ color: item.darkColor }} 
              />
              <span className={`font-bold ${isActive ? 'text-sm' : 'text-xs'} hidden sm:inline`}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Botón móvil y menú móvil - solo reducido padding del contenedor */}
      <div className="md:hidden">
        <button
          className="p-2 rounded-lg transition-colors hover:bg-accent"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 border-t bg-background shadow-lg z-50">
            <nav className="flex flex-col p-3 gap-2" 
              style={{ backgroundColor: `${menuItems[0].color}30` }}>
              {menuItems.map((item) => {
                const isActive = pathname === item.url || 
                  (item.url !== "/" && pathname.startsWith(item.url))
                
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all hover:shadow-md ${
                      isActive ? 'scale-105 shadow-md' : ''
                    }`}
                    style={{
                      backgroundColor: item.color,
                      borderLeft: `3px solid ${item.darkColor}`,
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon 
                      className={`${isActive ? 'h-5 w-5' : 'h-4 w-4'}`} 
                      style={{ color: item.darkColor }} 
                    />
                    <span className={`font-bold ${isActive ? 'text-sm' : 'text-sm'}`}>
                      {item.title}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </>
  )
}