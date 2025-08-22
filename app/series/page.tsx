"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp } from "lucide-react"

const seriesData = [
  {
    name: "Fundación",
    author: "Isaac Asimov",
    totalBooks: 7,
    readBooks: 3,
    genre: "Ciencia Ficción",
    avgRating: 4.4,
    status: "En progreso",
    cover: "/placeholder.svg?height=200&width=150",
    books: [
      { title: "Fundación", read: true, rating: 4.5 },
      { title: "Fundación e Imperio", read: true, rating: 4.3 },
      { title: "Segunda Fundación", read: true, rating: 4.4 },
      { title: "Los límites de la Fundación", read: false },
      { title: "Fundación y Tierra", read: false },
      { title: "Preludio a la Fundación", read: false },
      { title: "Hacia la Fundación", read: false },
    ],
  },
  {
    name: "Dune",
    author: "Frank Herbert",
    totalBooks: 6,
    readBooks: 2,
    genre: "Ciencia Ficción",
    avgRating: 4.3,
    status: "En progreso",
    cover: "/placeholder.svg?height=200&width=150",
    books: [
      { title: "Dune", read: true, rating: 4.5 },
      { title: "El mesías de Dune", read: true, rating: 4.1 },
      { title: "Hijos de Dune", read: false },
      { title: "Emperador Dios de Dune", read: false },
      { title: "Herejes de Dune", read: false },
      { title: "Casa Capitular: Dune", read: false },
    ],
  },
  {
    name: "Crónicas de Narnia",
    author: "C.S. Lewis",
    totalBooks: 7,
    readBooks: 7,
    genre: "Fantasía",
    avgRating: 4.2,
    status: "Completada",
    cover: "/placeholder.svg?height=200&width=150",
    books: [
      { title: "El león, la bruja y el ropero", read: true, rating: 4.3 },
      { title: "El príncipe Caspian", read: true, rating: 4.1 },
      { title: "La travesía del Viajero del Alba", read: true, rating: 4.2 },
      { title: "La silla de plata", read: true, rating: 4.0 },
      { title: "El caballo y el muchacho", read: true, rating: 4.1 },
      { title: "El sobrino del mago", read: true, rating: 4.3 },
      { title: "La última batalla", read: true, rating: 4.4 },
    ],
  },
  {
    name: "El Señor de los Anillos",
    author: "J.R.R. Tolkien",
    totalBooks: 3,
    readBooks: 3,
    genre: "Fantasía",
    avgRating: 4.8,
    status: "Completada",
    cover: "/placeholder.svg?height=200&width=150",
    books: [
      { title: "La Comunidad del Anillo", read: true, rating: 4.7 },
      { title: "Las Dos Torres", read: true, rating: 4.8 },
      { title: "El Retorno del Rey", read: true, rating: 4.9 },
    ],
  },
  {
    name: "Harry Potter",
    author: "J.K. Rowling",
    totalBooks: 7,
    readBooks: 5,
    genre: "Fantasía",
    avgRating: 4.6,
    status: "En progreso",
    cover: "/placeholder.svg?height=200&width=150",
    books: [
      { title: "La Piedra Filosofal", read: true, rating: 4.5 },
      { title: "La Cámara Secreta", read: true, rating: 4.4 },
      { title: "El Prisionero de Azkaban", read: true, rating: 4.8 },
      { title: "El Cáliz de Fuego", read: true, rating: 4.7 },
      { title: "La Orden del Fénix", read: true, rating: 4.6 },
      { title: "El Misterio del Príncipe", read: false },
      { title: "Las Reliquias de la Muerte", read: false },
    ],
  },
]

export default function Series() {
  const totalSeries = seriesData.length
  const totalBooksInSeries = seriesData.reduce((sum, series) => sum + series.totalBooks, 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fbf3dd" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-yellow-700">Total Series</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-800">{totalSeries}</div>
              <p className="text-sm text-yellow-600">sagas seguidas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-yellow-700">Total Libros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-800">{totalBooksInSeries}</div>
              <p className="text-sm text-yellow-600">libros en series</p>
            </CardContent>
          </Card>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {seriesData.map((series, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={series.cover || "/placeholder.svg"}
                    alt={series.name}
                    className="w-16 h-24 object-cover rounded-md shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl group-hover:text-yellow-600 transition-colors">
                          {series.name}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">por {series.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            {series.genre}
                          </Badge>
                          <Badge
                            variant={series.status === "Completada" ? "default" : "secondary"}
                            className={series.status === "Completada" ? "bg-green-100 text-green-800" : ""}
                          >
                            {series.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">{series.avgRating}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {series.readBooks}/{series.totalBooks} libros
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progreso de la serie</span>
                    <span className="text-muted-foreground">
                      {Math.round((series.readBooks / series.totalBooks) * 100)}%
                    </span>
                  </div>
                  <Progress value={(series.readBooks / series.totalBooks) * 100} className="h-2" />
                </div>

                {/* Books List */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Libros de la serie:</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {series.books.map((book, bookIndex) => (
                      <div key={bookIndex} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${book.read ? "bg-green-500" : "bg-gray-300"}`} />
                          <span className={book.read ? "text-green-700" : "text-muted-foreground"}>{book.title}</span>
                        </div>
                        {book.read && book.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{book.rating}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Series Insights */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <TrendingUp className="h-5 w-5" />
              Análisis de Series
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Estadísticas Generales</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    • Tienes <strong>{totalSeries} series</strong> en tu biblioteca
                  </p>
                  <p>
                    • Total de libros en series: <strong>{totalBooksInSeries} libros</strong>
                  </p>
                  <p>
                    • Serie mejor calificada: <strong>El Señor de los Anillos</strong> (4.8 ⭐)
                  </p>
                  <p>
                    • Serie más larga: <strong>Fundación y Crónicas de Narnia</strong> (7 libros)
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Géneros Favoritos</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fantasía</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      3 series
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ciencia Ficción</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      2 series
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
