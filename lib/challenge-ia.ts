import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function generateSQLWithAI(challengeData: {
  name: string;
  description: string;
  goal_value: number;
  unit: string;
  year: number;
  rule_description?: string;
}): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500,
      }
    });

    const prompt = `
Generate a PostgreSQL SQL query for a reading challenge.

DATABASE SCHEMA:
- books: id, title, author_id, rating, type, start_date, end_date, year, pages, publisher, language, era, format, audience, reading_difficulty, favorite, awards, summary, review, main_characters, favorite_character, image_url, series_id
- authors: id, name, nationality, continent, birth_year, death_year, gender, literary_genre, biography, awards, img_url
- genres: id, name, description
- book_genre: book_id, genre_id

CHALLENGE: ${challengeData.name}
DESCRIPTION: ${challengeData.description}
GOAL: ${challengeData.goal_value} ${challengeData.unit}
YEAR: ${challengeData.year}
RULES: ${challengeData.rule_description || 'Count books read in the specified year'}

REQUIREMENTS:
- Return exactly one column named "count"
- Filter by: EXTRACT(YEAR FROM end_date) = ${challengeData.year} AND end_date IS NOT NULL
- Use appropriate JOINs if needed
- Return only the SQL query, no explanations

SQL QUERY:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sql = response.text().trim();

    return cleanSQLResponse(sql);
  } catch (error: any) {
    console.error('Error generating SQL with Gemini:', error);
    throw new Error('Could not generate SQL query with AI');
  }
}

export async function selectMainChallenge(challenges: any[], currentYear: number): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
      }
    });

    const prompt = `
ANALYZE these reading challenges and select the MAIN/GENERAL challenge for year ${currentYear}.

CRITERIA for main challenge:
- Should be a general reading challenge (not specific to genre, author, or theme)
- Should measure books or reading progress
- Should be the primary annual challenge

CHALLENGES:
${challenges.map((c, i) => `${i + 1}. "${c.name}" - ${c.description} (Goal: ${c.goal_value} ${c.unit})`).join('\n')}

Respond ONLY with the number (1, 2, 3, etc.) of the selected challenge. If none seem appropriate, respond with "1".
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const selection = response.text().trim();

    const selectedIndex = parseInt(selection) - 1;
    return challenges[selectedIndex] || challenges[0];
  } catch (error) {
    console.error('Error selecting main challenge with AI:', error);
    return challenges[0];
  }
}

function cleanSQLResponse(sql: string): string {
  return sql
    .replace(/```sql|```|sql/gi, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim();
}