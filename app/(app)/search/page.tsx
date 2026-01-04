"use client"

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookOpen, User, Search, X } from 'lucide-react'
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

  // Perform search when page loads or query changes
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
    // Focus the input
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

  const totalResults = results.books.length + results.authors.length

  // Filter results according to active tab
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
    <div className="min-h-screen bg-gradient-to-br from-v50 to-indigo-100">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="title text-xl sm:text-2xl">Search Results</h1>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 max-w-xl mx-auto w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v500 hover:text-v600" />
            <Input
              ref={searchInputRef}
              placeholder="Search books or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-10 sm:h-11 bg-white border border-gray-300 focus:border-200 text-sm rounded-md shadow-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-v500 hover:text-v600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            className="h-10 sm:h-11 px-4 sm:px-6 button2 text-white text-sm rounded-md"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16">
            <div className="loading h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-v500"></div>
            <span className="ml-3 text-sm sm:text-base text-v700">Searching "{query}"...</span>
          </div>
        ) : hasSearched && (
          <div className="space-y-4 sm:space-y-6">

            {/* Tabs to filter results */}
            {totalResults > 0 && (
              <div className="flex border-b border-gray-200 mb-3 sm:mb-4 overflow-x-auto">
                {/* Books - FIRST */}
                <button
                  className={`tab flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    activeTab === 'books' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('books')}
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Books</span>
                  <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs min-w-5">
                    {results.books.length}
                  </span>
                </button>
                
                {/* Authors - SECOND */}
                <button
                  className={`tab flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    activeTab === 'authors' 
                      ? 'border-b-2 border-green-600 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('authors')}
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Authors</span>
                  <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-xs min-w-5">
                    {results.authors.length}
                  </span>
                </button>

                {/* All - THIRD */}
                <button
                  className={`tab flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    activeTab === 'all' 
                      ? 'border-b-2 border-purple-600 text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  <span>All</span>
                  <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs min-w-5">
                    {totalResults}
                  </span>
                </button>
              </div>
            )}

            {/* Content according to active tab */}
            {(activeTab === 'books' || activeTab === 'all') && filteredResults.books.length > 0 && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                  {filteredResults.books.map((book) => (
                    <Card 
                      key={book.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-300 border-gray-200 hover:border-v300"
                      onClick={() => handleBookSelect(book)}
                    >
                      <CardContent className="p-2 sm:p-3">
                        {/* Book content - WITHOUT OVERLAY */}
                        <div className="aspect-[3/4] mb-1 sm:mb-2 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden shadow-xs">
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
                              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-v400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-xs text-gray-800 line-clamp-2 mb-1">
                          {book.volumeInfo?.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-1 mb-0.5">
                          {book.volumeInfo?.authors?.join(', ') || 'Unknown author'}
                        </p>
                        {book.volumeInfo?.publishedDate && (
                          <p className="text-xs text-gray-500">
                            {book.volumeInfo.publishedDate.split('-')[0]} {/* Only the year */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                  {filteredResults.authors.map((author) => (
                    <Card 
                      key={author.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                      onClick={() => handleAuthorSelect(author)}
                    >
                      <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="btn-author w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                          {author.image ? (
                            <img
                              src={author.image}
                              alt={author.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-gray-800 mb-0.5 sm:mb-1 line-clamp-2">
                            {author.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {author.booksCount} book{author.booksCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No results for active tab */}
            {hasSearched && filteredResults.books.length === 0 && filteredResults.authors.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-v500 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm max-w-xs mx-auto">
                  Try with other search terms or check the spelling.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Book details modal */}
        <BookSearchDetails
          book={selectedBook}
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </div>
  )
}