"use client"

import { useState, useEffect } from "react"
import { BookOpen, Star, Globe, User, Trophy, RefreshCw, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import AddAuthor from "@/components/author/AddAuthor"
import EditAuthor from "@/components/author/EditAuthor"
import DeleteAuthorDialog from "@/components/author/DeleteAuthorDialog"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import type { Author } from "@/lib/types"
import { getContinentColor, getAuthorGenreColor, getGenderColor } from "@/lib/colors"
import { AuthorFilters } from "@/components/author/AuthorFilters"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ImageModal from "@/components/author/ImageModal"

interface AuthorWithStats extends Author {
  slug: string
  books: number
  avgRating: number
  bookTitles: string[]
  totalPages: number
  isAlive: boolean
  age: number
  continent: string
  literary_genre: string
}

// Function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
}

// Function to determine main literary genre
const getMainGenre = (books: any[]): string => {
  const genreCount: Record<string, number> = {}

  books.forEach((book) => {
    // Access Supabase structure
    const genres = book.genres || []
    genres.forEach((genreItem: any) => {
      const genreName = genreItem.genre?.name
      if (genreName) {
        genreCount[genreName] = (genreCount[genreName] || 0) + 1
      }
    })
  })

  const mainGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]
  return mainGenre ? mainGenre[0] : "Various"
}

export default function Authors() {
  const [authorsData, setAuthorsData] = useState<AuthorWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [continentFilter, setContinentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [booksFilter, setBooksFilter] = useState("all")
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAuthorImage, setSelectedAuthorImage] = useState<{url: string, name: string} | null>(null)

  useEffect(() => {
    fetchAuthorsData()
  }, [])

  const fetchAuthorsData = async () => {
    try {
      setLoading(true)

      // Get all authors with their books
      const { data: authors, error: authorsError } = await supabase
        .from("authors")
        .select(`
          id,
          name,
          nationality,
          continent,
          birth_year,
          death_year,
          gender,
          literary_genre,
          biography,
          awards,
          img_url,
          books:books(
            id,
            title,
            rating,
            pages,
            genres:book_genre(
              genre:genres(
                name
              )
            )
          )
        `)
        .order("id", { ascending: false })

      if (authorsError) {
        console.error("Error fetching authors:", authorsError)
        toast.error("Error loading authors")
        return
      }

      // Process data for component format
      const processedAuthors =
        authors?.map((author) => {
          const books = author.books || []
          const bookCount = books.length

          // Calculate average rating
          const validRatings = books.filter((book: any) => book.rating !== null && book.rating !== undefined)
          const avgRating =
            validRatings.length > 0
              ? Number(
                  (
                    validRatings.reduce((sum: number, book: any) => sum + Number(book.rating), 0) / validRatings.length
                  ).toFixed(1),
                )
              : 0

          // Calculate total pages
          const totalPages = books.reduce((sum: number, book: any) => sum + (book.pages || 0), 0)

          // Get book titles
          const bookTitles = books.map((book: any) => book.title)

          // Get main genre from books
          const mainGenre = getMainGenre(books)

          // Determine if author is alive
          const isAlive = !author.death_year
          const currentYear = new Date().getFullYear()
          const age = isAlive
            ? currentYear - (author.birth_year || currentYear)
            : (author.death_year || currentYear) - (author.birth_year || currentYear)

          // Use continent directly from database
          const continent = author.continent || "Unknown"

          // Parse awards
          const awards = author.awards ? author.awards.split(",").map((award: string) => award.trim()) : []

          return {
            id: author.id,
            name: author.name,
            slug: generateSlug(author.name),
            books: bookCount,
            avgRating,
            nationality: author.nationality || "Unknown",
            continent: author.continent || "Unknown",
            literary_genre: author.literary_genre || mainGenre, // Use literary_genre instead of genre
            gender: author.gender || "Not specified",
            birth_year: author.birth_year || 0, // Use birth_year (from Author type)
            death_year: author.death_year, // Use death_year (from Author type)
            biography: author.biography || "", // Use biography (from Author type)
            awards: author.awards || "", // Use awards (from Author type)
            img_url: author.img_url,
            // Additional fields for AuthorWithStats
            age,
            avatar: "/placeholder.svg?height=60&width=60",
            bookTitles,
            totalPages,
            isAlive,
          } as AuthorWithStats
        }) || []

      setAuthorsData(processedAuthors)
    } catch (error) {
      console.error("Error fetching authors:", error)
      toast.error("Error loading authors data")
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorAdded = () => {
    // Refresh the authors list after adding a new one
    fetchAuthorsData()
    toast.success("Author added successfully")
  }

  const handleAuthorUpdated = () => {
    fetchAuthorsData()
    setEditingAuthor(null)
    setIsEditModalOpen(false)
  }

  const handleAuthorDeleted = () => {
    fetchAuthorsData()
    setDeletingAuthor(null)
    setIsDeleteDialogOpen(false)
  }

  const handleEditClick = (author: AuthorWithStats) => {
    setEditingAuthor(author)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (author: AuthorWithStats) => {
    setDeletingAuthor(author)
    setIsDeleteDialogOpen(true)
  }

  //filters
  const handleClearFilters = () => {
    setContinentFilter("all")
    setStatusFilter("all")
    setBooksFilter("all")
  }

  const uniqueContinents = [...new Set(authorsData.map((author) => author.continent))].sort()

  const filteredAuthors = authorsData.filter((author) => {
    const matchesSearch =
      searchQuery === "" ||
      author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.nationality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.literary_genre.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesContinent = continentFilter === "all" || author.continent === continentFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "alive" && author.isAlive) ||
      (statusFilter === "dead" && !author.isAlive)
    const matchesBooks =
      booksFilter === "all" ||
      (booksFilter === "1" && author.books === 1) ||
      (booksFilter === "2-5" && author.books >= 2 && author.books <= 5) ||
      (booksFilter === "6-10" && author.books >= 6 && author.books <= 10) ||
      (booksFilter === "10+" && author.books > 10)

    return matchesSearch && matchesContinent && matchesStatus && matchesBooks
  })
  .sort((a, b) => b.id - a.id)

  // Calculate statistics
  const totalAuthors = authorsData.length
  const totalBooks = authorsData.reduce((sum, author) => sum + author.books, 0)
  const avgRating = totalAuthors > 0 ? authorsData.reduce((sum, author) => sum + author.avgRating, 0) / totalAuthors : 0
  const aliveAuthors = authorsData.filter((author) => author.isAlive).length
  const continents = [...new Set(authorsData.map((author) => author.continent))].length

  const mostReadAuthor = authorsData.length > 0 
  ? authorsData.reduce((most, current) => 
      current.books > most.books ? current : most
    ) 
  : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#e7f3f8" }}>
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-blue-500 border-blue-200 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-blue-600">Loading authors...</p>
        </div>
      </div>
    )
  }

  if (totalAuthors === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#e7f3f8" }}>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-blue-800 mb-2">No authors available</h3>
                <p className="text-blue-600">Add some books to your library to see authors.</p>
                <AddAuthor onAuthorAdded={handleAuthorAdded} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e7f3f8" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Authors</h1>
            <p className="text-blue-600 text-sm sm:text-base">Explore your collection of favorite authors</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={fetchAuthorsData}
              className="border-blue-300 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 bg-transparent h-9 sm:h-10"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <AddAuthor onAuthorAdded={handleAuthorAdded} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-6 mb-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Total Authors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{totalAuthors}</div>
              <p className="text-sm text-blue-600">unique writers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Books per Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">
                {totalAuthors > 0 ? (totalBooks / totalAuthors).toFixed(1) : 0}
              </div>
              <p className="text-sm text-blue-600">average per author</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{avgRating.toFixed(1)}</div>
              <p className="text-sm text-blue-600">average stars</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Continents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{continents}</div>
              <p className="text-sm text-blue-600">world regions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Living Authors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{aliveAuthors}</div>
              <p className="text-sm text-blue-600">currently active</p>
            </CardContent>
          </Card>
        </div>

        <AuthorFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          continentFilter={continentFilter}
          onContinentChange={setContinentFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          booksFilter={booksFilter}
          onBooksChange={setBooksFilter}
          onClearFilters={handleClearFilters}
          uniqueContinents={uniqueContinents}
          filteredCount={filteredAuthors.length}
          totalCount={authorsData.length}
        />

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuthors.map((author) => {
            const continentColor = getContinentColor(author.continent)
            const genreColor = getAuthorGenreColor(author.literary_genre)

            return (
              <Card
                key={author.id}
                className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 min-h-[500px] flex flex-col relative"
              >
                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-blue-200 shadow-lg">
                      <DropdownMenuItem
                        onClick={() => handleEditClick(author)}
                        className="cursor-pointer text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(author)}
                        className="cursor-pointer text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar 
                      className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => author.img_url && setSelectedAuthorImage({url: author.img_url, name: author.name})}
                    >
                      <AvatarImage src={author.img_url || "/placeholder.svg?height=60&width=60"} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg">
                        {author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {author.name}
                      </CardTitle>
                      <CardDescription className="text-sm flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {author.nationality}
                        {author.isAlive && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Alive
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Birth:</span>
                      <div className="font-medium">{author.birth_year || "Unknown"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <div className="font-medium">
                        {author.isAlive ? `${author.age} years` : `${author.age} years (†${author.death_year})`}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {/* Continent badge with inline styles */}
                    <span
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-gray-200"
                      style={{
                        backgroundColor: continentColor.bg,
                        color: continentColor.text,
                        borderColor: continentColor.bg,
                      }}
                    >
                      {author.continent}
                    </span>

                    {/* Genre badge with inline styles */}
                    <span
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-gray-200"
                      style={{
                        backgroundColor: genreColor.bg,
                        color: genreColor.text,
                        borderColor: genreColor.bg,
                      }}
                    >
                      {author.literary_genre}
                    </span>

                    {/* Author gender badge */}
                    <span
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-gray-200"
                      style={{
                        backgroundColor: getGenderColor(author.gender).bg,
                        color: getGenderColor(author.gender).text,
                        borderColor: getGenderColor(author.gender).bg,
                      }}
                    >
                      {author.gender}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{author.books}</div>
                      <div className="text-xs text-muted-foreground">Books</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{author.avgRating}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-cyan-600">{author.totalPages}</div>
                      <div className="text-xs text-muted-foreground">Pages</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground italic line-clamp-2">{author.biography}</p>

                  {/* Awards */}
                  {author.awards && author.awards.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const awardsArray = author.awards.split(",").map((award: string) => award.trim())
                          return (
                            <>
                              {awardsArray.slice(0, 2).map((award: string, awardIndex: number) => (
                                <Badge
                                  key={awardIndex}
                                  variant="outline"
                                  className="text-xs bg-yellow-50 text-yellow-800 flex items-center gap-1"
                                >
                                  <Trophy className="h-3 w-3" /> {award}
                                </Badge>
                              ))}
                              {awardsArray.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{awardsArray.length - 2} more
                                </Badge>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Books */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      {author.bookTitles.slice(0, 2).map((book, bookIndex) => (
                        <div key={bookIndex} className="flex items-center gap-2">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{book}</span>
                        </div>
                      ))}
                      {author.bookTitles.length > 2 && (
                        <div className="text-xs text-muted-foreground pl-5">
                          +{author.bookTitles.length - 2} more book(s)
                        </div>
                      )}
                    </div>
                  </div>
                  {author.books === 1 && <div className="h-6"></div>}
                  {/* Rating Display */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Average rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold">{author.avgRating}</span>
                    </div>
                  </div>
                  {author.books === 1 && <div className="flex-1"></div>}
                  {/* View All Books Button */}
                  <Link href={`/authors/${author.slug}`}>
                    <Button
                      variant="outline"
                      className="w-full mt-2 group-hover:bg-blue-50 group-hover:border-blue-200 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View all books
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Author Insights */}
        <Card className="mt-4 bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="h-5 w-5" />
              Author Insights
            </CardTitle>
            <CardDescription>Analysis of your favorite authors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Most Read Author</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={mostReadAuthor?.img_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {mostReadAuthor?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "N/A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mostReadAuthor?.name || "None"}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {mostReadAuthor?.books || 0} books • {mostReadAuthor?.avgRating || 0}
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Highest Rated</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={authorsData.sort((a, b) => b.avgRating - a.avgRating)[0]?.img_url || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {authorsData
                        .sort((a, b) => b.avgRating - a.avgRating)[0]
                        ?.name?.split(" ")
                        .map((n) => n[0])
                        .join("") || "N/A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {authorsData.sort((a, b) => b.avgRating - a.avgRating)[0]?.name || "None"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {authorsData.sort((a, b) => b.avgRating - a.avgRating)[0]?.avgRating || 0}
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> average
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Most Read Continent</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {Object.entries(
                        authorsData.reduce(
                          (acc, author) => {
                            acc[author.continent] = (acc[author.continent] || 0) + author.books
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                      ).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Object.entries(
                        authorsData.reduce(
                          (acc, author) => {
                            acc[author.continent] = (acc[author.continent] || 0) + 1
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                      ).sort((a, b) => b[1] - a[1])[0]?.[1] || 0}{" "}
                      authors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit and Delete Modals */}
        {editingAuthor && (
          <EditAuthor
            author={editingAuthor}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setEditingAuthor(null)
            }}
            onAuthorUpdated={handleAuthorUpdated}
          />
        )}

        <DeleteAuthorDialog
          author={deletingAuthor}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setDeletingAuthor(null)
          }}
          onAuthorDeleted={handleAuthorDeleted}
        />
      </div>
      <ImageModal
        isOpen={!!selectedAuthorImage}
        onClose={() => setSelectedAuthorImage(null)}
        imageUrl={selectedAuthorImage?.url || ""}
        alt={selectedAuthorImage?.name || ""}
      />
    </div>
  )
}