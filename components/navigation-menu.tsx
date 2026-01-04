'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BookOpen, Tag, Users, BarChart3, Quote, Trophy, Layers, Image,
  Menu, X 
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Configuration with your SVG names
interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  headerIcon: string;
  headerLogo: string;
  color: string;
  darkColor: string;
}

const menuItems: MenuItem[] = [
  {
    title: "My Library",
    url: "/",
    icon: BookOpen,
    headerIcon: "/library.svg",
    headerLogo: "/library1.svg",
    color: "#f8f3fc",
    darkColor: "#8b5cf6",
  },
  {
    title: "Genres",
    url: "/genres",
    icon: Tag,
    headerIcon: "/genre.svg",
    headerLogo: "/genre1.svg",
    color: "#fcf1f6",
    darkColor: "#ec4899",
  },
  {
    title: "Authors",
    url: "/authors",
    icon: Users,
    headerIcon: "/author.svg",
    headerLogo: "/author1.svg",
    color: "#e7f3f8",
    darkColor: "#0ea5e9",
  },
  {
    title: "Statistics",
    url: "/stats",
    icon: BarChart3,
    headerIcon: "/static.svg",
    headerLogo: "/static1.svg",
    color: "#fdebec",
    darkColor: "#ef4444",
  },
  {
    title: "Quotes",
    url: "/quotes",
    icon: Quote,
    headerIcon: "/quote.svg",
    headerLogo: "/quote1.svg",
    color: "#edf3ec",
    darkColor: "#22c55e",
  },
  {
    title: "Challenges",
    url: "/challenges",
    icon: Trophy,
    headerIcon: "/challenge.svg",
    headerLogo: "/challenge1.svg",
    color: "#fbecdd",
    darkColor: "#f59e0b",
  },
  {
    title: "Series",
    url: "/series",
    icon: Layers,
    headerIcon: "/serie.svg",
    headerLogo: "/serie1.svg",
    color: "#fbf3dd",
    darkColor: "#eab308",
  },
  {
    title: "Gallery",
    url: "/gallery",
    icon: Image,
    headerIcon: "/gallery.svg",
    headerLogo: "/gallery1.svg",
    color: "#e8f4fd",
    darkColor: "#3b82f6",
  },
]

export function NavigationMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Find current active item
  const activeItem = menuItems.find(item => 
    pathname === item.url || 
    (item.url !== "/" && pathname.startsWith(item.url))
  ) || menuItems[0]

  return (
    <>
      {/* Dynamic header logo - Responsive spacing */}
      <div className="flex items-center gap-2 flex-shrink-0 pl-4 md:pl-8 lg:pl-44">
        <img 
          src={activeItem.headerIcon} 
          alt={`${activeItem.title} Icon`} 
          className="h-6 w-6" 
        />
        <img 
          src={activeItem.headerLogo} 
          alt={`${activeItem.title} Logo`} 
          className="h-6 w-auto hidden sm:block" 
        />
      </div>

      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center gap-2 p-1 rounded-lg overflow-x-auto max-w-full mr-4 md:mr-8 lg:mr-44" 
        style={{ backgroundColor: `${menuItems[0].color}30` }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.url || 
            (item.url !== "/" && pathname.startsWith(item.url))
          const Icon = item.icon 
          
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
              <Icon 
                className={`${isActive ? 'h-5 w-5' : 'h-4 w-4'}`} 
                color={item.darkColor} 
              />
              <span className={`font-bold ${isActive ? 'text-sm' : 'text-xs'} hidden sm:inline`}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile button and mobile menu */}
      <div className="md:hidden mr-4">
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
                const Icon = item.icon 
                
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
                    <Icon 
                      className={`${isActive ? 'h-5 w-5' : 'h-4 w-4'}`} 
                      color={item.darkColor} 
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