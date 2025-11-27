import { Heart, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Book } from "@/lib/types"
import { AVAILABLE_COLORS, getConsistentColorIndex } from "@/lib/colors";
import { StarRating, EmptyStarRating } from "./book-components"

interface BookCardProps {
  book: Book
}

const availableColors = AVAILABLE_COLORS;

// Función para obtener estilos de color consistentes para géneros
const getGenreColorStyle = (genreName: string) => {
  const colorIndex = getConsistentColorIndex(genreName, "bookCardGenres", availableColors.length);
  const colorClass = availableColors[colorIndex];
  return {
    backgroundColor: colorClass.bg,
    borderColor: colorClass.border.replace('border-', '#'),
    color: colorClass.text.replace('text-', '#')
  };
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
          className="w-full h-auto aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg"
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
        <CardTitle className="text-sm line-clamp-2 group-hover:text-v600 transition-colors leading-tight">
          {book.title}
        </CardTitle>
        <CardDescription className="text-xs font-medium text-muted-foreground">{book.author?.name}</CardDescription>

        <div className="flex items-center justify-between">
          {/* Mostrar géneros con colores consistentes */}
          <div className="flex flex-wrap gap-1">
            {book.genres?.slice(0, 2).map((genre) => (
              <Badge
                key={genre.id}
                variant="outline"
                style={getGenreColorStyle(genre.name)}
                className="font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs max-w-full hover:scale-105 transition-transform duration-200"
                title={genre.name}
              >
                <span className="truncate">{genre.name}</span>
              </Badge>
            ))}
            {book.genres && book.genres.length > 2 && (
              <Badge
                variant="outline"
                className="bg-[#f2f1ef] text-gray-600 border border-gray-300 font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs hover:scale-105 transition-transform duration-200"
                title={`+${book.genres.length - 2} géneros más: ${book.genres.slice(2).map(g => g.name).join(', ')}`}
              >
                +{book.genres.length - 2}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center">
            {book.rating ? (
              <StarRating 
                rating={book.rating} 
                size={2.5} 
                showNumber={false}
                className="justify-end"
              />
            ) : (
              <EmptyStarRating 
                size={2.5}
                className="justify-end"
              />
            )}
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

        {/* Review/descripción del libro */}
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