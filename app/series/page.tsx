"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getQuoteCategoryColor } from "@/lib/colors"

interface Book {
  title: string
  rating?: number
}

interface Series {
  id: number
  name: string
  author: string
  totalBooks: number
  genre: string
  avgRating: number
  cover: string
  books: Book[]
}

export default function Series() {
  const [seriesData, setSeriesData] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [selectedLength, setSelectedLength] = useState("All")

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch('/api/series')
        if (!response.ok) {
          throw new Error('Failed to fetch series')
        }
        const data = await response.json()
        setSeriesData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [])

  // Filter series
  const filteredSeries = seriesData.filter((series) => {
    const matchesSearch = 
      series.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGenre = selectedGenre === "All" || series.genre === selectedGenre
    
    const matchesLength = 
      selectedLength === "All" ||
      (selectedLength === "Trilogy" && series.totalBooks === 3) ||
      (selectedLength === "Duology" && series.totalBooks === 2) ||
      (selectedLength === "Saga" && series.totalBooks > 3) ||
      (selectedLength === "Standalone" && series.totalBooks === 1)

    return matchesSearch && matchesGenre && matchesLength
  })

  // Get unique genres
  const uniqueGenres = Array.from(new Set(seriesData.map(series => series.genre)))

  const totalSeries = filteredSeries.length
  const totalBooksInSeries = filteredSeries.reduce((sum, series) => sum + series.totalBooks, 0)
  
  // Calculate favorite genres (from filtered series)
  const genreCount = filteredSeries.reduce((acc, series) => {
    acc[series.genre] = (acc[series.genre] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Find best rated series
  const bestRatedSeries = filteredSeries.reduce((best, current) => 
    current.avgRating > best.avgRating ? current : best, 
    { avgRating: 0, name: '' } as Series
  )

  // Find longest series
  const longestSeries = filteredSeries.reduce((longest, current) => 
    current.totalBooks > longest.totalBooks ? current : longest, 
    { totalBooks: 0, name: '' } as Series
  )

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fbf3dd" }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading series...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fbf3dd" }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fbf3dd" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-yellow-800">My Series</h1>
          <p className="text-yellow-600">Your collection of literary sagas</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-yellow-700">Total Series</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-800">{totalSeries}</div>
              <p className="text-sm text-yellow-600">sagas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-yellow-700">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-800">{totalBooksInSeries}</div>
              <p className="text-sm text-yellow-600">books in series</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 h-5 w-5 z-10 pointer-events-none" />
              <Input
                placeholder="Search series or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 sm:h-10 bg-white/30 backdrop-blur-sm border-yellow-200 rounded-xl text-yellow-800 placeholder-yellow-400 focus:ring-yellow-300 text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-yellow-500 hover:text-yellow-700"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-2">
              {/* Genre Filter */}
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-yellow-200 rounded-xl text-yellow-800 focus:ring-yellow-300 text-sm w-32 sm:w-36">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm border-yellow-200 rounded-xl">
                  <SelectItem value="All" className="text-yellow-800 focus:bg-yellow-50 focus:text-yellow-800">
                    All genres
                  </SelectItem>
                  {uniqueGenres.map((genre) => (
                    <SelectItem 
                      key={genre} 
                      value={genre}
                      className="text-yellow-800 focus:bg-yellow-50 focus:text-yellow-800"
                    >
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Length Filter */}
              <Select value={selectedLength} onValueChange={setSelectedLength}>
                <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-yellow-200 rounded-xl text-yellow-800 focus:ring-yellow-300 text-sm w-32 sm:w-36">
                  <SelectValue placeholder="Length" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm border-yellow-200 rounded-xl">
                  <SelectItem value="All" className="text-yellow-800 focus:bg-yellow-50 focus:text-yellow-800">
                    All lengths
                  </SelectItem>
                  <SelectItem value="Standalone" className="text-yellow-800 focus:bg-yellow-50 focus:text-yellow-800">
                    Standalone 
                  </SelectItem>
                  <SelectItem value="Duology" className="text-yellow-800 focus:bg-yellow-50 focus:text-yellow-800">
                    Duology 
                  </SelectItem>
                  <SelectItem value="Trilogy" className="text-yellow-800 focus:bg-yellow-50 focus:text-yellow-800">
                    Trilogy 
                  </SelectItem>
                  <SelectItem value="Saga" className="text-yellow-800 focus:bg-yellow-50 focus:text-yellow-800">
                    Saga
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Button */}
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedGenre("All")
                  setSelectedLength("All")
                }}
                disabled={!searchTerm && selectedGenre === "All" && selectedLength === "All"}
                className="h-9 px-3 bg-white/30 backdrop-blur-sm border border-yellow-200 rounded-xl text-yellow-700 hover:bg-yellow-50 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" /> 
              </button>
            </div>
          </div>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
          {filteredSeries.map((series) => (
            <Card
              key={series.id}
              className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={series.cover}
                    alt={series.name}
                    className="w-16 h-24 object-cover rounded-md shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl group-hover:text-yellow-600 transition-colors">
                          {series.name}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">by {series.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={`${getQuoteCategoryColor(series.genre).bg} ${getQuoteCategoryColor(series.genre).text} ${getQuoteCategoryColor(series.genre).border}`}
                          >
                            {series.genre}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">{series.avgRating}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {series.totalBooks} {series.totalBooks === 1 ? 'book' : 'books'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Books List */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Books in the series:</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {series.books.map((book, bookIndex) => (
                      <div key={bookIndex} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-800">{book.title}</span>
                        </div>
                        {book.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{book.rating}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredSeries.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No series found with the selected filters.
              </p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting the filters or search.</p>
            </CardContent>
          </Card>
        )}

        {/* Series Insights */}
        {filteredSeries.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <TrendingUp className="h-5 w-5" />
                Series Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">General Statistics</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      • Best rated series: <strong>{bestRatedSeries.name}</strong> 
                      <span className="flex items-center gap-1">
                        ({bestRatedSeries.avgRating}
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />)
                      </span>
                    </p>
                    <p>
                      • Longest series: <strong>{longestSeries.name}</strong> ({longestSeries.totalBooks} books)
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Favorite Genres</h3>
                  <div className="space-y-2">
                    {Object.entries(genreCount).map(([genre, count]) => {
                      const genreColor = getQuoteCategoryColor(genre)
                      return (
                        <div key={genre} className="flex items-center justify-between">
                          <span className="text-sm">{genre}</span>
                          <Badge 
                            variant="outline" 
                            className={`${genreColor.bg} ${genreColor.text} ${genreColor.border}`}
                          >
                            {count} {count === 1 ? 'series' : 'series'}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}