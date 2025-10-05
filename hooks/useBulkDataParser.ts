import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"

interface UseBulkDataParserProps {
  genresOptions: { value: string; label: string; id?: number }[]
  authorsOptions: { value: string; label: string; id?: number }[]
  seriesOptions: { value: string; label: string; id?: number }[]
  setGenresOptions: (options: { value: string; label: string; id?: number }[]) => void
  setAuthorsOptions: (options: { value: string; label: string; id?: number }[]) => void
  setSeriesOptions: (options: { value: string; label: string; id?: number }[]) => void
}

interface ParseResult {
  formData: any
  authorsToCreate: string[]
  seriesToCreate: string[]
  genresToCreate: string[]
}

export function useBulkDataParser({ 
  genresOptions, 
  authorsOptions, 
  seriesOptions,
  setGenresOptions,
  setAuthorsOptions,
  setSeriesOptions
}: UseBulkDataParserProps) {
  
  const parseBulkData = (bulkData: string): ParseResult | null => {
    const lines = bulkData
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length < 2) {
      toast.error("Error", {
        description: "Por favor, proporciona al menos el título y autor del libro.",
      })
      return null
    }

    // IDENTIFICAR AUTORES NUEVOS
    const authorName = lines[1] || ""
    const existingAuthor = authorsOptions.find((a) => a.value === authorName)
    const authorsToCreate: string[] = []
    
    if (authorName && !existingAuthor) {
      authorsToCreate.push(authorName)
    }

    // IDENTIFICAR SERIES NUEVAS
    const seriesName = lines[22] || ""
    const existingSeries = seriesOptions.find((s) => s.value === seriesName)
    const seriesToCreate: string[] = []
    
    if (seriesName && !existingSeries) {
      seriesToCreate.push(seriesName)
    }

    // IDENTIFICAR GÉNEROS NUEVOS
    const bulkGenres = lines[2] ? lines[2].split(",").map((g) => g.trim()) : []
    const genreIds: number[] = []
    const genresToCreate: string[] = []

    bulkGenres.forEach((genreName) => {
      const existingGenre = genresOptions.find((g) => g.value === genreName)
      if (existingGenre?.id) {
        genreIds.push(existingGenre.id)
      } else if (genreName) {
        genresToCreate.push(genreName)
      }
    })

    const parsedData = {
      title: lines[0] || "",
      author: authorName,
      authorId: existingAuthor?.id || null,
      genres: bulkGenres,
      genreIds: genreIds,
      rating: lines[3] || "",
      type: lines[4] || "",
      pages: lines[5] || "",
      dateStarted: lines[6] || "",
      dateRead: lines[7] || "",
      year: lines[8] || "",
      publisher: lines[9] || "",
      language: lines[10] || "",
      era: lines[11] || "",
      format: lines[12] || "Digital",
      audience: lines[13] || "Juvenil",
      readingDensity: lines[14] || "",
      awards: lines[15] || "",
      cover: lines[16] || "",
      mainCharacters: lines[17] ? lines[17].split(",").map((c) => c.trim()) : [],
      favoriteCharacter: lines[18] || "",
      isFavorite: (lines[19] || "").toLowerCase() === "true",
      summary: lines[20] || "",
      review: lines[21] || "",
      series: seriesName,
      seriesId: existingSeries?.id || null,
      quotes: lines.slice(23).map((line) => {
        const [text, page, type, category] = line.split("|")
        return {
          text: text?.trim() || "",
          page: page?.trim() || "",
          type: type?.trim() || "General",
          category: category?.trim() || "",
        }
      }),
    }

    return {
      formData: parsedData,
      authorsToCreate,
      seriesToCreate,
      genresToCreate
    }
  }

  const createNewAuthors = async (authorsToCreate: string[]): Promise<Record<string, number>> => {
    const authorIds: Record<string, number> = {}
    
    for (const authorName of authorsToCreate) {
      try {
        const { data: newAuthor, error } = await supabase
          .from("authors")
          .insert({ name: authorName })
          .select("id, name")
          .single()

        if (error) throw error
        
        if (newAuthor) {
          authorIds[authorName] = newAuthor.id
          // Actualizar las opciones de autores
          setAuthorsOptions(prev => [...prev, { 
            value: authorName, 
            label: authorName, 
            id: newAuthor.id 
          }])
        }
      } catch (error) {
        console.error("Error creating author:", error)
        toast.error("Error", {
          description: `No se pudo crear el autor "${authorName}".`,
        })
      }
    }
    
    return authorIds
  }

  const createNewSeries = async (seriesToCreate: string[]): Promise<Record<string, number>> => {
    const seriesIds: Record<string, number> = {}
    
    for (const seriesName of seriesToCreate) {
      try {
        const { data: newSeries, error } = await supabase
          .from("series")
          .insert({ name: seriesName })
          .select("id, name")
          .single()

        if (error) throw error
        
        if (newSeries) {
          seriesIds[seriesName] = newSeries.id
          // Actualizar las opciones de series
          setSeriesOptions(prev => [...prev, { 
            value: seriesName, 
            label: seriesName, 
            id: newSeries.id 
          }])
        }
      } catch (error) {
        console.error("Error creating series:", error)
        toast.error("Error", {
          description: `No se pudo crear la serie "${seriesName}".`,
        })
      }
    }
    
    return seriesIds
  }

  const createNewGenres = async (genresToCreate: string[]): Promise<Record<string, number>> => {
    const genreIds: Record<string, number> = {}
    
    try {
      const { data: newGenres, error } = await supabase
        .from("genres")
        .insert(genresToCreate.map(name => ({ name })))
        .select("id, name")

      if (error) throw error
      
      if (newGenres) {
        newGenres.forEach(newGenre => {
          genreIds[newGenre.name] = newGenre.id
        })
        // Actualizar las opciones de géneros
        setGenresOptions(prev => [
          ...prev, 
          ...newGenres.map(g => ({ value: g.name, label: g.name, id: g.id }))
        ])
      }
    } catch (error) {
      console.error("Error creating genres:", error)
      toast.error("Error", {
        description: `No se pudieron crear los géneros: ${genresToCreate.join(", ")}`,
      })
    }
    
    return genreIds
  }

  const processBulkData = async (bulkData: string) => {
    const result = parseBulkData(bulkData)
    if (!result) return null

    const { formData, authorsToCreate, seriesToCreate, genresToCreate } = result

    // Crear elementos nuevos y obtener sus IDs
    const [authorIds, seriesIds, genreIds] = await Promise.all([
      createNewAuthors(authorsToCreate),
      createNewSeries(seriesToCreate),
      createNewGenres(genresToCreate)
    ])

    // Actualizar los IDs en formData
    if (formData.author && authorIds[formData.author]) {
      formData.authorId = authorIds[formData.author]
    }

    if (formData.series && seriesIds[formData.series]) {
      formData.seriesId = seriesIds[formData.series]
    }

    // Actualizar IDs de géneros
    if (genresToCreate.length > 0) {
      formData.genres.forEach((genre: string) => {
        if (genreIds[genre] && !formData.genreIds.includes(genreIds[genre])) {
          formData.genreIds.push(genreIds[genre])
        }
      })
    }

    toast.success("Datos cargados", {
      description: "Los campos se han llenado automáticamente con la información proporcionada.",
    })

    return formData
  }

  return { processBulkData }
}