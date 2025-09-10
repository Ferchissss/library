"use client"
import { Star, BookOpen, Users, Heart, QuoteIcon, Calendar } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabaseClient'
import { toast } from "sonner"

interface BookDetailsModalProps {
  book: Book | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  quotes: Quote[]
  refreshData?: () => void
}

const availableColors = AVAILABLE_COLORS;

// Función para obtener estilos de color consistentes para géneros
const getGenreColorStyle = (genreName: string) => {
  const colorIndex = getConsistentColorIndex(genreName, "bookDetailsGenres", availableColors.length);
  const colorClass = availableColors[colorIndex];
  return {
    backgroundColor: colorClass.bg,
    borderColor: colorClass.border.replace('border-', '#'),
    color: colorClass.text.replace('text-', '#')
  };
}

export function BookDetailsModal({ book, isOpen, onOpenChange, quotes, refreshData }: BookDetailsModalProps) {
  if (!book) return null

  const [editingField, setEditingField] = useState<{section: string, field: string} | null>(null)
  const [options, setOptions] = useState<Record<string, { value: string; label: string; id?: number }[]>>({})

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data: types } = await supabase.from("books").select("type").not("type", "is", null).order("type", { ascending: true })
        const { data: publishers } = await supabase.from("books").select("publisher").not("publisher", "is", null).order("publisher", { ascending: true })
        const { data: languages } = await supabase.from("books").select("language").not("language", "is", null).order("language", { ascending: true })
        const { data: eras } = await supabase.from("books").select("era").not("era", "is", null).order("era", { ascending: true })
        const { data: formats } = await supabase.from("books").select("format").not("format", "is", null).order("format", { ascending: true })
        const { data: audiences } = await supabase.from("books").select("audience").not("audience", "is", null).order("audience", { ascending: true })
        const { data: years } = await supabase.from("books").select("year").not("year", "is", null).order("year", { ascending: false })
        const { data: authors } = await supabase.from("authors").select("id, name").order("name", { ascending: true })
        const { data: series } = await supabase.from("series").select("id, name").order("name", { ascending: true })
        const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true })

        setOptions({
          type: [...new Set(types?.map(t => t.type))].map(t => ({ value: t, label: t })) || [],
          publisher: [...new Set(publishers?.map(p => p.publisher))].map(p => ({ value: p, label: p })) || [],
          language: [...new Set(languages?.map(l => l.language))].map(l => ({ value: l, label: l })) || [],
          era: [...new Set(eras?.map(e => e.era))].map(e => ({ value: e, label: e })) || [],
          format: [...new Set(formats?.map(f => f.format))].map(f => ({ value: f, label: f })) || [],
          audience: [...new Set(audiences?.map(a => a.audience))].map(a => ({ value: a, label: a })) || [],
          year: [...new Set(years?.map(y => y.year?.toString()))].map(y => ({ value: y, label: y })) || [],
          author: authors?.map(a => ({ value: a.id.toString(), label: a.name, id: a.id })) || [],
          series: series?.map(s => ({ value: s.id.toString(), label: s.name, id: s.id })) || [],
          genre: genres?.map(g => ({ value: g.id.toString(), label: g.name, id: g.id })) || [],
          reading_difficulty: [
            { value: "Light", label: "Light" },
            { value: "Medium", label: "Medium" },
            { value: "Dense", label: "Dense" }
          ],
        })
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }

    fetchOptions()
  }, [])

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
        favorite_character: "favorite_character"
      }

      const dbField = fieldMap[field]
      if (!dbField) return

      let dbValue = newValue

      // Convertir IDs para campos relacionales
      if (field === "author" || field === "series") {
        if (newValue) {
          const parsedId = parseInt(newValue)
          if (!isNaN(parsedId)) {
            dbValue = parsedId
          } else {
            dbValue = null
          }
        } else {
          dbValue = null
        }
      }

      if (field === "year" || field === "pages") dbValue = parseInt(newValue)
      if (field === "rating") dbValue = parseFloat(newValue)
      if (field === "favorite") dbValue = Boolean(newValue)
      if (field === "start_date" || field === "end_date") {
        dbValue = newValue ? new Date(newValue).toISOString() : null
      }

      const { error } = await supabase
        .from("books")
        .update({ [dbField]: dbValue })
        .eq("id", book.id)

      if (error) throw error

      toast.success(`Campo ${field} actualizado`)
      setEditingField(null)
      refreshData?.()
    } catch (error) {
      console.error("Error updating field:", error)
      toast.error(`No se pudo actualizar el campo ${field}`)
    }
  }

  const handleSaveGenres = async (genreIds: string[]) => {
    if (!book) return
    
    try {
      const numericGenreIds = genreIds.map(id => parseInt(id)).filter(id => !isNaN(id))
      
      // Eliminar relaciones existentes
      const { error: deleteError } = await supabase
        .from("book_genre")
        .delete()
        .eq("book_id", book.id)

      if (deleteError) throw deleteError

      // Crear nuevas relaciones si hay géneros válidos
      if (numericGenreIds.length > 0) {
        const genreInserts = numericGenreIds.map(genreId => ({
          book_id: book.id,
          genre_id: genreId
        }))

        const { error: insertError } = await supabase
          .from("book_genre")
          .insert(genreInserts)

        if (insertError) throw insertError
      }

      toast.success("Géneros actualizados correctamente")
      setEditingField(null)
      refreshData?.()
    } catch (error) {
      console.error("Error updating genres:", error)
      toast.error("No se pudieron actualizar los géneros")
    }
  }

  const getValueForField = (field: string) => {
    if (!book) return null
    
    const fieldValues: Record<string, any> = {
      title: book.title,
      review: book.review,
      type: book.type,
      publisher: book.publisher,
      language: book.language,
      era: book.era,
      format: book.format,
      audience: book.audience,
      reading_difficulty: book.reading_difficulty,
      year: book.year,
      pages: book.pages,
      awards: book.awards,
      favorite: book.favorite,
      series: book.series?.id?.toString(),
      author: book.author?.id?.toString(),
      rating: book.rating,
      start_date: book.start_date,
      end_date: book.end_date,
      image_url: book.image_url,
      summary: book.summary,
      main_characters: book.main_characters,
      favorite_character: book.favorite_character
    }
    
    return fieldValues[field] ?? null
  }

  const refreshAuthors = async () => {
    const { data: authors } = await supabase
      .from("authors")
      .select("id, name")
      .order("name", { ascending: true })
    setOptions(prev => ({
      ...prev,
      author: authors?.map(a => ({ value: a.id.toString(), label: a.name, id: a.id })) || []
    }))
  }

  const refreshSeries = async () => {
    const { data: series } = await supabase
      .from("series")
      .select("id, name")
      .order("name", { ascending: true })
    setOptions(prev => ({
      ...prev,
      series: series?.map(s => ({ value: s.id.toString(), label: s.name, id: s.id })) || []
    }))
  }

  const refreshGenres = async () => {
    const { data: genres } = await supabase
      .from("genres")
      .select("id, name")
      .order("name", { ascending: true })
    setOptions(prev => ({
      ...prev,
      genre: genres?.map(g => ({ value: g.id.toString(), label: g.name, id: g.id })) || []
    }))
  }

  const renderEditableField = (section: string, field: string, label: string, value: any, options: any[] = []) => {
    const isEditing = editingField?.section === section && editingField?.field === field
    
    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3">
          <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
            {label}
          </Label>
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
        <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
          {label}
        </Label>
        <p className="text-sm mt-1 font-semibold text-purple-900">
          {value || ""}
        </p>
      </div>
    )
  }

  const renderImageField = () => {
    const isEditing = editingField?.section === "header" && editingField?.field === "image_url"
    
    if (isEditing) {
      return (
        <div className="text-center">
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

  const renderSummaryField = () => {
    const isEditing = editingField?.section === "opinion" && editingField?.field === "summary"
    
    if (isEditing) {
      return (
        <div className="bg-white/60 rounded-lg p-3">
          <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
            Resumen
          </Label>
          <div className="mt-1">
            <EditableCell
              book={book!}
              columnId="summary"
              value={book.summary}
              options={[]}
              onSave={(newValue) => handleSave("summary", newValue)}
              onCancel={() => setEditingField(null)}
            />
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white/60 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors group relative"
      onClick={() => setEditingField({ section: "opinion", field: "summary" })}
    >
      <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
        Resumen
      </Label>
      <p className="text-sm mt-1 italic text-purple-700">
        {book.summary ? `"${book.summary}"` : "No hay resumen disponible"}
      </p>
    </div>
  )
}

const renderMainCharactersField = () => {
  const isEditing = editingField?.section === "characters" && editingField?.field === "main_characters"
  
  if (isEditing) {
    return (
      <div className="bg-white/60 rounded-lg p-3">
        <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
          Personajes Principales
        </Label>
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
      <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
        Personajes Principales
      </Label>
      {book.main_characters ? (
        <ul className="space-y-3 mt-1">
          {book.main_characters.split(",").map((character, index) => (
            <li key={index} className="flex items-center gap-3">
              <svg className="h-2.5 w-2.5 flex-shrink-0" viewBox="0 0 10 10" fill="#a855f7">
                <circle cx="5" cy="5" r="5" />
              </svg>
              <span className="text-gray-800 font-medium capitalize">{character.trim()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm mt-1 text-gray-400 italic">No hay información de personajes principales</p>
      )}
    </div>
  )
}

const renderFavoriteCharacterField = () => {
  const isEditing = editingField?.section === "characters" && editingField?.field === "favorite_character"
  
  if (isEditing) {
    return (
      <div className="bg-white/60 rounded-lg p-3">
        <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
          Personaje Favorito
        </Label>
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
      className="bg-white/60 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors group relative"
      onClick={() => setEditingField({ section: "characters", field: "favorite_character" })}
    >
      <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
        Personaje Favorito
      </Label>
      <p className="text-sm mt-1 text-gray-700">
        {book.favorite_character || "No hay personaje favorito especificado"}
      </p>
    </div>
  )
}

const renderSeriesField = () => {
  const isEditing = editingField?.section === "info" && editingField?.field === "series"
  const seriesName = book.series?.name || ""
  
  if (isEditing) {
    return (
      <div className="bg-white/60 rounded-lg p-3">
        <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
          Universo
        </Label>
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
      <Label className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
        Universo
      </Label>
      <p className="text-sm mt-1 font-semibold text-purple-900">
        {seriesName}
      </p>
    </div>
  )
}

const renderReadingDifficultyField = () => {
  const isEditing = editingField?.section === "details" && editingField?.field === "reading_difficulty"
  
  if (isEditing) {
    return (
      <div className="bg-white/60 rounded-lg p-3">
        <Label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
          Densidad de Lectura
        </Label>
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
      <Label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
        Densidad de Lectura
      </Label>
      <p className="text-sm mt-1 font-semibold text-blue-900">
        {book.reading_difficulty || ""}
      </p>
    </div>
  )
}

const renderFavoriteField = () => {
  const isEditing = editingField?.section === "details" && editingField?.field === "favorite"
  
  if (isEditing) {
    return (
      <div className="bg-white/60 rounded-lg p-3">
        <Label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
          Favorito
        </Label>
        <div className="mt-1">
          <EditableCell
            book={book!}
            columnId="favorite"
            value={book.favorite}
            options={[]}
            onSave={(newValue) => {
              handleSave("favorite", newValue)
              setEditingField(null)
            }}
            onCancel={() => setEditingField(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white/60 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors group relative"
      onClick={() => setEditingField({ section: "details", field: "favorite" })}
    >
      <Label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
        Favorito
      </Label>
      <div className="flex items-center gap-2 mt-1">
        {book.favorite ? (
          <Badge className="bg-pink-100 text-pink-800 border-pink-300 font-semibold">
            ❤️ Favorito
          </Badge>
        ) : (
          <p></p>
        )}
      </div>
    </div>
  )
}

const renderDateField = (field: "start_date" | "end_date", label: string, icon: string) => {
  const isEditing = editingField?.section === "dates" && editingField?.field === field
  const dateValue = field === "start_date" ? book.start_date : book.end_date

  if (isEditing) {
    return (
      <div className="bg-white/60 rounded-lg p-3">
        <Label className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
          {icon} {label}
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
        {icon} {label}
      </Label>
      <p className="text-sm mt-1 font-bold text-emerald-900">
        {dateValue ? new Date(dateValue).toLocaleDateString("es-ES") : ""}
      </p>
    </div>
  )
}

const renderTitleField = () => {
  const isEditing = editingField?.section === "header" && editingField?.field === "title"
  
  if (isEditing) {
    return (
      <div className="text-center">
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
      <h3 className="text-lg font-bold text-purple-800">{book.title}</h3>
    </div>
  )
}

const renderReviewField = () => {
  const isEditing = editingField?.section === "left" && editingField?.field === "review"
  const hasReview = !!book.review;
  
  if (isEditing) {
    return (
      <div className="bg-purple-50 p-3 rounded-lg">
        <EditableCell
          book={book!}
          columnId="review"
          value={book.review}
          options={[]}
          onSave={(newValue) => handleSave("review", newValue)}
          onCancel={() => setEditingField(null)}
        />
      </div>
    )
  }

  return (
    <div 
      className="cursor-pointer group relative min-h-[60px] rounded-lg border-2 border-dashed border-transparent group-hover:border-purple-200 transition-all"
      onClick={() => setEditingField({ section: "left", field: "review" })}
    >
      {hasReview ? (
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm italic text-purple-700">"{book.review}"</p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="text-center text-gray-400 group-hover:text-purple-500 transition-colors">
            <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

const renderRatingField = () => {
  const isEditing = editingField?.section === "left" && editingField?.field === "rating"
  const hasRating = book.rating !== undefined && book.rating !== null;
  
  if (isEditing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <EditableCell
          book={book!}
          columnId="rating"
          value={book.rating}
          options={[]}
          onSave={(newValue) => handleSave("rating", newValue)}
          onCancel={() => setEditingField(null)}
        />
      </div>
    )
  }

  return (
    <div 
      className="flex items-center justify-center gap-1 cursor-pointer group p-2 rounded-lg hover:bg-purple-50 transition-colors"
      onClick={() => setEditingField({ section: "left", field: "rating" })}
    >
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < (book.rating || 0) ? 
            "fill-yellow-400 text-yellow-400 hover:fill-yellow-500" : 
            "text-gray-300 hover:fill-purple-200 hover:text-purple-200"
          } transition-colors`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-400 hover:text-purple-600 transition-colors">
        {book.rating || ""}
      </span>
    </div>
  )
}

const renderGenresField = () => {
  const isEditing = editingField?.section === "left" && editingField?.field === "genre"
  const hasGenres = book.genres && book.genres.length > 0;
  
  if (isEditing) {
    return (
      <div className="flex flex-wrap gap-1 justify-center">
        <EditableCell
          book={book!}
          columnId="genre"
          value={book.genres?.map(g => g.id.toString()) || []}
          options={options.genre || []}
          onSave={(newValue) => handleSaveGenres(newValue)}
          onCancel={() => setEditingField(null)}
        />
      </div>
    )
  }

  return (
    <div 
      className="flex flex-wrap gap-1 justify-center cursor-pointer group relative min-h-[32px] items-center rounded-lg border-2 border-dashed border-transparent group-hover:border-purple-200 transition-all p-1"
      onClick={() => setEditingField({ section: "left", field: "genre" })}
    >
      {hasGenres ? (
        book.genres.map((genre) => (
          <Badge 
            key={genre.id} 
            style={getGenreColorStyle(genre.name)}
            className="border-0 font-medium px-2 py-1"
          >
            {genre.name}
          </Badge>
        ))
      ) : (
        <div className="flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="text-center text-gray-400 group-hover:text-purple-500 transition-colors">
            <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

return (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
      {/* Overlay transparente cuando hay un campo en edición */}
      {editingField && (
        <div 
          className="fixed inset-0 bg-transparent z-40 cursor-default"
          onClick={() => setEditingField(null)}
        />
      )}
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="text-2xl font-bold text-purple-800">{book.title}</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Book Cover and Basic Info - Fixed height */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="text-center space-y-4 flex-1">
                {renderImageField()}

                <div className="space-y-2">
                  {renderTitleField()}
                  
                  {renderEditableField("left", "author", "", book.author?.name || "", options.author || [])}

                  {renderGenresField()}
                </div>

                {/* Rating */}
                {book.rating !== undefined && renderRatingField()}

                {/* One line summary */}
                {renderReviewField()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content - Fixed height with scroll */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Tabs defaultValue="summary" className="space-y-6 flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 flex-shrink-0">
              <TabsTrigger value="summary">Information</TabsTrigger>
              <TabsTrigger value="opinion">Summary</TabsTrigger>
              <TabsTrigger value="characters">Personajes</TabsTrigger>
              <TabsTrigger value="quotes">Citas</TabsTrigger>
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

                        {renderEditableField("info", "publisher", "Editorial", book.publisher || "", options.publisher || [])}
                        {renderEditableField("info", "language", "Idioma", book.language || "", options.language || [])}
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
                        {renderEditableField("details", "era", "Época", book.era || "", options.era || [])}
                        {renderEditableField("details", "format", "Formato", book.format || "", options.format || [])}
                        {renderEditableField("details", "audience", "Público", book.audience || "", options.audience || [])}
                        {renderReadingDifficultyField()}

                        <div className="grid grid-cols-1 gap-3">
                          {renderFavoriteField()}
                          {renderEditableField("details", "awards", "Premios", book.awards || "", [])}
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
                        {renderDateField("start_date", "Start Date", "📅")}
                        {renderDateField("end_date", "Fecha de Finalización", "🏁")}

                        {book.start_date && book.end_date && (
                          <div className="bg-white/60 rounded-lg p-3">
                            <Label className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
                              ⏱️ Días de Lectura
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
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="text-purple-800 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Resumen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-full overflow-y-auto">
                      {renderSummaryField()}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personajes */}
              <TabsContent value="characters" className="h-full overflow-y-auto space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-purple-800 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Personajes Principales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderMainCharactersField()}
                  </CardContent>
                </Card>
                
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-purple-800 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Personaje Favorito
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderFavoriteCharacterField()}
                  </CardContent>
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
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-full overflow-y-auto space-y-6">
                      {quotes.length > 0 ? (
                        quotes.map((quote) => (
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
                      ) : (
                        <p className="text-gray-400 italic">No hay citas registradas para este libro</p>
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