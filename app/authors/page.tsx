"use client"

import type React from "react"

import { User, BookOpen, Star, Plus, Globe, Sparkles, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import Link from "next/link"

const authorsData = [
  {
    name: "Gabriel García Márquez",
    slug: "gabriel-garcia-marquez",
    books: 3,
    avgRating: 4.8,
    nationality: "Colombiano",
    continent: "América del Sur",
    genre: "Realismo Mágico",
    gender: "Masculino",
    birthYear: 1927,
    deathYear: 2014,
    age: 87,
    avatar: "/placeholder.svg?height=60&width=60",
    bookTitles: ["Cien años de soledad", "El amor en los tiempos del cólera", "Crónica de una muerte anunciada"],
    totalPages: 1247,
    bio: "Escritor colombiano, premio Nobel de Literatura 1982. Máximo exponente del realismo mágico.",
    awards: ["Premio Nobel de Literatura 1982", "Premio Cervantes 1982"],
    isAlive: false,
  },
  {
    name: "George Orwell",
    slug: "george-orwell",
    books: 2,
    avgRating: 4.5,
    nationality: "Británico",
    continent: "Europa",
    genre: "Distopía",
    gender: "Masculino",
    birthYear: 1903,
    deathYear: 1950,
    age: 46,
    avatar: "/placeholder.svg?height=60&width=60",
    bookTitles: ["1984", "Rebelión en la granja"],
    totalPages: 456,
    bio: "Escritor y periodista británico, crítico del totalitarismo y defensor de la libertad.",
    awards: ["Prometheus Hall of Fame Award"],
    isAlive: false,
  },
  {
    name: "Frank Herbert",
    slug: "frank-herbert",
    books: 2,
    avgRating: 4.3,
    nationality: "Estadounidense",
    continent: "América del Norte",
    genre: "Ciencia Ficción",
    gender: "Masculino",
    birthYear: 1920,
    deathYear: 1986,
    age: 65,
    avatar: "/placeholder.svg?height=60&width=60",
    bookTitles: ["Dune", "El mesías de Dune"],
    totalPages: 1156,
    bio: "Maestro de la ciencia ficción, creador del universo de Dune y sus complejas sociedades.",
    awards: ["Hugo Award", "Nebula Award"],
    isAlive: false,
  },
  {
    name: "Antoine de Saint-Exupéry",
    slug: "antoine-de-saint-exupery",
    books: 1,
    avgRating: 5.0,
    nationality: "Francés",
    continent: "Europa",
    genre: "Filosofía",
    gender: "Masculino",
    birthYear: 1900,
    deathYear: 1944,
    age: 44,
    avatar: "/placeholder.svg?height=60&width=60",
    bookTitles: ["El Principito"],
    totalPages: 96,
    bio: "Escritor y aviador francés, autor de obras filosóficas profundas y universales.",
    awards: ["Legión de Honor de Francia"],
    isAlive: false,
  },
  {
    name: "Isaac Asimov",
    slug: "isaac-asimov",
    books: 3,
    avgRating: 4.4,
    nationality: "Estadounidense",
    continent: "América del Norte",
    genre: "Ciencia Ficción",
    gender: "Masculino",
    birthYear: 1920,
    deathYear: 1992,
    age: 72,
    avatar: "/placeholder.svg?height=60&width=60",
    bookTitles: ["Fundación", "Yo, Robot", "El fin de la eternidad"],
    totalPages: 892,
    bio: "Prolífico escritor de ciencia ficción y divulgación científica, creador de las Leyes de la Robótica.",
    awards: ["Hugo Award", "Nebula Award", "Locus Award"],
    isAlive: false,
  },
  {
    name: "Isabel Allende",
    slug: "isabel-allende",
    books: 2,
    avgRating: 4.6,
    nationality: "Chilena",
    continent: "América del Sur",
    genre: "Realismo Mágico",
    gender: "Femenino",
    birthYear: 1942,
    deathYear: null,
    age: new Date().getFullYear() - 1942,
    avatar: "/placeholder.svg?height=60&width=60",
    bookTitles: ["La casa de los espíritus", "De amor y de sombra"],
    totalPages: 756,
    bio: "Escritora chilena, una de las principales exponentes del realismo mágico contemporáneo.",
    awards: ["Premio Nacional de Literatura de Chile", "Medalla Presidencial de la Libertad"],
    isAlive: true,
  },
  {
    name: "Haruki Murakami",
    slug: "haruki-murakami",
    books: 1,
    avgRating: 4.2,
    nationality: "Japonés",
    continent: "Asia",
    genre: "Ficción Contemporánea",
    gender: "Masculino",
    birthYear: 1949,
    deathYear: null,
    age: new Date().getFullYear() - 1949,
    avatar: "/placeholder.svg?height=60&width=60",
    bookTitles: ["Tokio Blues"],
    totalPages: 389,
    bio: "Escritor japonés contemporáneo, conocido por su estilo surrealista y melancólico.",
    awards: ["Premio Franz Kafka", "Premio Jerusalem"],
    isAlive: true,
  },
]

// Colores por continente
const continentColors: Record<string, string> = {
  "América del Sur": "bg-green-100 text-green-800",
  Europa: "bg-blue-100 text-blue-800",
  "América del Norte": "bg-purple-100 text-purple-800",
  Asia: "bg-orange-100 text-orange-800",
  África: "bg-yellow-100 text-yellow-800",
  Oceanía: "bg-cyan-100 text-cyan-800",
}

// Colores por género literario
const genreColors: Record<string, string> = {
  "Realismo Mágico": "bg-emerald-100 text-emerald-800",
  Distopía: "bg-red-100 text-red-800",
  "Ciencia Ficción": "bg-blue-100 text-blue-800",
  Filosofía: "bg-purple-100 text-purple-800",
  "Ficción Contemporánea": "bg-indigo-100 text-indigo-800",
}

export default function Authors() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    nationality: "",
    birthYear: "",
    deathYear: "",
    genre: "",
    biography: "",
    awards: "",
    gender: "",
    continent: "",
  })
  const [bulkData, setBulkData] = useState("")

  const totalAuthors = authorsData.length
  const totalBooks = authorsData.reduce((sum, author) => sum + author.books, 0)
  const avgRating = authorsData.reduce((sum, author) => sum + author.avgRating, 0) / authorsData.length
  const aliveAuthors = authorsData.filter((author) => author.isAlive).length
  const continents = [...new Set(authorsData.map((author) => author.continent))].length

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const parseBulkData = () => {
    const lines = bulkData
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length >= 1) {
      setFormData({
        name: lines[0] || "",
        nationality: lines[1] || "",
        birthYear: lines[2] || "",
        deathYear: lines[3] || "",
        genre: lines[4] || "",
        biography: lines[5] || "",
        awards: lines[6] || "",
        gender: lines[7] || "",
        continent: lines[8] || "",
      })
      setBulkData("")
      setIsCollapsibleOpen(false)
      toast({
        title: "Datos cargados",
        description: "Los campos se han llenado automáticamente con la información proporcionada.",
      })
    } else {
      toast({
        title: "Error",
        description: "Por favor, proporciona al menos el nombre del autor.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del autor es obligatorio.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simular guardado (aquí iría la lógica real de guardado)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Datos del autor:", formData)

      toast({
        title: "¡Autor agregado exitosamente!",
        description: `${formData.name} ha sido añadido a tu biblioteca.`,
      })

      // Limpiar formulario y cerrar modal
      setFormData({
        name: "",
        nationality: "",
        birthYear: "",
        deathYear: "",
        genre: "",
        biography: "",
        awards: "",
        gender: "",
        continent: "",
      })
      setIsModalOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar el autor. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name.trim().length > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e7f3f8" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Autores</h1>
            <p className="text-blue-600">Explora tu colección de autores favoritos</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Autor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-blue-800">
                  <User className="h-5 w-5" />
                  Agregar Nuevo Autor
                </DialogTitle>
                <DialogDescription>
                  Completa la información del autor. Los campos marcados con * son obligatorios.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Entrada Rápida */}
                <Card className="bg-blue-50/50 border-blue-200">
                  <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
                        <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
                          <Sparkles className="h-4 w-4" />
                          Entrada Rápida de Datos
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Pega todos los datos con saltos de línea para llenar automáticamente los campos
                        </CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2 text-sm">Orden esperado (uno por línea):</h4>
                          <ol className="text-xs text-blue-700 space-y-1">
                            <li>1. Nombre completo del autor *</li>
                            <li>2. Nacionalidad</li>
                            <li>3. Año de nacimiento</li>
                            <li>4. Año de muerte (opcional, dejar vacío si está vivo)</li>
                            <li>5. Género literario principal</li>
                            <li>6. Biografía breve</li>
                            <li>7. Premios principales</li>
                            <li>8. Género (Masculino/Femenino/Otro)</li>
                            <li>9. Continente</li>
                          </ol>
                        </div>
                        <Textarea
                          placeholder="Ejemplo:
Gabriel García Márquez
Colombiano
1927
2014
Realismo Mágico
Escritor colombiano, premio Nobel de Literatura 1982...
Premio Nobel de Literatura 1982, Premio Cervantes 1982
Masculino
América del Sur"
                          value={bulkData}
                          onChange={(e) => setBulkData(e.target.value)}
                          rows={8}
                          className="border-blue-200 focus:border-blue-400 font-mono text-sm"
                        />
                        <Button
                          onClick={parseBulkData}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={!bulkData.trim()}
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Llenar Campos Automáticamente
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Formulario Principal */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name" className="text-blue-700 font-medium">
                        Nombre completo *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Ej: Gabriel García Márquez"
                        required
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationality" className="text-blue-700 font-medium">
                        Nacionalidad
                      </Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange("nationality", e.target.value)}
                        placeholder="Ej: Colombiano, Británico"
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="continent" className="text-blue-700 font-medium">
                        Continente
                      </Label>
                      <Select
                        value={formData.continent}
                        onValueChange={(value) => handleInputChange("continent", value)}
                      >
                        <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue placeholder="Seleccionar continente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="América del Norte">América del Norte</SelectItem>
                          <SelectItem value="América del Sur">América del Sur</SelectItem>
                          <SelectItem value="Europa">Europa</SelectItem>
                          <SelectItem value="Asia">Asia</SelectItem>
                          <SelectItem value="África">África</SelectItem>
                          <SelectItem value="Oceanía">Oceanía</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthYear" className="text-blue-700 font-medium">
                        Año de nacimiento
                      </Label>
                      <Input
                        id="birthYear"
                        type="number"
                        min="1000"
                        max={new Date().getFullYear()}
                        value={formData.birthYear}
                        onChange={(e) => handleInputChange("birthYear", e.target.value)}
                        placeholder="Ej: 1927"
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deathYear" className="text-blue-700 font-medium">
                        Año de muerte (opcional)
                      </Label>
                      <Input
                        id="deathYear"
                        type="number"
                        min="1000"
                        max={new Date().getFullYear()}
                        value={formData.deathYear}
                        onChange={(e) => handleInputChange("deathYear", e.target.value)}
                        placeholder="Dejar vacío si está vivo"
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-blue-700 font-medium">
                        Género
                      </Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Femenino">Femenino</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                          <SelectItem value="No especificado">No especificado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-blue-700 font-medium">
                        Género literario principal
                      </Label>
                      <Input
                        id="genre"
                        value={formData.genre}
                        onChange={(e) => handleInputChange("genre", e.target.value)}
                        placeholder="Ej: Realismo Mágico, Ciencia Ficción"
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biography" className="text-blue-700 font-medium">
                      Biografía
                    </Label>
                    <Textarea
                      id="biography"
                      value={formData.biography}
                      onChange={(e) => handleInputChange("biography", e.target.value)}
                      placeholder="Escribe una biografía breve del autor, incluyendo sus logros más importantes..."
                      rows={3}
                      className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="awards" className="text-blue-700 font-medium">
                      Premios y reconocimientos
                    </Label>
                    <Textarea
                      id="awards"
                      value={formData.awards}
                      onChange={(e) => handleInputChange("awards", e.target.value)}
                      placeholder="Lista los premios más importantes separados por comas..."
                      rows={2}
                      className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Autor
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>

                {/* Tips */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-800 mb-1 text-sm">Consejos para agregar autores</h3>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Usa la función de entrada rápida para llenar múltiples campos de una vez</li>
                        <li>• La biografía puede incluir información sobre su estilo e influencias</li>
                        <li>• En premios, incluye solo los más relevantes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Total de Autores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{totalAuthors}</div>
              <p className="text-sm text-blue-600">escritores únicos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Libros por Autor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{(totalBooks / totalAuthors).toFixed(1)}</div>
              <p className="text-sm text-blue-600">promedio por autor</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Calificación Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{avgRating.toFixed(1)}</div>
              <p className="text-sm text-blue-600">estrellas promedio</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Continentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{continents}</div>
              <p className="text-sm text-blue-600">regiones del mundo</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700">Autores Vivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{aliveAuthors}</div>
              <p className="text-sm text-blue-600">actualmente activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authorsData.map((author, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg">
                      {author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{author.name}</CardTitle>
                    <CardDescription className="text-sm flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      {author.nationality}
                      {author.isAlive && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Vivo
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nacimiento:</span>
                    <div className="font-medium">{author.birthYear}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Edad:</span>
                    <div className="font-medium">
                      {author.isAlive ? `${author.age} años` : `${author.age} años (†${author.deathYear})`}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={continentColors[author.continent]}>
                    {author.continent}
                  </Badge>
                  <Badge variant="outline" className={genreColors[author.genre] || "bg-gray-100 text-gray-800"}>
                    {author.genre}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-100 text-slate-800">
                    {author.gender}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{author.books}</div>
                    <div className="text-xs text-muted-foreground">Libros</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{author.avgRating}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-600">{author.totalPages}</div>
                    <div className="text-xs text-muted-foreground">Páginas</div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground italic line-clamp-2">{author.bio}</p>

                {/* Awards */}
                {author.awards.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Premios destacados:</span>
                    <div className="flex flex-wrap gap-1">
                      {author.awards.slice(0, 2).map((award, awardIndex) => (
                        <Badge key={awardIndex} variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                          🏆 {award}
                        </Badge>
                      ))}
                      {author.awards.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{author.awards.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Books */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Libros leídos:</span>
                  <div className="space-y-1">
                    {author.bookTitles.slice(0, 2).map((book, bookIndex) => (
                      <div key={bookIndex} className="flex items-center gap-2">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{book}</span>
                      </div>
                    ))}
                    {author.bookTitles.length > 2 && (
                      <div className="text-xs text-muted-foreground pl-5">
                        +{author.bookTitles.length - 2} libro(s) más
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Display */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Calificación promedio</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold">{author.avgRating}</span>
                  </div>
                </div>

                {/* View All Books Button */}
                <Link href={`/authors/${author.slug}`}>
                  <Button
                    variant="outline"
                    className="w-full mt-2 group-hover:bg-blue-50 group-hover:border-blue-200 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver todos los libros
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Author Insights */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="h-5 w-5" />
              Insights de Autores
            </CardTitle>
            <CardDescription>Análisis de tus autores favoritos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Autor más leído</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">GGM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Gabriel García Márquez</p>
                    <p className="text-sm text-muted-foreground">3 libros • 4.8 ⭐</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Mejor calificado</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-green-100 text-green-600">ASE</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Antoine de Saint-Exupéry</p>
                    <p className="text-sm text-muted-foreground">1 libro • 5.0 ⭐</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Continente más leído</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">América del Sur</p>
                    <p className="text-sm text-muted-foreground">2 autores • 5 libros</p>
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
