// app/genres/[slug]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { BookOpen, TrendingUp, LayoutList, Rows3, GripHorizontal, Search, ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import type { Book, Genre } from "@/lib/types"
import Link from "next/link"
import { BookListView } from "@/components/genres/book-list-view"
import { BookGridExpanded } from "@/components/genres/book-grid-expanded"
import { BookCarouselView } from "@/components/genres/book-carousel-view"
import { GenreEditor } from "@/components/genres/GenreEditor"
import { toast } from "sonner"

type ViewMode = "list" | "grid-expanded" | "carousel"

export default function GenreBooksPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [genre, setGenre] = useState<Genre | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid-expanded")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isEditingGenre, setIsEditingGenre] = useState(false)
  const [totalAllBooks, setTotalAllBooks] = useState(0)

  useEffect(() => {
    fetchGenreData()
  }, [slug])

  useEffect(() => {
    filterBooks()
  }, [books, searchQuery])

  const fetchGenreData = async () => {
    try {
      setLoading(true)
      
      // Get genre by name (convert slug to name)
      const genreName = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')

      // Get genre with its books
      const { data: genres, error } = await supabase
      .from('genres')
      .select(`
        id,
        name,
        description,
        book_genre(
          book:books(
            id,
            title,
            rating,
            pages,
            year,
            publisher,
            favorite,
            summary,
            review,
            image_url,
            author:author_id(
              id,
              name
            ),
            genres(
              id,
              name
            )
          )
        )
      `)
      .eq('name', genreName)

      if (error) {
        console.error("Error fetching genre:", error)
        return
      }

      if (genres && genres.length > 0) {
        const genreData = genres[0]
        setGenre(genreData)
        
        // Extract and transform books
        const booksData = genreData.book_genre?.map((bg: any) => ({
          ...bg.book,
          author: bg.book.author,
          genres: bg.book.genres,
          series: bg.book.series
        })) || []
        
        setBooks(booksData)
      }
      const { count: totalCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
    
    setTotalAllBooks(totalCount || 0)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterBooks = () => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author?.name.toLowerCase().includes(query) ||
      book.summary?.toLowerCase().includes(query) ||
      book.review?.toLowerCase().includes(query)
    )
    setFilteredBooks(filtered)
  }

  const buttonClass = (mode: ViewMode) => 
    `transition-all ${viewMode === mode ? "bg-pink-600 text-white border-pink-600" : "bg-transparent border-pink-200 text-pink-700 hover:bg-pink-50"}`

  // Calculate statistics
  const totalBooks = books.length
  const avgRating = totalBooks > 0 
    ? Number((books.reduce((sum, book) => sum + (book.rating || 0), 0) / totalBooks).toFixed(1))
    : 0
  const favoriteBooks = books.filter(book => book.favorite).length
  const totalPages = books.reduce((sum, book) => sum + (book.pages || 0), 0)
  const bestRatedBook = totalBooks > 0 
    ? Math.max(...books.map(book => book.rating || 0))
    : 0
  // Función para manejar el guardado exitoso
  const handleGenreUpdate = (updatedGenre: Genre) => {
    setGenre(updatedGenre)
    toast.success("Genre updated successfully")
  }

  // Función para manejar cancelación
  const handleEditCancel = () => {
    // No necesitamos hacer nada especial aquí
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fcf1f6" }}>
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-pink-500 border-pink-200 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-pink-600">Loading books...</p>
        </div>
      </div>
    )
  }

  if (!genre) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fcf1f6" }}>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-pink-400 mb-4" />
                <h3 className="text-lg font-semibold text-pink-800 mb-2">Genre not found</h3>
                <p className="text-pink-600">The genre you're looking for doesn't exist in your library.</p>
                <Link href="/genres">
                  <Button className="mt-4 bg-pink-600 hover:bg-pink-700 text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Genres
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fcf1f6" }}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-3 sm:mb-4">
          <Link href="/genres">
            <Button variant="outline" size="sm" className="bg-transparent border-pink-200 text-pink-700 hover:bg-pink-100 text-sm">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Back to Genres
            </Button>
          </Link>
        </div>

        {/* Genre Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 mb-3 sm:mb-4 py-3 sm:py-0 sm:h-24 flex flex-col justify-center">
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div className="flex-1 min-w-0 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl text-pink-800 truncate">
                      {genre.name}
                    </CardTitle>
                    <GenreEditor 
                      genre={genre}
                      onSave={handleGenreUpdate}
                      onCancel={handleEditCancel}
                    />
                  </div>
                  <CardDescription className="text-sm sm:text-base md:text-lg text-pink-600 line-clamp-2">
                    {genre.description}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-pink-100 text-pink-800 text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 pointer-events-none w-fit self-end sm:self-auto">
                {totalBooks} {totalBooks === 1 ? 'book' : 'books'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* View Controls and Search */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 h-4 w-4 sm:h-5 sm:w-5 z-10 pointer-events-none" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 h-9 sm:h-10 bg-white/30 backdrop-blur-sm border-pink-200 rounded-xl text-pink-800 placeholder-pink-400 focus:ring-pink-300 text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-pink-500 hover:text-pink-700"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-2">
              {/* List View */}
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3 ${buttonClass("list")}`}
                title="List"
              >
                <LayoutList className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1 sm:ml-2">List</span>
              </Button>

              {/* Grid Expanded View */}
              <Button
                variant={viewMode === "grid-expanded" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid-expanded")}
                className={`h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3 ${buttonClass("grid-expanded")}`}
                title="Expanded Grid"
              >
                <Rows3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1 sm:ml-2">Grid</span>
              </Button>

              {/* Carousel View */}
              <Button
                variant={viewMode === "carousel" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("carousel")}
                className={`h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3 ${buttonClass("carousel")}`}
                title="Carousel"
              >
                <GripHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1 sm:ml-2">Carousel</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Books View */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-pink-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-pink-800 mb-2">
              {searchQuery ? "No books found" : "No books in this genre"}
            </h3>
            <p className="text-pink-600 text-sm sm:text-base">
              {searchQuery 
                ? "Try different search terms."
                : "Add some books to this genre to see them here."
              }
            </p>
          </div>
        ) : (
          <>
            {viewMode === "list" && <BookListView books={filteredBooks} />}
            {viewMode === "grid-expanded" && <BookGridExpanded books={filteredBooks} />}
            {viewMode === "carousel" && <BookCarouselView books={filteredBooks} />}
          </>
        )}

        {/* Genre Trends */}
        <Card className="mt-4 sm:mt-6 bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-pink-800 text-lg sm:text-xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              {genre.name} Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="text-xs sm:text-sm text-pink-600 space-y-1 sm:space-y-2">
                <p className="leading-relaxed">
                  • <strong>{favoriteBooks} books</strong> marked as favorites in this genre
                </p>
                <p className="leading-relaxed">
                  • The highest rated book has <strong>{bestRatedBook}/10</strong> points
                </p>
                <p className="leading-relaxed">
                  • You've read <strong>{totalPages} pages</strong> total in this genre
                </p>
                <p className="leading-relaxed">
                  • Average rating: <strong>{avgRating}/10</strong> stars
                </p>
                <p className="leading-relaxed">
                  • Represents <strong>{((totalBooks / totalAllBooks) * 100).toFixed(1)}%</strong> of your total library
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}