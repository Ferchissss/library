// app/api/challenges/route.ts
import { supabase } from "@/lib/supabaseClient"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1
    const { data: challenges, error } = await supabase
      .from("challenges")
      .select("*")
      .in("year", [currentYear, previousYear])
      .order("year", { ascending: false })
      .order("id", { ascending: false })

    if (error) {
      throw error
    }

    const challengesWithProgress = await Promise.all(
      (challenges || []).map(async (challenge) => {
        try {
          if (!challenge.query_sql) {
            return { 
              ...challenge, 
              current_progress: 0, 
              status: challenge.year === previousYear ? "Expired" : "Pending" 
            }
          }

          const { data: progressData, error: progressError } = await supabase
            .rpc('exec_sql', { query: challenge.query_sql })

          let currentProgress = 0
          
          if (!progressError && progressData && progressData.length > 0) {
            currentProgress = progressData[0].count || 0
          }

          let status
          if (challenge.year === previousYear) {
            // For challenges from previous year, check if completed
            status = currentProgress >= (challenge.goal_value || 0) 
              ? "Completed" 
              : "Expired"
          } else {
            // For challenges from current year
            status = currentProgress >= (challenge.goal_value || 0) 
              ? "Completed" 
              : "In Progress"
          }

          return {
            ...challenge,
            current_progress: currentProgress,
            status,
          }

        } catch (error) {
          return { 
            ...challenge, 
            current_progress: 0, 
            status: challenge.year === previousYear ? "Expired" : "Error" 
          }
        }
      })
    )

    return NextResponse.json(challengesWithProgress)

  } catch (error) {
    return NextResponse.json(
      { error: "Error getting challenges" }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.name || !body.query_sql) {
      return NextResponse.json(
        { error: "Name and query_sql are required" }, 
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
      query_sql: body.query_sql,
    }

    const { data, error } = await supabase
      .from("challenges")
      .insert(challengeData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: "Error creating challenge" }, 
      { status: 500 }
    )
  }
}