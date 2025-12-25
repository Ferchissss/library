// lib/challenge-ia.ts - VERSIÓN SIN IA
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Esta función ahora genera SQL BASADO EN PLANTILLAS (sin IA)
export async function generateSQLWithAI(challengeData: {
  name: string;
  description: string;
  goal_value: number;
  unit: string;
  year: number;
  rule_description?: string;
}): Promise<string> {
  try {
    // Plantillas de SQL según el tipo de desafío
    const sqlTemplates: Record<string, string> = {
      // Desafío general de libros
      'libro': `
        SELECT COUNT(*) as count 
        FROM books 
        WHERE EXTRACT(YEAR FROM end_date) = ${challengeData.year} 
          AND end_date IS NOT NULL
      `,
      // Desafío por páginas
      'página': `
        SELECT COALESCE(SUM(pages), 0) as count 
        FROM books 
        WHERE EXTRACT(YEAR FROM end_date) = ${challengeData.year} 
          AND end_date IS NOT NULL 
          AND pages IS NOT NULL
      `,
      // Desafío por género
      'género': `
        SELECT COUNT(DISTINCT b.id) as count 
        FROM books b
        JOIN book_genre bg ON b.id = bg.book_id
        JOIN genres g ON bg.genre_id = g.id
        WHERE EXTRACT(YEAR FROM b.end_date) = ${challengeData.year} 
          AND b.end_date IS NOT NULL
          AND LOWER(g.name) LIKE '%${challengeData.name.toLowerCase().split(' ')[0]}%'
      `,
      // Desafío por autor
      'autor': `
        SELECT COUNT(DISTINCT b.id) as count 
        FROM books b
        JOIN authors a ON b.author_id = a.id
        WHERE EXTRACT(YEAR FROM b.end_date) = ${challengeData.year} 
          AND b.end_date IS NOT NULL
          AND LOWER(a.name) LIKE '%${challengeData.name.toLowerCase().split(' ')[0]}%'
      `
    }

    // Determinar qué plantilla usar basado en nombre/descripción
    const challengeName = challengeData.name.toLowerCase()
    const challengeDesc = challengeData.description.toLowerCase()
    const unit = challengeData.unit.toLowerCase()

    let sqlTemplate = sqlTemplates['libro'] // Por defecto
    
    if (unit.includes('página') || challengeName.includes('página') || challengeDesc.includes('página')) {
      sqlTemplate = sqlTemplates['página']
    } else if (challengeName.includes('género') || challengeDesc.includes('género')) {
      sqlTemplate = sqlTemplates['género']
    } else if (challengeName.includes('autor') || challengeDesc.includes('autor')) {
      sqlTemplate = sqlTemplates['autor']
    }

    return sqlTemplate.trim()
  } catch (error: any) {
    console.error('Error generating SQL:', error)
    // SQL por defecto si hay error
    return `
      SELECT COUNT(*) as count 
      FROM books 
      WHERE EXTRACT(YEAR FROM end_date) = ${challengeData.year} 
        AND end_date IS NOT NULL
    `
  }
}

// Esta función selecciona el desafío principal SIN IA
export async function selectMainChallenge(challenges: any[], currentYear: number): Promise<any> {
  try {
    if (!challenges || challenges.length === 0) {
      return null
    }

    // 1. Primero busca desafíos del año actual
    const currentYearChallenges = challenges.filter(c => c.year === currentYear)
    
    if (currentYearChallenges.length > 0) {
      // 2. Priorizar desafíos "generales" por nombre
      const generalKeywords = ['lectura', 'libro', 'anual', 'general', 'retos', 'desafío']
      
      const generalChallenge = currentYearChallenges.find(challenge => 
        generalKeywords.some(keyword => 
          challenge.name.toLowerCase().includes(keyword)
        )
      )
      
      if (generalChallenge) {
        return generalChallenge
      }
      
      // 3. Si no encuentra general, tomar el primero del año
      return currentYearChallenges[0]
    }
    
    // 4. Si no hay del año actual, tomar el primero de cualquier año
    return challenges[0]
  } catch (error) {
    console.error('Error selecting main challenge:', error)
    return challenges[0] || null
  }
}

// Función auxiliar para limpiar SQL (mantener por compatibilidad)
function cleanSQLResponse(sql: string): string {
  return sql.trim()
}