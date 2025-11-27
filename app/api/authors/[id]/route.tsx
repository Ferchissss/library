import { supabase } from "@/lib/supabaseClient"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authorId = Number.parseInt(params.id)
    const body = await req.json()

    const { error } = await supabase
      .from("authors")
      .update({
        name: body.name,
        nationality: body.nationality || null,
        continent: body.continent || null,
        birth_year: body.birth_year ? Number.parseInt(body.birth_year) : null,
        death_year: body.death_year ? Number.parseInt(body.death_year) : null,
        gender: body.gender || null,
        literary_genre: body.literary_genre || null,
        biography: body.biography || null,
        awards: body.awards || null,
        img_url: body.img_url || null,
      })
      .eq("id", authorId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating author:", error)
    return NextResponse.json({ error: "Error updating author" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authorId = Number.parseInt(params.id)

    const { error } = await supabase.from("authors").delete().eq("id", authorId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting author:", error)
    return NextResponse.json({ error: "Error deleting author" }, { status: 500 })
  }
}
