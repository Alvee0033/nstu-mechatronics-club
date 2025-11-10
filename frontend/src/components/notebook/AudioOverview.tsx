import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import GradientCard from '@/components/ui/GradientCard';

interface AudioOverviewProps {
  documents: Array<{ id: string; name: string; content: string }>;
}

export default function AudioOverview({ documents }: AudioOverviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Select a default English voice
      const englishVoice = availableVoices.find(voice =>
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || availableVoices.find(voice => voice.lang.startsWith('en'));

      setSelectedVoice(englishVoice || availableVoices[0]);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const generateAudioOverview = async () => {
    if (documents.length === 0) return;

    setIsGenerating(true);
    try {
      // Combine all document content
      const allContent = documents.map(doc => doc.content).join('\n\n');

      // Generate audio overview using AI
      const prompt = `Create a concise 2-3 minute audio overview script from this content about mechatronics. Make it engaging and educational, like a podcast episode. Include:

1. A brief introduction to the topic
2. Key concepts and explanations
3. Practical applications
4. A conclusion with key takeaways

Keep it conversational and suitable for audio presentation. Limit to about 800-1000 words.

Content: ${allContent.substring(0, 3000)}`;

      const response = await fetch('/api/generate-audio-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentText(data.overview);
      } else {
        // Fallback overview
        setCurrentText(`Welcome to this audio overview of mechatronics concepts.

Mechatronics combines mechanical engineering, electronics, and computer science to create intelligent systems. Key components include sensors that detect changes in the environment, actuators that perform physical actions, and controllers that process information and make decisions.

In mechatronics systems, you'll find various sensors like proximity sensors, temperature sensors, and encoders. These sensors provide feedback to the control system. Actuators, such as motors and solenoids, execute the physical movements based on controller commands.

One of the fundamental concepts in mechatronics is feedback control. PID controllers, which stand for Proportional-Integral-Derivative, are commonly used to maintain system stability and achieve desired performance.

Practical applications of mechatronics include robotics, automated manufacturing, automotive systems, and consumer electronics. For example, modern cars use mechatronic systems for engine management, anti-lock brakes, and adaptive cruise control.

As you continue your journey in mechatronics, remember that integration of mechanical, electrical, and software components is key to creating innovative solutions. Keep experimenting and learning!`);
      }
    } catch (error) {
      console.error('Error generating audio overview:', error);
      // Use fallback overview
      setCurrentText('Welcome to the NSTU Mechatronics Club audio overview. This feature allows you to listen to summaries of your uploaded documents and research materials.');
    } finally {
      setIsGenerating(false);
    }
  };

  const speak = () => {
    if (!currentText || !selectedVoice) return;

    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.voice = selectedVoice;
    utterance.rate = 0.9; // Slightly slower for educational content
    utterance.pitch = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  const pause = () => {
    speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    speechSynthesis.resume();
    setIsPlaying(true);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleVoiceChange = (voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  if (!currentText) {
    return (
      <GradientCard>
        <div className="flex items-center space-x-2 mb-4">
          <Volume2 size={20} className="text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Audio Overview</h3>
        </div>

        <div className="text-center py-8">
          <Volume2 size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-white/60 mb-4">
            Generate podcast-style audio summaries of your documents
          </p>
          <button
            onClick={generateAudioOverview}
            disabled={documents.length === 0 || isGenerating}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Audio Overview'}
          </button>
          {documents.length === 0 && (
            <p className="text-sm text-white/40 mt-2">
              Upload documents first to generate audio overview
            </p>
          )}
        </div>
      </GradientCard>
    );
  }

  return (
    <GradientCard>
      <div className="flex items-center space-x-2 mb-4">
        <Volume2 size={20} className="text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Audio Overview</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-white/80 mb-2">Voice:</label>
        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        {!isPlaying ? (
          <button
            onClick={speak}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors"
          >
            <Play size={16} />
            <span>Play</span>
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors"
          >
            <Pause size={16} />
            <span>Pause</span>
          </button>
        )}

        <button
          onClick={stop}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-500/50 text-white rounded-lg transition-colors"
        >
          <VolumeX size={16} />
          <span>Stop</span>
        </button>

        <button
          onClick={generateAudioOverview}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw size={16} />
          <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
        </button>
      </div>

      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
        <div className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
          {currentText}
        </div>
      </div>

      <div className="mt-4 text-xs text-white/40">
        Audio playback uses your browser's text-to-speech engine
      </div>
    </GradientCard>
  );
}