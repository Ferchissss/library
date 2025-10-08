// lib/bookDataTransformers.ts

export interface AnalyzedBookData {
  title: string
  series?: string
  author: string
  genres: string[]
  pages: number
  publishedDate?: string
  publisher?: string
  language: string
  literaryAwards?: string[]
  characters?: string[]
}

export interface AddBookFormData {
  title: string
  author: string
  genres: string[]
  year: string
  pages: string
  language: string
  publisher: string
  awards: string
  mainCharacters: string[]
  summary: string
  review: string
  series: string
  rating: string
  type: string
  dateStarted: string
  dateRead: string
  era: string
  format: string
  audience: string
  readingDensity: string
  cover: string
  favoriteCharacter: string
  isFavorite: boolean
  quotes: any[]
}

export const transformToAddBookFormat = (bookData: AnalyzedBookData): AddBookFormData => {
  return {
    title: bookData.title || "",
    author: bookData.author || "",
    genres: bookData.genres || [],
    year: bookData.publishedDate || "",
    pages: bookData.pages?.toString() || "",
    language: bookData.language || "",
    publisher: bookData.publisher || "",
    awards: bookData.literaryAwards?.join(", ") || "",
    mainCharacters: bookData.characters || [],
    summary: "", // No tenemos este dato del analizador
    review: "", // No tenemos este dato del analizador
    series: bookData.series || "",
    // Los campos que no tenemos los dejamos vacíos
    rating: "",
    type: "",
    dateStarted: "",
    dateRead: "",
    era: "",
    format: "",
    audience: "",
    readingDensity: "",
    cover: "",
    favoriteCharacter: "",
    isFavorite: false,
    quotes: [],
  }
}

export const convertToBulkDataFormat = (bookData: AnalyzedBookData): string => {
  const lines = [
    bookData.title || "", // Línea 0: Título
    bookData.author || "", // Línea 1: Autor
    bookData.genres.join(", ") || "", // Línea 2: Géneros
    "", // Línea 3: Rating (no tenemos)
    "", // Línea 4: Tipo (no tenemos)
    bookData.pages?.toString() || "", // Línea 5: Páginas
    "", // Línea 6: Fecha inicio (no tenemos)
    "", // Línea 7: Fecha fin (no tenemos)
    bookData.publishedDate || "", // Línea 8: Año
    bookData.publisher || "", // Línea 9: Editorial
    bookData.language || "", // Línea 10: Idioma
    "", // Línea 11: Época (no tenemos)
    "", // Línea 12: Formato (no tenemos)
    "", // Línea 13: Audiencia (no tenemos)
    "", // Línea 14: Densidad (no tenemos)
    bookData.literaryAwards?.join(", ") || "", // Línea 15: Premios
    "", // Línea 16: Portada (no tenemos)
    bookData.characters?.join(", ") || "", // Línea 17: Personajes principales
    "", // Línea 18: Personaje favorito (no tenemos)
    "", // Línea 19: Es favorito (no tenemos)
    "", // Línea 20: Resumen (no tenemos)
    "", // Línea 21: Reseña (no tenemos)
    bookData.series || "", // Línea 22: Serie
    // Líneas 23+: Citas (no tenemos)
  ]

  return lines.join("\n")
}