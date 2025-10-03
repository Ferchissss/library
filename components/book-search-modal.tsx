"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookSearchResults } from './book-search-results'

interface BookSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onBookSelect: (book: any) => void
}

export function BookSearchModal({ isOpen, onClose, onBookSelect }: BookSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch books when debounced search term changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchBooks(debouncedSearch)
    } else {
      setResults([])
    }
  }, [debouncedSearch])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const searchBooks = async (query: string) => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.books || [])
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Error searching books:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleBookSelect = (book: any) => {
    onBookSelect(book)
    onClose()
    setSearchTerm('')
    setResults([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-purple-800">Buscar Libros</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              ref={inputRef}
              placeholder="Escribe el título o autor del libro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden">
          <BookSearchResults 
            results={results}
            onBookSelect={handleBookSelect}
            loading={loading}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Resultados proporcionados por Google Books API
          </p>
        </div>
      </div>
    </div>
  )
}