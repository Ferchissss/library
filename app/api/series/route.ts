import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Incomplete Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select(`
        id,
        name,
        img_url,
        books (
          id,
          orden,
          title,
          rating,
          start_date,
          end_date,
          author_id,
          authors (
            id,
            name
          )
        )
      `)

    if (seriesError) {
      return NextResponse.json(
        { error: `Database error: ${seriesError.message}` },
        { status: 500 }
      )
    }

    if (!series || series.length === 0) {
      return NextResponse.json([])
    }

    const processedSeries = await Promise.all(
      series.map(async (serie) => {
        try {
          const books = serie.books || []
          const readBooks = books.filter(book => book.start_date && book.end_date)
          
          const ratings = books
            .filter(book => book.rating)
            .map(book => Number(book.rating))
          const avgRating = ratings.length > 0 
            ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 0

          let genre = "Unknown"
          if (books.length > 0) {
            const { data: genres } = await supabase
              .from('book_genre')
              .select(`
                genres (
                  name
                )
              `)
              .eq('book_id', books[0].id)
              .limit(1)

            if (genres && genres.length > 0) {
              genre = (genres[0] as any).genres?.name || "Unknown"
            }
          }

          return {
            id: serie.id,
            name: serie.name,
            author: (books[0]?.authors as any)?.name || "Unknown author",
            totalBooks: books.length,
            genre: genre,
            avgRating: avgRating,
            cover: serie.img_url || "/placeholder.svg?height=200&width=150",
            books: books.map(book => ({
              title: book.title,
              read: !!(book.start_date && book.end_date),
              rating: book.rating ? Number(book.rating) : undefined
            }))
          }
        } catch (error) {
          return null
        }
      })
    )

    const validSeries = processedSeries.filter(series => series !== null)
    return NextResponse.json(validSeries)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}