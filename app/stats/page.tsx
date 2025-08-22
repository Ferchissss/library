"use client"

import { BookOpen, Calendar, TrendingUp, Target, Award, Clock, BarChart3, TimerIcon as Timeline } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const monthlyData = [
  { month: "Ene", books: 3, pages: 890 },
  { month: "Feb", books: 2, pages: 650 },
  { month: "Mar", books: 4, pages: 1200 },
  { month: "Abr", books: 3, pages: 980 },
  { month: "May", books: 5, pages: 1450 },
  { month: "Jun", books: 2, pages: 720 },
]

const yearlyData = [
  { year: 2020, books: 18, pages: 5400, avgRating: 7.2 },
  { year: 2021, books: 22, pages: 6800, avgRating: 7.8 },
  { year: 2022, books: 28, pages: 8200, avgRating: 8.1 },
  { year: 2023, books: 31, pages: 9500, avgRating: 8.3 },
  { year: 2024, books: 24, pages: 7200, avgRating: 8.5 },
]

const timelineBooks = [
  {
    id: 1,
    title: "El Principito",
    author: "Antoine de Saint-Exupéry",
    dateRead: "2024-01-15",
    rating: 9,
    genre: "Filosofía",
    pages: 96,
  },
  {
    id: 2,
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    dateRead: "2024-02-28",
    rating: 10,
    genre: "Realismo Mágico",
    pages: 417,
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    dateRead: "2024-03-20",
    rating: 9,
    genre: "Distopía",
    pages: 328,
  },
  {
    id: 4,
    title: "Dune",
    author: "Frank Herbert",
    dateRead: "2024-04-10",
    rating: 8,
    genre: "Ciencia Ficción",
    pages: 688,
  },
  {
    id: 5,
    title: "El nombre del viento",
    author: "Patrick Rothfuss",
    dateRead: "2024-05-05",
    rating: 9,
    genre: "Fantasía",
    pages: 662,
  },
  {
    id: 6,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    dateRead: "2024-06-18",
    rating: 8,
    genre: "Historia",
    pages: 512,
  },
]

const genreStats = [
  { genre: "Ciencia Ficción", count: 8, percentage: 33 },
  { genre: "Filosofía", count: 5, percentage: 21 },
  { genre: "Historia", count: 4, percentage: 17 },
  { genre: "Ficción", count: 4, percentage: 17 },
  { genre: "Biografía", count: 3, percentage: 12 },
]

const achievements = [
  { title: "Lector Constante", description: "30 días consecutivos leyendo", icon: "🔥", unlocked: true },
  { title: "Explorador de Géneros", description: "Leer 5 géneros diferentes", icon: "🌟", unlocked: true },
  { title: "Maratonista", description: "Leer 1000 páginas en un mes", icon: "🏃", unlocked: true },
  { title: "Crítico Literario", description: "Escribir 10 reseñas", icon: "✍️", unlocked: false },
  { title: "Bibliófilo", description: "Leer 50 libros", icon: "📚", unlocked: false },
]

export default function Stats() {
  const currentYear = new Date().getFullYear()
  const yearlyGoal = 30
  const booksRead = 24
  const goalProgress = (booksRead / yearlyGoal) * 100

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { month: "long" })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdebec" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Meta Anual */}
        <Card className="mb-8 bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta de Lectura {currentYear}
            </CardTitle>
            <CardDescription className="text-pink-100">Tu progreso hacia la meta anual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {booksRead} / {yearlyGoal} libros
                </span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {Math.round(goalProgress)}% completado
                </Badge>
              </div>
              <Progress value={goalProgress} className="h-3 bg-white/20" />
              <p className="text-sm text-pink-100">
                {yearlyGoal - booksRead > 0
                  ? `Te faltan ${yearlyGoal - booksRead} libros para alcanzar tu meta`
                  : "¡Felicidades! Has superado tu meta anual"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-700">Promedio Mensual</CardTitle>
              <Calendar className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-800">3.2</div>
              <p className="text-xs text-pink-600">libros por mes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-700">Páginas por Día</CardTitle>
              <BookOpen className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-800">47</div>
              <p className="text-xs text-pink-600">promedio diario</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-700">Tiempo de Lectura</CardTitle>
              <Clock className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-800">2.3h</div>
              <p className="text-xs text-pink-600">promedio diario</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-700">Racha Actual</CardTitle>
              <TrendingUp className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-800">45</div>
              <p className="text-xs text-pink-600">días consecutivos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes vistas */}
        <Tabs defaultValue="monthly" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
            <TabsTrigger value="yearly">Por Año</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="genres">Géneros</TabsTrigger>
          </TabsList>

          {/* Vista Mensual */}
          <TabsContent value="monthly" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-800">
                  <BarChart3 className="h-5 w-5" />
                  Progreso Mensual {currentYear}
                </CardTitle>
                <CardDescription>Libros leídos por mes en el año actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-8">{data.month}</span>
                        <div className="flex-1">
                          <Progress value={(data.books / 5) * 100} className="h-2" />
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{data.books} libros</div>
                        <div className="text-muted-foreground">{data.pages} páginas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vista Anual */}
          <TabsContent value="yearly" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-800">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas por Año
                </CardTitle>
                <CardDescription>Evolución de tu lectura a través de los años</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {yearlyData.map((data, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-pink-50 to-rose-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-pink-800">{data.year}</h3>
                        <Badge variant="outline" className="bg-pink-50 text-pink-700">
                          ⭐ {data.avgRating}/10
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Libros:</span>
                          <div className="font-semibold text-lg text-pink-700">{data.books}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Páginas:</span>
                          <div className="font-semibold text-lg text-pink-700">{data.pages.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Promedio/mes:</span>
                          <div className="font-semibold text-lg text-pink-700">{(data.books / 12).toFixed(1)}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress
                          value={(data.books / Math.max(...yearlyData.map((d) => d.books))) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vista Timeline */}
          <TabsContent value="timeline" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-800">
                  <Timeline className="h-5 w-5" />
                  Timeline de Lectura
                </CardTitle>
                <CardDescription>Cronología de tus libros leídos este año</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Línea vertical del timeline */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-200 to-rose-200"></div>

                  <div className="space-y-6">
                    {timelineBooks.map((book, index) => (
                      <div key={book.id} className="relative flex items-start gap-6">
                        {/* Punto del timeline */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-white" />
                          </div>
                        </div>

                        {/* Contenido del libro */}
                        <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{book.title}</h3>
                              <p className="text-muted-foreground">{book.author}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{formatDate(book.dateRead)}</div>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(book.rating)].map((_, i) => (
                                  <span key={i} className="text-yellow-400 text-xs">
                                    ★
                                  </span>
                                ))}
                                <span className="text-xs text-muted-foreground ml-1">{book.rating}/10</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="secondary" className="bg-pink-50 text-pink-700">
                              {book.genre}
                            </Badge>
                            <span className="text-muted-foreground">{book.pages} páginas</span>
                            <span className="text-muted-foreground">{getMonthName(book.dateRead)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vista Géneros */}
          <TabsContent value="genres" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-pink-800">Géneros Favoritos</CardTitle>
                <CardDescription>Distribución por género</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {genreStats.map((genre, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{genre.genre}</span>
                        <span className="text-muted-foreground">{genre.count} libros</span>
                      </div>
                      <Progress value={genre.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logros */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-800">
              <Award className="h-5 w-5" />
              Logros
            </CardTitle>
            <CardDescription>Tus logros de lectura desbloqueados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{achievement.title}</h3>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Desbloqueado
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
