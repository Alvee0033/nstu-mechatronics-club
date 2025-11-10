import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate quiz questions using Gemini
    const quizPrompt = `${prompt}

Please generate 5 multiple-choice questions from the above content. Each question should have:
- A clear question
- 4 answer options (A, B, C, D)
- One correct answer (specify which option is correct)
- A brief explanation of why the answer is correct

Format your response as a JSON array of objects with these properties:
- "question": string
- "options": array of 4 strings
- "correctAnswer": number (0-3 indicating the correct option index)
- "explanation": string

Do not include any other text or formatting.`;

    const response = await generateAIResponse(quizPrompt);

    // Parse the JSON response
    try {
      const questions = JSON.parse(response);
      return NextResponse.json({ questions });
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ questions });
      }

      // Fallback: return a basic quiz question
      const fallbackQuestions = [
        {
          question: "What does PID stand for in control systems?",
          options: [
            "Proportional-Integral-Derivative",
            "Pressure-Input-Display",
            "Programmable-Interface-Driver",
            "Pulse-Width-Modulation"
          ],
          correctAnswer: 0,
          explanation: "PID stands for Proportional-Integral-Derivative, which are the three terms used in PID controllers for feedback control systems."
        }
      ];

      return NextResponse.json({ questions: fallbackQuestions });
    }
  } catch (error) {
    console.error('Error generating quiz:', error);

    // Return fallback quiz questions
    const fallbackQuestions = [
      {
        question: "What does PID stand for in control systems?",
        options: [
          "Proportional-Integral-Derivative",
          "Pressure-Input-Display",
          "Programmable-Interface-Driver",
          "Pulse-Width-Modulation"
        ],
        correctAnswer: 0,
        explanation: "PID stands for Proportional-Integral-Derivative, which are the three terms used in PID controllers for feedback control systems."
      },
      {
        question: "Which component converts physical quantities into electrical signals?",
        options: [
          "Actuator",
          "Controller",
          "Sensor",
          "Motor"
        ],
        correctAnswer: 2,
        explanation: "Sensors convert physical quantities (like temperature, pressure, position) into electrical signals that can be processed by the control system."
      }
    ];

    return NextResponse.json({ questions: fallbackQuestions });
  }
}