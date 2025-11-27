import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_GEMINI_API_KEY no está configurada' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Usar modelo actual
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
      }
    });

    console.log('🔧 Probando con modelo gemini-2.0-flash...');
    
    const prompt = "Responde con solo la palabra 'CONEXION_EXITOSA'";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log('✅ Respuesta de Gemini 2.0:', text);

    return NextResponse.json({
      status: 'success',
      message: 'Conexión exitosa con Gemini 2.0',
      response: text,
      model: 'gemini-2.0-flash'
    });

  } catch (error: any) {
    console.error('❌ Error con Gemini 2.0:', error);

    return NextResponse.json({
      status: 'error',
      message: 'Error conectando con Gemini 2.0',
      error: error.message
    }, { status: 500 });
  }
}