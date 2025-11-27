"use client"

import { Heart, Star, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Book } from "@/lib/types"
import { AVAILABLE_COLORS, getConsistentColorIndex } from "@/lib/colors"

interface BookGridExpandedProps {
  books: Book[]
}

const availableColors = AVAILABLE_COLORS

const getGenreColorStyle = (genreName: string) => {
  const colorIndex = getConsistentColorIndex(genreName, "bookGridGenres", availableColors.length)
  const colorClass = availableColors[colorIndex]
  return {
    backgroundColor: colorClass.bg,
    borderColor: colorClass.border.replace("border-", "#"),
    color: colorClass.text.replace("text-", "#"),
  }
}

export function BookGridExpanded({ books }: BookGridExpandedProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {books.map((book) => (
        <Card
          key={book.id}
          className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-pink-200 overflow-hidden flex flex-col"
        >
          <div className="relative h-72 overflow-hidden">
            <Image
              src={book.image_url || "/placeholder.svg?height=288&width=216"}
              alt={book.title}
              width={216}
              height={288}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {book.favorite && (
              <div className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg backdrop-blur-sm">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </div>
            )}
          </div>

          <CardContent className="flex-1 p-3 flex flex-col">
            <h3 className="font-bold text-base text-slate-800 group-hover:text-pink-600 transition-colors mb-1 line-clamp-2">
              {book.title}
            </h3>

            <p className="text-sm text-muted-foreground font-medium mb-2">{book.author?.name}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {book.genres?.slice(0, 2).map((genre) => (
                <Badge
                  key={genre.id}
                  variant="outline"
                  style={getGenreColorStyle(genre.name)}
                  className="text-xs font-medium px-1.5 py-0"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>

            <div className="flex-1">
              {book.summary && <p className="text-xs text-gray-600 line-clamp-3 mb-2">{book.summary}</p>}
            </div>

            <div className="space-y-2 mt-auto pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-2.5 w-2.5 ${i < Math.round((book.rating ?? 0) / 2) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{book.rating}/10</span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{book.pages}p</span>
                </div>
                <div className="text-center">{book.year}</div>
                <div className="text-right truncate">{book.publisher}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}