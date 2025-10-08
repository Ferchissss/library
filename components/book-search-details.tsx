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
  
  // Estados para las opciones necesarias para el hook
  const [genresOptions, setGenresOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [authorsOptions, setAuthorsOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [seriesOptions, setSeriesOptions] = useState<{ value: string; label: string; id?: number }[]>([])

  // Cargar opciones básicas al abrir el modal
  useEffect(() => {
    const fetchOptionsAndPrepareData = async () => {
      if (!isOpen || !book) return

      try {
        // Autores
        const { data: authors } = await supabase.from("authors").select("id, name").order("name", { ascending: true })
        setAuthorsOptions(authors?.map((a) => ({ value: a.name, label: a.name, id: a.id })) || [])

        // Géneros
        const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true })
        setGenresOptions(genres?.map((g) => ({ value: g.name, label: g.name, id: g.id })) || [])

        // Series
        const { data: series } = await supabase.from("series").select("id, name").order("name", { ascending: true })
        setSeriesOptions(series?.map((s) => ({ value: s.name, label: s.name, id: s.id })) || [])

        // Preparar datos inmediatamente cuando se abre el modal
        const preparedData = prepareBookDataDirectly()
        setPrefilledData(preparedData)
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }

    fetchOptionsAndPrepareData()
  }, [isOpen, book])

  const handleOpenAddBook = () => {
    // Cerrar el modal de detalles y abrir el de agregar libro
    onOpenChange(false)
    setIsAddBookOpen(true)
  }

  const handleCloseAddBook = () => {
    setIsAddBookOpen(false)
    setPrefilledData(null)
  }

  if (!book) return null

  // Método directo como fallback - mapeando exactamente los campos del formulario
  const prepareBookDataDirectly = () => {
    const volumeInfo = book.volumeInfo
    
    // Buscar IDs existentes para autores y géneros
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
      format: "Físico", // Valor por defecto
      audience: "Adulto", // Valor por defecto
      readingDensity: "",
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
            <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Detalles del Libro
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información Principal */}
            <Card className="border-purple-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Portada */}
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                          <BookOpen className="h-16 w-16 text-purple-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información Básica */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">{volumeInfo.title}</h1>
                      {volumeInfo.subtitle && (
                        <p className="text-lg text-gray-600 mb-3">{volumeInfo.subtitle}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Autores */}
                      {volumeInfo.authors && (
                        <div className="flex items-start gap-2">
                          <User className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-gray-700">Autor(es): </span>
                            <span className="text-gray-600">{volumeInfo.authors.join(', ')}</span>
                          </div>
                        </div>
                      )}

                      {/* Géneros */}
                      {volumeInfo.categories && (
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-gray-700">Géneros: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {volumeInfo.categories.map((category: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Fecha de publicación */}
                      {volumeInfo.publishedDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <div>
                            <span className="font-semibold text-gray-700">Año: </span>
                            <span className="text-gray-600">{volumeInfo.publishedDate.split('-')[0]}</span>
                          </div>
                        </div>
                      )}

                      {/* Idioma */}
                      {volumeInfo.language && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Idioma: </span>
                          <Badge variant="secondary" className="capitalize">
                            {getLanguageName(volumeInfo.language)}
                          </Badge>
                        </div>
                      )}

                      {/* Páginas */}
                      {volumeInfo.pageCount && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Páginas: </span>
                          <span className="text-gray-600">{volumeInfo.pageCount}</span>
                        </div>
                      )}

                      {/* Editorial */}
                      {volumeInfo.publisher && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Editorial: </span>
                          <span className="text-gray-600">{volumeInfo.publisher}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enlaces externos */}
            {(volumeInfo.previewLink || volumeInfo.infoLink) && (
              <Card className="border-purple-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Enlaces</h3>
                  <div className="flex gap-3">
                    {volumeInfo.previewLink && (
                      <a
                        href={volumeInfo.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Vista Previa
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
                        Más Información
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de Acción */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Cerrar
              </Button>
              
              {/* Botón que abre el AddBookModal */}
              <Button
                onClick={handleOpenAddBook}
                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar a Mi Biblioteca
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AddBookModal separado pero controlado */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onOpenChange={handleCloseAddBook}
        prefilledData={prefilledData}
        refreshData={refreshData}
      />
    </>
  )
}