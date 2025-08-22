"use client"

import { useState } from "react"
import { Plus, Filter, Search, Heart, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const quotesData = [
  {
    id: 1,
    text: "Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.",
    source: "Cien años de soledad",
    author: "Gabriel García Márquez",
    page: 1,
    category: "Apertura memorable",
    type: "Libro",
    likes: 12,
    isFavorite: true,
  },
  {
    id: 2,
    text: "La guerra es la paz. La libertad es la esclavitud. La ignorancia es la fuerza.",
    source: "1984",
    author: "George Orwell",
    page: 26,
    category: "Filosofía política",
    type: "Libro",
    likes: 8,
    isFavorite: true,
  },
  {
    id: 3,
    text: "Frankly, my dear, I don't give a damn.",
    source: "Gone with the Wind",
    author: "Clark Gable",
    page: null,
    category: "Icónica",
    type: "Película",
    likes: 15,
    isFavorite: true,
  },
  {
    id: 4,
    text: "El miedo es el asesino de la mente.",
    source: "Dune",
    author: "Frank Herbert",
    page: 45,
    category: "Filosofía",
    type: "Libro",
    likes: 6,
    isFavorite: false,
  },
  {
    id: 5,
    text: "May the Force be with you.",
    source: "Star Wars",
    author: "Obi-Wan Kenobi",
    page: null,
    category: "Inspiracional",
    type: "Película",
    likes: 20,
    isFavorite: true,
  },
  {
    id: 6,
    text: "En un agujero en el suelo, vivía un hobbit. No un agujero húmedo, sucio, repugnante, con restos de gusanos y olor a fango, ni tampoco un agujero seco, desnudo y arenoso, sin nada en que sentarse o que comer: era un agujero-hobbit, y eso significa comodidad.",
    source: "El Hobbit",
    author: "J.R.R. Tolkien",
    page: 1,
    category: "Apertura memorable",
    type: "Libro",
    likes: 18,
    isFavorite: true,
  },
  {
    id: 7,
    text: "Ser o no ser, esa es la cuestión.",
    source: "Hamlet",
    author: "William Shakespeare",
    page: 64,
    category: "Filosofía",
    type: "Libro",
    likes: 25,
    isFavorite: true,
  },
  {
    id: 8,
    text: "Todas las familias felices se parecen unas a otras, pero cada familia infeliz lo es a su manera.",
    source: "Anna Karenina",
    author: "León Tolstói",
    page: 1,
    category: "Apertura memorable",
    type: "Libro",
    likes: 14,
    isFavorite: false,
  },
  {
    id: 9,
    text: "Winter is coming.",
    source: "Game of Thrones",
    author: "Ned Stark",
    page: null,
    category: "Icónica",
    type: "Serie",
    likes: 22,
    isFavorite: true,
  },
  {
    id: 10,
    text: "No llores porque ya se terminó, sonríe porque sucedió.",
    source: "Atribuido a Dr. Seuss",
    author: "Dr. Seuss",
    page: null,
    category: "Inspiracional",
    type: "Otro",
    likes: 16,
    isFavorite: false,
  },
  {
    id: 11,
    text: "Era el mejor de los tiempos, era el peor de los tiempos, era la edad de la sabiduría, era la edad de la locura.",
    source: "Historia de dos ciudades",
    author: "Charles Dickens",
    page: 1,
    category: "Apertura memorable",
    type: "Libro",
    likes: 11,
    isFavorite: false,
  },
  {
    id: 12,
    text: "I have a dream.",
    source: "Discurso en Washington",
    author: "Martin Luther King Jr.",
    page: null,
    category: "Inspiracional",
    type: "Otro",
    likes: 30,
    isFavorite: true,
  },
  {
    id: 13,
    text: "La única forma de hacer un gran trabajo es amar lo que haces.",
    source: "Discurso en Stanford",
    author: "Steve Jobs",
    page: null,
    category: "Inspiracional",
    type: "Otro",
    likes: 19,
    isFavorite: false,
  },
  {
    id: 14,
    text: "Yo soy tu padre.",
    source: "Star Wars: El Imperio Contraataca",
    author: "Darth Vader",
    page: null,
    category: "Icónica",
    type: "Película",
    likes: 28,
    isFavorite: true,
  },
  {
    id: 15,
    text: "El conocimiento es poder.",
    source: "Novum Organum",
    author: "Francis Bacon",
    page: 45,
    category: "Sabiduría",
    type: "Libro",
    likes: 13,
    isFavorite: false,
  },
  {
    id: 16,
    text: "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.",
    source: "La Biblia - Juan 1:1",
    author: "Juan el Evangelista",
    page: null,
    category: "Filosofía",
    type: "Libro",
    likes: 17,
    isFavorite: false,
  },
  {
    id: 17,
    text: "Pienso, luego existo.",
    source: "Discurso del método",
    author: "René Descartes",
    page: 32,
    category: "Filosofía",
    type: "Libro",
    likes: 21,
    isFavorite: true,
  },
  {
    id: 18,
    text: "Houston, tenemos un problema.",
    source: "Apollo 13",
    author: "Jim Lovell",
    page: null,
    category: "Icónica",
    type: "Película",
    likes: 12,
    isFavorite: false,
  },
  {
    id: 19,
    text: "La vida es como una caja de chocolates, nunca sabes lo que te va a tocar.",
    source: "Forrest Gump",
    author: "Forrest Gump",
    page: null,
    category: "Reflexión",
    type: "Película",
    likes: 24,
    isFavorite: true,
  },
  {
    id: 20,
    text: "Había una vez un niño llamado Eustace Clarence Scrubb, y casi se merecía ese nombre.",
    source: "La travesía del Viajero del Alba",
    author: "C.S. Lewis",
    page: 1,
    category: "Apertura memorable",
    type: "Libro",
    likes: 9,
    isFavorite: false,
  },
  {
    id: 21,
    text: "El amor es la fuerza más humilde, pero la más poderosa de que dispone el mundo.",
    source: "Autobiografía",
    author: "Mahatma Gandhi",
    page: 156,
    category: "Sabiduría",
    type: "Libro",
    likes: 15,
    isFavorite: true,
  },
  {
    id: 22,
    text: "Valar morghulis - Todos los hombres deben morir.",
    source: "Game of Thrones",
    author: "Jaqen H'ghar",
    page: null,
    category: "Filosofía",
    type: "Serie",
    likes: 18,
    isFavorite: false,
  },
  {
    id: 23,
    text: "La imaginación es más importante que el conocimiento.",
    source: "Entrevista",
    author: "Albert Einstein",
    page: null,
    category: "Sabiduría",
    type: "Otro",
    likes: 26,
    isFavorite: true,
  },
  {
    id: 24,
    text: "Después de todo, mañana será otro día.",
    source: "Lo que el viento se llevó",
    author: "Scarlett O'Hara",
    page: null,
    category: "Inspiracional",
    type: "Película",
    likes: 14,
    isFavorite: false,
  },
  {
    id: 25,
    text: "La felicidad se puede encontrar hasta en los momentos más oscuros, si uno recuerda encender la luz.",
    source: "Harry Potter y el Prisionero de Azkaban",
    author: "Albus Dumbledore",
    page: 427,
    category: "Inspiracional",
    type: "Libro",
    likes: 31,
    isFavorite: true,
  },
  {
    id: 26,
    text: "Elemental, mi querido Watson.",
    source: "Las aventuras de Sherlock Holmes",
    author: "Sherlock Holmes",
    page: 89,
    category: "Icónica",
    type: "Libro",
    likes: 16,
    isFavorite: false,
  },
  {
    id: 27,
    text: "La única constante en la vida es el cambio.",
    source: "Fragmentos",
    author: "Heráclito",
    page: null,
    category: "Filosofía",
    type: "Libro",
    likes: 20,
    isFavorite: true,
  },
  {
    id: 28,
    text: "Que la fuerza te acompañe, siempre.",
    source: "Star Wars: Una Nueva Esperanza",
    author: "Obi-Wan Kenobi",
    page: null,
    category: "Inspiracional",
    type: "Película",
    likes: 23,
    isFavorite: true,
  },
  {
    id: 29,
    text: "No es lo que nos sucede, sino cómo reaccionamos a ello lo que importa.",
    source: "Discursos",
    author: "Epicteto",
    page: 12,
    category: "Sabiduría",
    type: "Libro",
    likes: 17,
    isFavorite: false,
  },
  {
    id: 30,
    text: "Todos tenemos dos vidas. La segunda comienza cuando nos damos cuenta de que solo tenemos una.",
    source: "Atribuido a Confucio",
    author: "Confucio",
    page: null,
    category: "Reflexión",
    type: "Otro",
    likes: 22,
    isFavorite: true,
  },
]

// Sistema de colores para categorías
const categoryColors = {
  "Apertura memorable": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  "Filosofía política": { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  Icónica: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  Filosofía: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  Inspiracional: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  Reflexión: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300" },
  Sabiduría: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
}

// Colores disponibles para nuevas categorías
const availableColors = [
  { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
  { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-300" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300" },
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-300" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300" },
  { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
]

const types = ["Todos", "Libro", "Película", "Serie", "Podcast", "Otro"]

export default function Quotes() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [selectedType, setSelectedType] = useState("Todos")
  const [isAddingQuote, setIsAddingQuote] = useState(false)
  const [newQuote, setNewQuote] = useState({
    text: "",
    source: "",
    page: "",
    category: "",
    type: "Libro",
    isFavorite: false,
  })
  const [categoryColorMap, setCategoryColorMap] = useState(categoryColors)

  // Obtener todas las categorías únicas de las citas existentes
  const existingCategories = Array.from(new Set(quotesData.map((quote) => quote.category)))
  const allCategories = ["Todas", ...existingCategories.sort()]

  // Función para obtener el color de una categoría
  const getCategoryColor = (category) => {
    if (categoryColorMap[category]) {
      return categoryColorMap[category]
    }

    // Si la categoría no existe, asignar un color nuevo
    const usedColors = Object.values(categoryColorMap)
    const availableColor = availableColors.find((color) => !usedColors.some((used) => used.bg === color.bg))

    const newColor = availableColor || availableColors[0] // Fallback al primer color si todos están usados

    // Actualizar el mapa de colores
    setCategoryColorMap((prev) => ({
      ...prev,
      [category]: newColor,
    }))

    return newColor
  }

  // Función para normalizar categorías (capitalizar primera letra, trim espacios)
  const normalizeCategory = (category) => {
    if (!category || !category.trim()) return ""
    const trimmed = category.trim()
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  // Función para buscar categorías similares
  const findSimilarCategory = (inputCategory) => {
    const normalized = normalizeCategory(inputCategory)
    const existing = existingCategories.find((cat) => cat.toLowerCase() === normalized.toLowerCase())
    return existing || null
  }

  const filteredQuotes = quotesData.filter((quote) => {
    const matchesSearch =
      quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todas" || quote.category === selectedCategory
    const matchesType = selectedType === "Todos" || quote.type === selectedType

    return matchesSearch && matchesCategory && matchesType
  })

  const totalQuotes = quotesData.length
  const favoriteQuotes = quotesData.filter((q) => q.isFavorite).length

  const handleAddQuote = () => {
    if (!newQuote.text.trim() || !newQuote.source.trim()) {
      alert("Por favor, completa al menos el texto de la cita y la fuente.")
      return
    }

    // Procesar la categoría
    let finalCategory = "Sin categoría"
    if (newQuote.category.trim()) {
      const similarCategory = findSimilarCategory(newQuote.category)
      if (similarCategory) {
        finalCategory = similarCategory
        console.log(`Categoría existente encontrada: "${similarCategory}" para "${newQuote.category}"`)
      } else {
        finalCategory = normalizeCategory(newQuote.category)
        console.log(`Nueva categoría creada: "${finalCategory}"`)
        // Asignar color a la nueva categoría
        getCategoryColor(finalCategory)
      }
    }

    // Aquí normalmente agregarías la cita a tu base de datos o estado global
    const quoteToAdd = {
      id: quotesData.length + 1,
      text: newQuote.text.trim(),
      source: newQuote.source.trim(),
      page: newQuote.page ? Number.parseInt(newQuote.page) : null,
      category: finalCategory,
      type: newQuote.type,
      likes: 0,
      isFavorite: newQuote.isFavorite,
    }

    console.log("Nueva cita agregada:", quoteToAdd)

    // Resetear el formulario y cerrar el modal
    setNewQuote({
      text: "",
      source: "",
      page: "",
      category: "",
      type: "Libro",
      isFavorite: false,
    })
    setIsAddingQuote(false)

    // Mostrar mensaje de éxito
    alert(`¡Cita agregada exitosamente en la categoría "${finalCategory}"!`)
  }

  const handleCancelAdd = () => {
    setNewQuote({
      text: "",
      source: "",
      page: "",
      category: "",
      type: "Libro",
      isFavorite: false,
    })
    setIsAddingQuote(false)
  }

  const handleCategoryChange = (value) => {
    setNewQuote({ ...newQuote, category: value })

    // Mostrar sugerencia si hay categoría similar
    if (value.trim()) {
      const similar = findSimilarCategory(value)
      if (similar && similar.toLowerCase() !== value.toLowerCase()) {
        console.log(`Sugerencia: ¿Quisiste decir "${similar}"?`)
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#edf3ec" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header con botón agregar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Citas Literarias</h1>
            <p className="text-green-600">Tu colección personal de frases memorables</p>
          </div>

          {/* Modal para agregar nueva cita */}
          <Dialog open={isAddingQuote} onOpenChange={setIsAddingQuote}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 shadow-lg transition-all duration-200 hover:shadow-xl">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-green-800">Agregar Nueva Cita</DialogTitle>
                <DialogDescription className="text-green-600">
                  Guarda una nueva cita memorable de libros, películas, series o cualquier fuente que te inspire.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Texto de la cita */}
                <div className="space-y-2">
                  <Label htmlFor="quote-text" className="text-sm font-medium text-green-700">
                    Texto de la cita *
                  </Label>
                  <Textarea
                    id="quote-text"
                    value={newQuote.text}
                    onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                    placeholder="Escribe aquí la cita que quieres guardar..."
                    rows={4}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>

                {/* Fuente */}
                <div className="space-y-2">
                  <Label htmlFor="quote-source" className="text-sm font-medium text-green-700">
                    Fuente *
                  </Label>
                  <Input
                    id="quote-source"
                    value={newQuote.source}
                    onChange={(e) => setNewQuote({ ...newQuote, source: e.target.value })}
                    placeholder="Ej: El Quijote, Star Wars, etc."
                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>

                {/* Tipo, Categoría y Página */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quote-type" className="text-sm font-medium text-green-700">
                      Tipo
                    </Label>
                    <Select value={newQuote.type} onValueChange={(value) => setNewQuote({ ...newQuote, type: value })}>
                      <SelectTrigger className="border-green-200 focus:border-green-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Libro">📚 Libro</SelectItem>
                        <SelectItem value="Película">🎬 Película</SelectItem>
                        <SelectItem value="Serie">📺 Serie</SelectItem>
                        <SelectItem value="Podcast">🎧 Podcast</SelectItem>
                        <SelectItem value="Otro">✨ Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quote-category" className="text-sm font-medium text-green-700">
                      Categoría
                    </Label>
                    <div className="relative">
                      <Input
                        id="quote-category"
                        value={newQuote.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        placeholder="Ej: Filosofía, Inspiracional..."
                        className="border-green-200 focus:border-green-400 focus:ring-green-400"
                      />
                      {newQuote.category.trim() && (
                        <div className="mt-1 text-xs text-gray-500">
                          {findSimilarCategory(newQuote.category) &&
                          findSimilarCategory(newQuote.category).toLowerCase() !== newQuote.category.toLowerCase() ? (
                            <span className="text-amber-600">
                              💡 Sugerencia: "{findSimilarCategory(newQuote.category)}" ya existe
                            </span>
                          ) : existingCategories.includes(normalizeCategory(newQuote.category)) ? (
                            <span className="text-green-600">✅ Categoría existente</span>
                          ) : (
                            <span className="text-blue-600">✨ Nueva categoría</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quote-page" className="text-sm font-medium text-green-700">
                      Página (opcional)
                    </Label>
                    <Input
                      id="quote-page"
                      value={newQuote.page}
                      onChange={(e) => setNewQuote({ ...newQuote, page: e.target.value })}
                      placeholder="Número"
                      type="number"
                      min="1"
                      className="border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                  </div>
                </div>

                {/* Mostrar categorías existentes */}
                {existingCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">Categorías existentes:</Label>
                    <div className="flex flex-wrap gap-2">
                      {existingCategories.map((category) => {
                        const colors = getCategoryColor(category)
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setNewQuote({ ...newQuote, category })}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${colors.bg} ${colors.text} ${colors.border} border`}
                          >
                            {category}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Checkbox para favorito */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="quote-favorite"
                    checked={newQuote.isFavorite}
                    onChange={(e) => setNewQuote({ ...newQuote, isFavorite: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <Label htmlFor="quote-favorite" className="text-sm font-medium text-green-700 cursor-pointer">
                    Marcar como favorita ❤️
                  </Label>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelAdd}
                  className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddQuote}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!newQuote.text.trim() || !newQuote.source.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Guardar Cita
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview - Ahora solo 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-700">Total de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{totalQuotes}</div>
              <p className="text-sm text-green-600">frases guardadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-700">Favoritas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{favoriteQuotes}</div>
              <p className="text-sm text-green-600">citas destacadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar citas, fuentes o autores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-400"
                  />
                </div>
              </div>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48 border-green-200">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 border-green-200">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de citas con nuevo diseño */}
        <div className="space-y-6">
          {filteredQuotes.map((quote) => {
            const categoryColor = getCategoryColor(quote.category)
            return (
              <Card
                key={quote.id}
                className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 relative"
              >
                {/* Corazón de favorito en la esquina superior derecha */}
                {quote.isFavorite && (
                  <div className="absolute top-4 right-4 z-10">
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna izquierda - Texto de la cita */}
                    <div className="lg:col-span-2">
                      <blockquote className="text-lg text-green-800 font-medium leading-relaxed italic border-l-4 border-green-300 pl-4">
                        "{quote.text}"
                      </blockquote>
                    </div>

                    {/* Columna derecha - Información de la fuente */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-700">{quote.source}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`${categoryColor.bg} ${categoryColor.text} hover:scale-105 transition-transform border ${categoryColor.border}`}
                          >
                            {quote.category}
                          </Badge>
                          <Badge variant="outline" className="border-green-300 text-green-600">
                            {quote.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Página como pie de página */}
                  {quote.page && (
                    <div className="absolute bottom-2 right-4">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Pág. {quote.page}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredQuotes.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No se encontraron citas que coincidan con los filtros seleccionados.
              </p>
              <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros o agregar una nueva cita.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
