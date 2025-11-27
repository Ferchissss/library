"use client"

import { Heart, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Book } from "@/lib/types"
import { AVAILABLE_COLORS, getConsistentColorIndex } from "@/lib/colors"

interface BookListViewProps {
  books: Book[]
}

const availableColors = AVAILABLE_COLORS

const getGenreColorStyle = (genreName: string) => {
  const colorIndex = getConsistentColorIndex(genreName, "bookListGenres", availableColors.length)
  const colorClass = availableColors[colorIndex]
  return {
    backgroundColor: colorClass.bg,
    borderColor: colorClass.border.replace("border-", "#"),
    color: colorClass.text.replace("text-", "#"),
  }
}

export function BookListView({ books }: BookListViewProps) {
  return (
    <div className="space-y-3">
      {books.map((book, index) => (
        <Card
          key={book.id}
          className="group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-pink-200 overflow-hidden flex"
        >
          <div className="w-24 h-32 flex-shrink-0 relative">
            <Image
              src={book.image_url || "/placeholder.svg?height=128&width=96"}
              alt={book.title}
              width={96}
              height={128}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 group-hover:text-pink-600 transition-colors text-base">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{book.author?.name}</p>
                </div>
                {book.favorite && <Heart className="w-5 h-5 text-red-500 fill-red-500 flex-shrink-0" />}
              </div>

              <div className="flex flex-wrap gap-2 items-center mb-2">
                {book.genres?.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    style={getGenreColorStyle(genre.name)}
                    className="text-xs font-medium px-2 py-0.5"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {book.review && <p className="text-xs text-gray-600 italic line-clamp-1">"{book.review}"</p>}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round((book.rating ?? 0) / 2) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-1 font-medium text-slate-700">{book.rating}/10</span>
              </div>
              <span>{book.pages}p</span>
              <span>{book.year}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
