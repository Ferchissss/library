"use client"

import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Book } from "@/lib/types"
import { AVAILABLE_COLORS, getConsistentColorIndex } from "@/lib/colors"

interface BookCarouselViewProps {
  books: Book[]
}

const availableColors = AVAILABLE_COLORS

const getGenreColorStyle = (genreName: string) => {
  const colorIndex = getConsistentColorIndex(genreName, "bookCarouselGenres", availableColors.length)
  const colorClass = availableColors[colorIndex]
  return {
    backgroundColor: colorClass.bg,
    borderColor: colorClass.border.replace("border-", "#"),
    color: colorClass.text.replace("text-", "#"),
  }
}

export function BookCarouselView({ books }: BookCarouselViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Configuración responsiva de items por vista
  const getItemsPerView = () => {
    if (typeof window === "undefined") return 2
    if (window.innerWidth >= 1280) return 5 // xl screens
    if (window.innerWidth >= 1024) return 4 // lg screens
    if (window.innerWidth >= 768) return 3 // md screens
    return 1 // mobile - solo 1 item para hacerlo deslizable
  }

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView())

  // Actualizar itemsPerView cuando cambie el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView())
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, books.length - itemsPerView) : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === Math.max(0, books.length - itemsPerView) ? 0 : prev + 1))
  }

  const visibleBooks = isMobile ? books : books.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <div className="space-y-4">
      {/* Contenedor principal - layout diferente para móvil vs desktop */}
      {isMobile ? (
        /* Vista móvil - deslizable horizontalmente */
        <div className="relative">
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-4" style={{ minWidth: "max-content" }}>
              {books.map((book) => (
                <Card
                  key={book.id}
                  className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-pink-200 overflow-hidden flex flex-col min-w-[280px] max-w-[280px]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={book.image_url || "/placeholder.svg?height=256&width=192"}
                      alt={book.title}
                      width={192}
                      height={256}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {book.favorite && (
                      <div className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-pink-600 transition-colors mb-1 line-clamp-2">
                      {book.title}
                    </h3>

                    <p className="text-xs text-muted-foreground font-medium mb-2 line-clamp-1">
                      {book.author?.name}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {book.genres?.slice(0, 1).map((genre) => (
                        <Badge
                          key={genre.id}
                          variant="outline"
                          style={getGenreColorStyle(genre.name)}
                          className="text-xs font-medium px-1.5 py-0"
                        >
                          {genre.name}
                        </Badge>
                      ))}
                      {book.genres && book.genres.length > 1 && (
                        <Badge variant="outline" className="text-xs font-medium px-1.5 py-0 bg-gray-100 text-gray-600">
                          +{book.genres.length - 1}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-2.5 w-2.5 ${
                              i < Math.round((book.rating ?? 0) / 2) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{book.rating}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Indicador visual de que es deslizable (opcional) */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 opacity-60 pointer-events-none">
            <ChevronRight className="h-6 w-6" />
          </div>
        </div>
      ) : (
        /* Vista desktop - con botones de navegación */
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="border-pink-300 text-pink-600 hover:bg-pink-100 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleBooks.map((book) => (
              <Card
                key={book.id}
                className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-pink-200 overflow-hidden flex flex-col"
              >
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={book.image_url || "/placeholder.svg?height=288&width=216"}
                    alt={book.title}
                    width={216}
                    height={288}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {book.favorite && (
                    <div className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </div>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm text-slate-800 group-hover:text-pink-600 transition-colors mb-1 line-clamp-2">
                    {book.title}
                  </h3>

                  <p className="text-xs text-muted-foreground font-medium mb-2">{book.author?.name}</p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {book.genres?.slice(0, 2).map((genre) => (
                      <Badge
                        key={genre.id}
                        variant="outline"
                        style={getGenreColorStyle(genre.name)}
                        className="text-xs font-medium px-1.5 py-0"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-2.5 w-2.5 ${
                            i < Math.round((book.rating ?? 0) / 2) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{book.rating}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex === Math.max(0, books.length - itemsPerView)}
            className="border-pink-300 text-pink-600 hover:bg-pink-100 bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Indicadores de paginación - solo mostrar en desktop */}
      {!isMobile && books.length > itemsPerView && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.ceil(books.length / itemsPerView) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * itemsPerView)}
              className={`h-2 rounded-full transition-all ${
                Math.floor(currentIndex / itemsPerView) === i
                  ? "bg-pink-600 w-8"
                  : "bg-pink-300 w-2 hover:bg-pink-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}