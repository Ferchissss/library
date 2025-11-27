"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Sparkles, BookOpenCheck, Plus, X, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { MultiSelect } from "@/components/MultiSelect"
import { useBulkDataParser } from "@/hooks/useBulkDataParser"
import { BulkInputSection } from "./BulkInputSection"
import { QuotesSection } from "./QuotesSection"
import type { Quote } from "@/lib/types" 

interface AddBookModalProps {
  refreshData?: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  prefilledData?: any
}

export function AddBookModal({ refreshData, isOpen, onOpenChange, prefilledData  }: AddBookModalProps) {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false) 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(false)

  // States for selector options
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
    format: "Digital", // Default value Digital
    audience: "Young Adult",
    readingDensity: "Medium",
    awards: "",
    cover: "",
    mainCharacters: [] as string[],
    favoriteCharacter: "",
    isFavorite: false,
    summary: "",
    review: "",
    series: "",
    seriesId: null as number | null,
    quotes: [] as Quote[],
  })

  const [characterInput, setCharacterInput] = useState("")
  // Hook for bulk data parsing
  const { processBulkData } = useBulkDataParser({ genresOptions, authorsOptions, seriesOptions, setGenresOptions, setAuthorsOptions, setSeriesOptions  })
  // Effect to load prefilled data when modal opens
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
  // Load options when opening modal
  useEffect(() => {
    const fetchOptions = async () => {
      if (!isOpen) return

      setLoadingOptions(true)
      try {
        // Authors
        const { data: authors } = await supabase.from("authors").select("id, name").order("name", { ascending: true })
        setAuthorsOptions(authors?.map((a) => ({ value: a.name, label: a.name, id: a.id })) || [])

        // Genres
        const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true })
        setGenresOptions(genres?.map((g) => ({ value: g.name, label: g.name, id: g.id })) || [])

        // Series
        const { data: series } = await supabase.from("series").select("id, name").order("name", { ascending: true })
        setSeriesOptions(series?.map((s) => ({ value: s.name, label: s.name, id: s.id })) || [])

        // Publishers
        const { data: publishers } = await supabase
          .from("books")
          .select("publisher")
          .not("publisher", "is", null)
          .order("publisher", { ascending: true })
        const uniquePublishers = [...new Set(publishers?.map((p) => p.publisher))]
        setPublishersOptions(uniquePublishers?.map((p) => ({ value: p, label: p })) || [])

        // Languages
        const { data: languages } = await supabase
          .from("books")
          .select("language")
          .not("language", "is", null)
          .order("language", { ascending: true })
        const uniqueLanguages = [...new Set(languages?.map((l) => l.language))]
        setLanguagesOptions(uniqueLanguages?.map((l) => ({ value: l, label: l })) || [])

        // Types
        const { data: types } = await supabase
          .from("books")
          .select("type")
          .not("type", "is", null)
          .order("type", { ascending: true })
        const uniqueTypes = [...new Set(types?.map((t) => t.type))]
        setTypesOptions(uniqueTypes?.map((t) => ({ value: t, label: t })) || [])

        // Eras
        const { data: eras } = await supabase
          .from("books")
          .select("era")
          .not("era", "is", null)
          .order("era", { ascending: true })
        const uniqueEras = [...new Set(eras?.map((e) => e.era))]
        setErasOptions(uniqueEras?.map((e) => ({ value: e, label: e })) || [])

        // Formats
        const { data: formats } = await supabase
          .from("books")
          .select("format")
          .not("format", "is", null)
          .order("format", { ascending: true })
        const uniqueFormats = [...new Set(formats?.map((f) => f.format))]
        setFormatsOptions(uniqueFormats?.map((f) => ({ value: f, label: f })) || [])

        // Audiences
        const { data: audiences } = await supabase
          .from("books")
          .select("audience")
          .not("audience", "is", null)
          .order("audience", { ascending: true })
        const uniqueAudiences = [...new Set(audiences?.map((a) => a.audience))]
        setAudiencesOptions(uniqueAudiences?.map((a) => ({ value: a, label: a })) || [])

        // Years (publication)
        const { data: years } = await supabase
          .from("books")
          .select("year")
          .not("year", "is", null)
          .order("year", { ascending: false })
        const uniqueYears = [...new Set(years?.map((y) => y.year?.toString()))]
        setYearsOptions(uniqueYears?.map((y) => ({ value: y, label: y })) || [])

        // Quote types
        const { data: quoteTypes } = await supabase
          .from("quotes")
          .select("type")
          .not("type", "is", null)
          .order("type", { ascending: true })
        const uniqueQuoteTypes = [...new Set(quoteTypes?.map((qt) => qt.type))]
        setQuoteTypesOptions(uniqueQuoteTypes?.map((qt) => ({ value: qt, label: qt })) || [])
        // Quote categories
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
  // Function to handle bulk data parsing
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
        description: "Title and author are required.",
      })
      return
    }
    // If no authorId but there is author, try to find it again
    if (!formData.authorId && formData.author) {
      const foundAuthor = authorsOptions.find(a => a.value === formData.author)
      if (foundAuthor?.id) {
        setFormData(prev => ({ ...prev, authorId: foundAuthor.id ?? null }))
      }
    }

    // If no seriesId but there is series, try to find it again
    if (!formData.seriesId && formData.series) {
      const foundSeries = seriesOptions.find(s => s.value === formData.series)
      if (foundSeries?.id) {
        setFormData(prev => ({ ...prev, seriesId: foundSeries.id ?? null }))
      }
    }

    // Verify we have all genre IDs
    if (formData.genres.length !== formData.genreIds.length) {
      toast.error("Error", {
        description: "Please make sure all genres are correctly selected.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create book object to insert
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

      // Insert book into Supabase
      const { data: book, error: bookError } = await supabase.from("books").insert(bookData).select("id").single()

      if (bookError || !book) {
        throw bookError || new Error("Could not create book")
      }

      // Handle genres (using IDs)
      if (formData.genreIds.length > 0) {
        const genreInserts = formData.genreIds.map((genreId) => ({
          book_id: book.id,
          genre_id: genreId,
        }))

        const { error: genresError } = await supabase.from("book_genre").insert(genreInserts)

        if (genresError) {
          console.error("Error adding genres:", genresError)
          throw new Error("Error saving book genres")
        }
      }

      // Insert quotes (if they exist)
      if (formData.quotes.length > 0) {
        // Prepare all quotes for multiple insertion
        const quotesToInsert = formData.quotes.map((quote) => ({
          book_id: book.id,
          text: quote.text,
          page: quote.page || null,
          type: quote.type || null,
          category: quote.category || null,
          favorite: false,
        }))

        // Insert all quotes in a single operation
        const { error: quotesError } = await supabase.from("quotes").insert(quotesToInsert)

        if (quotesError) {
          console.error("Error adding quotes:", quotesError)
          throw new Error("Error saving book quotes")
        }
      }

      toast.success("Book added successfully!", {
        description: `"${formData.title}" has been added to your library.`,
      })

      // Reset form
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

      // Close modal and refresh book list
      onOpenChange(false)
      if (refreshData) refreshData()
    } catch (error) {
      const err = error as Error
      console.error("Error saving book:", err)
      toast.error("Error", {
        description: `There was a problem saving the book: ${err.message}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title.trim().length > 0 && formData.author.trim().length > 0

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

  const handleQuotesChange = (quotes: Quote[]) => {
    setFormData(prev => ({ ...prev, quotes }))
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <BookOpen className="w-12 h-12 text" />
              <Sparkles className="w-6 h-6 text-v500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="title text-center">
            Add a New Treasure to Your Library
          </DialogTitle>
          <p className="title2 text-center">Every book is an adventure waiting to be cataloged</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* SEPARATE COMPONENT WITH HOOK */}
          <BulkInputSection 
            onParse={handleBulkParse}
            isOpen={isCollapsibleOpen}
            onOpenChange={setIsCollapsibleOpen}
          />

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Card className="bordes">
              <CardHeader className="py-2">
                <CardTitle className="text">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="title" className="label">Title *:</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                      className="input"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="author" className="label">Author *:</Label>
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
                    <Label htmlFor="series" className="label">Series:</Label>
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
                    <Label className="label">Genres:</Label>
                    <div className="flex-1">
                      <MultiSelect
                        options={genresOptions}
                        selected={formData.genres}
                        onChange={(selected, newItem) => {
                          // Get IDs of selected genres
                          const selectedIds = selected
                            .map((genreName) => {
                              // First check if it's a newly created genre (newItem)
                              if (newItem && newItem.value === genreName) {
                                return newItem.id
                              }
                              // If not, search in existing options
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

            {/* Publication Details */}
            <Card className="bordes">
              <CardHeader className="py-2">
                <CardTitle className="text">Publication Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="year" className="label">Year:</Label>
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
                    <Label htmlFor="pages" className="label">Pages:</Label>
                    <Input
                      id="pages"
                      type="number"
                      min="1"
                      value={formData.pages}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pages: e.target.value }))}
                      className="input "
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="language" className="label">Language:</Label>
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
                    <Label htmlFor="publisher" className="label">Publisher:</Label>
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

            {/* Categorization */}
            <Card className="bordes">
              <CardHeader className="py-2">
                <CardTitle className="text">Categorization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="type" className="label">Type:</Label>
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
                    <Label htmlFor="era" className="label">Era:</Label>
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
                    <Label htmlFor="format" className="label">Format:</Label>
                    <div className="flex-1">
                      <Select
                        value={formData.format}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, format: value }))}
                      >
                        <SelectTrigger className="selectrigger"><SelectValue/></SelectTrigger>
                        <SelectContent className="select-content">
                          <SelectItem value="Physical" className="flex items-center gap-2 hover:bg-blue-50 text-blue-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-blue-700"></span>
                            Physical - Paper book
                          </SelectItem>
                          <SelectItem value="Digital" className="flex items-center gap-2 hover:bg-green-50 text-green-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-green-700"></span>
                            Digital - eBook or PDF
                          </SelectItem>
                          <SelectItem value="Audiobook" className="flex items-center gap-2 hover:bg-pink-50 text-pink-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-pink-700"></span>
                            Audiobook - Audio version
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label htmlFor="audience" className="label">Audience:</Label>
                    <div className="flex-1">
                      <Select
                        value={formData.audience}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, audience: value }))}
                      >
                        <SelectTrigger className="selectrigger"><SelectValue/></SelectTrigger>
                        <SelectContent className="select-content">
                          <SelectItem value="All" className="flex items-center gap-2 hover:bg-blue-50 text-blue-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-blue-700"></span>
                            All - For all ages
                          </SelectItem>
                          <SelectItem value="Adult" className="flex items-center gap-2 hover:bg-green-50 text-green-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-green-700"></span>
                            Adult - Adult content
                          </SelectItem>
                          <SelectItem value="Young Adult" className="flex items-center gap-2 hover:bg-pink-50 text-pink-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-pink-700"></span>
                            Young Adult - Teenagers and young adults
                          </SelectItem>
                          <SelectItem value="Children" className="flex items-center gap-2 hover:bg-orange-50 text-orange-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-orange-700"></span>
                            Children - For kids
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label htmlFor="readingDensity" className="label">Density:</Label>
                    <div className="flex-1">
                      <Select
                        value={formData.readingDensity}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, readingDensity: value }))}
                      >
                        <SelectTrigger className="selectrigger w-full text-left"><SelectValue/></SelectTrigger>
                        <SelectContent className="select-content">
                          <SelectItem value="Light" className="flex items-center gap-2 hover:bg-blue-50 text-blue-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-blue-700"></span>
                            Light - Fluent and fast reading
                          </SelectItem>
                          <SelectItem value="Medium" className="flex items-center gap-2 hover:bg-green-50 text-green-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-green-700"></span>
                            Medium - Requires moderate attention
                          </SelectItem>
                          <SelectItem value="Dense" className="flex items-center gap-2 hover:bg-pink-50 text-pink-700 transition-colors">
                            <span className="w-3 h-3 rounded-full border border-pink-700"></span>
                            Dense - Requires intense concentration
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Cover URL field next to Density */}
                  <div className="flex items-center gap-4">
                    <Label htmlFor="cover" className="label">Cover URL:</Label>
                    <Input
                      id="cover"
                      value={formData.cover}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cover: e.target.value }))}
                      className="input"
                    />
                  </div>
                  {/* Awards field added at the end */}
                  <div className="flex items-center gap-4 md:col-span-2">
                    <Label htmlFor="awards" className="label">Awards:</Label>
                    <Input
                      id="awards"
                      value={formData.awards}
                      onChange={(e) => setFormData((prev) => ({ ...prev, awards: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reading Information */}
            <Card className="bordes">
              <CardHeader className="py-2">
                <CardTitle className="text">Reading Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="rating" className="label">Rating:</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData((prev) => ({ ...prev, rating: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="dateStarted" className="label">Start date:</Label>
                    <Input
                      id="dateStarted"
                      type="date"
                      value={formData.dateStarted}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dateStarted: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="dateRead" className="label">End date:</Label>
                    <Input
                      id="dateRead"
                      type="date"
                      value={formData.dateRead}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dateRead: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Review */}
            <Card className="bordes">
              <CardHeader className="py-2">
                <CardTitle className="text">Personal Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="label">Main Characters</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={characterInput}
                          onChange={(e) => setCharacterInput(e.target.value)}
                          onKeyPress={handleCharacterKeyPress}
                          className="input"
                        />
                        <Button
                          type="button"
                          onClick={addCharacter}
                          size="sm"
                          className="button2 h-6 py-1"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {formData.mainCharacters.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.mainCharacters.map((character, index) => (
                            <div
                              key={index}
                              className="bg-v100 text px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              {character}
                              <button
                                type="button"
                                onClick={() => removeCharacter(character)}
                                className="text-v600 hover:text"
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
                    <Label htmlFor="favoriteCharacter" className="label">Favorite Character</Label>
                    <Input
                      id="favoriteCharacter"
                      value={formData.favoriteCharacter}
                      onChange={(e) => setFormData((prev) => ({ ...prev, favoriteCharacter: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <Label className="label">Favorite Quotes</Label>
                <QuotesSection
                  quotes={formData.quotes}
                  onQuotesChange={handleQuotesChange}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <Button
                type="submit"
                className="button1"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading h-4 w-4 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <BookOpenCheck className="h-4 w-4 mr-2" />
                    Add Book
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="button-tran2"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}