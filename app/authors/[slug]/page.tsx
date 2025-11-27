"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ChevronLeft, Star, Globe, Award, Trophy, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import type { Author, Book } from "@/lib/types"
import { getContinentColor, getAuthorGenreColor } from "@/lib/colors"
import { toast } from "sonner"
import EditAuthor from "@/components/author/EditAuthor"
import DeleteAuthorDialog from "@/components/author/DeleteAuthorDialog"
import ImageModal from "@/components/author/ImageModal"

interface AuthorWithBooks extends Author {
  books: Book[]
  slug: string
  avgRating: number
  totalPages: number
  isAlive: boolean
  age: number
}

export default function AuthorDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [author, setAuthor] = useState<AuthorWithBooks | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAuthorImage, setSelectedAuthorImage] = useState<{url: string, name: string} | null>(null)

  useEffect(() => {
    fetchAuthorData()
  }, [slug])

  const fetchAuthorData = async () => {
    try {
        setLoading(true)
        
        // First, get all authors to find match by slug
        const { data: authors, error } = await supabase
        .from('authors')
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
            year,
            publisher,
            favorite,
            summary,
            review,
            image_url,
            genres:book_genre(
                genre:genres(
                id,
                name
                )
            )
            )
        `)
        .order('name')

        if (error) {
        console.error("Error fetching authors:", error)
        return
        }

        if (authors) {
        // Find author whose slug matches
        const foundAuthor = authors.find(author => {
            const authorSlug = author.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            return authorSlug === slug
        })

        if (foundAuthor) {
          const books = foundAuthor.books || []
          
          // Calculate statistics
          const validRatings = books.filter((book: any) => book.rating !== null && book.rating !== undefined)
          const avgRating = validRatings.length > 0 
          ? Number((validRatings.reduce((sum: number, book: any) => sum + Number(book.rating), 0) / validRatings.length).toFixed(1))
          : 0

          const totalPages = books.reduce((sum: number, book: any) => sum + (book.pages || 0), 0)
          const isAlive = !foundAuthor.death_year
          const currentYear = new Date().getFullYear()
          const age = isAlive 
          ? currentYear - (foundAuthor.birth_year || currentYear)
          : (foundAuthor.death_year || currentYear) - (foundAuthor.birth_year || currentYear)

          const authorWithStats: AuthorWithBooks = {
          ...foundAuthor,
          books: books.map((book: any) => ({
          ...book,
          genres: book.genres?.map((bg: any) => bg.genre) || []
          })),
          slug,
          avgRating,
          totalPages,
          isAlive,
          age,
          img_url: foundAuthor.img_url
        }

        setAuthor(authorWithStats)
      }
    }
  } catch (error) {
    console.error("Error:", error)
  } finally {
    setLoading(false)
  }
}
  const handleAuthorUpdated = () => {
    fetchAuthorData() // Reload data
    setEditingAuthor(null)
    setIsEditModalOpen(false)
    toast.success("Author updated successfully")
  }

  const handleAuthorDeleted = () => {
    // Redirect to authors page after deleting
    window.location.href = "/authors"
  }

  const handleEditClick = () => {
    if (author) {
      setEditingAuthor(author)
      setIsEditModalOpen(true)
    }
  }

  const handleDeleteClick = () => {
    if (author) {
      setDeletingAuthor(author)
      setIsDeleteDialogOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#e7f3f8" }}>
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-blue-500 border-blue-200 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-blue-600">Loading author...</p>
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#e7f3f8" }}>
        <div className="container mx-auto px-4 py-8">
          <Link href="/authors">
            <Button variant="outline" className="mb-8 border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Authors
            </Button>
          </Link>
          <Card className="text-center py-12 bg-white/80 backdrop-blur-sm border-0">
            <CardContent>
              <p className="text-lg text-blue-600">Author not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const continentColor = getContinentColor(author.continent || "Unknown")
  const genreColor = getAuthorGenreColor(author.literary_genre || "Various") 

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e7f3f8" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/authors">
          <Button variant="outline" className="mb-8 border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Authors
          </Button>
        </Link>

        {/* Author Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 via-blue-50 to-cyan-50 border-0 overflow-hidden relative">
          {/* Dropdown Menu */}
          <div className="absolute top-4 right-4 z-10">
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
                  onClick={handleEditClick}
                  className="cursor-pointer text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="cursor-pointer text-red-600 hover:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar 
                  className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => author.img_url && setSelectedAuthorImage({url: author.img_url, name: author.name})}
                >
                  <AvatarImage 
                    src={author.img_url || "/placeholder.svg?height=200&width=200"} 
                    alt={author.name} 
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-3xl">
                    {author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Author Info */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-3">{author.name}</h1>
                <p className="text-lg text-blue-600 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {author.nationality} • {author.continent}
                </p>

                <p className="text-gray-700 max-w-2xl mb-6 leading-relaxed">{author.biography}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{author.books.length}</div>
                    <div className="text-sm text-blue-600">Books</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{author.avgRating}</div>
                    <div className="text-sm text-blue-600">Rating</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600">{author.totalPages}</div>
                    <div className="text-sm text-blue-600">Pages</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {author.isAlive ? `${author.age} years` : `${author.age} years (†${author.death_year})`}
                    </div>
                    <div className="text-sm text-blue-600">Age</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-6">
                  <span 
                    className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold border-gray-200"
                    style={{
                      backgroundColor: continentColor.bg,
                      color: continentColor.text,
                      borderColor: continentColor.bg
                    }}
                  >
                    {author.continent}
                  </span>
                  <span 
                    className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold border-gray-200"
                    style={{
                      backgroundColor: genreColor.bg,
                      color: genreColor.text,
                      borderColor: genreColor.bg
                    }}
                  >
                    {author.literary_genre}
                  </span>
                  {author.isAlive && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Alive
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Section */}
        <div className="mb-8">
          {/* Books Grid */}
          <div
            className={`grid gap-6 ${
              author.books.length === 1 ? "grid-cols-1 md:grid-cols-1 max-w-2xl" : 
              author.books.length === 2 ? "grid-cols-1 md:grid-cols-2" : 
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {author.books.map((book, index) => (
              <Card
                key={book.id}
                className="group hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 overflow-hidden"
              >
                <CardHeader className="pb-0">
                  {/* Book Number Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Book {index + 1}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700">
                      {book.year}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-blue-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {book.title}
                  </h3>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1">
                    {book.genres?.slice(0, 2).map((genre: any, genreIndex: number) => (
                      <Badge key={genreIndex} variant="secondary" className="bg-emerald-100 text-emerald-800">
                        {genre.name}
                      </Badge>
                    ))}
                    {book.genres && book.genres.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{book.genres.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 line-clamp-3 leading-relaxed">
                    {book.summary || "Description not available."}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-xl font-bold text-cyan-600">{book.pages || "N/A"}</div>
                      <div className="text-xs text-gray-600">Pages</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl font-bold text-yellow-600">{book.rating || "N/A"}</span>
                      </div>
                      <div className="text-xs text-gray-600">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{book.year || "N/A"}</div>
                      <div className="text-xs text-gray-600">Publication</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards Section */}
        {author.awards && author.awards.length > 0 && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Award className="h-5 w-5" />
                Awards and Recognitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {author.awards.split(',').map((award: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span className="text-gray-800 font-medium">{award.trim()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedAuthorImage}
        onClose={() => setSelectedAuthorImage(null)}
        imageUrl={selectedAuthorImage?.url || ""}
        alt={selectedAuthorImage?.name || ""}
      />
    </div>
  )
}