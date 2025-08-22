"use client"
import { Star, BookOpen, Users, Heart, QuoteIcon, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import type { Book, Quote } from "@/lib/types"
import { MarkdownViewer } from "./MarkdownViewer"

interface BookDetailsModalProps {
  book: Book | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  quotes: Quote[]
}

export function BookDetailsModal({ book, isOpen, onOpenChange, quotes }: BookDetailsModalProps) {
  if (!book) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-purple-800">{book.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Book Cover and Basic Info - Fixed height */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="text-center space-y-4 flex-1">
                  <Image
                    src={book.image_url || "/placeholder.svg"}
                    alt={book.title}
                    width={200}
                    height={300}
                    className="mx-auto rounded-lg shadow-md"
                  />

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-purple-800">{book.title}</h3>
                    <p className="text-purple-600 font-medium">{book.author?.name}</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {book.genres?.map((genre) => (
                        <Badge key={genre.id} className="bg-green-100 text-green-800 border-0">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < book.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{book.rating}/5</span>
                  </div>

                  {/* One line summary */}
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm italic text-purple-700">"{book.review}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content - Fixed height with scroll */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Tabs defaultValue="summary" className="space-y-6 flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 flex-shrink-0">
                <TabsTrigger value="summary">Information</TabsTrigger>
                <TabsTrigger value="opinion">Summary</TabsTrigger>
                <TabsTrigger value="characters">Personajes</TabsTrigger>
                <TabsTrigger value="quotes">Citas</TabsTrigger>
              </TabsList>

              {/* Fixed height content area with scroll */}
              <div className="flex-1 min-h-0">
                {/* Información */}
                <TabsContent value="summary" className="h-full overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Información básica */}
                    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100 h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                          <BookOpen className="h-5 w-5 text-purple-600" />
                          Información del Libro
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                              Universo
                            </Label>
                            <p className="text-sm mt-1 font-medium text-gray-800">
                              {book.series?.name || "No especificado"}
                            </p>
                          </div>

                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                              Tipo
                            </Label>
                            <p className="text-sm mt-1 font-medium text-gray-800">{book.type || "No especificado"}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/60 rounded-lg p-3">
                              <Label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                Año
                              </Label>
                              <p className="text-sm mt-1 font-bold text-purple-800">{book.year || "N/A"}</p>
                            </div>

                            <div className="bg-white/60 rounded-lg p-3">
                              <Label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                Páginas
                              </Label>
                              <p className="text-sm mt-1 font-bold text-purple-800">{book.pages || "N/A"}</p>
                            </div>
                          </div>

                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                              Editorial
                            </Label>
                            <p className="text-sm mt-1 font-medium text-gray-800">
                              {book.publisher || "No especificado"}
                            </p>
                          </div>

                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                              Idioma
                            </Label>
                            <p className="text-sm mt-1 font-medium text-gray-800">
                              {book.language || "No especificado"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detalles Adicionales */}
                    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100 h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          Detalles Adicionales
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Época</Label>
                            <p className="text-sm mt-1 font-medium text-gray-800">{book.era || "No especificado"}</p>
                          </div>

                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                              Formato
                            </Label>
                            <p className="text-sm mt-1 font-medium text-gray-800">{book.format || "No especificado"}</p>
                          </div>

                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                              Público
                            </Label>
                            <p className="text-sm mt-1 font-medium text-gray-800">
                              {book.audience || "No especificado"}
                            </p>
                          </div>

                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                              Densidad de Lectura
                            </Label>
                            <p className="text-sm mt-1 font-medium text-gray-800">
                              {book.reading_difficulty || "No especificado"}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white/60 rounded-lg p-3">
                              <Label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                Favorito
                              </Label>
                              <div className="flex items-center gap-2 mt-1">
                                {book.favorite ? (
                                  <Badge className="bg-pink-100 text-pink-800 border-pink-300 font-semibold">
                                    ❤️ Favorito
                                  </Badge>
                                ) : (
                                  <p className="text-sm font-medium text-gray-500">No es favorito</p>
                                )}
                              </div>
                            </div>

                            <div className="bg-white/60 rounded-lg p-3">
                              <Label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                Premios
                              </Label>
                              <p className="text-sm mt-1 font-medium text-gray-800">{book.awards || "Sin premios"}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fechas y Progreso */}
                    <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-100 h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                          Fechas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Fechas */}
                        <div className="space-y-3">
                          {book.start_date && (
                            <div className="bg-white/60 rounded-lg p-3">
                              <Label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                📅 Start Date
                              </Label>
                              <p className="text-sm mt-1 font-bold text-emerald-800">
                                {new Date(book.start_date).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          )}

                          {book.end_date && (
                            <div className="bg-white/60 rounded-lg p-3">
                              <Label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                🏁 Fecha de Finalización
                              </Label>
                              <p className="text-sm mt-1 font-bold text-emerald-800">
                                {new Date(book.end_date).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          )}

                          {book.start_date && book.end_date && (
                            <div className="bg-white/60 rounded-lg p-3">
                              <Label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                ⏱️ Días de Lectura
                              </Label>
                              <p className="text-sm mt-1 font-bold text-emerald-800">
                                {Math.ceil(
                                  (new Date(book.end_date as string).getTime() -
                                    new Date(book.start_date as string).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )}{" "}
                                días
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Resumen */}
                <TabsContent value="opinion" className="h-full overflow-y-auto">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Resumen
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="h-full overflow-y-auto">
                        <p className="text-gray-700 leading-relaxed italic">"{book.summary}"</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Personajes */}
                <TabsContent value="characters" className="h-full overflow-y-auto space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Personajes Principales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {book.main_characters?.split(",").map((character, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <svg className="h-2.5 w-2.5 flex-shrink-0" viewBox="0 0 10 10" fill="#a855f7">
                              <circle cx="5" cy="5" r="5" />
                            </svg>
                            <span className="text-gray-800 font-medium capitalize">{character.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Personaje Favorito
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{book.favorite_character}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Citas */}
                <TabsContent value="quotes" className="h-full overflow-y-auto">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <QuoteIcon className="h-5 w-5" />
                        Citas Favoritas
                      </CardTitle>
                      <CardDescription className="text-purple-600">
                        Fragmentos que más me impactaron durante la lectura
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="h-full overflow-y-auto space-y-6">
                        {quotes.length > 0 ? (
                          quotes.map((quote) => (
                            <div
                              key={quote.id}
                              className="border-l-4 border-purple-300 pl-4 py-2 bg-purple-50/50 rounded-r-lg"
                            >
                              <MarkdownViewer content={`"${quote.text}"`} />
                              {quote.page && <div className="text-sm text-purple-600 mt-1">Página {quote.page}</div>}
                              {quote.category && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {quote.category}
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 italic">No hay citas registradas para este libro</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>              
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
