"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, User, Calendar, ExternalLink, Plus } from "lucide-react"
import { AddBookModal } from "./add-book-modal"
import { supabase } from "@/lib/supabaseClient"

interface BookSearchDetailsProps {
  book: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  refreshData?: () => void
}

const getLanguageName = (languageCode: string): string => {
  const languageMap: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ar': 'Arabic',
  }
  
  return languageMap[languageCode.toLowerCase()] || languageCode.toUpperCase()
}

export function BookSearchDetails({ book, isOpen, onOpenChange, refreshData }: BookSearchDetailsProps) {
  const [prefilledData, setPrefilledData] = useState<any>(null)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  
  // States for options needed for the hook
  const [genresOptions, setGenresOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [authorsOptions, setAuthorsOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [seriesOptions, setSeriesOptions] = useState<{ value: string; label: string; id?: number }[]>([])

  // Load basic options when opening the modal
  useEffect(() => {
    const fetchOptionsAndPrepareData = async () => {
      if (!isOpen || !book) return

      try {
        // Authors
        const { data: authors } = await supabase.from("authors").select("id, name").order("name", { ascending: true })
        setAuthorsOptions(authors?.map((a) => ({ value: a.name, label: a.name, id: a.id })) || [])

        // Genres
        const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true })
        setGenresOptions(genres?.map((g) => ({ value: g.name, label: g.name, id: g.id })) || [])

        // Series
        const { data: series } = await supabase.from("series").select("id, name").order("name", { ascending: true })
        setSeriesOptions(series?.map((s) => ({ value: s.name, label: s.name, id: s.id })) || [])

        // Prepare data immediately when modal opens
        const preparedData = prepareBookDataDirectly()
        setPrefilledData(preparedData)
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }

    fetchOptionsAndPrepareData()
  }, [isOpen, book])

  const handleOpenAddBook = () => {
    // Close details modal and open add book modal
    onOpenChange(false)
    setIsAddBookOpen(true)
  }

  const handleCloseAddBook = () => {
    setIsAddBookOpen(false)
    setPrefilledData(null)
  }

  if (!book) return null

  // Direct method as fallback - mapping exactly the form fields
  const prepareBookDataDirectly = () => {
    const volumeInfo = book.volumeInfo
    
    // Find existing IDs for authors and genres
    const authorName = volumeInfo.authors?.[0] || ""
    const existingAuthor = authorsOptions.find(a => a.value === authorName)
    
    const genreNames = volumeInfo.categories || []
    const genreIds = genreNames
      .map((genreName: string) => {
        const existingGenre = genresOptions.find(g => g.value === genreName)
        return existingGenre?.id || null
      })
      .filter((id: number | null): id is number => id !== null)

    return {
      title: volumeInfo.title || "",
      author: authorName,
      authorId: existingAuthor?.id || null,
      genres: genreNames,
      genreIds: genreIds,
      rating: "",
      type: "",
      pages: volumeInfo.pageCount?.toString() || "",
      dateStarted: "",
      dateRead: "",
      year: volumeInfo.publishedDate?.split('-')[0] || "",
      publisher: volumeInfo.publisher || "",
      language: getLanguageName(volumeInfo.language || ""),
      era: "",
      format: "Physical", // Default value
      audience: "Adult", // Default value
      readingDensity: "Medium",
      awards: "",
      cover: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || "",
      mainCharacters: [],
      favoriteCharacter: "",
      isFavorite: false,
      summary: "",
      review: "",
      series: "",
      seriesId: null,
      quotes: [],
    }
  }

  const volumeInfo = book.volumeInfo

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Book Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Main Information */}
            <Card className="bordes">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cover */}
                  <div className="flex justify-center">
                    <div className="w-48 h-64 bg-gray-100 rounded-lg shadow-md overflow-hidden">
                      {volumeInfo.imageLinks?.thumbnail ? (
                        <img
                          src={volumeInfo.imageLinks.thumbnail.replace('zoom=1', 'zoom=2')}
                          alt={volumeInfo.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-book.png'
                          }}
                        />
                      ) : (
                        <div className="btn-cover">
                          <BookOpen className="h-16 w-16 text-v400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">{volumeInfo.title}</h1>
                      {volumeInfo.subtitle && (
                        <p className="text-lg text-gray-600 mb-3">{volumeInfo.subtitle}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Authors */}
                      {volumeInfo.authors && (
                        <div className="flex items-start gap-2">
                          <User className="h-5 w-5 text-v600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-gray-700">Author(s): </span>
                            <span className="text-gray-600">{volumeInfo.authors.join(', ')}</span>
                          </div>
                        </div>
                      )}

                      {/* Genres */}
                      {volumeInfo.categories && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-700">Genres:</span>
                          <div className="flex flex-wrap gap-1">
                            {volumeInfo.categories.map((category: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-v50 text-v700 text-xs"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Publication date */}
                      {volumeInfo.publishedDate && (
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-semibold text-gray-700">Year: </span>
                            <span className="text-gray-600">{volumeInfo.publishedDate.split('-')[0]}</span>
                          </div>
                        </div>
                      )}

                      {/* Language */}
                      {volumeInfo.language && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Language: </span>
                          <span className="text-gray-600">{getLanguageName(volumeInfo.language)}</span>
                        </div>
                      )}

                      {/* Pages */}
                      {volumeInfo.pageCount && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Pages: </span>
                          <span className="text-gray-600">{volumeInfo.pageCount}</span>
                        </div>
                      )}

                      {/* Publisher */}
                      {volumeInfo.publisher && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Publisher: </span>
                          <span className="text-gray-600">{volumeInfo.publisher}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* External links */}
            {(volumeInfo.previewLink || volumeInfo.infoLink) && (
              <Card className="bordes">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text mb-3">Links</h3>
                  <div className="flex gap-3">
                    {volumeInfo.previewLink && (
                      <a
                        href={volumeInfo.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Preview
                      </a>
                    )}
                    {volumeInfo.infoLink && (
                      <a
                        href={volumeInfo.infoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        More Information
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="button-tran2"
              >
                Close
              </Button>
              
              {/* Button that opens AddBookModal */}
              <Button
                onClick={handleOpenAddBook}
                className="button1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to My Library
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Separate but controlled AddBookModal */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onOpenChange={handleCloseAddBook}
        prefilledData={prefilledData}
        refreshData={refreshData}
      />
    </>
  )
}