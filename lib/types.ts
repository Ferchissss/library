export type Author = {
  id: number
  name: string
  nationality?: string
  birth_year?: number
  death_year?: number
  gender?: string
  literary_genre?: string
  biography?: string
  awards?: string
}

export type Series = {
  id: number
  name: string
}

export type Genre = {
  id: number
  name: string
}

export type Book = {
  id: number
  orden: number 
  title: string
  author?: Author
  author_id?: number
  rating?: number // decimal(2,1)
  type?: string
  start_date?: string // ISO date string (e.g., '2025-08-04')
  end_date?: string
  year?: number
  pages?: number
  publisher?: string
  language?: string
  era?: string
  format?: string
  audience?: string
  reading_difficulty?: string
  favorite: boolean
  awards?: string
  summary?: string
  review?: string
  main_characters?: string
  favorite_character?: string
  image_url?: string
  series?: Series
  series_id?: number
  genres?: Genre[]
  quotes?: Quote[]
}

export type Quote = {
  id: number
  text: string
  type?: string
  category?: string
  page?: number
  favorite: boolean
  book_id?: number
  book?: Book
}

export type Challenge = {
  id: number
  name: string
  description?: string
  start_date?: string
  end_date?: string
}
