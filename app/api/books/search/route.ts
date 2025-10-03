import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return new Response(JSON.stringify({ books: [], authors: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    console.log('Buscando en Google Books:', q)
    
    // Buscar en Google Books por título Y por autor
    const [titleRes, authorRes] = await Promise.all([
      fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(q)}&maxResults=6&langRestrict=es`),
      fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(q)}&maxResults=6&langRestrict=es`)
    ])
    
    if (!titleRes.ok || !authorRes.ok) {
      throw new Error(`Google Books API error`)
    }

    const titleData = await titleRes.json()
    const authorData = await authorRes.json()

    // Formatear resultados de libros
    const formattedBooks = (titleData.items || []).map((book: any) => ({
      id: book.id,
      volumeInfo: {
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        publishedDate: book.volumeInfo.publishedDate,
        description: book.volumeInfo.description,
        imageLinks: {
          thumbnail: book.volumeInfo.imageLinks?.thumbnail,
          smallThumbnail: book.volumeInfo.imageLinks?.smallThumbnail,
        },
        publisher: book.volumeInfo.publisher,
        pageCount: book.volumeInfo.pageCount,
        categories: book.volumeInfo.categories,
        language: book.volumeInfo.language,
        previewLink: book.volumeInfo.previewLink,
        infoLink: book.volumeInfo.infoLink,
      },
      searchType: 'book' as const
    }))

    // Formatear resultados de autores (tomamos libros únicos por autor)
    const authorMap = new Map()
    const authorBooks = authorData.items || []
    
    authorBooks.forEach((book: any) => {
      const authors = book.volumeInfo.authors || []
      authors.forEach((author: string) => {
        if (!authorMap.has(author)) {
          authorMap.set(author, {
            id: `author-${author.toLowerCase().replace(/\s+/g, '-')}`,
            name: author,
            booksCount: 1,
            image: book.volumeInfo.imageLinks?.thumbnail, // Usamos la portada del primer libro
            searchType: 'author' as const
          })
        }
      })
    })

    const formattedAuthors = Array.from(authorMap.values())

    return new Response(
      JSON.stringify({
        books: formattedBooks,
        authors: formattedAuthors,
        totalItems: (titleData.totalItems || 0) + (authorData.totalItems || 0),
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        } 
      }
    )
  } catch (error) {
    console.error('Error fetching books:', error)
    return new Response(
      JSON.stringify({ 
        books: [], 
        authors: [],
        error: 'Error fetching data from Google Books API' 
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}