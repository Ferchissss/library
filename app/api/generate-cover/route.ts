import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Pollinations.ai - Generate image
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&model=flux&nologo=true&enhance=true`

    console.log('Generating image...')
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error('Failed to generate image with Pollinations')
    }

    // Get the image as blob
    const imageBlob = await response.blob()
    console.log('Image generated, size:', imageBlob.size)

    // Configure Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileName = `cover-${timestamp}-${randomString}.jpg`

    console.log('Uploading to Supabase Storage...')

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('series-covers')
      .upload(fileName, imageBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log('Upload successful:', uploadData)

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('series-covers')
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl

    console.log('Public URL:', publicUrl)

    return NextResponse.json({ imageUrl: publicUrl })

  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}