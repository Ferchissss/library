import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 })

    const hfKey = process.env.HF_API_KEY
    if (!hfKey) return NextResponse.json({ error: "Missing HF_API_KEY" }, { status: 500 })

    const response = await fetch(
      "https://router.huggingface.co/stabilityai/stable-diffusion-2-1-mini",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("HF error:", errorText)
      return NextResponse.json({ error: "HF API error", details: errorText }, { status: 500 })
    }

    // convertimos la respuesta a base64
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const url = `data:image/png;base64,${base64}`

    return NextResponse.json({ imageUrl: url })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 })
  }
}
