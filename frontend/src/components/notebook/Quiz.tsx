import { useState } from 'react';
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, ThumbsUp, BookOpen } from 'lucide-react';
import GradientCard from '@/components/ui/GradientCard';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizProps {
  documents: Array<{ id: string; name: string; content: string }>;
}

export default function Quiz({ documents }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const generateQuiz = async () => {
    if (documents.length === 0) return;

    setIsGenerating(true);
    try {
      // Combine all document content
      const allContent = documents.map(doc => doc.content).join('\n\n');

      // Generate quiz using AI
      const prompt = `Generate 5 multiple-choice questions about mechatronics from this content. Each question should have 4 options (A, B, C, D) with one correct answer. Include a brief explanation for each correct answer.

Format as JSON array with objects containing: "question", "options" (array of 4 strings), "correctAnswer" (index 0-3), "explanation".

Content: ${allContent.substring(0, 2000)}`;

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedQuestions = data.questions.map((q: any, index: number) => ({
          id: `question-${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }));
        setQuestions(generatedQuestions);
        resetQuiz();
      } else {
        // Fallback questions
        const fallbackQuestions: QuizQuestion[] = [
          {
            id: '1',
            question: 'What does PID stand for in control systems?',
            options: [
              'Proportional-Integral-Derivative',
              'Pressure-Input-Display',
              'Programmable-Interface-Driver',
              'Pulse-Width-Modulation'
            ],
            correctAnswer: 0,
            explanation: 'PID stands for Proportional-Integral-Derivative, which are the three terms used in PID controllers for feedback control systems.'
          },
          {
            id: '2',
            question: 'Which component converts physical quantities into electrical signals?',
            options: ['Actuator', 'Controller', 'Sensor', 'Motor'],
            correctAnswer: 2,
            explanation: 'Sensors convert physical quantities (like temperature, pressure, position) into electrical signals that can be processed by the control system.'
          }
        ];
        setQuestions(fallbackQuestions);
        resetQuiz();
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Use fallback questions
      const fallbackQuestions: QuizQuestion[] = [
        {
          id: '1',
          question: 'What does PID stand for in control systems?',
          options: [
            'Proportional-Integral-Derivative',
            'Pressure-Input-Display',
            'Programmable-Interface-Driver',
            'Pulse-Width-Modulation'
          ],
          correctAnswer: 0,
          explanation: 'PID stands for Proportional-Integral-Derivative, which are the three terms used in PID controllers for feedback control systems.'
        }
      ];
      setQuestions(fallbackQuestions);
      resetQuiz();
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  if (questions.length === 0) {
    return (
      <GradientCard>
        <div className="flex items-center space-x-2 mb-4">
          <Brain size={20} className="text-green-400" />
          <h3 className="text-lg font-semibold text-white">Quiz</h3>
        </div>

        <div className="text-center py-8">
          <Brain size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-white/60 mb-4">
            Test your knowledge with AI-generated quizzes
          </p>
          <button
            onClick={generateQuiz}
            disabled={documents.length === 0 || isGenerating}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </button>
          {documents.length === 0 && (
            <p className="text-sm text-white/40 mt-2">
              Upload documents first to generate a quiz
            </p>
          )}
        </div>
      </GradientCard>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <GradientCard>
        <div className="flex items-center space-x-2 mb-4">
          <Brain size={20} className="text-green-400" />
          <h3 className="text-lg font-semibold text-white">Quiz Complete!</h3>
        </div>

        <div className="text-center py-8">
          <div className="mb-4 flex justify-center">
            {percentage >= 80 ? (
              <Trophy className="w-16 h-16 text-yellow-400" />
            ) : percentage >= 60 ? (
              <ThumbsUp className="w-16 h-16 text-green-400" />
            ) : (
              <BookOpen className="w-16 h-16 text-blue-400" />
            )}
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">
            {score}/{questions.length} Correct
          </h4>
          <p className="text-lg text-white/80 mb-6">
            {percentage}% Score
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={resetQuiz}
              className="px-4 py-2 bg-gray-600/50 hover:bg-gray-500/50 text-white rounded-lg transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={generateQuiz}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
            >
              New Quiz
            </button>
          </div>
        </div>
      </GradientCard>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <GradientCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain size={20} className="text-green-400" />
          <h3 className="text-lg font-semibold text-white">Quiz</h3>
        </div>
        <div className="text-sm text-white/60">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg text-white mb-4">{currentQuestion.question}</h4>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${showResult
                  ? index === currentQuestion.correctAnswer
                    ? 'bg-green-500/20 border-green-500 text-green-100'
                    : index === selectedAnswer
                      ? 'bg-red-500/20 border-red-500 text-red-100'
                      : 'bg-gray-700/50 border-gray-600 text-white/60'
                  : selectedAnswer === index
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-100'
                    : 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50'
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option}</span>
                {showResult && index === currentQuestion.correctAnswer && (
                  <CheckCircle size={16} className="text-green-400 ml-auto" />
                )}
                {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                  <XCircle size={16} className="text-red-400 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h5 className="text-blue-400 font-medium mb-2">Explanation:</h5>
          <p className="text-white/80 text-sm">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="flex justify-between">
        <div className="text-sm text-white/60">
          Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
        </div>
        {showResult && (
          <button
            onClick={nextQuestion}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </GradientCard>
  );
}