'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Play, Plus, Trash2, Code, FileText, Send, Bot, User, BookOpen, Brain, Volume2, Network } from 'lucide-react';
import GradientCard from '@/components/ui/GradientCard';
import DocumentUpload from '@/components/notebook/DocumentUpload';
import Flashcards from '@/components/notebook/Flashcards';
import Quiz from '@/components/notebook/Quiz';
import AudioOverview from '@/components/notebook/AudioOverview';
import MindMap from '@/components/notebook/MindMap';
import { generateAIResponse, executeCode } from '@/lib/gemini';

interface NotebookCell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  output?: string;
  isRunning?: boolean;
  error?: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: Date;
}

type ActiveTool = 'notebook' | 'flashcards' | 'quiz' | 'audio' | 'mindmap';

export default function NotebookPage() {
  const [cells, setCells] = useState<NotebookCell[]>([
    {
      id: '1',
      type: 'markdown',
      content: '# Welcome to NSTU Mechatronics AI Research Assistant\n\nThis interactive notebook allows you to write code, run experiments, and get AI-powered assistance for your mechatronics projects.\n\nTry running the code cell below!'
    },
    {
      id: '2',
      type: 'code',
      content: 'print("Hello, NSTU Mechatronics Club!")\nprint("Welcome to our AI Research Assistant!")'
    }
  ]);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiConversation, setAiConversation] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [activeTool, setActiveTool] = useState<ActiveTool>('notebook');
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);

  const handleDocumentProcessed = (document: UploadedDocument) => {
    setUploadedDocuments(prev => [...prev, document]);
  };

  const addCell = (type: 'code' | 'markdown', afterId?: string) => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type,
      content: type === 'code' ? '# Write your Python code here\nprint("Hello World")' : '# Write your markdown here\n\n**Bold text** and *italic text*'
    };

    setCells(prev => {
      if (!afterId) return [...prev, newCell];

      const index = prev.findIndex(cell => cell.id === afterId);
      if (index === -1) return [...prev, newCell];

      return [...prev.slice(0, index + 1), newCell, ...prev.slice(index + 1)];
    });
  };

  const updateCell = (id: string, content: string) => {
    setCells(prev => prev.map(cell =>
      cell.id === id ? { ...cell, content } : cell
    ));
  };

  const deleteCell = (id: string) => {
    setCells(prev => prev.filter(cell => cell.id !== id));
  };

  const runCell = async (id: string) => {
    const cell = cells.find(c => c.id === id);
    if (!cell) return;

    setCells(prev => prev.map(cell =>
      cell.id === id ? { ...cell, isRunning: true, error: undefined } : cell
    ));

    try {
      const result = await executeCode(cell.content);
      setCells(prev => prev.map(cell =>
        cell.id === id ? { ...cell, output: result.output, error: result.error, isRunning: false } : cell
      ));
    } catch (error) {
      setCells(prev => prev.map(cell =>
        cell.id === id ? { ...cell, error: 'Failed to execute code', isRunning: false } : cell
      ));
    }
  };

  const askAI = async (question: string) => {
    setIsAiThinking(true);
    setAiConversation(prev => [...prev, { role: 'user', content: question }]);

    try {
      const response = await generateAIResponse(question);
      setAiConversation(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setAiConversation(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please check your API key configuration and try again.' }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Research Assistant
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Interactive notebook for mechatronics research, coding experiments, and AI-powered assistance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Tools */}
          <div className="lg:col-span-1 space-y-6">
            {/* Document Upload */}
            <DocumentUpload onDocumentProcessed={handleDocumentProcessed} />

            {/* Tool Navigation */}
            <GradientCard>
              <h3 className="text-lg font-semibold text-white mb-4">Tools</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTool('notebook')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTool === 'notebook'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-white/60 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Code size={16} />
                    <span>Notebook</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTool('flashcards')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTool === 'flashcards'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-white/60 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} />
                    <span>Flashcards</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTool('quiz')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTool === 'quiz'
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-white/60 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Brain size={16} />
                    <span>Quiz</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTool('audio')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTool === 'audio'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-white/60 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Volume2 size={16} />
                    <span>Audio</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTool('mindmap')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTool === 'mindmap'
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'text-white/60 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Network size={16} />
                    <span>Mind Map</span>
                  </div>
                </button>
              </div>
            </GradientCard>

            {/* AI Assistant Panel */}
            <GradientCard className="sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Bot size={24} className="text-cyan-400" />
                <h3 className="text-xl font-bold text-white">AI Assistant</h3>
              </div>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {aiConversation.length === 0 ? (
                  <div className="text-center text-white/40 py-8">
                    <Bot size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Ask me anything about mechatronics, coding, or research!</p>
                  </div>
                ) : (
                  aiConversation.map((message, index) => (
                    <div key={index} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role === 'assistant' && <Bot size={16} className="text-cyan-400 mt-1 flex-shrink-0" />}
                      <div className={`flex-1 p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-cyan-500/20 text-cyan-100 ml-8'
                          : 'bg-gray-800/50 text-white'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === 'user' && <User size={16} className="text-cyan-400 mt-1 flex-shrink-0" />}
                    </div>
                  ))
                )}

                {isAiThinking && (
                  <div className="flex items-start space-x-3">
                    <Bot size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 p-3 rounded-lg bg-gray-800/50">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask about mechatronics, coding..."
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        askAI(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder*="Ask about"]') as HTMLInputElement;
                      if (input?.value.trim()) {
                        askAI(input.value.trim());
                        input.value = '';
                      }
                    }}
                    disabled={isAiThinking}
                    className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </GradientCard>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTool === 'notebook' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Research Notebook</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addCell('markdown')}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                    >
                      <FileText size={16} />
                      <span>Add Text</span>
                    </button>
                    <button
                      onClick={() => addCell('code')}
                      className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                    >
                      <Code size={16} />
                      <span>Add Code</span>
                    </button>
                  </div>
                </div>

                {cells.map((cell, index) => (
                  <motion.div
                    key={cell.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GradientCard className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {cell.type === 'code' ? (
                            <Code size={18} className="text-cyan-400" />
                          ) : (
                            <FileText size={18} className="text-purple-400" />
                          )}
                          <span className="text-sm font-medium text-white/60 uppercase tracking-wide">
                            {cell.type === 'code' ? 'Python Code' : 'Markdown'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {cell.type === 'code' && (
                            <button
                              onClick={() => runCell(cell.id)}
                              disabled={cell.isRunning}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors disabled:opacity-50"
                            >
                              <Play size={14} />
                              <span className="text-sm">{cell.isRunning ? 'Running...' : 'Run'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => addCell('code', cell.id)}
                            className="p-1 text-white/40 hover:text-cyan-400 transition-colors"
                            title="Add code cell below"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => addCell('markdown', cell.id)}
                            className="p-1 text-white/40 hover:text-purple-400 transition-colors"
                            title="Add text cell below"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => deleteCell(cell.id)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
                            title="Delete cell"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {cell.type === 'code' ? (
                          <textarea
                            value={cell.content}
                            onChange={(e) => updateCell(cell.id, e.target.value)}
                            className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-green-400 font-mono text-sm resize-y focus:outline-none focus:border-cyan-500"
                            placeholder="Write your Python code here..."
                          />
                        ) : (
                          <textarea
                            value={cell.content}
                            onChange={(e) => updateCell(cell.id, e.target.value)}
                            className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-y focus:outline-none focus:border-purple-500"
                            placeholder="Write your markdown here..."
                          />
                        )}

                        {cell.output && (
                          <div className="bg-black/30 border border-gray-700 rounded-lg p-4">
                            <div className="text-sm text-white/60 mb-2">Output:</div>
                            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{cell.output}</pre>
                          </div>
                        )}

                        {cell.error && (
                          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                            <div className="text-sm text-red-400 mb-2">Error:</div>
                            <pre className="text-red-300 font-mono text-sm">{cell.error}</pre>
                          </div>
                        )}
                      </div>
                    </GradientCard>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTool === 'flashcards' && (
              <Flashcards documents={uploadedDocuments} />
            )}

            {activeTool === 'quiz' && (
              <Quiz documents={uploadedDocuments} />
            )}

            {activeTool === 'audio' && (
              <AudioOverview documents={uploadedDocuments} />
            )}

            {activeTool === 'mindmap' && (
              <MindMap documents={uploadedDocuments} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}