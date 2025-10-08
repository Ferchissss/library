"use client"

import { useState, useEffect } from 'react'
import { Book as BookIcon, BookOpen, Star, TrendingUp, Search, Calendar, SortDesc, SortAsc, User, Library, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useViewMode } from "@/components/view-mode-provider"
import { BookCard } from "@/components/book-card"
import { BookTable } from "@/components/book-table"
import { ViewModeToggle } from "@/components/view-mode-toggle"
import { Badge } from "@/components/ui/badge"
import { AddBookModal } from "@/components/add-book-modal"
import { supabase } from '@/lib/supabaseClient';
import type { Book, Quote  } from "@/lib/types"  
import { BookDetailsModal } from '@/components/book-details-modal'
import { BookSearchButton } from '@/components/book-search-button'
import { BookTextAnalyzerModal } from '@/components/text-analyzer-modal'
import { useBulkDataParser } from '@/hooks/useBulkDataParser'
import { transformToAddBookFormat } from '@/lib/bookDataTransformers'

export default function HomePage() {
  const { viewMode } = useViewMode()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedFavorites, setSelectedFavorites] = useState("all")
  const [sortBy, setSortBy] = useState("default")
  const [books, setBooks] = useState<Book[]>([])
  const [quotesMap, setQuotesMap] = useState<Record<number, Quote[]>>({})
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [showAddBook, setShowAddBook] = useState(false)
  const [prefilledData, setPrefilledData] = useState<any>(null)
  
  // Estados para las opciones (necesarios para el analizador)
  const [authorsOptions, setAuthorsOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [genresOptions, setGenresOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [seriesOptions, setSeriesOptions] = useState<{ value: string; label: string; id?: number }[]>([])

  // Inicializar el hook de procesamiento de datos
  const { processAnalyzedData } = useBulkDataParser({
    genresOptions,
    authorsOptions,
    seriesOptions,
    setGenresOptions,
    setAuthorsOptions,
    setSeriesOptions
  })

  const [statsData, setStatsData] = useState({
    totalBooks: 0,
    booksThisYear: 0,
    totalPages: 0,
    averageRating: 0,
  })

  // Función para cargar las opciones necesarias para el analizador
  const fetchOptions = async () => {
    try {
      // Autores
      const { data: authors } = await supabase
        .from("authors")
        .select("id, name")
        .order("name", { ascending: true })
      setAuthorsOptions(authors?.map((a) => ({ value: a.name, label: a.name, id: a.id })) || [])

      // Géneros
      const { data: genres } = await supabase
        .from("genres")
        .select("id, name")
        .order("name", { ascending: true })
      setGenresOptions(genres?.map((g) => ({ value: g.name, label: g.name, id: g.id })) || [])

      // Series
      const { data: series } = await supabase
        .from("series")
        .select("id, name")
        .order("name", { ascending: true })
      setSeriesOptions(series?.map((s) => ({ value: s.name, label: s.name, id: s.id })) || [])
    } catch (error) {
      console.error("Error fetching options:", error)
    }
  }

  // Función para cargar los libros desde Supabase
  const fetchBooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('books')
        .select(`*, author:authors (id,name), genres:genres ( id, name ), series:series (id, name)`)
        .order('id', { ascending: false })
      
      if (error) throw error
      
      // Obtener citas
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
      
      if (quotesError) throw quotesError
      
      // Crear el mapa de citas
      const quotesMap = quotesData?.reduce((acc, quote) => {
        if (quote.book_id) {
          if (!acc[quote.book_id]) {
            acc[quote.book_id] = []
          }
          acc[quote.book_id].push(quote)
        }
        return acc
      }, {} as Record<number, Quote[]>)
      
      setBooks(data || [])
      setQuotesMap(quotesMap || {})
      calculateStats(data || [])
    } catch (error) {
      const err = error as Error
      console.error('Error fetching books:', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular estadísticas
  const calculateStats = (books: Book[]) => {
    const currentYear = new Date().getFullYear()
    
    const stats = {
      totalBooks: books.length,
      booksThisYear: books.filter(book => {
        const year = book.end_date ? new Date(book.end_date).getFullYear() : null
        return year === currentYear
      }).length,
      totalPages: books.reduce((sum, book) => sum + (book.pages || 0), 0),
      averageRating: books.length > 0 
        ? parseFloat((books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.length).toFixed(1))
        : 0,
    }
    
    setStatsData(stats)
  }
   
  // Función para manejar la selección de libro
  const handleBookSelect = (book: Book) => {
    setSelectedBook(book)
  }

  // Función para actualizar libros
  const handleBookUpdate = (updatedBook: Book) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === updatedBook.id ? updatedBook : book
      )
    )
    // Si el libro actualizado es el seleccionado, actualizarlo también
    if (selectedBook && selectedBook.id === updatedBook.id) {
      setSelectedBook(updatedBook)
    }
  }

  // Función para manejar selección desde búsqueda
  const handleSearchBookSelect = (book: any) => {
    console.log('Libro seleccionado desde búsqueda:', book)
  }

  // Función para manejar la selección desde el analizador de texto
  const handleAnalyzerBookSelect = async (bookData: any) => {
    // 🎯 USAR DIRECTAMENTE LOS DATOS SIN PROCESAMIENTO EXTRA
    setPrefilledData(bookData)
    setShowAnalyzer(false)
    setShowAddBook(true)
  }

  // Cargar libros y opciones al montar el componente
  useEffect(() => {
    fetchBooks()
    fetchOptions()
  }, [])

  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFavorites =
        selectedFavorites === "all" ||
        (selectedFavorites === "favorites" && book.favorite) ||
        (selectedFavorites === "non-favorites" && !book.favorite)

      return matchesSearch && matchesFavorites
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating-desc":
          return (b.rating ?? 0) - (a.rating ?? 0)
        case "rating-asc":
          return (a.rating ?? 0) - (b.rating ?? 0)
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return (a.author?.name ?? "").localeCompare(b.author?.name ?? "")        
        case "pages-desc":
          return (b.pages ?? 0) - (a.pages ?? 0)
        case "pages-asc":
          return (a.pages ?? 0) - (b.pages ?? 0)
        case "orden-asc":
          return a.orden - b.orden 
        default:  
          return b.orden - a.orden 
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f3fc" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-800">Cargando tu biblioteca...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f3fc" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Add Book Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Mi Biblioteca</h1>
            <p className="text-purple-600">Gestiona y explora tu colección personal de libros</p>
          </div>
          <div className="flex gap-3">
            <BookSearchButton onBookSelect={handleSearchBookSelect} />
            <Button
              onClick={fetchBooks}
              disabled={loading}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 px-2 py-1 text-sm rounded-md bg-transparent"
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={() => setShowAnalyzer(true)}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Analizar Texto
            </Button>
            <AddBookModal 
              refreshData={fetchBooks}
              isOpen={showAddBook}
              onOpenChange={setShowAddBook}
              prefilledData={prefilledData}
            />
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-2">
              <CardTitle className="text-sm font-medium text-purple-700">Libros Leídos</CardTitle>
              <BookIcon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-purple-800">{statsData.totalBooks}</div>
              <p className="text-xs text-purple-600">+{statsData.booksThisYear} este año</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-2">
              <CardTitle className="text-sm font-medium text-purple-700">Páginas Leídas</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-purple-800">{statsData.totalPages.toLocaleString()}</div>
              <p className="text-xs text-purple-600">
                Promedio: {Math.round(statsData.totalPages / statsData.totalBooks)} por libro
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-2">
              <CardTitle className="text-sm font-medium text-purple-700">Calificación Promedio</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-purple-800">{statsData.averageRating}</div>
              <p className="text-xs text-purple-600">de 10 puntos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search - Redesigned */}
        <div className="mb-8 space-y-4">
          {/* Filters + Search Row */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 z-10 pointer-events-none" />
              <Input
                placeholder="Buscar por título"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-9 bg-white/30 text-gray-700 backdrop-blur-md border border-purple-300/30 rounded-2xl placeholder:text-gray-500"              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Favoritos */}
              <Select value={selectedFavorites} onValueChange={setSelectedFavorites}>
                <SelectTrigger className="h-9 text-sm bg-white/30 text-gray-700 backdrop-blur-md border border-purple-300/30 rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-300 w-48">
                  <SelectValue placeholder="Favoritos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <Library className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Todos los libros
                  </SelectItem>
                  <SelectItem value="favorites">
                    <Star className="inline-block w-4 h-4 mr-2 text-purple-500 fill-purple-500" />
                    Solo favoritos
                  </SelectItem>
                  <SelectItem value="non-favorites">
                    <Library className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    No favoritos
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Ordenar por */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 text-sm bg-white/30 text-gray-700 backdrop-blur-md border border-purple-300/30 rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-300 w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <SortDesc className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Orden (Mayor a menor)
                  </SelectItem>
                  <SelectItem value="orden-asc">
                    <SortAsc className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Orden (Menor a mayor)
                  </SelectItem>
                  <SelectItem value="rating-desc">
                    <SortDesc className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Calificación (Mayor)
                  </SelectItem>
                  <SelectItem value="rating-asc">
                    <SortAsc className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Calificación (Menor)
                  </SelectItem>
                  <SelectItem value="title">
                    <BookOpen className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Título (A-Z)
                  </SelectItem>
                  <SelectItem value="author">
                    <User className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Autor (A-Z)
                  </SelectItem>
                  <SelectItem value="pages-desc">
                    <SortDesc className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Páginas (Mayor)
                  </SelectItem>
                  <SelectItem value="pages-asc">
                    <SortAsc className="inline-block w-4 h-4 mr-2 text-purple-500" />
                    Páginas (Menor)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="w-full sm:w-auto">
              <ViewModeToggle />
            </div>
          </div>

          {/* Active Filters */}
          {(selectedFavorites !== "all" || selectedStatus !== "all" || sortBy !== "default" || searchTerm) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Búsqueda: "{searchTerm}"
                </Badge>
              )}
              {selectedFavorites !== "all" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {selectedFavorites === "favorites" ? "⭐ Favoritos" : "📚 No favoritos"}
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {selectedStatus === "completed" ? "✅ Completados" : "📖 Leyendo"}
                </Badge>
              )}
              {sortBy !== "default" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Ordenado por:{" "}
                  {sortBy.includes("rating")
                    ? "Calificación"
                    : sortBy.includes("title")
                      ? "Título"
                      : sortBy.includes("author")
                        ? "Autor"
                        : "Páginas"}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedFavorites("all")
                  setSelectedStatus("all")
                  setSortBy("default")
                }}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-red-600"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Books Display */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <BookTable books={filteredBooks} quotesMap={quotesMap} refreshData={fetchBooks} onBookSelect={handleBookSelect} onBookUpdate={handleBookUpdate}/>
        )}

        {/* Modal de detalles del libro */}
        <BookDetailsModal 
          book={selectedBook}
          isOpen={!!selectedBook}
          onOpenChange={(open) => {if (!open) {setSelectedBook(null)}}}
          quotes={selectedBook ? quotesMap[selectedBook.id] || [] : []}
          onBookUpdate={handleBookUpdate}
          refreshData={fetchBooks}
        />

        {/* Modal del analizador de texto */}
        <BookTextAnalyzerModal
          isOpen={showAnalyzer}
          onClose={() => setShowAnalyzer(false)}
          onBookSelect={handleAnalyzerBookSelect}
          genresOptions={genresOptions}
          authorsOptions={authorsOptions}
          seriesOptions={seriesOptions}
          setGenresOptions={setGenresOptions}
          setAuthorsOptions={setAuthorsOptions}
          setSeriesOptions={setSeriesOptions}
          onOpenAddBook={handleAnalyzerBookSelect}
        />

        {filteredBooks.length === 0 && (
          <Card className="text-center py-12 bg-white/60 backdrop-blur-sm border-0">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron libros</h3>
              <p className="text-muted-foreground">
                Intenta ajustar tus filtros de búsqueda o agrega un nuevo libro a tu biblioteca.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}