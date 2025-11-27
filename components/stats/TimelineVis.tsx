// components/stats/TimelineVis.tsx - VERSIÓN SIMPLE
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimerIcon as Timeline } from "lucide-react"
import { useState } from 'react'

interface TimelineVisProps {
  books: Array<{
    id: number
    title: string
    start_date?: string
    end_date?: string
    author: string
    pages: number
    rating?: number
    genre?: string
  }>
}

export function TimelineVis({ books }: TimelineVisProps) {
  const [selectedBook, setSelectedBook] = useState<any>(null)

  // Filtrar libros que tienen start_date y end_date
  const validBooks = books.filter(book => book.start_date && book.end_date)

  // Ordenar por fecha de inicio
  const sortedBooks = [...validBooks].sort((a, b) => 
    new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime()
  )

  // Calcular el rango de fechas
  const dates = validBooks.flatMap(book => [
    new Date(book.start_date!), 
    new Date(book.end_date!)
  ])
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

  // Función para calcular la posición horizontal de una fecha
  const getPosition = (date: Date) => {
    const totalRange = maxDate.getTime() - minDate.getTime()
    const positionFromStart = date.getTime() - minDate.getTime()
    return (positionFromStart / totalRange) * 100
  }

  if (validBooks.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Timeline className="h-5 w-5" />
            Timeline de Lectura
          </CardTitle>
          <CardDescription>No hay libros con fechas de lectura completas para mostrar</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-800">
          <Timeline className="h-5 w-5" />
          Timeline de Lectura
        </CardTitle>
        <CardDescription>
          Línea de tiempo de tus {validBooks.length} lecturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline */}
          <div className="relative">
            {/* Línea del timeline */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-pink-200"></div>
            
            {/* Marcas de años */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              {[minDate.getFullYear(), maxDate.getFullYear()].map(year => (
                <span key={year}>{year}</span>
              ))}
            </div>

            {/* Libros */}
            <div className="space-y-3">
              {sortedBooks.map((book) => {
                const startPos = getPosition(new Date(book.start_date!))
                const endPos = getPosition(new Date(book.end_date!))
                const width = Math.max(2, endPos - startPos) // Mínimo 2% de ancho

                return (
                  <div key={book.id} className="relative" style={{ height: '40px' }}>
                    {/* Barra del libro */}
                    <div
                      className={`absolute h-6 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 cursor-pointer transition-all hover:from-pink-600 hover:to-rose-600 ${
                        selectedBook?.id === book.id ? 'ring-2 ring-pink-300 shadow-lg' : ''
                      }`}
                      style={{
                        left: `${startPos}%`,
                        width: `${width}%`,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                      onClick={() => setSelectedBook(book)}
                      title={`${book.title} - ${book.author}`}
                    >
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-white text-xs font-medium truncate">
                          {book.title}
                        </span>
                      </div>
                    </div>

                    {/* Punto de inicio */}
                    <div
                      className="absolute w-3 h-3 bg-pink-700 rounded-full border-2 border-white shadow"
                      style={{
                        left: `${startPos}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detalles del libro seleccionado */}
          {selectedBook && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-bold text-lg text-pink-800">{selectedBook.title}</h3>
              <p className="text-pink-700">{selectedBook.author}</p>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-pink-600">Inicio:</span>{' '}
                  {new Date(selectedBook.start_date!).toLocaleDateString('es-ES')}
                </div>
                <div>
                  <span className="text-pink-600">Fin:</span>{' '}
                  {new Date(selectedBook.end_date!).toLocaleDateString('es-ES')}
                </div>
                <div>
                  <span className="text-pink-600">Páginas:</span> {selectedBook.pages}
                </div>
                <div>
                  <span className="text-pink-600">Rating:</span> {selectedBook.rating || 'N/A'}/10
                </div>
              </div>
              {selectedBook.genre && selectedBook.genre !== 'Sin género' && (
                <div className="mt-2">
                  <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                    {selectedBook.genre}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Leyenda */}
          <div className="text-xs text-muted-foreground">
            <p>• Se muestran {validBooks.length} libros con fechas completas</p>
            <p>• Haz clic en cualquier barra para ver detalles</p>
            <p>• El ancho de la barra representa la duración de la lectura</p>
            <p>• Rango: {minDate.getFullYear()} - {maxDate.getFullYear()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}