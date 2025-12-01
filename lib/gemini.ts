import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function generateBookCover(prompt: string, seriesName: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    // Prompt mejorado para portadas de libros
    const enhancedPrompt = `Generate a detailed visual description for a book cover of a series titled "${seriesName}". 
    The prompt provided by the user is: "${prompt}"
    
    Requirements for the cover description:
    1. Book cover style (not illustration, not photo)
    2. Should look like a professional fantasy/sci-fi book cover
    3. Include typography elements for the title
    4. Rich, vivid colors
    5. Epic, atmospheric feel
    
    Respond ONLY with the visual description, nothing else.`
    
    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const text = response.text()
    
    return text
  } catch (error) {
    console.error('Error generating cover description:', error)
    throw error
  }
}