import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate mind map structure using Gemini
    const mindMapPrompt = `${prompt}

Please create a mind map structure for the key concepts from the above content. Identify:
- The main topic (central node)
- 4-6 major subtopics (connected to center)
- 2-3 sub-concepts for each major subtopic

Format your response as JSON with this structure:
{
  "nodes": [
    {"id": "1", "label": "Main Topic", "position": {"x": 250, "y": 250}},
    {"id": "2", "label": "Subtopic 1", "position": {"x": 100, "y": 150}},
    ...
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    ...
  ]
}

Position nodes in a circular layout around the center. Use reasonable x,y coordinates for visualization.`;

    const response = await generateAIResponse(mindMapPrompt);

    // Parse the JSON response
    try {
      const mindMapData = JSON.parse(response);
      return NextResponse.json(mindMapData);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const mindMapData = JSON.parse(jsonMatch[0]);
        return NextResponse.json(mindMapData);
      }

      // Fallback: return a basic mind map
      const fallbackMindMap = {
        nodes: [
          {
            id: '1',
            type: 'default',
            position: { x: 250, y: 250 },
            data: { label: 'Mechatronics' },
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '2px solid #06b6d4',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
            },
          },
          {
            id: '2',
            type: 'default',
            position: { x: 100, y: 150 },
            data: { label: 'Sensors' },
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '2px solid #10b981',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '12px',
            },
          },
          {
            id: '3',
            type: 'default',
            position: { x: 400, y: 150 },
            data: { label: 'Actuators' },
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '2px solid #f59e0b',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '12px',
            },
          },
          {
            id: '4',
            type: 'default',
            position: { x: 250, y: 350 },
            data: { label: 'Control Systems' },
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '12px',
            },
          },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e1-3', source: '1', target: '3' },
          { id: 'e1-4', source: '1', target: '4' },
        ],
      };

      return NextResponse.json(fallbackMindMap);
    }
  } catch (error) {
    console.error('Error generating mind map:', error);

    // Return fallback mind map
    const fallbackMindMap = {
      nodes: [
        {
          id: '1',
          type: 'default',
          position: { x: 250, y: 250 },
          data: { label: 'Mechatronics' },
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '2px solid #06b6d4',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
      ],
      edges: [],
    };

    return NextResponse.json(fallbackMindMap);
  }
}