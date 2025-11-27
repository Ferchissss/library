"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, User, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookSearchDetails } from './book-search-details' 

interface BookSearchButtonProps {
  onBookSelect?: (book: any) => void
  onAuthorSelect?: (author: any) => void
  refreshData?: () => void
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

export function BookSearchButton({ onBookSelect, onAuthorSelect, refreshData }: BookSearchButtonProps) {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{
    books: SearchResult[]
    authors: SearchResult[]
  }>({ books: [], authors: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [showBookDetails, setShowBookDetails] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Function for real-time search
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

  // Function to handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (result.searchType === 'book') {
      // Instead of calling onBookSelect directly, open the details modal
      setSelectedBook(result)
      setShowBookDetails(true)
      
      // If the onBookSelect callback exists, also call it
      if (onBookSelect) {
        onBookSelect(result)
      }
    } else if (result.searchType === 'author' && onAuthorSelect) {
      onAuthorSelect(result)
    }
    setShowResults(false)
    setSearchTerm('')
    setShowSearch(false)
  }

  // Function to handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault()
      // Redirect to results page
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setShowResults(false)
      setShowSearch(false)
      setSearchTerm('')
    }
  }

  // Debounce for search
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

  // Close results when clicking outside
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

  // Focus input when opened
  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showSearch])

  // Show results when input receives focus and there's a search term
  const handleInputFocus = () => {
    if (searchTerm.trim()) {
      setShowResults(true)
    }
  }

  const hasResults = searchResults.books.length > 0 || searchResults.authors.length > 0

  return (
    <>
      <div ref={containerRef} className="flex items-center gap-2">
        {showSearch ? (
          <div className="relative">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v700 z-10 pointer-events-none" />
              <Input
                ref={inputRef}
                placeholder="Search books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                className="pl-10 pr-10 h-9 bg-white/80 text-gray-700 border border-v300 rounded-lg placeholder:text-gray-500 focus-visible:ring-v200"
              />
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-v700"
                onClick={() => {
                  setShowSearch(false)
                  setSearchTerm("")
                  setShowResults(false)
                  setSearchResults({ books: [], authors: [] })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search results */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
                {searchLoading ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="loading h-6 w-6 border-t-2 border-v500"></div>
                    <span className="ml-2 text-sm text">Searching...</span>
                  </div>
                ) : hasResults ? (
                  <div className="p-2">
                    {/* Books */}
                    {searchResults.books.length > 0 && (
                      <>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                          Books
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
                                  <div className="btn-cover">
                                    <BookOpen className="h-5 w-5 text-v400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-800 truncate">
                                  {book.volumeInfo?.title}
                                </h4>
                                <p className="text-xs text-gray-600 truncate">
                                  {book.volumeInfo?.authors?.join(', ') || 'Unknown author'}
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

                    {/* Authors */}
                    {searchResults.authors.length > 0 && (
                      <>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                          Authors
                        </h3>
                        <div className="space-y-1 mb-4">
                          {searchResults.authors.map((author) => (
                            <div
                              key={author.id}
                              className="flex items-center gap-3 p-2 hover:bg-v50 rounded-lg cursor-pointer transition-colors"
                              onClick={() => handleResultSelect(author)}
                            >
                              <div className="btn-author w-10 h-10">
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
                                  {author.booksCount} book{author.booksCount !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Footer with Enter instruction */}
                    <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                      <p className="text-xs text-gray-500 text-center">
                        Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to see all results
                      </p>
                    </div>
                  </div>
                ) : searchTerm.trim() ? (
                  <div className="p-4 text-center text-gray-500">
                    No results found. Press Enter to search.
                  </div>
                ) : null 
                }
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={() => setShowSearch(true)}
            variant="outline"
            className="button-tran"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Book details modal */}
      <BookSearchDetails
        book={selectedBook}
        isOpen={showBookDetails}
        onOpenChange={setShowBookDetails}
        refreshData={refreshData}
      />
    </>
  )
}