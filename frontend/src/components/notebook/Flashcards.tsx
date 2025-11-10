import { useState } from 'react';
import { BookOpen, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import GradientCard from '@/components/ui/GradientCard';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardsProps {
  documents: Array<{ id: string; name: string; content: string }>;
}

export default function Flashcards({ documents }: FlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFlashcards = async () => {
    if (documents.length === 0) return;

    setIsGenerating(true);
    try {
      // Combine all document content
      const allContent = documents.map(doc => doc.content).join('\n\n');

      // Generate flashcards using AI
      const prompt = `Generate 10 flashcards from this content about mechatronics. Each flashcard should have a clear question and concise answer. Format as JSON array with objects containing "question" and "answer" fields.

Content: ${allContent.substring(0, 2000)}`; // Limit content length

      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedCards = data.flashcards.map((card: any, index: number) => ({
          id: `card-${index}`,
          question: card.question,
          answer: card.answer
        }));
        setFlashcards(generatedCards);
        setCurrentCardIndex(0);
        setShowAnswer(false);
      } else {
        // Fallback: generate basic flashcards
        const fallbackCards: Flashcard[] = [
          {
            id: '1',
            question: 'What is mechatronics?',
            answer: 'Mechatronics combines mechanical engineering, electronics, computer science, and control engineering.'
          },
          {
            id: '2',
            question: 'What are the main components of a mechatronic system?',
            answer: 'Sensors, actuators, controllers, and mechanical components.'
          },
          {
            id: '3',
            question: 'What is PID control?',
            answer: 'PID stands for Proportional-Integral-Derivative control, a feedback mechanism used in control systems.'
          }
        ];
        setFlashcards(fallbackCards);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      // Use fallback cards
      const fallbackCards: Flashcard[] = [
        {
          id: '1',
          question: 'What is mechatronics?',
          answer: 'Mechatronics combines mechanical engineering, electronics, computer science, and control engineering.'
        }
      ];
      setFlashcards(fallbackCards);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const resetCards = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (flashcards.length === 0) {
    return (
      <GradientCard>
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen size={20} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Flashcards</h3>
        </div>

        <div className="text-center py-8">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-white/60 mb-4">
            Generate flashcards from your uploaded documents
          </p>
          <button
            onClick={generateFlashcards}
            disabled={documents.length === 0 || isGenerating}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Flashcards'}
          </button>
          {documents.length === 0 && (
            <p className="text-sm text-white/40 mt-2">
              Upload documents first to generate flashcards
            </p>
          )}
        </div>
      </GradientCard>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <GradientCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen size={20} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Flashcards</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetCards}
            className="p-1 text-white/40 hover:text-white transition-colors"
            title="Reset to first card"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={generateFlashcards}
            disabled={isGenerating}
            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-sm transition-colors disabled:opacity-50"
          >
            {isGenerating ? '...' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="text-center mb-4">
        <span className="text-sm text-white/60">
          Card {currentCardIndex + 1} of {flashcards.length}
        </span>
      </div>

      <div
        className="min-h-48 flex items-center justify-center cursor-pointer"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <div className="text-center p-6">
          <div className="mb-4">
            <div className="text-sm text-white/60 mb-2">
              {showAnswer ? 'Answer' : 'Question'}
            </div>
            <div className="text-lg text-white leading-relaxed">
              {showAnswer ? currentCard.answer : currentCard.question}
            </div>
          </div>
          <div className="text-sm text-white/40">
            Click to {showAnswer ? 'hide' : 'reveal'} answer
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevCard}
          disabled={currentCardIndex === 0}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="flex space-x-1">
          {flashcards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentCardIndex ? 'bg-purple-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          disabled={currentCardIndex === flashcards.length - 1}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </GradientCard>
  );
}