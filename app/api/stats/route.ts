// app/api/stats/route.ts - VERSIÓN COMPLETA
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { selectMainChallenge } from '@/lib/challenge-ia'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

function getCurrentYear() {
  return new Date().getFullYear()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // 1. BUSCAR O CREAR DESAFÍO PRINCIPAL
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('year', year)

    let mainChallenge = null

    if (challenges && challenges.length > 0) {
      mainChallenge = await selectMainChallenge(challenges, year)
    } 

    // 2. CALCULAR PROGRESO DEL DESAFÍO
    let progress = 0
    if (mainChallenge?.query_sql) {
      const { data: progressData, error: progressError } = await supabase.rpc('exec_sql', { 
        sql_query: mainChallenge.query_sql 
      })
      progress = progressError ? 0 : (progressData?.[0]?.count || 0)
    }

    // 3. PROMEDIO MENSUAL DE LIBROS (AÑO ACTUAL)
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('books')
      .select('id', { count: 'exact' })
      .gte('end_date', `${year}-01-01`) 
      .lte('end_date', `${year}-12-31`)
      .not('end_date', 'is', null)

    const totalBooks = monthlyError ? 0 : monthlyData?.length || 0
    const avgMonthlyBooks = Math.round((totalBooks / 12) * 10) / 10

    // 4. PÁGINAS POR DÍA PROMEDIO (AÑO ACTUAL)
    const { data: pagesData, error: pagesError } = await supabase
      .from('books')
      .select('pages, start_date, end_date')
      .gte('end_date', `${year}-01-01`)  
      .lte('end_date', `${year}-12-31`)
      .not('start_date', 'is', null)
      .not('end_date', 'is', null)
      .not('pages', 'is', null)

    let avgPagesPerDay: number | undefined
    if (pagesData && pagesData.length > 0) {
      const totalPagesPerDay = pagesData.map(book => {
        const days = (new Date(book.end_date!).getTime() - new Date(book.start_date!).getTime()) / (1000 * 60 * 60 * 24)
        return days > 0 ? book.pages! / days : 0
      }).filter(val => val > 0)
      
      avgPagesPerDay = totalPagesPerDay.length > 0 ? 
        Math.round(totalPagesPerDay.reduce((a, b) => a + b, 0) / totalPagesPerDay.length) : 47
    }

    // 5. TIEMPO PROMEDIO POR LIBRO (TODOS LOS AÑOS)
    const { data: daysData, error: daysError } = await supabase
      .from('books')
      .select('start_date, end_date')
      .not('start_date', 'is', null)
      .not('end_date', 'is', null)

    let avgDaysPerBook = 0
    if (daysData && daysData.length > 0) {
      const totalDays = daysData.map(book => {
        return (new Date(book.end_date!).getTime() - new Date(book.start_date!).getTime()) / (1000 * 60 * 60 * 24)
      }).filter(days => days > 0)
      
      avgDaysPerBook = totalDays.length > 0 ? 
        Math.round(totalDays.reduce((a, b) => a + b, 0) / totalDays.length) : 0
    }

    // 6. VELOCIDAD DE LECTURA (TODOS LOS AÑOS)
    const { data: speedData, error: speedError } = await supabase
      .from('books')
      .select('pages, start_date, end_date')
      .not('start_date', 'is', null)
      .not('end_date', 'is', null)
      .not('pages', 'is', null)

    let avgPagesPerDayPerBook = 0
    if (speedData && speedData.length > 0) {
      const speeds = speedData.map(book => {
        const days = (new Date(book.end_date!).getTime() - new Date(book.start_date!).getTime()) / (1000 * 60 * 60 * 24)
        return days > 0 ? book.pages! / days : 0
      }).filter(speed => speed > 0)
      
      avgPagesPerDayPerBook = speeds.length > 0 ? 
        Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0
    }

    // 7. DATOS MENSUALES PARA EL TAB "MENSUAL"
    const currentYear = getCurrentYear()
    const { data: monthlyStatsData } = await supabase
      .from('books')
      .select('end_date, pages')
      .gte('end_date', `${currentYear}-01-01`)
      .lte('end_date', `${currentYear}-12-31`)
      .not('pages', 'is', null)

    const monthlyDataFormatted = generateMonthlyData(monthlyStatsData || [])

    // 8. DATOS ANUALES HISTÓRICOS PARA EL TAB "POR AÑO"
    const { data: yearlyStatsData } = await supabase
      .from('books')
      .select('end_date, pages, rating')
      .not('end_date', 'is', null)
      .not('pages', 'is', null)
      .order('year', { ascending: true })

    const yearlyDataFormatted = generateYearlyData(yearlyStatsData || [])

    // 9. DATOS PARA TIMELINE
    console.log('🔍 Iniciando consulta timeline...')

    // Consulta SIMPLE primero para verificar
    const { data: simpleTimelineData } = await supabase
      .from('books')
      .select('id, title, start_date, end_date, rating, pages')
      .not('start_date', 'is', null)
      .not('end_date', 'is', null)
      .order('end_date', { ascending: false })

    console.log('📚 Simple timeline data:', simpleTimelineData)

    // Obtener autores por separado
    let authorsData = []
    let genresData = []

    if (simpleTimelineData && simpleTimelineData.length > 0) {
      const bookIds = simpleTimelineData.map(book => book.id)
      
      const { data: authors } = await supabase
        .from('books')
        .select('id, authors (name)')
        .in('id', bookIds)
      authorsData = authors || []

      const { data: genres } = await supabase
        .from('book_genres')
        .select('book_id, genres (name)')
        .in('book_id', bookIds)
      genresData = genres || []
    }

    console.log('👥 Authors data:', authorsData)
    console.log('🎭 Genres data:', genresData)

    // Combinar datos manualmente
    const timelineDataWithRelations = simpleTimelineData ? simpleTimelineData.map(book => ({
      ...book,
      authors: authorsData.find(a => a.id === book.id)?.authors || { name: 'Autor desconocido' },
      book_genres: genresData.filter(g => g.book_id === book.id) || []
    })) : []

    console.log('✨ Timeline data combinado:', timelineDataWithRelations)

    const timelineBooksFormatted = generateTimelineData(timelineDataWithRelations)
    console.log('✅ Timeline books formateados:', timelineBooksFormatted)

    // 10. ESTADÍSTICAS DE GÉNEROS
    const { data: genreData } = await supabase
      .from('book_genre')
      .select(`
        book_id,
        genres (name),
        books!inner(end_date)
      `)
      .gte('books.end_date', `${currentYear}-01-01`)
      .lte('books.end_date', `${currentYear}-12-31`)

    const genreStatsFormatted = generateGenreStats(genreData || [])

    return NextResponse.json({
      challenge: mainChallenge,
      progress,
      avgMonthlyBooks,
      avgPagesPerDay,
      avgDaysPerBook,
      avgPagesPerDayPerBook,
      monthlyData: monthlyDataFormatted,
      yearlyData: yearlyDataFormatted,
      timelineBooks: timelineBooksFormatted,
      genreStats: genreStatsFormatted
    })

  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json({ 
      challenge: null,
      progress: 0,
      avgMonthlyBooks: 3.2,
      avgPagesPerDay: 47,
      avgDaysPerBook: 0,
      avgPagesPerDayPerBook: 0,
      monthlyData: [],
      yearlyData: [],
      timelineBooks: [],
      genreStats: []
    }, { status: 500 })
  }
}

// Función para generar datos mensuales
function generateMonthlyData(books: any[]) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  const monthlyStats = months.map((month, index) => {
    const monthBooks = books.filter(book => {
      const date = new Date(book.end_date)
      return date.getMonth() === index
    })
    
    const totalPages = monthBooks.reduce((sum, book) => sum + (book.pages || 0), 0)
    
    return {
      month,
      books: monthBooks.length,
      pages: totalPages
    }
  })

  return monthlyStats
}

// Función para generar datos anuales
function generateYearlyData(books: any[]) {
  const yearsMap = new Map()
  
  books.forEach(book => {
    const endDate = new Date(book.end_date)
    const year = endDate.getFullYear()  // ← Año de finalización
    
    if (!yearsMap.has(year)) {
      yearsMap.set(year, {
        year,
        books: 0,
        pages: 0,
        ratings: []
      })
    }
    
    const yearData = yearsMap.get(year)
    yearData.books += 1
    yearData.pages += book.pages || 0
    if (book.rating) {
      yearData.ratings.push(book.rating)
    }
  })
  
  return Array.from(yearsMap.values()).map(data => ({
    year: data.year,
    books: data.books,
    pages: data.pages,
    avgRating: data.ratings.length > 0 
      ? Math.round((data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length) * 10) / 10
      : 0
  })).sort((a, b) => b.year - a.year)
}

// Función para generar datos de timeline
  function generateTimelineData(books: any[]) {
    return books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.authors?.name || 'Autor desconocido',
      start_date: book.start_date, 
      end_date: book.end_date,
      dateRead: book.end_date,
      rating: book.rating || 0,
      genre: book.book_genres?.[0]?.genres?.name || book.book_genres?.[0]?.name || 'Sin género',
      pages: book.pages || 0
    }))
  }

// Función para generar estadísticas de géneros
function generateGenreStats(genreData: any[]) {
  const genreCount = new Map()
  
  genreData.forEach(item => {
    const genreName = item.genres?.name
    if (genreName) {
      genreCount.set(genreName, (genreCount.get(genreName) || 0) + 1)
    }
  })
  
  const total = Array.from(genreCount.values()).reduce((sum, count) => sum + count, 0)
  
  return Array.from(genreCount.entries()).map(([genre, count]) => ({
    genre,
    count,
    percentage: Math.round((count / total) * 100)
  })).sort((a, b) => b.count - a.count)
}