import { NextRequest, NextResponse } from 'next/server';
import { generateSQLWithAI } from '@/lib/gemini-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, goal_value, unit, year, rule_description } = body;

    // Validate required data
    if (!name || !unit || !year) {
      return NextResponse.json(
        { error: 'Name, unit and year are required' },
        { status: 400 }
      );
    }

    // Generate SQL with AI
    const generatedSQL = await generateSQLWithAI({
      name,
      description: description || '',
      goal_value: goal_value || 0,
      unit,
      year,
      rule_description: rule_description || ''
    });

    return NextResponse.json({ 
      sql: generatedSQL,
      note: 'SQL query generated with Google Gemini'
    });
    
  } catch (error) {
    console.error('Error generating SQL:', error);

    let message = 'Unknown error';

    if (error instanceof Error) {
      message = error.message;
    }

    const fallbackSQL = `SELECT COUNT(*) as count FROM books 
      WHERE EXTRACT(YEAR FROM end_date) = ${new Date().getFullYear()} 
      AND end_date IS NOT NULL`;

    return NextResponse.json({
      sql: fallbackSQL,
      note: 'Basic SQL due to AI generation error',
      error: message
    }, { status: 500 });
  }
}