import { supabase } from "@/lib/supabaseClient"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id
    const body = await req.json()

    // Validate required data
    if (!body.name || !body.unit) {
      return NextResponse.json(
        { error: "Name and unit are required" }, 
        { status: 400 }
      )
    }

    const challengeData = {
      name: body.name,
      icon_name: body.icon_name || null,
      description: body.description || null,
      goal_value: body.goal_value || 0,
      unit: body.unit || null,
      year: body.year || new Date().getFullYear(),
      rule_description: body.rule_description || null,
      query_sql: body.query_sql || null
    }

    const { data, error } = await supabase
      .from("challenges")
      .update(challengeData)
      .eq("id", challengeId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: "Error updating challenge" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id

    const { error } = await supabase
      .from("challenges")
      .delete()
      .eq("id", challengeId)

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true,
      message: "Challenge deleted successfully" 
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting challenge" }, 
      { status: 500 }
    )
  }
}