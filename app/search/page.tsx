"use client"

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookOpen, User, ArrowLeft, Search, X, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { BookSearchDetails } from '@/components/book-search-details'

interface SearchResult {
  id: string
  searchType: 'book' | 'author'
  volumeInfo?: {
    title: string
    authors: string[]
    publishedDate?: string
    description?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    publisher?: string
    pageCount?: number
    categories?: string[]
    previewLink?: string
    infoLink?: string
    language?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
  name?: string
  booksCount?: number
  image?: string
}

type ActiveTab = 'books' | 'authors' | 'all'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [searchTerm, setSearchTerm] = useState(query)
  const [results, setResults] = useState<{
    books: SearchResult[]
    authors: SearchResult[]
  }>({ books: [], authors: [] })
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('books')
  const [selectedBook, setSelectedBook] = useState<SearchResult | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Realizar búsqueda cuando la página carga o el query cambia
  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ books: [], authors: [] })
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)
    
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults({
          books: data.books || [],
          authors: data.authors || []
        })
      }
    } catch (error) {
      console.error('Error searching:', error)
      setResults({ books: [], authors: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setResults({ books: [], authors: [] })
    setHasSearched(false)
    router.push('/search')
    // Enfocar el input
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const handleBookSelect = (book: SearchResult) => {
    setSelectedBook(book)
    setIsDetailsOpen(true)
  }

  const handleAuthorSelect = (author: SearchResult) => {
    router.push(`/search?q=${encodeURIComponent(author.name || '')}`)
  }

  // Función para manejar la adición directa del libro
  const handleAddBookDirectly = (book: SearchResult) => {
    // Aquí puedes implementar la lógica para agregar directamente a la biblioteca
    console.log('Agregando libro directamente:', book)
    // Por ejemplo, podrías abrir un modal más simple o hacer una llamada a la API
    alert(`Libro "${book.volumeInfo?.title}" agregado directamente a tu biblioteca`)
  }

  // Función para manejar la adición desde el modal de detalles
  const handleAddToLibrary = (bookData: any) => {
    console.log('Datos del libro para agregar:', bookData)
    // Aquí implementas la lógica para guardar en tu base de datos
    // Por ejemplo:
    // await fetch('/api/books', {
    //   method: 'POST',
    //   body: JSON.stringify(bookData)
    // })
    alert(`Libro "${bookData.title}" agregado a tu biblioteca con todos los detalles`)
  }

  const totalResults = results.books.length + results.authors.length

  // Filtrar resultados según la pestaña activa
  const getFilteredResults = () => {
    switch (activeTab) {
      case 'books':
        return { books: results.books, authors: [] }
      case 'authors':
        return { books: [], authors: results.authors }
      case 'all':
      default:
        return results
    }
  }

  const filteredResults = getFilteredResults()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-purple-800">Resultados de Búsqueda</h1>
        </div>

        {/* Barra de búsqueda */}
        <Card className="mb-8 shadow-sm border-gray-200">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar libros o autores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8 h-11 bg-white border-gray-300 focus:border-purple-400 text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button 
                type="submit" 
                className="h-11 px-6 bg-purple-500 hover:bg-purple-600 text-white text-sm"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-base text-purple-700">Buscando "{query}"...</span>
          </div>
        ) : hasSearched && (
          <div className="space-y-6">

            {/* Tabs para filtrar resultados */}
            {totalResults > 0 && (
              <div className="flex border-b border-gray-200 mb-4">
                {/* Libros - PRIMERO */}
                <button
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors text-sm ${
                    activeTab === 'books' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('books')}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Libros</span>
                  <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs min-w-5">
                    {results.books.length}
                  </span>
                </button>
                
                {/* Autores - SEGUNDO */}
                <button
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors text-sm ${
                    activeTab === 'authors' 
                      ? 'border-b-2 border-green-600 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('authors')}
                >
                  <User className="h-4 w-4" />
                  <span>Autores</span>
                  <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-xs min-w-5">
                    {results.authors.length}
                  </span>
                </button>

                {/* Todos - TERCERO */}
                <button
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors text-sm ${
                    activeTab === 'all' 
                      ? 'border-b-2 border-purple-600 text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  <span>Todos</span>
                  <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs min-w-5">
                    {totalResults}
                  </span>
                </button>
              </div>
            )}

            {/* Contenido según la pestaña activa */}
            {(activeTab === 'books' || activeTab === 'all') && filteredResults.books.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Libros ({filteredResults.books.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredResults.books.map((book) => (
                    <Card 
                      key={book.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-300 border-gray-200 hover:border-purple-300"
                      onClick={() => handleBookSelect(book)}
                    >
                      <CardContent className="p-3">
                        {/* Contenido del libro - SIN OVERLAY */}
                        <div className="aspect-[3/4] mb-2 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden shadow-xs">
                          {book.volumeInfo?.imageLinks?.thumbnail ? (
                            <img
                              src={book.volumeInfo.imageLinks.thumbnail}
                              alt={book.volumeInfo.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-book.png'
                              }}
                            />
                          ) : (
                            <BookOpen className="h-8 w-8 text-gray-300" />
                          )}
                        </div>
                        <h3 className="font-semibold text-xs text-gray-800 line-clamp-2 mb-1">
                          {book.volumeInfo?.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                          {book.volumeInfo?.authors?.join(', ') || 'Autor desconocido'}
                        </p>
                        {book.volumeInfo?.publishedDate && (
                          <p className="text-xs text-gray-500">
                            {book.volumeInfo.publishedDate.split('-')[0]} {/* Solo el año */}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'authors' || activeTab === 'all') && filteredResults.authors.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Autores ({filteredResults.authors.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredResults.authors.map((author) => (
                    <Card 
                      key={author.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                      onClick={() => handleAuthorSelect(author)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border border-white shadow-sm">
                          {author.image ? (
                            <img
                              src={author.image}
                              alt={author.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-800 mb-1">
                            {author.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {author.booksCount} libro{author.booksCount !== 1 ? 's' : ''} encontrado{author.booksCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sin resultados para la pestaña activa */}
            {hasSearched && filteredResults.books.length === 0 && filteredResults.authors.length === 0 && (
              <div className="text-center py-12">
                {activeTab === 'books' ? (
                  <>
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No se encontraron libros
                    </h3>
                    <p className="text-gray-500 text-sm">
                      No hay libros que coincidan con tu búsqueda.
                    </p>
                  </>
                ) : activeTab === 'authors' ? (
                  <>
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No se encontraron autores
                    </h3>
                    <p className="text-gray-500 text-sm">
                      No hay autores que coincidan con tu búsqueda.
                    </p>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No se encontraron resultados
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Intenta con otros términos de búsqueda o verifica la ortografía.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal de detalles del libro */}
        <BookSearchDetails
          book={selectedBook}
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onAddToLibrary={handleAddToLibrary}
        />
      </div>
    </div>
  )
}