"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, User, Calendar, ExternalLink, Plus } from "lucide-react"

interface BookSearchDetailsProps {
  book: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddToLibrary: (bookData: any) => void
}

export function BookSearchDetails({ book, isOpen, onOpenChange, onAddToLibrary }: BookSearchDetailsProps) {
  if (!book) return null

  // Función para preparar los datos para el formulario de agregar libro
  const prepareBookData = () => {
    const volumeInfo = book.volumeInfo
    
    return {
      title: volumeInfo.title || "",
      author: volumeInfo.authors?.[0] || "",
      genres: volumeInfo.categories || [],
      pages: volumeInfo.pageCount?.toString() || "",
      year: volumeInfo.publishedDate?.split('-')[0] || "",
      publisher: volumeInfo.publisher || "",
      language: volumeInfo.language?.toUpperCase() || "",
      cover: volumeInfo.imageLinks?.thumbnail || "",
      isFavorite: false,
    }
  }

  const handleAddToLibrary = () => {
    const preparedData = prepareBookData()
    onAddToLibrary(preparedData)
    onOpenChange(false)
  }

  const volumeInfo = book.volumeInfo

  return (
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
                          {volumeInfo.language}
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
            <Button
              onClick={handleAddToLibrary}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar a Mi Biblioteca
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}