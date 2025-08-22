import { Heart, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import type { Book } from "@/lib/types"

interface BookCardProps {
  book: Book
}

// Colores personalizados más suaves y aesthetic
const availableColors = [
  "bg-[#f2f1ef] text-gray-700 border border-gray-300",
  "bg-[#e6e4e0] text-gray-700 border border-gray-300",
  "bg-[#efdfd7] text-amber-800 border border-amber-300",
  "bg-[#f7dcc9] text-orange-800 border border-orange-300",
  "bg-[#f1dfaf] text-yellow-800 border border-yellow-300",
  "bg-[#dbecdd] text-green-800 border border-green-300",
  "bg-[#d3e7f2] text-blue-800 border border-blue-300",
  "bg-[#e7ddef] text-purple-800 border border-purple-300",
  "bg-[#f7dfea] text-pink-800 border border-pink-300",
  "bg-[#fbddd9] text-red-800 border border-red-300",
]

// Función para generar color consistente basado en el nombre del género
const getGenreColor = (genreName: string) => {
  // Crear un hash simple del nombre para obtener un índice consistente
  let hash = 0
  for (let i = 0; i < genreName.length; i++) {
    const char = genreName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir a 32bit integer
  }
  const index = Math.abs(hash) % availableColors.length
  return availableColors[index]
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Card className="group hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 overflow-hidden">
      <div className="relative">
        <Image
          src={book.image_url || "/placeholder.svg?height=200&width=150"}
          alt={book.title}
          width={150}
          height={220}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg"
        />
        {book.favorite && (
          <div className="absolute top-2 right-2">
            <div className="p-2 bg-white/80 rounded-full shadow-md backdrop-blur-sm">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        <CardTitle className="text-sm line-clamp-2 group-hover:text-purple-600 transition-colors leading-tight">
          {book.title}
        </CardTitle>
        <CardDescription className="text-xs font-medium text-muted-foreground">{book.author?.name}</CardDescription>

        <div className="flex items-center justify-between">
          {/* Mostrar géneros con colores consistentes */}
          <div className="flex flex-wrap gap-1">
            {book.genres?.slice(0, 2).map((genre) => (
              <Badge
                key={genre.id}
                variant="outline" // Usar variante outline para evitar hover de fondo por defecto
                className={`${getGenreColor(genre.name)} font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs max-w-full hover:scale-105 transition-transform duration-200`}
                title={genre.name}
              >
                <span className="truncate">{genre.name}</span>
              </Badge>
            ))}
            {book.genres && book.genres.length > 2 && (
              <Badge
                variant="outline" // Usar variante outline
                className="bg-[#f2f1ef] text-gray-600 border border-gray-300 font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs hover:scale-105 transition-transform duration-200"
                title={`+${book.genres.length - 2} géneros más: ${book.genres.slice(2).map(g => g.name).join(', ')}`}
              >
                +{book.genres.length - 2}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${i < Math.round((book.rating ?? 0) / 2) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>{book.pages}p</span>
            <span>
              {book.end_date ? new Date(book.end_date).toLocaleDateString("es-ES", {
                month: "short",
                year: "2-digit",
              }): ""}
            </span>
          </div>
        </div>

        {/* Review/descripción del libro - movida abajo y estilizada */}
        {book.review && (
          <div className="pt-2 mt-2 border-t border-gray-100">
            <p className="text-sm text-gray-700 line-clamp-2 leading-snug italic">
              "{book.review}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
