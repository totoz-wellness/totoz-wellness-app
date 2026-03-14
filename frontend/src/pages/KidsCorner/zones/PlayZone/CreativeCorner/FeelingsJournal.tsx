import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Mood = 'happy' | 'excited' | 'calm' | 'sad' | 'worried' | 'angry';

const MOODS = [
  { type: 'happy' as Mood, emoji: '😊', label: 'Happy', color: 'yellow' },
  { type: 'excited' as Mood, emoji: '🤩', label: 'Excited', color: 'orange' },
  { type: 'calm' as Mood, emoji: '😌', label: 'Calm', color: 'blue' },
  { type: 'sad' as Mood, emoji: '😢', label: 'Sad', color: 'gray' },
  { type: 'worried' as Mood, emoji: '😟', label: 'Worried', color: 'purple' },
  { type: 'angry' as Mood, emoji: '😠', label: 'Angry', color: 'red' },
];

const PROMPTS = [
  "Today I felt... because...",
  "Something that made me smile today was...",
  "If I could tell my future self one thing, it would be...",
  "I'm grateful for...",
  "A challenge I faced today was...",
  "My favorite moment today was...",
  "Something I learned about myself is...",
  "Tomorrow I want to...",
];

const FeelingsJournal: React.FC<Props> = ({ onComplete, onBack }) => {
  const [entry, setEntry] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[0]);
  const [showPrompts, setShowPrompts] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const handleChange = (text: string) => {
    setEntry(text);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleSave = () => {
    if (wordCount < 10) {
      toast.error('Write at least 10 words to save your journal entry! 📝', {
        duration: 3000,
      });
      return;
    }

    if (!selectedMood) {
      toast.error('Pick a mood before saving! 😊', {
        duration: 3000,
      });
      return;
    }

    // Save successful
    toast.success('📔 Journal entry saved! Great job expressing yourself!', {
      duration: 3000,
      icon: '✨',
    });

    setHasCompleted(true);
    
    setTimeout(() => {
      onComplete();
      setEntry('');
      setWordCount(0);
      setSelectedMood(null);
    }, 500);
  };

  const usePrompt = (prompt: string) => {
    setEntry(prompt + ' ');
    setCurrentPrompt(prompt);
    setShowPrompts(false);
    toast('Prompt added! Start writing! ✍️', { icon: '💡' });
  };

  const progress = Math.min((wordCount / 10) * 100, 100);
  const moodSelected = selectedMood !== null;

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="bg-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          ⬅ Back
        </button>
        <h2 className="text-2xl md:text-3xl font-black text-pink-800 flex items-center gap-3">
          <span className="text-4xl">📔</span> My Secret Journal
        </h2>
      </div>

      {/* Intro Card */}
      <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-6 rounded-2xl border-2 border-pink-200 shadow-lg">
        <div className="flex items-start gap-4">
          <span className="text-5xl">✨</span>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Your Safe Writing Space</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              This is your private journal where you can write about anything! 
              Your feelings, dreams, adventures, or just your day. 
              Everything you write here is safe and private. 🔒
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Pick Your Mood */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <span className="text-2xl">💭</span> Step 1: How are you feeling?
          </h4>
          {moodSelected && <span className="text-2xl">✅</span>}
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.type}
              onClick={() => setSelectedMood(mood.type)}
              className={`p-4 rounded-2xl border-2 transition-all transform ${
                selectedMood === mood.type
                  ? 'border-pink-400 bg-pink-50 scale-110 shadow-lg'
                  : 'border-gray-200 hover:border-pink-200 hover:scale-105 hover:bg-gray-50'
              }`}
            >
              <div className="text-4xl mb-2">{mood.emoji}</div>
              <div className="text-xs font-bold text-gray-700">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Writing Prompts */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <span className="text-2xl">💡</span> Step 2: Need inspiration?
          </h4>
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold hover:bg-purple-200 transition-all"
          >
            {showPrompts ? 'Hide Prompts' : 'Show Prompts'}
          </button>
        </div>

        {showPrompts && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => usePrompt(prompt)}
                className="text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all group"
              >
                <span className="text-sm text-purple-700 font-medium group-hover:font-bold">
                  "{prompt}"
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Write Your Entry */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <span className="text-2xl">✍️</span> Step 3: Start writing!
          </h4>
          {wordCount >= 10 && <span className="text-2xl">✅</span>}
        </div>

        {/* Progress Bar */}
        <div className="bg-pink-50 p-4 rounded-xl mb-4 border-2 border-pink-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-pink-700">Writing Progress</span>
            <span className="text-2xl">{wordCount >= 10 ? '✅' : '✍️'}</span>
          </div>
          <div className="w-full bg-white rounded-full h-4 overflow-hidden border border-pink-300 shadow-inner">
            <div 
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 h-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              {progress > 15 && (
                <span className="text-xs font-bold text-white">{wordCount} words</span>
              )}
            </div>
          </div>
          <p className="text-sm text-pink-600 mt-2">
            {wordCount < 10 
              ? `Write ${10 - wordCount} more ${10 - wordCount === 1 ? 'word' : 'words'} to save! (${wordCount}/10)` 
              : `Amazing! You wrote ${wordCount} words! Ready to save! 🎉`
            }
          </p>
        </div>

        {/* Journal Textarea */}
        <textarea 
          value={entry}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start writing here... ✨

You can write about:
• How you're feeling right now
• Something fun that happened today
• A dream you had last night
• A goal you want to achieve
• Anything on your mind!"
          className="w-full h-80 p-6 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-300 focus:border-pink-400 outline-none resize-none text-base leading-relaxed bg-gradient-to-br from-pink-50/30 via-purple-50/30 to-blue-50/30"
          style={{ fontFamily: 'Georgia, serif' }}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button 
            onClick={() => {
              setEntry('');
              setWordCount(0);
              setSelectedMood(null);
              toast('Journal cleared! Start fresh! 📝', { icon: '🗑️' });
            }}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-md"
          >
            🗑️ Clear
          </button>
          <button 
            onClick={handleSave}
            disabled={wordCount < 10 || !selectedMood || hasCompleted}
            className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white py-4 rounded-2xl font-bold hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-pink-500"
          >
            💾 Save Entry {wordCount >= 10 && moodSelected && '& Earn Sticker!'}
          </button>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl border-2 border-green-200">
        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">🌟</span> Why Journaling Helps
        </h4>
        <ul className="space-y-2 text-sm text-green-700">
          <li className="flex items-start gap-2">
            <span className="text-lg">💭</span>
            <span><strong>Understand your feelings:</strong> Writing helps you figure out what you're feeling and why</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg">🧘</span>
            <span><strong>Calm your mind:</strong> Getting thoughts on paper can make you feel less worried</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg">📈</span>
            <span><strong>Track your growth:</strong> Look back and see how much you've learned and grown!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg">✨</span>
            <span><strong>Boost creativity:</strong> Free writing sparks new ideas and imagination</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FeelingsJournal;