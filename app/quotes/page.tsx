// app/quotes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Search, Heart, BookOpen, X, RefreshCw, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AddQuote } from "@/components/quotes/AddQuote"
import { Quote } from "@/lib/types"
import { getQuoteCategoryColor } from "@/lib/colors" // Importar desde tu archivo de colores
import { Button } from "@/components/ui/button"
import { EditQuote } from "@/components/quotes/EditQuote"
import { DeleteQuote } from "@/components/quotes/DeleteQuote"

export default function Quotes() {
  const [quotesData, setQuotesData] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [selectedType, setSelectedType] = useState("Todos")
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Cargar citas desde la API
  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quotes')
      if (!response.ok) {
        throw new Error('Error al cargar las citas')
      }
      const data = await response.json()
      setQuotesData(data)
    } catch (error) {
      console.error('Error fetching quotes:', error)
      alert('Error al cargar las citas')
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar nueva cita agregada
  const handleQuoteAdded = (newQuote: Quote) => {
    setQuotesData(prev => [newQuote, ...prev])
  }

  // Obtener todas las categorías únicas de las citas existentes
  const existingCategories = Array.from(new Set(quotesData.map((quote) => quote.category).filter(Boolean)))

  const filteredQuotes = quotesData.filter((quote) => {
    const matchesSearch =
      quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.book?.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quote.book?.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "Todas" || quote.category === selectedCategory
    const matchesType = selectedType === "Todos" || quote.type === selectedType

    return matchesSearch && matchesCategory && matchesType
  })

  const totalQuotes = quotesData.length
  const favoriteQuotes = quotesData.filter((q) => q.favorite).length

  const handleQuoteUpdated = (updatedQuote: Quote) => {
    setQuotesData(prev => 
      prev.map(quote => quote.id === updatedQuote.id ? updatedQuote : quote)
    )
  }

  const handleQuoteDeleted = (quoteId: number) => {
    setQuotesData(prev => prev.filter(quote => quote.id !== quoteId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#edf3ec" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Cargando citas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#edf3ec" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header con botón agregar */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Citas Literarias</h1>
            <p className="text-green-600">Tu colección personal de frases memorables</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200 bg-transparent h-9 sm:h-10"
              size="sm"
              onClick={fetchQuotes}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <AddQuote 
              onQuoteAdded={handleQuoteAdded}
              existingCategories={existingCategories}
            />
          </div>
          
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-700">Total de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{totalQuotes}</div>
              <p className="text-sm text-green-600">frases guardadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-700">Favoritas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{favoriteQuotes}</div>
              <p className="text-sm text-green-600">citas destacadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 h-5 w-5 z-10 pointer-events-none" />
              <Input
                placeholder="Buscar citas, libros o autores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 sm:h-10 bg-white/30 backdrop-blur-sm border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:ring-green-300 text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-green-500 hover:text-green-700"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Filters - Inline */}
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-2">
              {/* Type Filter - Solo tipos que existen en la DB */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-green-200 rounded-xl text-green-800 focus:ring-green-300 text-sm w-32 sm:w-36">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm border-green-200 rounded-xl">
                  <SelectItem value="Todos" className="text-green-800 focus:bg-green-50 focus:text-green-800">
                    Todos los tipos
                  </SelectItem>
                  {Array.from(new Set(quotesData.map(quote => quote.type).filter(Boolean))).map((type) => (
                    <SelectItem 
                      key={type} 
                      value={type!}
                      className="text-green-800 focus:bg-green-50 focus:text-green-800"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter - Solo categorías que existen en la DB */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-green-200 rounded-xl text-green-800 focus:ring-green-300 text-sm w-32 sm:w-36">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm border-green-200 rounded-xl">
                  <SelectItem value="Todas" className="text-green-800 focus:bg-green-50 focus:text-green-800">
                    Todas las categorías
                  </SelectItem>
                  {existingCategories.map((category) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className="text-green-800 focus:bg-green-50 focus:text-green-800"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Button */}
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("Todos")
                  setSelectedCategory("Todas")
                }}
                disabled={!searchTerm && selectedType === "Todos" && selectedCategory === "Todas"}
                className="h-9 px-3 bg-white/30 backdrop-blur-sm border border-green-200 rounded-xl text-green-700 hover:bg-green-50 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" /> 
              </button>
            </div>
          </div>
        </div>

        {/* Lista de citas */}
        <div className="space-y-2">
          {filteredQuotes.map((quote) => {
            const categoryColor = getQuoteCategoryColor(quote.category || "")
            return (
              <Card
                key={quote.id}
                className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 relative"
              >
                {quote.favorite && (
                  <div className="absolute top-4 right-4 z-10">
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </div>
                )}
                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="bg-white border-blue-200 shadow-lg">

                      {/* EDITAR QUOTE */}
                      <DropdownMenuItem
                        className="cursor-pointer text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedQuote(quote);    // guardamos la quote actual
                          setIsEditOpen(true);        // abrimos el dialog
                        }}
                      >
                        Editar
                      </DropdownMenuItem>

                      {/* ELIMINAR QUOTE */}
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 hover:bg-red-50"
                        onClick={() => handleQuoteDeleted(quote.id)}
                      >
                        Eliminar
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <EditQuote 
                  quote={quote}
                  onQuoteUpdated={handleQuoteUpdated}
                  existingCategories={existingCategories}
                />
                <DeleteQuote
                  quote={quote}
                  onQuoteDeleted={handleQuoteDeleted}
                />

                <CardContent className="p-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <blockquote className="text-lg text-green-800 font-medium leading-relaxed italic border-l-4 border-green-300 pl-4">
                        "{quote.text}"
                      </blockquote>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {quote.book?.title && <BookOpen className="h-4 w-4 text-green-600" />}
                          <span className="font-semibold text-green-700">
                            {quote.book?.title || ""}
                          </span>
                        </div>
                        {quote.book?.author && (
                          <p className="text-sm text-green-600">por {quote.book.author.name}</p>
                        )}

                        <div className="flex items-center gap-2">
                          {quote.category && (
                            <Badge
                              variant="secondary"
                              className={`${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} hover:scale-105 transition-transform border`}
                            >
                              {quote.category}
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-green-300 text-green-600">
                            {quote.type || "Sin tipo"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {quote.page && (
                    <div className="absolute bottom-2 right-4">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Pág. {quote.page}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredQuotes.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No se encontraron citas que coincidan con los filtros seleccionados.
              </p>
              <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros o agregar una nueva cita.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}