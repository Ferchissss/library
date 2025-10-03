"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface BookSearchButtonProps {
  onBookSelect: (book: any) => void
  onAuthorSelect?: (author: any) => void
}

interface SearchResult {
  id: string
  searchType: 'book' | 'author'
  volumeInfo?: {
    title: string
    authors: string[]
    publishedDate?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
  }
  name?: string
  booksCount?: number
  image?: string
}

export function BookSearchButton({ onBookSelect, onAuthorSelect }: BookSearchButtonProps) {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{
    books: SearchResult[]
    authors: SearchResult[]
  }>({ books: [], authors: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Función para búsqueda en tiempo real
  const searchBooks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ books: [], authors: [] })
      setShowResults(false)
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults({
          books: data.books || [],
          authors: data.authors || []
        })
        setShowResults(true)
      } else {
        setSearchResults({ books: [], authors: [] })
      }
    } catch (error) {
      console.error('Error searching books:', error)
      setSearchResults({ books: [], authors: [] })
    } finally {
      setSearchLoading(false)
    }
  }

  // Función para manejar la selección de resultados
  const handleResultSelect = (result: SearchResult) => {
    if (result.searchType === 'book') {
      onBookSelect(result)
    } else if (result.searchType === 'author' && onAuthorSelect) {
      onAuthorSelect(result)
    }
    setShowResults(false)
    setSearchTerm('')
    setShowSearch(false)
  }

  // Función para manejar la tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault()
      // Redirigir a la página de resultados
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setShowResults(false)
      setShowSearch(false)
      setSearchTerm('')
    }
  }

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSearch && searchTerm.trim()) {
        searchBooks(searchTerm)
      } else {
        setSearchResults({ books: [], authors: [] })
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, showSearch])

  // Cerrar resultados cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Focus input cuando se abre
  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showSearch])

  // Mostrar resultados cuando el input recibe foco y hay término de búsqueda
  const handleInputFocus = () => {
    if (searchTerm.trim()) {
      setShowResults(true)
    }
  }

  const hasResults = searchResults.books.length > 0 || searchResults.authors.length > 0

  return (
    <div ref={containerRef} className="flex items-center gap-2">
      {showSearch ? (
        <div className="relative">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 z-10 pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Buscar libros o autores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              className="pl-10 pr-10 h-9 bg-white/80 text-gray-700 border border-purple-300 rounded-lg placeholder:text-gray-500 focus-visible:ring-purple-300"
            />
            {/* Botón para cerrar */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setShowSearch(false)
                setSearchTerm("")
                setShowResults(false)
                setSearchResults({ books: [], authors: [] })
              }}
            >
              ×
            </Button>
          </div>

          {/* Resultados de búsqueda */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
              {searchLoading ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-sm text-gray-600">Buscando...</span>
                </div>
              ) : hasResults ? (
                <div className="p-2">
                  {/* Autores */}
                  {searchResults.authors.length > 0 && (
                    <>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Autores
                      </h3>
                      <div className="space-y-1 mb-4">
                        {searchResults.authors.map((author) => (
                          <div
                            key={author.id}
                            className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleResultSelect(author)}
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                              {author.image ? (
                                <img
                                  src={author.image}
                                  alt={author.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-800">
                                {author.name}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {author.booksCount} libro{author.booksCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Libros */}
                  {searchResults.books.length > 0 && (
                    <>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Libros
                      </h3>
                      <div className="space-y-1">
                        {searchResults.books.map((book) => (
                          <div
                            key={book.id}
                            className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleResultSelect(book)}
                          >
                            <div className="flex-shrink-0 w-10 h-14 bg-gray-100 rounded flex items-center justify-center overflow-hidden shadow-sm">
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
                                <BookOpen className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-800 truncate">
                                {book.volumeInfo?.title}
                              </h4>
                              <p className="text-xs text-gray-600 truncate">
                                {book.volumeInfo?.authors?.join(', ') || 'Autor desconocido'}
                              </p>
                              {book.volumeInfo?.publishedDate && (
                                <p className="text-xs text-gray-500">
                                  {book.volumeInfo.publishedDate}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Footer con instrucción Enter */}
                  <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                    <p className="text-xs text-gray-500 text-center">
                      Presiona <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> para ver todos los resultados
                    </p>
                  </div>
                </div>
              ) : searchTerm.trim() ? (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron resultados. Presiona Enter para buscar.
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Escribe para buscar libros o autores...
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Button
          onClick={() => setShowSearch(true)}
          variant="outline"
          className="border-purple-300 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 px-2 py-2 rounded-md bg-transparent"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}