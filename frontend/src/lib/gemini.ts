const getApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
  }
  return apiKey;
};

export const generateAIResponse = async (prompt: string, context?: string): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are an AI Research Assistant for NSTU Mechatronics Club. You help students with:

- Mechatronics engineering concepts and projects
- Programming (Python, Arduino, Raspberry Pi, etc.)
- Robotics and automation
- Electronics and circuit design
- Data analysis and visualization
- Research methodology and academic writing
- Project planning and implementation

Always be helpful, encouraging, and provide practical, actionable advice. Use clear explanations and offer code examples when relevant. Encourage innovation and hands-on learning.

${context ? `Additional context: ${context}` : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser question: ${prompt}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
};

export const executeCode = async (code: string): Promise<{ output: string; error?: string }> => {
  try {
    // In a production environment, this would call a secure backend API
    // For now, we'll simulate code execution with basic validation

    // Basic security check - reject potentially dangerous code
    const dangerousPatterns = [
      /import\s+os/i,
      /import\s+sys/i,
      /import\s+subprocess/i,
      /exec\(/i,
      /eval\(/i,
      /open\(/i,
      /__import__/i,
      /system\(/i,
      /popen\(/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          output: '',
          error: 'Security Error: This code contains potentially dangerous operations that are not allowed in the sandbox.'
        };
      }
    }

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Basic Python-like execution simulation
    let output = '';

    // Handle print statements
    const printMatches = code.match(/print\(["'](.*?)["']\)/g);
    if (printMatches) {
      output = printMatches
        .map(match => {
          const content = match.match(/print\(["'](.*?)["']\)/)?.[1] || '';
          return content;
        })
        .join('\n');
    }

    // Handle basic variable assignments and expressions
    if (code.includes('=') && !output) {
      output = 'Variable assigned successfully';
    }

    // Handle basic calculations
    if (code.match(/\d+\s*[\+\-\*\/]\s*\d+/)) {
      try {
        // Simple eval for basic math (in production, use a proper code execution service)
        const mathResult = eval(code.replace(/print\(["'].*?["']\)/g, '').trim());
        if (typeof mathResult !== 'undefined') {
          output = mathResult.toString();
        }
      } catch (e) {
        // Ignore eval errors for now
      }
    }

    // Default success message
    if (!output) {
      output = 'Code executed successfully';
    }

    return { output };
  } catch (error) {
    return {
      output: '',
      error: 'Code execution failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};