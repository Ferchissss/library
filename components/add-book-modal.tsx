  "use client"

  import type React from "react"

  import { useState, useEffect } from "react"
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Textarea } from "@/components/ui/textarea"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { toast } from "sonner"
  import { Sparkles, BookOpenCheck, Plus, X, BookOpen } from "lucide-react"
  import { supabase } from "@/lib/supabaseClient"
  import { MultiSelect } from "@/components/MultiSelect"
  import { MarkdownEditor } from "./MarkdownEditor"
  import { MarkdownViewer } from "./MarkdownViewer"
  import { useBulkDataParser } from "@/hooks/useBulkDataParser"
  import { BulkInputSection } from "./BulkInputSection"

  interface AddBookModalProps {
    trigger?: React.ReactNode
    refreshData?: () => void
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    prefilledData?: any
  }

  export function AddBookModal({ trigger, refreshData, isOpen: externalIsOpen, onOpenChange: externalOnOpenChange, prefilledData  }: AddBookModalProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false) 
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingOptions, setLoadingOptions] = useState(false)
    const isControlled = externalIsOpen !== undefined
    const isOpen = isControlled ? externalIsOpen : internalIsOpen
    const setIsOpen = isControlled ? (externalOnOpenChange || (() => {})) : setInternalIsOpen

    // Estados para las opciones de los selectores
    const [authorsOptions, setAuthorsOptions] = useState<{ value: string; label: string; id?: number }[]>([])
    const [genresOptions, setGenresOptions] = useState<{ value: string; label: string; id?: number }[]>([])
    const [seriesOptions, setSeriesOptions] = useState<{ value: string; label: string; id?: number }[]>([])
    const [publishersOptions, setPublishersOptions] = useState<{ value: string; label: string }[]>([])
    const [languagesOptions, setLanguagesOptions] = useState<{ value: string; label: string }[]>([])
    const [typesOptions, setTypesOptions] = useState<{ value: string; label: string }[]>([])
    const [erasOptions, setErasOptions] = useState<{ value: string; label: string }[]>([])
    const [formatsOptions, setFormatsOptions] = useState<{ value: string; label: string }[]>([])
    const [audiencesOptions, setAudiencesOptions] = useState<{ value: string; label: string }[]>([])
    const [yearsOptions, setYearsOptions] = useState<{ value: string; label: string }[]>([])
    const [quoteTypesOptions, setQuoteTypesOptions] = useState<{ value: string; label: string }[]>([])
    const [quoteCategoriesOptions, setQuoteCategoriesOptions] = useState<{ value: string; label: string }[]>([])

    const [formData, setFormData] = useState({
      title: "",
      author: "",
      authorId: null as number | null,
      genres: [] as string[],
      genreIds: [] as number[],
      rating: "",
      type: "",
      pages: "",
      dateStarted: "",
      dateRead: "",
      year: "",
      publisher: "",
      language: "",
      era: "",
      format: "Digital", // Valor por defecto Digital
      audience: "Juvenil",
      readingDensity: "",
      awards: "",
      cover: "",
      mainCharacters: [] as string[],
      favoriteCharacter: "",
      isFavorite: false,
      summary: "",
      review: "",
      series: "",
      seriesId: null as number | null,
      quotes: [] as Array<{
        text: string
        page: string
        type: string
        category: string
      }>,
    })

    const [characterInput, setCharacterInput] = useState("")
    const [quoteInput, setQuoteInput] = useState({
      text: "",
      page: "",
      type: "",
      category: [] as string[], // Cambiado de string a string[]
    })
    // Hook para el parseo de datos masivos
    const { processBulkData } = useBulkDataParser({ genresOptions, authorsOptions, seriesOptions, setGenresOptions, setAuthorsOptions, setSeriesOptions  })
    // Efecto para cargar datos prefilled cuando el modal se abre
    useEffect(() => {
      if (isOpen && prefilledData) {
        setFormData(prev => ({
          ...prev,
          ...prefilledData,
          genres: Array.isArray(prefilledData.genres) ? prefilledData.genres : [],
          mainCharacters: Array.isArray(prefilledData.mainCharacters) ? prefilledData.mainCharacters : [],
        }))
      }
    }, [isOpen, prefilledData])
    // Cargar opciones al abrir el modal
    useEffect(() => {
      const fetchOptions = async () => {
        if (!isOpen) return

        setLoadingOptions(true)
        try {
          // Autores
          const { data: authors } = await supabase.from("authors").select("id, name").order("name", { ascending: true })
          setAuthorsOptions(authors?.map((a) => ({ value: a.name, label: a.name, id: a.id })) || [])

          // Géneros
          const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true })
          setGenresOptions(genres?.map((g) => ({ value: g.name, label: g.name, id: g.id })) || [])

          // Series
          const { data: series } = await supabase.from("series").select("id, name").order("name", { ascending: true })
          setSeriesOptions(series?.map((s) => ({ value: s.name, label: s.name, id: s.id })) || [])

          // Editoriales
          const { data: publishers } = await supabase
            .from("books")
            .select("publisher")
            .not("publisher", "is", null)
            .order("publisher", { ascending: true })
          const uniquePublishers = [...new Set(publishers?.map((p) => p.publisher))]
          setPublishersOptions(uniquePublishers?.map((p) => ({ value: p, label: p })) || [])

          // Idiomas
          const { data: languages } = await supabase
            .from("books")
            .select("language")
            .not("language", "is", null)
            .order("language", { ascending: true })
          const uniqueLanguages = [...new Set(languages?.map((l) => l.language))]
          setLanguagesOptions(uniqueLanguages?.map((l) => ({ value: l, label: l })) || [])

          // Tipos
          const { data: types } = await supabase
            .from("books")
            .select("type")
            .not("type", "is", null)
            .order("type", { ascending: true })
          const uniqueTypes = [...new Set(types?.map((t) => t.type))]
          setTypesOptions(uniqueTypes?.map((t) => ({ value: t, label: t })) || [])

          // Épocas
          const { data: eras } = await supabase
            .from("books")
            .select("era")
            .not("era", "is", null)
            .order("era", { ascending: true })
          const uniqueEras = [...new Set(eras?.map((e) => e.era))]
          setErasOptions(uniqueEras?.map((e) => ({ value: e, label: e })) || [])

          // Formatos
          const { data: formats } = await supabase
            .from("books")
            .select("format")
            .not("format", "is", null)
            .order("format", { ascending: true })
          const uniqueFormats = [...new Set(formats?.map((f) => f.format))]
          setFormatsOptions(uniqueFormats?.map((f) => ({ value: f, label: f })) || [])

          // Audiencias
          const { data: audiences } = await supabase
            .from("books")
            .select("audience")
            .not("audience", "is", null)
            .order("audience", { ascending: true })
          const uniqueAudiences = [...new Set(audiences?.map((a) => a.audience))]
          setAudiencesOptions(uniqueAudiences?.map((a) => ({ value: a, label: a })) || [])

          // Años (de publicación)
          const { data: years } = await supabase
            .from("books")
            .select("year")
            .not("year", "is", null)
            .order("year", { ascending: false })
          const uniqueYears = [...new Set(years?.map((y) => y.year?.toString()))]
          setYearsOptions(uniqueYears?.map((y) => ({ value: y, label: y })) || [])

          // Tipos de citas
          const { data: quoteTypes } = await supabase
            .from("quotes")
            .select("type")
            .not("type", "is", null)
            .order("type", { ascending: true })
          const uniqueQuoteTypes = [...new Set(quoteTypes?.map((qt) => qt.type))]
          setQuoteTypesOptions(uniqueQuoteTypes?.map((qt) => ({ value: qt, label: qt })) || [])
          // Categorías de citas
          const { data: quoteCategories } = await supabase
            .from("quotes")
            .select("category")
            .not("category", "is", null)
            .order("category", { ascending: true })
          const uniqueQuoteCategories = [...new Set(quoteCategories?.map((qc) => qc.category))]
          setQuoteCategoriesOptions(uniqueQuoteCategories?.map((qc) => ({ value: qc, label: qc })) || [])
        } catch (error) {
          console.error("Error fetching options:", error)
        } finally {
          setLoadingOptions(false)
        }
      }

      fetchOptions()
    }, [isOpen])
    // Función para manejar el parseo de datos masivos
    const handleBulkParse = async (bulkData: string) => {
      const formData = await processBulkData(bulkData)
      if (formData) {
        setFormData(prev => ({
          ...prev,
          ...formData
        }))
        setIsCollapsibleOpen(false)
      }
    }
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!formData.title.trim() || !formData.author.trim()) {
        toast.error("Error", {
          description: "El título y autor son obligatorios.",
        })
        return
      }
      // Si no hay authorId pero sí hay autor, intentar encontrarlo nuevamente
      if (!formData.authorId && formData.author) {
        const foundAuthor = authorsOptions.find(a => a.value === formData.author)
        if (foundAuthor?.id) {
          setFormData(prev => ({ ...prev, authorId: foundAuthor.id }))
        }
      }

      // Si no hay seriesId pero sí hay serie, intentar encontrarla nuevamente
      if (!formData.seriesId && formData.series) {
        const foundSeries = seriesOptions.find(s => s.value === formData.series)
        if (foundSeries?.id) {
          setFormData(prev => ({ ...prev, seriesId: foundSeries.id }))
        }
      }

      // Verificar que tenemos todos los IDs de géneros
      if (formData.genres.length !== formData.genreIds.length) {
        toast.error("Error", {
          description: "Por favor, asegúrate de que todos los géneros estén correctamente seleccionados.",
        })
        return
      }

      setIsSubmitting(true)

      try {
        // Crear el objeto del libro para insertar
        const bookData = {
          title: formData.title.trim(),
          author_id: formData.authorId,
          series_id: formData.seriesId,
          rating: formData.rating ? Number.parseFloat(formData.rating) : null,
          type: formData.type || null,
          start_date: formData.dateStarted || null,
          end_date: formData.dateRead || null,
          year: formData.year ? Number.parseInt(formData.year) : null,
          pages: formData.pages ? Number.parseInt(formData.pages) : null,
          publisher: formData.publisher || null,
          language: formData.language || null,
          era: formData.era || null,
          format: formData.format || null,
          audience: formData.audience || null,
          reading_difficulty: formData.readingDensity || null,
          awards: formData.awards || null,
          favorite: formData.isFavorite,
          summary: formData.summary || null,
          review: formData.review || null,
          main_characters: formData.mainCharacters.join(", ") || null,
          favorite_character: formData.favoriteCharacter || null,
          image_url: formData.cover || null,
        }

        // Insertar el libro en Supabase
        const { data: book, error: bookError } = await supabase.from("books").insert(bookData).select("id").single()

        if (bookError || !book) {
          throw bookError || new Error("No se pudo crear el libro")
        }

        // Manejar los géneros (usando IDs)
        if (formData.genreIds.length > 0) {
          const genreInserts = formData.genreIds.map((genreId) => ({
            book_id: book.id,
            genre_id: genreId,
          }))

          const { error: genresError } = await supabase.from("book_genre").insert(genreInserts)

          if (genresError) {
            console.error("Error adding genres:", genresError)
            throw new Error("Error al guardar los géneros del libro")
          }
        }

        // Insertar citas (si existen)
        if (formData.quotes.length > 0) {
          // Preparar todas las citas para inserción múltiple
          const quotesToInsert = formData.quotes.map((quote) => ({
            book_id: book.id,
            text: quote.text,
            page: quote.page ? Number.parseInt(quote.page) : null,
            type: quote.type || null,
            category: quote.category || null,
            favorite: false,
          }))

          // Insertar todas las citas en una sola operación
          const { error: quotesError } = await supabase.from("quotes").insert(quotesToInsert)

          if (quotesError) {
            console.error("Error adding quotes:", quotesError)
            throw new Error("Error al guardar las citas del libro")
          }
        }

        toast.success("¡Libro agregado exitosamente!", {
          description: `"${formData.title}" ha sido añadido a tu biblioteca.`,
        })

        // Resetear el formulario
        setFormData({
          title: "",
          author: "",
          authorId: null,
          genres: [],
          genreIds: [],
          rating: "",
          type: "",
          pages: "",
          dateStarted: "",
          dateRead: "",
          year: "",
          publisher: "",
          language: "",
          era: "",
          format: "",
          audience: "",
          readingDensity: "",
          awards: "",
          cover: "",
          mainCharacters: [],
          favoriteCharacter: "",
          isFavorite: false,
          summary: "",
          review: "",
          series: "",
          seriesId: null,
          quotes: [],
        })

        // Cerrar el modal y refrescar la lista de libros
        setIsOpen(false)
        if (refreshData) refreshData()
      } catch (error) {
        const err = error as Error
        console.error("Error saving book:", err)
        toast.error("Error", {
          description: `Hubo un problema al guardar el libro: ${err.message}`,
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    const isFormValid = formData.title.trim().length > 0 && formData.author.trim().length > 0

    const defaultTrigger = (
      <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-md transition-all duration-200">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Libro
      </Button>
    )

    const addCharacter = () => {
      if (characterInput.trim() && !formData.mainCharacters.includes(characterInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          mainCharacters: [...prev.mainCharacters, characterInput.trim()],
        }))
        setCharacterInput("")
      }
    }

    const removeCharacter = (characterToRemove: string) => {
      setFormData((prev) => ({
        ...prev,
        mainCharacters: prev.mainCharacters.filter((char) => char !== characterToRemove),
      }))
    }

    const handleCharacterKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        addCharacter()
      }
    }

    const addQuote = () => {
      if (quoteInput.text.trim()) {
        const newQuote = {
          text: quoteInput.text.trim(),
          page: quoteInput.page.trim(),
          type: quoteInput.type.trim() || "General",
          category: quoteInput.category.length > 0 ? quoteInput.category.join(", ") : "", // Uniendo las categorías con comas
        }
        setFormData((prev) => ({
          ...prev,
          quotes: [...prev.quotes, newQuote],
        }))
        setQuoteInput({ text: "", page: "", type: "", category: [] }) // Reseteando como array vacío
      }
    }

    const removeQuote = (index: number) => {
      setFormData((prev) => ({
        ...prev,
        quotes: prev.quotes.filter((_, i) => i !== index),
      }))
    }

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <BookOpen className="w-12 h-12 text-purple-800" />
                <Sparkles className="w-6 h-6 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <DialogTitle className="font-serif text-3xl text-purple-900 mb-2 text-center">
              Añade un Nuevo Tesoro a tu Biblioteca
            </DialogTitle>
            <p className="text-purple-600 font-sans text-center">Cada libro es una aventura esperando ser catalogada</p>
          </DialogHeader>

          <div className="space-y-4">
            {/* COMPONENTE SEPARADO CON HOOK */}
            <BulkInputSection 
              onParse={handleBulkParse}
              isOpen={isCollapsibleOpen}
              onOpenChange={setIsCollapsibleOpen}
            />

            {/* Formulario Principal */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Card className="border-purple-200">
                <CardHeader className="py-2">
                  <CardTitle className="text-purple-800">Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="title" className="text-purple-700 font-medium w-24 text-right">
                        Título *:
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        required
                        className="border-purple-200 focus:border-purple-400 flex-1 h-6 py-1 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="author" className="text-purple-700 font-medium w-24 text-right">
                        Autor *:
                      </Label>
                      <div className="flex-1">
                        <MultiSelect
                          options={authorsOptions}
                          selected={formData.author ? [formData.author] : []}
                          onChange={(selected, newItem) => {
                            setFormData((prev) => ({
                              ...prev,
                              author: selected[0] || "",
                              authorId: newItem?.id || authorsOptions.find((a) => a.value === selected[0])?.id || null,
                            }))
                          }}
                          creatable
                          singleSelect
                          tableName="authors"
                          refreshOptions={async () => {
                            const { data: authors } = await supabase
                              .from("authors")
                              .select("id, name")
                              .order("name", { ascending: true })
                            setAuthorsOptions(authors?.map((a) => ({ value: a.name, label: a.name, id: a.id })) || [])
                          }}
                          returnId={false}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="series" className="text-purple-700 font-medium w-24 text-right">
                        Serie:
                      </Label>
                      <div className="flex-1">
                        <MultiSelect
                          options={seriesOptions}
                          selected={formData.series ? [formData.series] : []}
                          onChange={(selected, newItem) => {
                            setFormData((prev) => ({
                              ...prev,
                              series: selected[0] || "",
                              seriesId: newItem?.id || seriesOptions.find((s) => s.value === selected[0])?.id || null,
                            }))
                          }}
                          creatable
                          singleSelect
                          tableName="series"
                          refreshOptions={async () => {
                            const { data: series } = await supabase
                              .from("series")
                              .select("id, name")
                              .order("name", { ascending: true })
                            setSeriesOptions(series?.map((s) => ({ value: s.name, label: s.name, id: s.id })) || [])
                          }}
                          returnId={false}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:col-span-2">
                      <Label className="text-purple-700 font-medium w-24 text-right">Géneros:</Label>
                      <div className="flex-1">
                        <MultiSelect
                          options={genresOptions}
                          selected={formData.genres}
                          onChange={(selected, newItem) => {
                            // Obtener IDs de los géneros seleccionados
                            const selectedIds = selected
                              .map((genreName) => {
                                // Primero verificar si es un género recién creado (newItem)
                                if (newItem && newItem.value === genreName) {
                                  return newItem.id
                                }
                                // Si no, buscar en las opciones existentes
                                const found = genresOptions.find((g) => g.value === genreName)
                                return found?.id || null
                              })
                              .filter((id) => id !== null) as number[]

                            setFormData((prev) => ({
                              ...prev,
                              genres: selected,
                              genreIds: selectedIds,
                            }))
                          }}
                          creatable
                          tableName="genres"
                          refreshOptions={async () => {
                            const { data: genres } = await supabase
                              .from("genres")
                              .select("id, name")
                              .order("name", { ascending: true })
                            setGenresOptions(genres?.map((g) => ({ value: g.name, label: g.name, id: g.id })) || [])
                          }}
                          returnId={false}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalles de Publicación */}
              <Card className="border-purple-200">
                <CardHeader className="py-2">
                  <CardTitle className="text-purple-800">Detalles de Publicación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="year" className="text-purple-700 font-medium w-32 text-right">
                        Año:
                      </Label>
                      <div className="flex-1">
                        <MultiSelect
                          options={yearsOptions}
                          selected={formData.year ? [formData.year] : []}
                          onChange={(selected) => setFormData((prev) => ({ ...prev, year: selected[0] || "" }))}
                          singleSelect
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="pages" className="text-purple-700 font-medium w-32 text-right">
                        Páginas:
                      </Label>
                      <Input
                        id="pages"
                        type="number"
                        min="1"
                        value={formData.pages}
                        onChange={(e) => setFormData((prev) => ({ ...prev, pages: e.target.value }))}
                        className="border-purple-200 focus:border-purple-400 flex-1 h-6 py-1 text-sm "
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="language" className="text-purple-700 font-medium w-32 text-right">
                        Idioma:
                      </Label>
                      <div className="flex-1">
                        <MultiSelect
                          options={languagesOptions}
                          selected={formData.language ? [formData.language] : []}
                          onChange={(selected) => setFormData((prev) => ({ ...prev, language: selected[0] || "" }))}
                          creatable
                          singleSelect
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="publisher" className="text-purple-700 font-medium w-32 text-right">
                        Editorial:
                      </Label>
                      <div className="flex-1">
                        <MultiSelect
                          options={publishersOptions}
                          selected={formData.publisher ? [formData.publisher] : []}
                          onChange={(selected) => setFormData((prev) => ({ ...prev, publisher: selected[0] || "" }))}
                          creatable
                          singleSelect
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categorización */}
              <Card className="border-purple-200">
                <CardHeader className="py-2">
                  <CardTitle className="text-purple-800">Categorización</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="type" className="text-purple-700 font-medium w-32 text-right">
                        Tipo:
                      </Label>
                      <div className="flex-1">
                        <MultiSelect
                          options={typesOptions}
                          selected={formData.type ? [formData.type] : []}
                          onChange={(selected) => setFormData((prev) => ({ ...prev, type: selected[0] || "" }))}
                          creatable
                          singleSelect
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="era" className="text-purple-700 font-medium w-32 text-right">
                        Época:
                      </Label>
                      <div className="flex-1">
                        <MultiSelect
                          options={erasOptions}
                          selected={formData.era ? [formData.era] : []}
                          onChange={(selected) => setFormData((prev) => ({ ...prev, era: selected[0] || "" }))}
                          creatable
                          singleSelect
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="format" className="text-purple-700 font-medium w-32 text-right">
                        Formato:
                      </Label>
                      <div className="flex-1">
                        <Select
                          value={formData.format}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, format: value }))}
                        >
                          <SelectTrigger className="h-6 min-h-6 py-0 border-purple-200 bg-purple-50 text-purple-700 rounded-md shadow-sm hover:bg-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all">
                            <SelectValue placeholder="Selecciona formato" />
                          </SelectTrigger>
                          <SelectContent className="bg-white shadow-lg rounded-md border border-purple-100">
                            <SelectItem
                              value="Físico"
                              className="flex items-center gap-2 hover:bg-blue-50 text-blue-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-blue-300 border border-blue-200"></span>
                              Físico - Libro en papel
                            </SelectItem>
                            <SelectItem
                              value="Digital"
                              className="flex items-center gap-2 hover:bg-green-50 text-green-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-green-300 border border-green-200"></span>
                              Digital - eBook o PDF
                            </SelectItem>
                            <SelectItem
                              value="Audiolibro"
                              className="flex items-center gap-2 hover:bg-purple-50 text-purple-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-purple-300 border border-purple-200"></span>
                              Audiolibro - Versión audio
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="audience" className="text-purple-700 font-medium w-32 text-right">
                        Audiencia:
                      </Label>
                      <div className="flex-1">
                        <Select
                          value={formData.audience}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, audience: value }))}
                        >
                          <SelectTrigger className="h-6 min-h-6 py-0 border-purple-200 bg-purple-50 text-purple-700 rounded-md shadow-sm hover:bg-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all">
                            <SelectValue placeholder="Selecciona audiencia" />
                          </SelectTrigger>
                          <SelectContent className="bg-white shadow-lg rounded-md border border-purple-100">
                            <SelectItem
                              value="Todos"
                              className="flex items-center gap-2 hover:bg-gray-50 text-gray-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-gray-300 border border-gray-200"></span>
                              Todos - Para todas las edades
                            </SelectItem>
                            <SelectItem
                              value="Adulto"
                              className="flex items-center gap-2 hover:bg-red-50 text-red-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-red-300 border border-red-200"></span>
                              Adulto - Contenido para adultos
                            </SelectItem>
                            <SelectItem
                              value="Juvenil"
                              className="flex items-center gap-2 hover:bg-orange-50 text-orange-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-orange-300 border border-orange-200"></span>
                              Juvenil - Adolescentes y jóvenes
                            </SelectItem>
                            <SelectItem
                              value="Infantil"
                              className="flex items-center gap-2 hover:bg-yellow-50 text-yellow-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-yellow-300 border border-yellow-200"></span>
                              Infantil - Para niños
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="readingDensity" className="text-purple-700 font-medium w-32 text-right">
                        Densidad:
                      </Label>
                      <div className="flex-1">
                        <Select
                          value={formData.readingDensity}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, readingDensity: value }))}
                        >
                          <SelectTrigger className="h-6 min-h-6 py-0 border-purple-200 bg-purple-50 text-purple-700 rounded-md shadow-sm hover:bg-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all">
                            <SelectValue placeholder="Selecciona densidad" />
                          </SelectTrigger>
                          <SelectContent className="bg-white shadow-lg rounded-md border border-purple-100">
                            <SelectItem
                              value="Ligera"
                              className="flex items-center gap-2 hover:bg-green-50 text-green-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-green-300 border border-green-200"></span>
                              Ligera - Lectura fluida y rápida
                            </SelectItem>
                            <SelectItem
                              value="Media"
                              className="flex items-center gap-2 hover:bg-yellow-50 text-yellow-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-yellow-300 border border-yellow-200"></span>
                              Media - Requiere atención moderada
                            </SelectItem>
                            <SelectItem
                              value="Densa"
                              className="flex items-center gap-2 hover:bg-pink-50 text-pink-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full bg-pink-300 border border-pink-200"></span>
                              Densa - Requiere concentración intensa
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Campo de URL de Portada al lado de Densidad */}
                    <div className="flex items-center gap-4">
                      <Label htmlFor="cover" className="text-purple-700 font-medium w-32 text-right">
                        URL Portada:
                      </Label>
                      <Input
                        id="cover"
                        value={formData.cover}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cover: e.target.value }))}
                        className="border-purple-200 focus:border-purple-400 flex-1 h-6 py-1 text-sm"
                      />
                    </div>
                    {/* Campo de Premios añadido al final */}
                    <div className="flex items-center gap-4 md:col-span-2">
                      <Label htmlFor="awards" className="text-purple-700 font-medium w-32 text-right">
                        Premios:
                      </Label>
                      <Input
                        id="awards"
                        value={formData.awards}
                        onChange={(e) => setFormData((prev) => ({ ...prev, awards: e.target.value }))}
                        className="border-purple-200 focus:border-purple-400 flex-1 h-6 py-1 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de Lectura */}
              <Card className="border-purple-200">
                <CardHeader className="py-2">
                  <CardTitle className="text-purple-800">Información de Lectura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="rating" className="text-purple-700 font-medium w-24 text-right">
                        Calificación:
                      </Label>
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData((prev) => ({ ...prev, rating: e.target.value }))}
                        className="border-purple-200 focus:border-purple-300 focus:ring-1 focus:ring-purple-200 flex-1 h-6 py-1 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="dateStarted" className="text-purple-700 font-medium w-24 text-right">
                        Fecha inicio:
                      </Label>
                      <Input
                        id="dateStarted"
                        type="date"
                        value={formData.dateStarted}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dateStarted: e.target.value }))}
                        className="border-purple-200 focus:border-purple-300 focus:ring-1 focus:ring-purple-200 flex-1 h-6 py-1 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="dateRead" className="text-purple-700 font-medium w-24 text-right">
                        Fecha fin:
                      </Label>
                      <Input
                        id="dateRead"
                        type="date"
                        value={formData.dateRead}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dateRead: e.target.value }))}
                        className="border-purple-200 focus:border-purple-300 focus:ring-1 focus:ring-purple-200 flex-1 h-6 py-1 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reseña Personal */}
              <Card className="border-purple-200">
                <CardHeader className="py-2">
                  <CardTitle className="text-purple-800">Reseña Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-purple-700 font-medium">Personajes Principales</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={characterInput}
                            onChange={(e) => setCharacterInput(e.target.value)}
                            onKeyPress={handleCharacterKeyPress}
                            className="border-purple-200 focus:border-purple-400 h-6 py-1 text-sm"
                          />
                          <Button
                            type="button"
                            onClick={addCharacter}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 h-6 py-1"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {formData.mainCharacters.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.mainCharacters.map((character, index) => (
                              <div
                                key={index}
                                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                              >
                                {character}
                                <button
                                  type="button"
                                  onClick={() => removeCharacter(character)}
                                  className="text-purple-600 hover:text-purple-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="favoriteCharacter" className="text-purple-700 font-medium">
                        Personaje Favorito
                      </Label>
                      <Input
                        id="favoriteCharacter"
                        value={formData.favoriteCharacter}
                        onChange={(e) => setFormData((prev) => ({ ...prev, favoriteCharacter: e.target.value }))}
                        className="border-purple-200 focus:border-purple-400 h-6 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary" className="text-purple-700 font-medium">
                      Resumen del Libro
                    </Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                      rows={3}
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review" className="text-purple-700 font-medium">
                      Tu Opinión/Reseña
                    </Label>
                    <Textarea
                      id="review"
                      value={formData.review}
                      onChange={(e) => setFormData((prev) => ({ ...prev, review: e.target.value }))}
                      rows={3}
                      className="border-purple-200 focus:border-purple-400 "
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="border border-purple-200 rounded-lg p-2 space-y-1">
                      <Label className="text-sm font-medium text-purple-600">Citas Favoritas</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        <div className="md:col-span-2">
                          <MarkdownEditor
                            value={quoteInput.text}
                            onChange={(value) => setQuoteInput((prev) => ({ ...prev, text: value }))}
                            placeholder="Escribe la cita (usa Markdown para formato)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            value={quoteInput.page}
                            onChange={(e) => setQuoteInput((prev) => ({ ...prev, page: e.target.value }))}
                            placeholder="Página"
                            className="text-sm h-6 py-1 text-sm"
                          />
                          <MultiSelect
                            options={quoteTypesOptions}
                            selected={quoteInput.type ? [quoteInput.type] : []}
                            onChange={(selected) => setQuoteInput((prev) => ({ ...prev, type: selected[0] || "" }))}
                            placeholder="Tipos"
                            singleSelect
                            creatable
                          />
                          <MultiSelect
                            options={quoteCategoriesOptions}
                            selected={quoteInput.category}
                            onChange={(selected) => setQuoteInput((prev) => ({ ...prev, category: selected }))}
                            placeholder="Categorías"
                            creatable
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <Button type="button" onClick={addQuote} size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Cita
                      </Button>
                      {formData.quotes.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {formData.quotes.map((quote, index) => (
                            <div key={index} className="bg-purple-50 p-3 rounded-lg text-sm">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <MarkdownViewer content={quote.text} />
                                  <div className="flex gap-2 mt-1 text-xs text-gray-500">
                                    {quote.page && <span>Página {quote.page}</span>}
                                    {quote.type && <span>• {quote.type}</span>}
                                    {quote.category && <span>• {quote.category}</span>}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => removeQuote(index)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-3">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-md transition-all duration-200 disabled:opacity-50"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <BookOpenCheck className="h-4 w-4 mr-2" />
                      Agregar Libro
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    )
  }