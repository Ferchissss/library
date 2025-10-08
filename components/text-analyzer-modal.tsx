// components/book-text-analyzer-modal.tsx
"use client"

import { useState } from 'react'
import { BookOpen, X, Copy, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useBulkDataParser } from "@/hooks/useBulkDataParser"
import { transformToAddBookFormat, convertToBulkDataFormat } from "@/lib/bookDataTransformers"
import { toast } from "sonner"

interface BookData {
  title: string
  series?: string
  author: string
  genres: string[]
  pages: number
  publishedDate?: string
  publisher?: string
  language: string
  literaryAwards?: string[]
  characters?: string[]
}

interface BookTextAnalyzerModalProps {
  isOpen: boolean
  onClose: () => void
  onBookSelect?: (bookData: BookData) => void
  genresOptions: { value: string; label: string; id?: number }[]
  authorsOptions: { value: string; label: string; id?: number }[]
  seriesOptions: { value: string; label: string; id?: number }[]
  setGenresOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string; id?: number }[]>>
  setAuthorsOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string; id?: number }[]>>
  setSeriesOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string; id?: number }[]>>
  onOpenAddBook?: (prefilledData: any) => void
}

export function BookTextAnalyzerModal({ 
  isOpen, 
  onClose, 
  onBookSelect, 
  genresOptions, 
  authorsOptions,
  seriesOptions,
  setGenresOptions,
  setAuthorsOptions,
  setSeriesOptions,
  onOpenAddBook 
}: BookTextAnalyzerModalProps) {
  const [inputText, setInputText] = useState('')
  const [analyzedData, setAnalyzedData] = useState<BookData | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Inicializar el hook de procesamiento de datos
  const { processBulkData, convertToBulkDataFormat   } = useBulkDataParser({
    genresOptions,
    authorsOptions,
    seriesOptions,
    setGenresOptions,
    setAuthorsOptions,
    setSeriesOptions
  })

  const analyzeText = (text: string): BookData => {
    const lines = text.split('\n').filter(line => line.trim())
    
    // Inicializar objeto con valores por defecto
    const bookData: BookData = {
      title: '',
      author: '',
      genres: [],
      pages: 0,
      language: 'English'
    }

    let currentSection = ''
    let isInDescription = false
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      // Detectar secciones (con return para evitar procesamiento múltiple)
      if (trimmedLine.toLowerCase() === 'genres' || trimmedLine.toLowerCase().includes('show all')) {
        currentSection = 'genres'
        isInDescription = false
        return
      }
      if (trimmedLine.toLowerCase().includes('first published')) {
        currentSection = 'publication'
        isInDescription = false
        // NO hacer return - procesar esta línea
      }
      if (trimmedLine.toLowerCase().includes('literary awards')) {
        currentSection = 'awards'
        isInDescription = false
        return
      }
      if (trimmedLine.toLowerCase().includes('series')) {
        currentSection = 'series'
        isInDescription = false
        return
      }
      if (trimmedLine.toLowerCase().includes('characters')) {
        currentSection = 'characters'
        isInDescription = false
        return
      }
      if (trimmedLine.toLowerCase().includes('this edition') || trimmedLine.toLowerCase().includes('format')) {
        currentSection = 'edition'
        isInDescription = false
        return
      }
      if (trimmedLine.toLowerCase().includes('show more')) {
        isInDescription = false
        return
      }
      if (trimmedLine.toLowerCase().includes('show less')) {
        isInDescription = false
        return
      }

      // Detectar páginas - en cualquier sección EXCEPTO 'edition'
      if (currentSection !== 'edition' && trimmedLine.match(/^\d+\s*pages/)) {
        currentSection = 'details'
        isInDescription = false
        // Continuar para procesar esta línea en el switch
      }

      // Detectar inicio de descripción (después de rating/reviews) - pero la ignoramos
      if (!isInDescription && 
          (trimmedLine.match(/^\d+\.\d+/) || 
           trimmedLine.match(/[\d,]+ ratings/) ||
           trimmedLine.match(/[\d,]+ reviews/)) &&
          index < lines.length - 1) {
        isInDescription = true
        return
      }

      // Procesar según la sección actual
      switch (currentSection) {
        case '':
          if (isInDescription) {
            // Ignorar líneas de descripción
            return
          } else {
            // Líneas iniciales - título, autor
            if (!bookData.title && trimmedLine && !trimmedLine.includes('#') && !trimmedLine.match(/^\d/)) {
              // Verificar si es serie (línea anterior puede tener #)
              if (index > 0 && lines[index-1].trim().includes('#')) {
                bookData.series = lines[index-1].trim().replace(/#\d+/, '').trim()
                bookData.title = trimmedLine
              } else {
                bookData.title = trimmedLine
              }
            } else if (trimmedLine.includes('#')) {
              // Solo guardar el nombre de la serie sin el número
              const seriesMatch = trimmedLine.match(/(.+?)\s*#\d+/)
              if (seriesMatch) {
                bookData.series = seriesMatch[1].trim()
              }
            } else if (!bookData.author && trimmedLine && !trimmedLine.match(/^\d/) && 
                      !trimmedLine.includes('ratings') && !trimmedLine.includes('reviews') &&
                      trimmedLine !== bookData.title) {
              // Ignorar ilustradores y solo capturar autor principal
              if (!trimmedLine.includes('(Illustrator)') && !trimmedLine.startsWith(',') && trimmedLine !== '') {
                bookData.author = trimmedLine
              }
            }
            // Ignorar líneas de rating/calificación
          }
          break

        case 'genres':
          if (trimmedLine && !trimmedLine.includes('...') && !trimmedLine.includes('show all')) {
            const genreLines = trimmedLine.split(/\s{2,}/)
            genreLines.forEach(genre => {
              if (genre && genre !== 'Genres' && !genre.includes('show') && !genre.includes('...')) {
                const cleanGenre = genre.trim()
                if (cleanGenre) {
                  bookData.genres.push(cleanGenre)
                }
              }
            })
          }
          break

        case 'details':
          // Buscar páginas con formato flexible
          const pagesMatch = trimmedLine.match(/(\d+)\s*pages/)
          if (pagesMatch) {
            bookData.pages = parseInt(pagesMatch[1])
          }
          // Solo resetear si realmente procesamos páginas
          if (trimmedLine.includes('pages')) {
            currentSection = ''
          }
          break

        case 'publication':
          // Buscar fecha de publicación y extraer solo el año
          const yearMatch = trimmedLine.match(/(\d{4})/)
          if (yearMatch) {
            bookData.publishedDate = yearMatch[1] // Solo el año
          }
          break

        case 'awards':
          if (trimmedLine && !trimmedLine.includes('Literary awards')) {
            bookData.literaryAwards = bookData.literaryAwards || []
            const award = trimmedLine.replace(/,$/, '')
            if (award) {
              bookData.literaryAwards.push(award)
            }
          }
          break

        case 'series':
          const seriesMatch = trimmedLine.match(/Series\s*(.+)/)
          if (seriesMatch) {
            // Remover el número # si existe
            bookData.series = seriesMatch[1].replace(/#\d+/, '').trim()
          }
          break

        case 'characters':
          if (trimmedLine && !trimmedLine.includes('Characters') && !trimmedLine.includes('Show')) {
            const charLines = trimmedLine.split(/\s{2,}|,\s*/)
            charLines.forEach(char => {
              if (char && char !== 'Characters' && !char.includes('Show')) {
                bookData.characters = bookData.characters || []
                const cleanChar = char.trim()
                if (cleanChar) {
                  bookData.characters.push(cleanChar)
                }
              }
            })
          }
          break

        case 'edition':
          // 1. Buscar editorial en formato "by Publisher"
          if (trimmedLine.includes('by ') && !bookData.publisher) {
            const publisherMatch = trimmedLine.match(/by\s+(.+)$/)
            if (publisherMatch) {
              bookData.publisher = publisherMatch[1].trim()
            }
          }
          
          // 2. Buscar editorial en formato "Published Publisher"
          else if (trimmedLine.includes('Published') && !bookData.publisher && !trimmedLine.includes('First published')) {
            const publisherMatch = trimmedLine.match(/Published\s*(.+)/)
            if (publisherMatch) {
              bookData.publisher = publisherMatch[1].trim()
            }
          }
          
          // 3. Buscar idioma
          else if (trimmedLine.includes('Language')) {
            const langMatch = trimmedLine.match(/Language\s*(.+)/)
            if (langMatch) {
              bookData.language = langMatch[1].trim()
            }
          }
          
          // NO resetear currentSection aquí - mantenerlo para procesar líneas siguientes
          break
      }
    })

    return bookData
  }

  const handleAnalyze = () => {
    if (!inputText.trim()) return
    const data = analyzeText(inputText)
    setAnalyzedData(data)
  }

  const handleCopyField = (field: string, value: any) => {
    navigator.clipboard.writeText(String(value))
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleRemoveGenre = (indexToRemove: number) => {
    if (!analyzedData) return
    setAnalyzedData({
      ...analyzedData,
      genres: analyzedData.genres.filter((_, index) => index !== indexToRemove)
    })
  }

  const handleRemoveCharacter = (indexToRemove: number) => {
    if (!analyzedData || !analyzedData.characters) return
    setAnalyzedData({
      ...analyzedData,
      characters: analyzedData.characters.filter((_, index) => index !== indexToRemove)
    })
  }

  const handleRemoveAward = (indexToRemove: number) => {
    if (!analyzedData || !analyzedData.literaryAwards) return
    setAnalyzedData({
      ...analyzedData,
      literaryAwards: analyzedData.literaryAwards.filter((_, index) => index !== indexToRemove)
    })
  }

  const handleUseData = async () => {
    if (!analyzedData) return

    try {
      // CONVERTIR a formato bulk (igual que BulkInputSection)
      const bulkDataText = convertToBulkDataFormat(analyzedData)
      
      // USAR processBulkData (igual que BulkInputSection)  
      const formData = await processBulkData(bulkDataText)
      
      if (formData && onOpenAddBook) {
        onOpenAddBook(formData)
        onClose()
      }
    } catch (error) {
      toast.error("Error", {
        description: "Hubo un problema al procesar los datos del libro.",
      })
    }
  }
  
  // Función para manejar el clic en el overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Función para prevenir que el clic en el contenido cierre el modal
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={handleContentClick}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Analizador de Texto de Libros
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex gap-4">
          {/* Columna izquierda - Input */}
          <div className="flex-1 flex flex-col">
            <Textarea
              placeholder="Pega aquí el texto del libro..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 min-h-[300px] resize-none font-mono text-sm"
            />
            <Button onClick={handleAnalyze} className="mt-4" disabled={!inputText.trim()}>
              Analizar Texto
            </Button>
          </div>

          {/* Columna derecha - Resultados */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              {analyzedData ? (
                <div className="space-y-4">
                  {/* Título - Siempre mostrar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Título</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyField('title', analyzedData.title)}
                      >
                        {copiedField === 'title' ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-sm p-2 bg-muted rounded">{analyzedData.title || 'No se pudo encontrar el título'}</p>
                  </div>

                  {/* Serie - Solo mostrar si existe */}
                  {analyzedData.series && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Serie</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyField('series', analyzedData.series)}
                        >
                          {copiedField === 'series' ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <p className="text-sm p-2 bg-muted rounded">{analyzedData.series}</p>
                    </div>
                  )}

                  {/* Autor - Siempre mostrar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Autor</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyField('author', analyzedData.author)}
                      >
                        {copiedField === 'author' ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-sm p-2 bg-muted rounded">{analyzedData.author || 'No se pudo encontrar el autor'}</p>
                  </div>

                  {/* Géneros - Solo mostrar si hay géneros */}
                  {analyzedData.genres.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Géneros</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyField('genres', analyzedData.genres.join(', '))}
                        >
                          {copiedField === 'genres' ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analyzedData.genres.map((genre, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {genre}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveGenre(index)}
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detalles - Solo mostrar si hay al menos un dato */}
                  {(analyzedData.pages > 0 || analyzedData.language || analyzedData.publishedDate || analyzedData.publisher) && (
                    <div className="grid grid-cols-2 gap-4">
                      {analyzedData.pages > 0 && (
                        <div>
                          <h3 className="font-semibold text-sm mb-1">Páginas</h3>
                          <p className="text-sm">{analyzedData.pages}</p>
                        </div>
                      )}
                      {analyzedData.language && (
                        <div>
                          <h3 className="font-semibold text-sm mb-1">Idioma</h3>
                          <p className="text-sm">{analyzedData.language}</p>
                        </div>
                      )}
                      {analyzedData.publishedDate && (
                        <div>
                          <h3 className="font-semibold text-sm mb-1">Publicación</h3>
                          <p className="text-sm">{analyzedData.publishedDate}</p>
                        </div>
                      )}
                      {analyzedData.publisher && (
                        <div>
                          <h3 className="font-semibold text-sm mb-1">Editorial</h3>
                          <p className="text-sm">{analyzedData.publisher}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Premios literarios - Solo mostrar si hay premios */}
                  {analyzedData.literaryAwards && analyzedData.literaryAwards.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Premios Literarios</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyField('awards', analyzedData.literaryAwards?.join(', '))}
                        >
                          {copiedField === 'awards' ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analyzedData.literaryAwards.map((award, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {award}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveAward(index)}
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personajes - Solo mostrar si hay personajes */}
                  {analyzedData.characters && analyzedData.characters.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Personajes</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyField('characters', analyzedData.characters?.join(', '))}
                        >
                          {copiedField === 'characters' ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analyzedData.characters.map((character, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {character}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveCharacter(index)}
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <Button onClick={handleUseData} className="w-full">
                    Usar estos datos
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Los datos analizados aparecerán aquí</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}