import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const updateData = await request.json()

    console.log(`Updating quote ${id}:`, updateData)

    const { data: quote, error } = await supabase
      .from("quotes")
      .update({
        text: updateData.text,
        type: updateData.type,
        category: updateData.category,
        page: updateData.page,
        favorite: updateData.favorite,
        book_id: updateData.book_id,
      })
      .eq("id", id)
      .select(`
        *,
        book:books (
          *,
          author:authors (*)
        )
      `)
      .single()

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    console.log(`Deleting quote ${id}`)

    const { error } = await supabase.from("quotes").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}