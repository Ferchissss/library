// app/genres/page.tsx
"use client"

import { useState, useEffect } from "react"
import { BookOpen, Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { getGenreColor } from "@/lib/colors"
import { GenreEditor } from "@/components/genres/GenreEditor"
import { toast } from "sonner"
import type { Genre } from "@/lib/types"

interface GenreData {
  id: number
  name: string
  slug: string
  count: number
  percentage: number
  color: string
  description: string
  books: string[]
  avgRating: number
}

export default function Genres() {
  const [genresData, setGenresData] = useState<GenreData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGenresData()
  }, [])

  const fetchGenresData = async () => {
    try {
      setLoading(true)
      
      // Get all genres with their books and description
      const { data: genres, error: genresError } = await supabase
        .from('genres')
        .select(`
          id,
          name,
          description,
          book_genre(
            book:books(
              id,
              title,
              rating
            )
          )
        `)

      if (genresError) {
        console.error("Error fetching genres:", genresError)
        return
      }

      // Process data for component format
      const processedGenres = genres?.map(genre => {
        // Extract books from Supabase relation format
        const books = genre.book_genre?.map((bg: any) => bg.book) || []
        const bookCount = books.length
        
        // Calculate average rating
        const validRatings = books.filter((book: any) => book.rating !== null && book.rating !== undefined)
        const avgRating = validRatings.length > 0 
          ? Number((validRatings.reduce((sum: number, book: any) => sum + Number(book.rating), 0) / validRatings.length).toFixed(1))
          : 0

        // Get featured books
        const featuredBooks = books
          .slice(0, 4)
          .map((book: any) => book.title)

        return {
          id: genre.id,
          name: genre.name,
          slug: genre.name.toLowerCase().replace(/\s+/g, '-'),
          count: bookCount,
          percentage: 0, // Will be calculated later
          color: getGenreColor(genre.name),
          description: genre.description || "Diverse collection of books",
          books: featuredBooks,
          avgRating,
        }
      }).filter(genre => genre.count > 0) || []

      // Calculate percentages after having all genres
      const totalBooks = processedGenres.reduce((sum, genre) => sum + genre.count, 0)
      const genresWithPercentages = processedGenres.map(genre => ({
        ...genre,
        percentage: totalBooks > 0 ? Math.round((genre.count / totalBooks) * 100) : 0
      })).sort((a, b) => b.count - a.count)

      setGenresData(genresWithPercentages)

    } catch (error) {
      console.error("Error fetching genres:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenreUpdate = (updatedGenre: Genre) => {
    setGenresData(prevGenres => 
      prevGenres.map(genre => 
        genre.id === updatedGenre.id 
          ? { 
              ...genre, 
              name: updatedGenre.name, 
              description: updatedGenre.description || "Diverse collection of books",
              slug: updatedGenre.name.toLowerCase().replace(/\s+/g, '-')
            }
          : genre
      )
    )
    toast.success("Genre updated successfully")
  }

  const handleEditCancel = () => {
    // No necesitamos hacer nada especial aquí
  }

  // Calculate general statistics
  const totalGenres = genresData.length
  const favoriteGenre = genresData[0] || { name: "None", count: 0 }
  const bestRatedGenre = genresData.reduce((best, current) => 
    current.avgRating > best.avgRating ? current : best, 
    { avgRating: 0, name: "None" }
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fcf1f6" }}>
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-pink-500 border-pink-200 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-pink-600">Loading genres...</p>
        </div>
      </div>
    )
  }

  if (totalGenres === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fcf1f6" }}>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-pink-400 mb-4" />
                <h3 className="text-lg font-semibold text-pink-800 mb-2">No genres available</h3>
                <p className="text-pink-600">Add some books to your library to see genre statistics.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fcf1f6" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-pink-700">Total Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-800">{totalGenres}</div>
              <p className="text-sm text-pink-600">genres explored</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-pink-700">Favorite Genre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-pink-800">{favoriteGenre.name}</div>
              <p className="text-sm text-pink-600">{favoriteGenre.count} books read</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-pink-700">Best Rated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-pink-800">{bestRatedGenre.name}</div>
              <p className="text-sm text-pink-600 flex items-center gap-1">
                {bestRatedGenre.avgRating}
                <Star className="w-4 h-4 fill-pink-600 text-pink-600" /> 
                average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {genresData.map((genre) => (
            <Card
              key={genre.id}
              className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 overflow-hidden"
            >
              <div className={`h-2`} style={{ backgroundColor: genre.color }} />

              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl group-hover:text-pink-600 transition-colors">
                      {genre.name}
                    </CardTitle>
                    <GenreEditor 
                      genre={{
                        id: genre.id,
                        name: genre.name,
                        description: genre.description
                      }}
                      onSave={handleGenreUpdate}
                      onCancel={handleEditCancel}
                    />
                  </div>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                    {genre.count} books
                  </Badge>
                </div>
                <CardDescription className="text-sm">{genre.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Percentage of your library</span>
                    <span className="text-muted-foreground">{genre.percentage}%</span>
                  </div>
                  <Progress value={genre.percentage} className="h-2" />
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average rating</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold">{genre.avgRating}</span>
                    <span className="text-yellow-500"><Star className="w-4 h-4 text-yellow-600" /> </span>
                  </div>
                </div>

                {/* Sample Books */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Featured books:</span>
                  <div className="flex flex-wrap gap-1">
                    {genre.books.slice(0, 3).map((book, bookIndex) => (
                      <Badge key={bookIndex} variant="outline" className="text-xs">
                        {book}
                      </Badge>
                    ))}
                    {genre.books.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{genre.books.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* View All Button */}
                <Link href={`/genres/${genre.slug}`}>
                  <Button
                    variant="outline"
                    className="w-full mt-4 group-hover:bg-pink-50 group-hover:border-pink-200 bg-transparent border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View all books
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Genre Trends */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-800">
              <TrendingUp className="h-5 w-5" />
              Reading Trends
            </CardTitle>
            <CardDescription>Analysis of your genre preferences over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  • You've explored <strong>{totalGenres} different genres</strong> in your library
                </p>
                <p>
                  • Your favorite genre is <strong>{favoriteGenre.name}</strong> with {favoriteGenre.count} books
                </p>
                <p>
                  • The best rated genre is <strong>{bestRatedGenre.name}</strong> with {bestRatedGenre.avgRating} stars average
                </p>
                <p>• You have a balanced distribution between fiction and non-fiction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}