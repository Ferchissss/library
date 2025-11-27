"use client"
import { useState, useEffect } from 'react'
import { Book as BookIcon, BookOpen, Star, Search, SortDesc, SortAsc, User, Library, RefreshCw, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useViewMode } from "@/components/view-mode-provider"
import { BookCard } from "@/components/book-card"
import { BookTable } from "@/components/book-table"
import { ViewModeToggle } from "@/components/view-mode-toggle"
import { AddBookModal } from "@/components/add-book-modal"
import { supabase } from '@/lib/supabaseClient';
import type { Book, Quote  } from "@/lib/types"  
import { BookDetailsModal } from '@/components/book-details-modal'
import { BookSearchButton } from '@/components/book-search-button'
import { BookTextAnalyzerModal } from '@/components/text-analyzer-modal'

export default function HomePage() {
  const { viewMode } = useViewMode()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedFavorites, setSelectedFavorites] = useState("all")
  const [sortBy, setSortBy] = useState("default")
  const [books, setBooks] = useState<Book[]>([])
  const [quotesMap, setQuotesMap] = useState<Record<number, Quote[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [showAddBook, setShowAddBook] = useState(false)
  const [prefilledData, setPrefilledData] = useState<any>(null)
  
  // States for options (needed for the analyzer)
  const [authorsOptions, setAuthorsOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [genresOptions, setGenresOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [seriesOptions, setSeriesOptions] = useState<{ value: string; label: string; id?: number }[]>([])

  const [statsData, setStatsData] = useState({
    totalBooks: 0,
    booksThisYear: 0,
    totalPages: 0,
    averageRating: 0,
  })

  // Function to load the options needed for the analyzer
  const fetchOptions = async () => {
    try {
      // Authors
      const { data: authors } = await supabase
        .from("authors")
        .select("id, name")
        .order("name", { ascending: true })
      setAuthorsOptions(authors?.map((a) => ({ value: a.name, label: a.name, id: a.id })) || [])

      // Genres
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

  // Function to load books from Supabase
  const fetchBooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('books')
        .select(`*, author:authors (id,name), genres:genres ( id, name ), series:series (id, name)`)
        .order('id', { ascending: false })
      
      if (error) throw error
      
      // Get quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
      
      if (quotesError) throw quotesError
      
      // Create the quotes map
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

  // Function to calculate statistics
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
   
  // Function to handle book selection
  const handleBookSelect = (book: Book) => {
    setSelectedBook(book)
  }

  // Function to update books
  const handleBookUpdate = (updatedBook: Book) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === updatedBook.id ? updatedBook : book
      )
    )
    // If the updated book is the selected one, update it too
    if (selectedBook && selectedBook.id === updatedBook.id) {
      setSelectedBook(updatedBook)
    }
  }

  // Function to handle selection from search
  const handleSearchBookSelect = (book: any) => {
    console.log('Book selected from search:', book)
  }

  // Function to handle selection from text analyzer
  const handleAnalyzerBookSelect = async (bookData: any) => {
    // 🎯 USE DATA DIRECTLY WITHOUT EXTRA PROCESSING
    setPrefilledData(bookData)
    setShowAnalyzer(false)
    setShowAddBook(true)
  }

  // Load books and options when component mounts
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
        case "order-asc":
          return a.orden - b.orden 
        default:  
          return b.orden - a.orden 
      }
    })

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-v50">
          <div className="text-center">
            <div className="loading h-12 w-12 border-t-2 border-v500 mx-auto mb-4"></div>
            <p className="text">Loading your library...</p>
          </div>
        </div>
      )
    }

  return (
    <div className="min-h-screen bg-v50">
      {/* Container with responsive padding */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header with Add Book Button - Responsive layout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <h1 className="title text-2xl sm:text-3xl lg:text-4xl">My Library</h1>
            <p className="text-v600 text-sm sm:text-base">Manage and explore your personal book collection</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end">
            <BookSearchButton onBookSelect={handleSearchBookSelect} />
            <Button
              onClick={fetchBooks}
              disabled={loading}
              variant="outline"
              className="button-tran h-9 sm:h-10"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`}/>
            </Button>
            <Button
              onClick={() => setShowAnalyzer(true)}
              variant="outline"
              className="button-tran h-9 sm:h-10"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Analyze Text</span>
            </Button>
            <Button
              onClick={() => setShowAddBook(true)}
              className="button1 h-9 sm:h-10"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Add Book</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Stats - Responsive grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-2">
          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="card-title text-sm sm:text-base">Books Read</CardTitle>
              <BookIcon className="icon h-4 w-4 sm:h-5 sm:w-5" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="card-div text-xl sm:text-2xl">{statsData.totalBooks}</div>
              <p className="card-p text-xs sm:text-sm">+{statsData.booksThisYear} this year</p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="card-title text-sm sm:text-base">Pages Read</CardTitle>
              <BookOpen className="icon h-4 w-4 sm:h-5 sm:w-5" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="card-div text-xl sm:text-2xl">{statsData.totalPages.toLocaleString()}</div>
              <p className="card-p text-xs sm:text-sm">
                Average: {Math.round(statsData.totalPages / statsData.totalBooks)} per book
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="card-title text-sm sm:text-base">Average Rating</CardTitle>
              <Star className="icon h-4 w-4 sm:h-5 sm:w-5" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="card-div text-xl sm:text-2xl">{statsData.averageRating}</div>
              <p className="card-p text-xs sm:text-sm">out of 10 points</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search - Responsive layout */}
        <div className="mb-0 space-y-4">
          {/* En móvil: dos filas separadas */}
          <div className="sm:hidden space-y-3">
            {/* Primera fila móvil: Search y View Toggle */}
            <div className="flex gap-3 items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v500 z-10 pointer-events-none" />
                <Input
                  placeholder="Search by title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-white/30 text-gray-700 backdrop-blur-md border bordes rounded-xl placeholder:text-gray-500 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-v500 hover:text-v700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <ViewModeToggle />
            </div>

            {/* Segunda fila móvil: Filtros en grid de 2 columnas */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Favorites */}
              <div className="w-full">
                <Select value={selectedFavorites} onValueChange={setSelectedFavorites}>
                  <SelectTrigger className="setrigger h-9 text-sm w-full max-w-full">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="select-item text-sm">
                      <Library className="icons h-3 w-3" />
                      All books
                    </SelectItem>
                    <SelectItem value="favorites" className="select-item text-sm">
                      <Star className="icons h-3 w-3 fill-purple-500" />
                      Only favorites
                    </SelectItem>
                    <SelectItem value="non-favorites" className="select-item text-sm">
                      <Library className="icons h-3 w-3" />
                      Not favorites
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort by */}
              <div className="w-full">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="setrigger h-9 text-sm w-full max-w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="select-item text-sm">
                      <SortDesc className="icons h-3 w-3" />
                      Order (High to low)
                    </SelectItem>
                    <SelectItem value="order-asc" className="select-item text-sm">
                      <SortAsc className="icons h-3 w-3" />
                      Order (Low to high)
                    </SelectItem>
                    <SelectItem value="rating-desc" className="select-item text-sm">
                      <SortDesc className="icons h-3 w-3" />
                      Rating (Highest)
                    </SelectItem>
                    <SelectItem value="rating-asc" className="select-item text-sm">
                      <SortAsc className="icons h-3 w-3" />
                      Rating (Lowest)
                    </SelectItem>
                    <SelectItem value="title" className="select-item text-sm">
                      <BookOpen className="icons h-3 w-3" />
                      Title (A-Z)
                    </SelectItem>
                    <SelectItem value="author" className="select-item text-sm">
                      <User className="icons h-3 w-3" />
                      Author (A-Z)
                    </SelectItem>
                    <SelectItem value="pages-desc" className="select-item text-sm">
                      <SortDesc className="icons h-3 w-3" />
                      Pages (Most)
                    </SelectItem>
                    <SelectItem value="pages-asc" className="select-item text-sm">
                      <SortAsc className="icons h-3 w-3" />
                      Pages (Least)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* En desktop: layout original (no tocar) */}
          <div className="hidden sm:flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64 order-1 sm:order-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-v500 z-10 pointer-events-none" />
              <Input
                placeholder="Search by title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-12 h-9 bg-white/30 text-gray-700 backdrop-blur-md border bordes rounded-xl sm:rounded-2xl placeholder:text-gray-500 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-v500 hover:text-v700"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center order-3 sm:order-2 w-full sm:w-auto justify-center sm:justify-start">
              {/* Favorites */}
              <Select value={selectedFavorites} onValueChange={setSelectedFavorites}>
                <SelectTrigger className="setrigger h-9 text-sm">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="select-item text-sm">
                    <Library className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    All books
                  </SelectItem>
                  <SelectItem value="favorites" className="select-item text-sm">
                    <Star className="icons h-3 w-3 sm:h-4 sm:w-4 fill-purple-500" />
                    Only favorites
                  </SelectItem>
                  <SelectItem value="non-favorites" className="select-item text-sm">
                    <Library className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Not favorites
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort by */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="setrigger h-9 text-sm">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" className="select-item text-sm">
                    <SortDesc className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Order (High to low)
                  </SelectItem>
                  <SelectItem value="order-asc" className="select-item text-sm">
                    <SortAsc className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Order (Low to high)
                  </SelectItem>
                  <SelectItem value="rating-desc" className="select-item text-sm">
                    <SortDesc className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Rating (Highest)
                  </SelectItem>
                  <SelectItem value="rating-asc" className="select-item text-sm">
                    <SortAsc className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Rating (Lowest)
                  </SelectItem>
                  <SelectItem value="title" className="select-item text-sm">
                    <BookOpen className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Title (A-Z)
                  </SelectItem>
                  <SelectItem value="author" className="select-item text-sm">
                    <User className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Author (A-Z)
                  </SelectItem>
                  <SelectItem value="pages-desc" className="select-item text-sm">
                    <SortDesc className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Pages (Most)
                  </SelectItem>
                  <SelectItem value="pages-asc" className="select-item text-sm">
                    <SortAsc className="icons h-3 w-3 sm:h-4 sm:w-4" />
                    Pages (Least)
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear filters button */}
              {(selectedFavorites !== "all" || sortBy !== "default" || searchTerm) && (
                <Button
                  onClick={() => {
                    setSelectedFavorites("all")
                    setSortBy("default")
                  }}
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm bg-white/30 backdrop-blur-md border border-purple-300/30 rounded-xl sm:rounded-2xl"
                >
                  <X className="icons h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>

            {/* View Toggle */}
            <div className="w-full sm:w-auto order-2 sm:order-3">
              <ViewModeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Books Display */}
      <div className="px-3 sm:px-4 lg:px-6 xl:px-10">
        {viewMode === "cards" ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <BookTable
            books={filteredBooks}
            quotesMap={quotesMap}
            refreshData={fetchBooks}
            onBookSelect={handleBookSelect}
            onBookUpdate={handleBookUpdate}
          />
        )}

        {/* Book details modal */}
        <BookDetailsModal 
          book={selectedBook}
          isOpen={!!selectedBook}
          onOpenChange={(open) => {if (!open) {setSelectedBook(null)}}}
          quotes={selectedBook ? quotesMap[selectedBook.id] || [] : []}
          onBookUpdate={handleBookUpdate}
          refreshData={fetchBooks}
        />

        {/* Text analyzer modal */}
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
        <AddBookModal 
          refreshData={fetchBooks}
          isOpen={showAddBook}
          onOpenChange={setShowAddBook}
          prefilledData={prefilledData}
        />

        {filteredBooks.length === 0 && (
          <Card className="text-center py-8 sm:py-12 bg-white/60 backdrop-blur-sm border-0 mx-3 sm:mx-0">
            <CardContent>
              <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Try adjusting your search filters or add a new book to your library.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}