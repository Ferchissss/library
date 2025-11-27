"use client"
import { BookOpen, Users, Heart, QuoteIcon, Calendar, UserPlus, PenLine, Plus, File, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import type { Book, Quote } from "@/lib/types"
import { MarkdownViewer } from "./MarkdownViewer"
import { AVAILABLE_COLORS, getConsistentColorIndex } from "@/lib/colors"
import { useState, useEffect } from "react"
import { EditableCell } from "./EditableCell"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { StarRating, EmptyStarRating, FavoriteButton } from "./book-components"
import { QuotesSection } from "./QuotesSection"

interface BookDetailsModalProps {
  book: Book | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  quotes: Quote[]
  onBookUpdate: (book: Book) => void
  refreshData?: () => void
}

const availableColors = AVAILABLE_COLORS

// Función para obtener estilos de color consistentes para géneros
const getGenreColorStyle = (genreName: string) => {
  const colorIndex = getConsistentColorIndex(genreName, "bookDetailsGenres", availableColors.length)
  const colorClass = availableColors[colorIndex]
  return {
    backgroundColor: colorClass.bg,
    borderColor: colorClass.border.replace("border-", "#"),
    color: "#4B5563",
  }
}

export function BookDetailsModal({book,isOpen,onOpenChange,quotes,onBookUpdate,refreshData,}: BookDetailsModalProps) {
  const [editingField, setEditingField] = useState<{ section: string; field: string } | null>(null)
  const [options, setOptions] = useState<Record<string, { value: string; label: string; id?: number }[]>>({})
  const [isAddingQuote, setIsAddingQuote] = useState(false)
  const [currentQuotes, setCurrentQuotes] = useState<Quote[]>(quotes)

  useEffect(() => {
    setCurrentQuotes(quotes)
  }, [quotes])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data: types } = await supabase
          .from("books")
          .select("type")
          .not("type", "is", null)
          .order("type", { ascending: true })
        const { data: publishers } = await supabase
          .from("books")
          .select("publisher")
          .not("publisher", "is", null)
          .order("publisher", { ascending: true })
        const { data: languages } = await supabase
          .from("books")
          .select("language")
          .not("language", "is", null)
          .order("language", { ascending: true })
        const { data: eras } = await supabase
          .from("books")
          .select("era")
          .not("era", "is", null)
          .order("era", { ascending: true })
        const { data: formats } = await supabase
          .from("books")
          .select("format")
          .not("format", "is", null)
          .order("format", { ascending: true })
        const { data: audiences } = await supabase
          .from("books")
          .select("audience")
          .not("audience", "is", null)
          .order("audience", { ascending: true })
        const { data: years } = await supabase
          .from("books")
          .select("year")
          .not("year", "is", null)
          .order("year", { ascending: false })
        const { data: authors } = await supabase.from("authors").select("id, name").order("name", { ascending: true })
        const { data: series } = await supabase.from("series").select("id, name").order("name", { ascending: true })
        const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true })

        setOptions({
          type: [...new Set(types?.map((t) => t.type))].map((t) => ({ value: t, label: t })) || [],
          publisher: [...new Set(publishers?.map((p) => p.publisher))].map((p) => ({ value: p, label: p })) || [],
          language: [...new Set(languages?.map((l) => l.language))].map((l) => ({ value: l, label: l })) || [],
          era: [...new Set(eras?.map((e) => e.era))].map((e) => ({ value: e, label: e })) || [],
          format: [...new Set(formats?.map((f) => f.format))].map((f) => ({ value: f, label: f })) || [],
          audience: [...new Set(audiences?.map((a) => a.audience))].map((a) => ({ value: a, label: a })) || [],
          year: [...new Set(years?.map((y) => y.year?.toString()))].map((y) => ({ value: y, label: y })) || [],
          author: authors?.map((a) => ({ value: a.id.toString(), label: a.name, id: a.id })) || [],
          series: series?.map((s) => ({ value: s.id.toString(), label: s.name, id: s.id })) || [],
          genre: genres?.map((g) => ({ value: g.id.toString(), label: g.name, id: g.id })) || [],
          reading_difficulty: [
            { value: "Light", label: "Light" },
            { value: "Medium", label: "Medium" },
            { value: "Dense", label: "Dense" },
          ],
        })
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }

    if (book) {
      fetchOptions()
    }
  }, [book])

  const handleSave = async (field: string, newValue: any) => {
    if (!book) return

    try {
      const fieldMap: Record<string, string> = {
        title: "title",
        review: "review",
        rating: "rating",
        type: "type",
        publisher: "publisher",
        language: "language",
        era: "era",
        format: "format",
        audience: "audience",
        reading_difficulty: "reading_difficulty",
        year: "year",
        pages: "pages",
        awards: "awards",
        favorite: "favorite",
        series: "series_id",
        author: "author_id",
        start_date: "start_date",
        end_date: "end_date",
        image_url: "image_url",
        summary: "summary",
        main_characters: "main_characters",
        favorite_character: "favorite_character",
      }

      const dbField = fieldMap[field]
      if (!dbField) return

      let dbValue = newValue

      // Convertir IDs para campos relacionales
      if (field === "author" || field === "series") {
        if (newValue) {
          const parsedId = Number.parseInt(newValue)
          if (!isNaN(parsedId)) {
            dbValue = parsedId
          } else {
            dbValue = null
          }
        } else {
          dbValue = null
        }
      }

      if (field === "year" || field === "pages") dbValue = Number.parseInt(newValue)
      if (field === "rating") dbValue = Number.parseFloat(newValue)
      if (field === "favorite") dbValue = Boolean(newValue)
      if (field === "start_date" || field === "end_date") {
        dbValue = newValue ? new Date(newValue).toISOString() : null
      }

      const { error } = await supabase
        .from("books")
        .update({ [dbField]: dbValue })
        .eq("id", book.id)

      if (error) throw error

      const updatedBook = { ...book }

      // Actualizar el campo correspondiente en el objeto local
      if (field === "author" && dbValue) {
        // Buscar el autor en las opciones para obtener el nombre
        const authorOption = options.author?.find((a) => a.id === dbValue)
        if (authorOption) {
          updatedBook.author = { id: dbValue, name: authorOption.label }
        }
      } else if (field === "series" && dbValue) {
        // Buscar la serie en las opciones para obtener el nombre
        const seriesOption = options.series?.find((s) => s.id === dbValue)
        if (seriesOption) {
          updatedBook.series = { id: dbValue, name: seriesOption.label }
        }
      } else if (field === "series" && !dbValue) {
        updatedBook.series = undefined
      } else if (field === "author" && !dbValue) {
        updatedBook.author = undefined
      } else {
        // Para campos simples, actualizar directamente
        ;(updatedBook as any)[field] = newValue
      }

      onBookUpdate(updatedBook) // ← Notificar al padre

      toast.success(`Campo ${field} actualizado`)
      setEditingField(null)
    } catch (error) {
      toast.error(`No se pudo actualizar el campo ${field}`)
    }
  }

  const handleSaveGenres = async (genreIds: string[]) => {
    if (!book) return

    try {
      const numericGenreIds = genreIds.map((id) => Number.parseInt(id)).filter((id) => !isNaN(id))

      // Eliminar relaciones existentes
      const { error: deleteError } = await supabase.from("book_genre").delete().eq("book_id", book.id)

      if (deleteError) throw deleteError

      // Crear nuevas relaciones si hay géneros válidos
      if (numericGenreIds.length > 0) {
        const genreInserts = numericGenreIds.map((genreId) => ({
          book_id: book.id,
          genre_id: genreId,
        }))

        const { error: insertError } = await supabase.from("book_genre").insert(genreInserts)

        if (insertError) throw insertError
      }

      const updatedGenres = numericGenreIds
        .map((genreId) => {
          const genreOption = options.genre?.find((g) => g.id === genreId)
          return genreOption ? { id: genreId, name: genreOption.label } : null
        })
        .filter(Boolean) as { id: number; name: string }[]

      const updatedBook = { ...book, genres: updatedGenres }
      onBookUpdate(updatedBook) // ← Notificar al padre

      toast.success("Géneros actualizados correctamente")
      setEditingField(null)
    } catch (error) {
      toast.error("No se pudieron actualizar los géneros")
    }
  }

  const handleFavoriteClick = async () => {
    if (!book) return

    try {
      const newFavoriteValue = !book.favorite
      const { error } = await supabase.from("books").update({ favorite: newFavoriteValue }).eq("id", book.id)

      if (error) throw error

      // Actualizar el libro localmente
      const updatedBook = { ...book, favorite: newFavoriteValue }
      onBookUpdate(updatedBook)

      toast.success(newFavoriteValue ? "Libro marcado como favorito" : "Libro desmarcado como favorito")
    } catch (error) {
      toast.error("No se pudo actualizar el favorito")
    }
  }

  const handleSaveQuotes = async (quotesToSave: Quote[]) => {
    if (!book) return

    try {
      // Eliminar todas las citas existentes del libro
      const { error: deleteError } = await supabase
        .from("quotes")
        .delete()
        .eq("book_id", book.id)

      if (deleteError) throw deleteError

      // Insertar las nuevas citas si hay alguna
      if (quotesToSave.length > 0) {
        const quotesToInsert = quotesToSave.map((quote) => ({
          book_id: book.id,
          text: quote.text,
          page: quote.page ?? null,
          type: quote.type || null,
          category: quote.category || null,
          favorite: false,
        }))

        const { error: insertError } = await supabase
          .from("quotes")
        .insert(quotesToInsert)

      if (insertError) throw insertError
    }

    // Actualizar el estado local
    setCurrentQuotes(quotesToSave)
    
    toast.success("Citas actualizadas correctamente")
    
    // Refrescar datos si se proporcionó la función
    if (refreshData) {
      refreshData()
    }
  } catch (error) {
    console.error("Error saving quotes:", error)
    toast.error("Error al guardar las citas")
  }
}

  const renderEditableField = (section: string, field: string, label: string, value: any, options: any[] = [], color: "purple" | "blue" | "emerald" = "purple" ) => {
    const isEditing = editingField?.section === section && editingField?.field === field
    const colorClasses = {
      purple: {label: "text-purple-500",text: "text-purple-900",},
      blue: {label: "text-blue-500", text: "text-blue-900",},
      emerald: {label: "text-emerald-500",text: "text-emerald-900",}
    }

    const colors = colorClasses[color]

    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3 relative z-[9999]">
          <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">{label}</Label>
          <div className="mt-1">
            <EditableCell
              book={book!}
              columnId={field}
              value={value}
              options={options}
              onSave={(newValue) => handleSave(field, newValue)}
              onCancel={() => setEditingField(null)}
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className="bg-white/60 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors group relative"
        onClick={() => setEditingField({ section, field })}
      >
        <Label className={`text-xs font-semibold ${colors.label} uppercase tracking-wide`}>{label}</Label>
        <p className={`text-sm mt-1 font-semibold ${colors.text}`}>{value || ""}</p>
      </div>
    )
  }

  const renderImageField = () => {
    if (!book) return null
    const isEditing = editingField?.section === "header" && editingField?.field === "image_url"

    if (isEditing) {
      return (
        <div className="text-center bg-white/60 rounded-lg p-3 relative" style={{ zIndex: 9999 }}>
          <EditableCell
            book={book!}
            columnId="image_url"
            value={book.image_url}
            options={[]}
            onSave={(newValue) => handleSave("image_url", newValue)}
            onCancel={() => setEditingField(null)}
          />
        </div>
      )
    }

    return (
      <div
        className="cursor-pointer group relative text-center"
        onClick={() => setEditingField({ section: "header", field: "image_url" })}
      >
        <Image
          src={book.image_url || "/placeholder.svg"}
          alt={book.title}
          width={200}
          height={300}
          className="mx-auto rounded-lg shadow-md"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
            Cambiar imagen
          </span>
        </div>
      </div>
    )
  }

  const renderMainCharactersField = () => {
    if (!book) return null
    const isEditing = editingField?.section === "characters" && editingField?.field === "main_characters"

    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3" style={{ position: "relative", zIndex: 9999 }}>
          <div className="mt-1">
            <EditableCell
              book={book!}
              columnId="main_characters"
              value={book.main_characters}
              options={[]}
              onSave={(newValue) => handleSave("main_characters", newValue)}
              onCancel={() => setEditingField(null)}
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className="bg-white/60 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors group relative"
        onClick={() => setEditingField({ section: "characters", field: "main_characters" })}
      >
        {book.main_characters ? (
          <ul className="space-y-3 mt-1">
            {book.main_characters.split(",").map((character, index) => (
              <li key={index} className="flex items-center gap-3">
                <Circle className="h-2.5 w-2.5 flex-shrink-0 fill-purple-500 text-purple-500" />
                <span className="text-gray-800 font-medium capitalize">{character.trim()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="text-center text-gray-400 group-hover:text-v500 transition-colors">
              <Users className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">Agregar personajes principales</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderFavoriteCharacterField = () => {
    if (!book) return null
    const isEditing = editingField?.section === "characters" && editingField?.field === "favorite_character"
    const hasFavoriteCharacter = !!book.favorite_character

    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3" style={{ position: "relative", zIndex: 9999 }}>
          <div className="mt-1">
            <EditableCell
              book={book!}
              columnId="favorite_character"
              value={book.favorite_character}
              options={[]}
              onSave={(newValue) => handleSave("favorite_character", newValue)}
              onCancel={() => setEditingField(null)}
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className="cursor-pointer group relative min-h-[60px] rounded-lg border-2 border-dashed border-transparent group-hover:bordes transition-all"
        onClick={() => setEditingField({ section: "characters", field: "favorite_character" })}
      >
        {hasFavoriteCharacter ? (
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-sm mt-1 text-gray-700">{book.favorite_character}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="text-center text-gray-400 group-hover:text-v500 transition-colors">
              <Heart className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">Agregar personaje favorito</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSeriesField = () => {
    if (!book) return null
    const isEditing = editingField?.section === "info" && editingField?.field === "series"
    const seriesName = book.series?.name || ""

    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3">
          <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Universo</Label>
          <div className="mt-1">
            <EditableCell
              book={book!}
              columnId="universe"
              value={book.series?.id?.toString() || ""}
              options={options.series || []}
              onSave={(newValue) => handleSave("series", newValue)}
              onCancel={() => setEditingField(null)}
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className="bg-white/60 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors group relative"
        onClick={() => setEditingField({ section: "info", field: "series" })}
      >
        <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Universo</Label>
        <p className="text-sm mt-1 font-semibold text-purple-900">{seriesName}</p>
      </div>
    )
  }

  const renderReadingDifficultyField = () => {
    if (!book) return null
    const isEditing = editingField?.section === "details" && editingField?.field === "reading_difficulty"

    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3">
          <Label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Densidad de Lectura</Label>
          <div className="mt-1">
            <EditableCell
              book={book!}
              columnId="readingDensity"
              value={book.reading_difficulty || ""}
              options={options.reading_difficulty || []}
              onSave={(newValue) => handleSave("reading_difficulty", newValue)}
              onCancel={() => setEditingField(null)}
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className="bg-white/60 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors group relative"
        onClick={() => setEditingField({ section: "details", field: "reading_difficulty" })}
      >
        <Label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Densidad de Lectura</Label>
        <p className="text-sm mt-1 font-semibold text-blue-900">{book.reading_difficulty || ""}</p>
      </div>
    )
  }
  const renderAuthorField = () => {
    if (!book) return null
    const isEditing = editingField?.section === "left" && editingField?.field === "author"
    const hasAuthor = !!book.author?.name

    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3 relative" style={{ zIndex: 9999 }}>
          <div className="mt-1">
            <EditableCell
              book={book!}
              columnId="author"
              value={book.author?.id?.toString() || ""}
              options={options.author || []}
              onSave={(newValue) => handleSave("author", newValue)}
              onCancel={() => setEditingField(null)}
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className="cursor-pointer group relative min-h-[60px] rounded-lg border-2 border-dashed border-transparent group-hover:bordes transition-all flex items-center justify-center"
        onClick={() => setEditingField({ section: "left", field: "author" })}
      >
        {hasAuthor ? (
          <div className="bg-white/60 rounded-lg p-3 w-full">
            <p className="text-sm mt-1 font-semibold text">{book.author?.name}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full opacity-60 group-hover:opacity-100 transition-opacity w-full">
            <div className="text-center text-gray-400 group-hover:text-v500 transition-colors">
              <UserPlus className="w-6 h-6 mx-auto mb-1" />
            </div>
          </div>
        )}
      </div>
    )
  }
  const renderDateField = (field: "start_date" | "end_date", label: string) => {
    if (!book) return null
    const isEditing = editingField?.section === "dates" && editingField?.field === field
    const dateValue = field === "start_date" ? book.start_date : book.end_date

    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3">
          <Label className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
            {label}
          </Label>
          <div className="mt-1">
            <EditableCell
              book={book!}
              columnId={field === "start_date" ? "dateStarted" : "dateRead"}
              value={dateValue}
              options={[]}
              onSave={(newValue) => handleSave(field, newValue)}
              onCancel={() => setEditingField(null)}
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className="bg-white/60 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors group relative"
        onClick={() => setEditingField({ section: "dates", field })}
      >
        <Label className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
         {label}
        </Label>
        <p className="text-sm mt-1 font-bold text-emerald-900">
          {dateValue ? new Date(dateValue).toLocaleDateString("es-ES") : ""}
        </p>
      </div>
    )
  }

  const renderTitleField = () => {
    if (!book) return null
    const isEditing = editingField?.section === "header" && editingField?.field === "title"

    if (isEditing) {
      return (
        <div className="text-center bg-white/60 rounded-lg p-3 relative" style={{ zIndex: 9999 }}>
          <EditableCell
            book={book!}
            columnId="title"
            value={book.title}
            options={[]}
            onSave={(newValue) => handleSave("title", newValue)}
            onCancel={() => setEditingField(null)}
          />
        </div>
      )
    }

    return (
      <div
        className="cursor-pointer group relative text-center"
        onClick={() => setEditingField({ section: "header", field: "title" })}
      >
        <h3 className="text-lg font-bold text">{book.title}</h3>
      </div>
    )
  }

  const renderReviewField = (field: "review" | "summary", label?: string, placeholder?: string) => {
    if (!book) return null
    const isEditing = editingField?.section === "left" && editingField?.field === field
    const hasContent = !!book[field]

    if (isEditing) {
      return (
        <div
          className="cursor-pointer group relative min-h-[60px] rounded-lg border-2 border-dashed border-transparent group-hover:bordes transition-all bg-white/80 p-3"
          style={field === "summary" ? { zIndex: 9999 } : undefined}
        >
          <EditableCell
            book={book!}
            columnId={field}
            value={book[field]}
            options={[]}
            onSave={(newValue) => handleSave(field, newValue)}
            onCancel={() => setEditingField(null)}
          />
        </div>
      )
    }

    return (
      <div
        className="cursor-pointer group relative min-h-[60px] rounded-lg border-2 border-dashed border-transparent group-hover:bordes transition-all"
        onClick={() => setEditingField({ section: "left", field })}
      >
        {hasContent ? (
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm italic text-v700">"{book[field]}"</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="text-center text-gray-400 group-hover:text-v500 transition-colors">
              <PenLine className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">{label || `Agregar ${field === "review" ? "reseña" : "resumen"}`}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderRatingAndFavoriteField = () => {
    if (!book) return null

    const isEditingRating = editingField?.section === "left" && editingField?.field === "rating"
    const hasRating = book.rating !== undefined && book.rating !== null

    return (
      <div className="flex items-center justify-center gap-4">
        {/* Rating */}
        {isEditingRating ? (
          <div className="flex items-center gap-1 bg-white/60 rounded-lg p-3 relative" style={{ zIndex: 9999 }}>
            <EditableCell
              book={book!}
              columnId="rating"
              value={book.rating}
              options={[]}
              onSave={(newValue) => handleSave("rating", newValue)}
              onCancel={() => setEditingField(null)}
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-1 cursor-pointer group p-2 rounded-lg hover:fondo transition-colors"
            onClick={() => setEditingField({ section: "left", field: "rating" })}
          >
            {hasRating ? (
              <StarRating 
                rating={book.rating!} 
                size={5}
                className="group-hover:text-v600 transition-colors"
              />
            ) : (
              <EmptyStarRating 
                size={5}
                className="group-hover:text-v600 transition-colors"
              />
            )}
          </div>
        )}

        {/* Favorito (mantener igual) */}
        <FavoriteButton
          isFavorite={book.favorite || false}
          onToggle={handleFavoriteClick}
          size="md"
          showTooltip={true}
        />
      </div>
    )
  }
  
  const renderGenresField = () => {
    if (!book) return null

    const isEditing = editingField?.section === "left" && editingField?.field === "genre"
    const hasGenres = book.genres && book.genres.length > 0

    if (isEditing) {
      return (
        <div
          className="flex flex-wrap gap-1 justify-center bg-white/60 rounded-lg p-3 relative"
          style={{ zIndex: 9999 }}
        >
          <EditableCell
            book={book}
            columnId="genre"
            value={book.genres?.map((g) => g.id.toString()) || []}
            options={options.genre || []}
            onSave={(newValue) => handleSaveGenres(newValue)}
            onCancel={() => setEditingField(null)}
          />
        </div>
      )
    }

    return (
      <div
        className="flex flex-wrap gap-1 justify-center cursor-pointer group relative min-h-[32px] items-center rounded-lg border-2 border-dashed border-transparent group-hover:bordes transition-all p-1"
        onClick={() => setEditingField({ section: "left", field: "genre" })}
      >
        {hasGenres ? (
          // Usar optional chaining y fallback a array vacío
          (book.genres || []).map((genre) => (
            <Badge key={genre.id} style={getGenreColorStyle(genre.name)} className="border-0 font-medium px-2 py-1">
              {genre.name}
            </Badge>
          ))
        ) : (
          <div className="flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="text-center text-gray-400 group-hover:text-v500 transition-colors">
              <Plus className="w-6 h-6 mx-auto mb-1" />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!book) return null
  const isEditingLeftColumn = editingField?.section === "left" || editingField?.section === "header"

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        {/* Overlay que cubre TODO excepto los componentes editables */}
        {editingField && (
          <div className="fixed inset-0 bg-transparent z-40 cursor-pointer" onClick={() => setEditingField(null)} />
        )}

        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="title">{book.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Book Cover and Basic Info - Fixed height */}
          <div className="lg:col-span-1">
            <Card className="bg-transparent border-none shadow-none h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="text-center space-y-4 flex-1">
                  {renderImageField()}

                  <div className="space-y-2">
                    {renderTitleField()}
                    {renderAuthorField()}
                    {renderGenresField()}
                  </div>

                  {/* Rating */}
                  {book.rating !== undefined && renderRatingAndFavoriteField()}

                  {/* One line summary */}
                  {renderReviewField("review", "")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content - Fixed height with scroll */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Tabs defaultValue="summary" className="space-y-6 flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-4 bg-transparent flex-shrink-0">
                {[
                  { value: "summary", label: "Information" },
                  { value: "opinion", label: "Summary" },
                  { value: "characters", label: "Personajes" },
                  { value: "quotes", label: "Citas" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="
                      relative pb-2 pt-2 text-sm font-medium text-gray-600
                      hover:text-v700 transition-colors duration-150
                      data-[state=active]:text-v700
                      data-[state=active]:bg-transparent
                      data-[state=active]:shadow-none
                      focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
                      after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
                      after:h-[2px] after:w-3/4 after:bg-v600 after:scale-x-0
                      data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300 after:ease-out
                    "
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Fixed height content area with scroll */}
              <div className="flex-1 min-h-0">
                {/* Información */}
                <TabsContent value="summary" className="h-full overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Información básica */}
                    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100 h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                          <BookOpen className="h-5 w-5 text-purple-600" />
                          Información del Libro
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          {renderSeriesField()}
                          {renderEditableField("info", "type", "Tipo", book.type || "", options.type || [])}

                          <div className="grid grid-cols-2 gap-3">
                            {renderEditableField("info", "year", "Año", book.year || "", options.year || [])}
                            {renderEditableField("info", "pages", "Páginas", book.pages || "", [])}
                          </div>

                          {renderEditableField(
                            "info",
                            "publisher",
                            "Editorial",
                            book.publisher || "",
                            options.publisher || [],
                          )}
                          {renderEditableField(
                            "info",
                            "language",
                            "Idioma",
                            book.language || "",
                            options.language || [],
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detalles Adicionales */}
                    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100 h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          Detalles Adicionales
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          {renderEditableField("details", "era", "Época", book.era || "", options.era || [], "blue")}
                          {renderEditableField("details", "format", "Formato", book.format || "", options.format || [], "blue")}
                          {renderEditableField(
                            "details",
                            "audience",
                            "Público",
                            book.audience || "",
                            options.audience || [], "blue"
                          )}
                          {renderReadingDifficultyField()}

                          <div className="grid grid-cols-1 gap-3">
                            {renderEditableField("details", "awards", "Premios", book.awards || "", [], "blue")}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fechas y Progreso */}
                    <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-100 h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                          Fechas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Fechas */}
                        <div className="space-y-3">
                          {renderDateField("start_date", "Start Date")}
                          {renderDateField("end_date", "Fecha de Finalización")}

                          {book.start_date && book.end_date && (
                            <div className="bg-white/60 rounded-lg p-3">
                              <Label className="text-xs font-semitero text-emerald-500 uppercase tracking-wide">
                                Días de Lectura
                              </Label>
                              <p className="text-sm mt-1 font-bold text-emerald-900">
                                {Math.ceil(
                                  (new Date(book.end_date as string).getTime() -
                                    new Date(book.start_date as string).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )}{" "}
                                días
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Resumen */}
                <TabsContent value="opinion" className="h-full overflow-y-auto">
                  <Card
                    className={`border-0 shadow-lg h-full ${editingField?.section === "left" && editingField?.field === "summary" ? "bg-white/80" : "bg-white/80 backdrop-blur-sm"}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <File className="h-5 w-5" />
                        Resumen
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">{renderReviewField("summary", "Agregar resumen")}</CardContent>
                  </Card>
                </TabsContent>

                {/* Personajes */}
                <TabsContent value="characters" className="h-full overflow-y-auto space-y-6">
                  <Card
                    className={`border-0 ${editingField?.section === "characters" && editingField?.field === "main_characters" ? "bg-white/80" : "bg-white/80 backdrop-blur-sm"}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Personajes Principales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{renderMainCharactersField()}</CardContent>
                  </Card>

                  <Card
                    className={`border-0 ${editingField?.section === "characters" && editingField?.field === "favorite_character" ? "bg-white/80" : "bg-white/80 backdrop-blur-sm"}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Personaje Favorito
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{renderFavoriteCharacterField()}</CardContent>
                  </Card>
                </TabsContent>

                {/* Citas */}
                <TabsContent value="quotes" className="h-full overflow-y-auto">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <QuoteIcon className="h-5 w-5" />
                        Citas Favoritas
                      </CardTitle>
                      <CardDescription className="text-purple-600">
                        Fragmentos que más me impactaron durante la lectura
                      </CardDescription>
                      
                      {/* BOTÓN PARA AGREGAR CITAS */}
                      <div className="flex justify-end">
                        <Button
                          onClick={() => setIsAddingQuote(!isAddingQuote)}
                          className="bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {isAddingQuote ? "Cancelar" : "Agregar Cita"}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <div className="h-full overflow-y-auto space-y-6">
                        {/* COMPONENTE DE CITAS REUTILIZABLE - SOLO SE MUESTRA CUANDO ESTÁS AGREGANDO */}
                        {isAddingQuote ? (
                          <QuotesSection
                            quotes={currentQuotes}
                            onQuotesChange={handleSaveQuotes}
                            className="mb-6"
                          />
                        ) : (
                          /* LISTA DE CITAS EXISTENTES - SOLO SE MUESTRA CUANDO NO ESTÁS AGREGANDO */
                          currentQuotes.length > 0 && currentQuotes.map((quote) => (
                            <div
                              key={quote.id}
                              className="border-l-4 border-purple-300 pl-4 py-2 bg-purple-50/50 rounded-r-lg"
                            >
                              <MarkdownViewer content={`"${quote.text}"`} />
                              {quote.page && <div className="text-sm text-purple-600 mt-1">Página {quote.page}</div>}
                              {quote.category && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {quote.category}
                                </Badge>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}