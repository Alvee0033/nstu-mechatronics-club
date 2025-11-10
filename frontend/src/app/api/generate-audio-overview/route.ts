import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate audio overview script using Gemini
    const audioPrompt = `${prompt}

Please create a concise 2-3 minute audio overview script from the above content. Make it engaging and educational, like a podcast episode. Include:

1. A brief introduction to the topic (30 seconds)
2. Key concepts and explanations (1-2 minutes)
3. Practical applications or examples (30 seconds)
4. A conclusion with key takeaways (30 seconds)

Keep it conversational and suitable for audio presentation. Use approximately 600-800 words. Make it sound natural when spoken, not like written text.

Format your response as plain text that can be read aloud naturally.`;

    const response = await generateAIResponse(audioPrompt);

    return NextResponse.json({ overview: response });
  } catch (error) {
    console.error('Error generating audio overview:', error);

    // Return fallback overview
    const fallbackOverview = `Welcome to this audio overview of mechatronics concepts.

Mechatronics combines mechanical engineering, electronics, and computer science to create intelligent systems. Key components include sensors that detect changes in the environment, actuators that perform physical actions, and controllers that process information and make decisions.

In mechatronics systems, you'll find various sensors like proximity sensors, temperature sensors, and encoders. These sensors provide feedback to the control system. Actuators, such as motors and solenoids, execute the physical movements based on controller commands.

One of the fundamental concepts in mechatronics is feedback control. PID controllers, which stand for Proportional-Integral-Derivative, are commonly used to maintain system stability and achieve desired performance.

Practical applications of mechatronics include robotics, automated manufacturing, automotive systems, and consumer electronics. For example, modern cars use mechatronic systems for engine management, anti-lock brakes, and adaptive cruise control.

As you continue your journey in mechatronics, remember that integration of mechanical, electrical, and software components is key to creating innovative solutions. Keep experimenting and learning!`;

    return NextResponse.json({ overview: fallbackOverview });
  }
}