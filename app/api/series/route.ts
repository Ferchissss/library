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
          
          // FIND THE MOST RECENT READING DATE
          let latestDate: Date | null = null
          const readBooks = books.filter(book => book.start_date && book.end_date)
          
          if (readBooks.length > 0) {
            // Get all end dates of reading
            const endDates = readBooks
              .map(book => book.end_date ? new Date(book.end_date) : null)
              .filter((date): date is Date => date !== null)
            
            if (endDates.length > 0) {
              // Find the most recent date
              latestDate = new Date(Math.max(...endDates.map(d => d.getTime())))
            }
          }
          
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
            // ADD ONLY THIS FIELD FOR SORTING
            latestReadDate: latestDate ? latestDate.getTime() : 0, // Use timestamp for easy sorting
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

    // FILTER AND SORT BY MOST RECENT DATE (higher timestamp first)
    const validSeries = processedSeries
      .filter(series => series !== null)
      .sort((a, b) => b.latestReadDate - a.latestReadDate) // Descending order

    // REMOVE THE TEMPORARY latestReadDate FIELD BEFORE SENDING
    const finalSeries = validSeries.map(({ latestReadDate, ...rest }) => rest)

    return NextResponse.json(finalSeries)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { seriesId, imageUrl } = await request.json()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the previous URL to delete the old image from storage
    const { data: oldSeries } = await supabase
      .from('series')
      .select('img_url')
      .eq('id', seriesId)
      .single()

    // Update the database with the new URL
    const { error } = await supabase
      .from('series')
      .update({ img_url: imageUrl })
      .eq('id', seriesId)

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    // If the previous URL was from Supabase Storage, delete the old image
    if (oldSeries?.img_url && oldSeries.img_url.includes('supabase.co/storage')) {
      try {
        // Extract the filename from the URL
        const urlParts = oldSeries.img_url.split('series-covers/')
        if (urlParts.length > 1) {
          const oldFileName = urlParts[1].split('?')[0] // Remove query params if any
          
          await supabase
            .storage
            .from('series-covers')
            .remove([oldFileName])
          
          console.log('Old image deleted:', oldFileName)
        }
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError)
        // Don't fail if the old image cannot be deleted
      }
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}