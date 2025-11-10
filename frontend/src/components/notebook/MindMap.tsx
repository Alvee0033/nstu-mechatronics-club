import { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import { Network, RotateCcw } from 'lucide-react';
import GradientCard from '@/components/ui/GradientCard';

import 'reactflow/dist/style.css';

interface MindMapProps {
  documents: Array<{ id: string; name: string; content: string }>;
}

export default function MindMap({ documents }: MindMapProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Initial nodes and edges
  const initialNodes: Node[] = [
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
  ];

  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const generateMindMap = async () => {
    if (documents.length === 0) return;

    setIsGenerating(true);
    try {
      // Combine all document content
      const allContent = documents.map(doc => doc.content).join('\n\n');

      // Generate mind map structure using AI
      const prompt = `Create a mind map structure for mechatronics concepts from this content. Identify the main topic, key subtopics, and their relationships.

Format as JSON with:
{
  "nodes": [
    {"id": "1", "label": "Main Topic", "position": {"x": 250, "y": 250}},
    {"id": "2", "label": "Subtopic 1", "position": {"x": 100, "y": 150}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"}
  ]
}

Content: ${allContent.substring(0, 2000)}`;

      const response = await fetch('/api/generate-mind-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedNodes = data.nodes.map((node: any) => ({
          ...node,
          type: 'default',
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '2px solid #06b6d4',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '12px',
            minWidth: '80px',
            textAlign: 'center' as const,
          },
        }));
        setNodes(generatedNodes);
        setEdges(data.edges);
      } else {
        // Fallback mind map
        const fallbackNodes: Node[] = [
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
        ];

        const fallbackEdges: Edge[] = [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e1-3', source: '1', target: '3' },
          { id: 'e1-4', source: '1', target: '4' },
        ];

        setNodes(fallbackNodes);
        setEdges(fallbackEdges);
      }
    } catch (error) {
      console.error('Error generating mind map:', error);
      // Use fallback mind map
      const fallbackNodes: Node[] = [
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
      ];
      setNodes(fallbackNodes);
      setEdges([]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <GradientCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Network size={20} className="text-pink-400" />
          <h3 className="text-lg font-semibold text-white">Mind Map</h3>
        </div>
        <button
          onClick={generateMindMap}
          disabled={documents.length === 0 || isGenerating}
          className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded text-sm transition-colors disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Map'}
        </button>
      </div>

      {documents.length === 0 && (
        <div className="text-center py-8">
          <Network size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-white/60">
            Upload documents to generate a visual mind map
          </p>
        </div>
      )}

      {documents.length > 0 && (
        <div className="h-96 border border-gray-700 rounded-lg overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap
              nodeColor="#1e293b"
              maskColor="#0f172a"
              style={{
                background: '#0f172a',
                border: '1px solid #374151',
              }}
            />
            <Background color="#374151" gap={16} />
          </ReactFlow>
        </div>
      )}

      <div className="mt-4 text-xs text-white/40">
        Drag nodes to reposition • Connect nodes by dragging from node edges
      </div>
    </GradientCard>
  );
}