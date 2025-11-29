import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log('Fetching quotes from Supabase...')
    
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select(`
        *,
        book:books (
          *,
          author:authors (*)
        )
      `)
      .order('id', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message }, 
        { status: 500 }
      )
    }

    console.log(`Found ${quotes?.length || 0} quotes`)
    return NextResponse.json(quotes || [])
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const quoteData = await request.json()
    console.log('Creating new quote:', quoteData)

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert([{
        text: quoteData.text,
        type: quoteData.type,
        category: quoteData.category,
        page: quoteData.page,
        favorite: quoteData.favorite,
        book_id: quoteData.book_id
      }])
      .select(`
        *,
        book:books (
          *,
          author:authors (*)
        )
      `)
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message }, 
        { status: 500 }
      )
    }

    return NextResponse.json(quote)
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}