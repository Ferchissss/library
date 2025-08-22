"use client"

import { BookOpen, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

const genresData = [
  {
    name: "Ciencia Ficción",
    slug: "ciencia-ficcion",
    count: 8,
    percentage: 33,
    color: "#e7f3f8",
    description: "Exploración del futuro y la tecnología",
    books: ["Dune", "1984", "Fundación", "Neuromante"],
    avgRating: 4.3,
  },
  {
    name: "Filosofía",
    slug: "filosofia",
    count: 5,
    percentage: 21,
    color: "#f8f3fc",
    description: "Reflexiones sobre la existencia y el conocimiento",
    books: ["El Principito", "Así habló Zaratustra", "Meditaciones"],
    avgRating: 4.6,
  },
  {
    name: "Realismo Mágico",
    slug: "realismo-magico",
    count: 4,
    percentage: 17,
    color: "#edf3ec",
    description: "Realidad mezclada con elementos fantásticos",
    books: ["Cien años de soledad", "La casa de los espíritus"],
    avgRating: 4.8,
  },
  {
    name: "Historia",
    slug: "historia",
    count: 4,
    percentage: 17,
    color: "#fbecdd",
    description: "Eventos y personajes del pasado",
    books: ["Sapiens", "El arte de la guerra", "Historia del tiempo"],
    avgRating: 4.2,
  },
  {
    name: "Biografía",
    slug: "biografia",
    count: 3,
    percentage: 12,
    color: "#fdebec",
    description: "Vidas extraordinarias contadas",
    books: ["Steve Jobs", "Einstein", "Leonardo da Vinci"],
    avgRating: 4.1,
  },
]

export default function Genres() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fcf1f6" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-pink-700">Total de Géneros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-800">{genresData.length}</div>
              <p className="text-sm text-pink-600">géneros explorados</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-pink-700">Género Favorito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-pink-800">{genresData[0].name}</div>
              <p className="text-sm text-pink-600">{genresData[0].count} libros leídos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-pink-700">Mejor Calificado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-pink-800">Realismo Mágico</div>
              <p className="text-sm text-pink-600">4.8 ⭐ promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {genresData.map((genre, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 overflow-hidden"
            >
              <div className={`h-2`} style={{ backgroundColor: genre.color }} />

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl group-hover:text-pink-600 transition-colors">{genre.name}</CardTitle>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                    {genre.count} libros
                  </Badge>
                </div>
                <CardDescription className="text-sm">{genre.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Porcentaje de tu biblioteca</span>
                    <span className="text-muted-foreground">{genre.percentage}%</span>
                  </div>
                  <Progress value={genre.percentage} className="h-2" />
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Calificación promedio</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold">{genre.avgRating}</span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>

                {/* Sample Books */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Libros destacados:</span>
                  <div className="flex flex-wrap gap-1">
                    {genre.books.slice(0, 3).map((book, bookIndex) => (
                      <Badge key={bookIndex} variant="outline" className="text-xs">
                        {book}
                      </Badge>
                    ))}
                    {genre.books.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{genre.books.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>

                {/* View All Button */}
                <Link href={`/genres/${genre.slug}`}>
                  <Button
                    variant="outline"
                    className="w-full mt-4 group-hover:bg-pink-50 group-hover:border-pink-200 bg-transparent border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver todos los libros
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Genre Trends */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-800">
              <TrendingUp className="h-5 w-5" />
              Tendencias de Lectura
            </CardTitle>
            <CardDescription>Análisis de tus preferencias de género a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  • Has explorado <strong>{genresData.length} géneros diferentes</strong> en tu biblioteca
                </p>
                <p>
                  • Tu género favorito es <strong>{genresData[0].name}</strong> con {genresData[0].count} libros
                </p>
                <p>
                  • El género mejor calificado es <strong>Realismo Mágico</strong> con 4.8 estrellas promedio
                </p>
                <p>• Tienes una distribución equilibrada entre ficción y no ficción</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
