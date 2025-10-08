import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { transformToAddBookFormat, convertToBulkDataFormat, type AnalyzedBookData, type AddBookFormData } from '@/lib/bookDataTransformers'

interface UseBulkDataParserProps {
  genresOptions: { value: string; label: string; id?: number }[]
  authorsOptions: { value: string; label: string; id?: number }[]
  seriesOptions: { value: string; label: string; id?: number }[]
  setGenresOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string; id?: number }[]>>
  setAuthorsOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string; id?: number }[]>>
  setSeriesOptions: React.Dispatch<React.SetStateAction<{ value: string; label: string; id?: number }[]>>
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
      // .filter((line) => line.length > 0) // ← MANTÉN ESTA LÍNEA COMENTADA

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
    const seriesName = lines[22] || "" // ← SERIE en línea 22
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
      title: lines[0] || "",                    // 0. Título
      author: lines[1] || "",                   // 1. Autor
      authorId: existingAuthor?.id || null,
      genres: bulkGenres,
      genreIds: genreIds,
      rating: lines[3] || "",                   // 3. Calificación
      type: lines[4] || "",                     // 4. Tipo
      pages: lines[5] || "",                    // 5. Páginas ← CORREGIDO
      dateStarted: lines[6] || "",              // 6. Fecha inicio
      dateRead: lines[7] || "",                 // 7. Fecha fin
      year: lines[8] || "",                     // 8. Año publicación ← CORREGIDO
      publisher: lines[9] || "",                // 9. Editorial ← CORREGIDO
      language: lines[10] || "",                // 10. Idioma ← CORREGIDO
      era: lines[11] || "",                     // 11. Época
      format: lines[12] || "Digital",           // 12. Formato
      audience: lines[13] || "Juvenil",         // 13. Audiencia
      readingDensity: lines[14] || "",          // 14. Densidad
      awards: lines[15] || "",                  // 15. Premios
      cover: lines[16] || "",                   // 16. Portada
      mainCharacters: lines[17] ? lines[17].split(",").map((c) => c.trim()) : [],
      favoriteCharacter: lines[18] || "",
      isFavorite: (lines[19] || "").toLowerCase() === "true",
      summary: lines[20] || "",
      review: lines[21] || "",
      series: lines[22] || "",                  // 22. Serie ← CORREGIDO
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
      toast.error("Error", {
        description: `No se pudieron crear los géneros: ${genresToCreate.join(", ")}`,
      })
    }
    
    return genreIds
  }

  const identifyNewEntities = (bookData: AnalyzedBookData) => {
    // IDENTIFICAR AUTORES NUEVOS
    const existingAuthor = authorsOptions.find((a) => a.value === bookData.author)
    const authorsToCreate: string[] = []
    
    if (bookData.author && !existingAuthor) {
      authorsToCreate.push(bookData.author)
    }

    // IDENTIFICAR SERIES NUEVAS
    const existingSeries = seriesOptions.find((s) => s.value === bookData.series)
    const seriesToCreate: string[] = []
    
    if (bookData.series && !existingSeries) {
      seriesToCreate.push(bookData.series)
    }

    // IDENTIFICAR GÉNEROS NUEVOS
    const genreIds: number[] = []
    const genresToCreate: string[] = []

    bookData.genres.forEach((genreName) => {
      const existingGenre = genresOptions.find((g) => g.value === genreName)
      if (existingGenre?.id) {
        genreIds.push(existingGenre.id)
      } else if (genreName) {
        genresToCreate.push(genreName)
      }
    })

    return { authorsToCreate, seriesToCreate, genresToCreate, genreIds }
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

  // Nueva función para procesar datos ya analizados
  const processAnalyzedData = async (bookData: AnalyzedBookData): Promise<AddBookFormData & { authorId?: number | null; seriesId?: number | null; genreIds?: number[] }> => {
    const { authorsToCreate, seriesToCreate, genresToCreate, genreIds } = identifyNewEntities(bookData)

    // Crear elementos nuevos y obtener sus IDs
    const [authorIds, seriesIds, newGenreIds] = await Promise.all([
      createNewAuthors(authorsToCreate),
      createNewSeries(seriesToCreate),
      createNewGenres(genresToCreate)
    ])

    const formData = transformToAddBookFormat(bookData)

    // Combinar IDs de géneros existentes y nuevos
    const allGenreIds = [...genreIds]
    if (genresToCreate.length > 0) {
      bookData.genres.forEach((genre: string) => {
        if (newGenreIds[genre] && !allGenreIds.includes(newGenreIds[genre])) {
          allGenreIds.push(newGenreIds[genre])
        }
      })
    }

    // Devolver el formData con los IDs
    return {
      ...formData,
      authorId: bookData.author && authorIds[bookData.author] ? authorIds[bookData.author] : null,
      seriesId: bookData.series && seriesIds[bookData.series] ? seriesIds[bookData.series] : null,
      genreIds: allGenreIds
    }
  }
  
  return { 
    processBulkData,
    processAnalyzedData,
    transformToAddBookFormat,
    convertToBulkDataFormat
  }
}