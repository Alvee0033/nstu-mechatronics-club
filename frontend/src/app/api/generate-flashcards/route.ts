import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate flashcards using Gemini
    const flashcardsPrompt = `${prompt}

Please generate 8-10 flashcards from the above content. Each flashcard should have:
- A clear, concise question
- A comprehensive but concise answer
- Focus on key concepts, definitions, and important facts

Format your response as a JSON array of objects with "question" and "answer" properties only. Do not include any other text or formatting.`;

    const response = await generateAIResponse(flashcardsPrompt);

    // Parse the JSON response
    try {
      const flashcards = JSON.parse(response);
      return NextResponse.json({ flashcards });
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const flashcards = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ flashcards });
      }

      // Fallback: return a basic flashcard
      const fallbackFlashcards = [
        {
          question: "What is mechatronics?",
          answer: "Mechatronics combines mechanical engineering, electronics, computer science, and control engineering to create intelligent systems."
        }
      ];

      return NextResponse.json({ flashcards: fallbackFlashcards });
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);

    // Return fallback flashcards
    const fallbackFlashcards = [
      {
        question: "What is mechatronics?",
        answer: "Mechatronics combines mechanical engineering, electronics, computer science, and control engineering to create intelligent systems."
      },
      {
        question: "What are sensors used for?",
        answer: "Sensors convert physical quantities into electrical signals that can be processed by control systems."
      }
    ];

    return NextResponse.json({ flashcards: fallbackFlashcards });
  }
}