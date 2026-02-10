import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { KidsData } from '../../../types/kidscorner.types';
import { SendIcon } from '../../../components/icons/SendIcon'; // Adjust based on your actual icon path

interface HelpZoneProps {
  kidsData: KidsData;
  onUpdateData: (newData: Partial<KidsData>) => void;
}

const HelpZone: React.FC<HelpZoneProps> = ({ kidsData, onUpdateData }) => {
  // Chat Buddy State
  const [buddyMessages, setBuddyMessages] = useState<{ text: string; sender: 'user' | 'buddy' }[]>([
    { text: "Hi there! I'm Buddy, your animal friend. How are you feeling today?", sender: 'buddy' }
  ]);
  const [buddyInput, setBuddyInput] = useState('');
  const [isBuddyTyping, setIsBuddyTyping] = useState(false);
  
  // Worry Box State
  const [worryText, setWorryText] = useState('');
  const [worryLocked, setWorryLocked] = useState(false);

  // --- HANDLERS ---
  const handleBuddyChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buddyInput.trim()) return;

    const userMsg = { text: buddyInput, sender: 'user' as const };
    setBuddyMessages(prev => [...prev, userMsg]);
    setBuddyInput('');
    setIsBuddyTyping(true);

    try {
      // Initialize Google AI
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || ''); // Using VITE_API_KEY
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are Buddy, a friendly, wise, and gentle animal friend (like an owl or a kind lion) in a digital safe space for kids. 
      The child just said: "${userMsg.text}". 
      Your job is to listen, provide comfort, and give simple, kid-friendly advice. 
      Use short sentences and emojis. 
      If a child seems very upset or mentions danger, gently suggest they talk to a trusted adult. 
      Stay encouraging and non-judgmental.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      setBuddyMessages(prev => [...prev, { text: text, sender: 'buddy' }]);
    } catch (e) {
      console.error(e);
      setBuddyMessages(prev => [...prev, { text: "I'm a little sleepy right now. Want to play a game instead? 🐾", sender: 'buddy' }]);
    } finally {
      setIsBuddyTyping(false);
    }
  };

  const handleLockWorry = () => {
    if (!worryText.trim()) return;
    onUpdateData({ worries: [...(kidsData.worries || []), worryText] });
    setWorryLocked(true);
    setTimeout(() => {
      setWorryText('');
      setWorryLocked(false);
    }, 3000);
  };

  const handleSOS = () => {
      // In a real app, this would trigger an email/SMS API
      alert("We are alerting your grown-up right now. Stay where you are, help is coming! ❤️");
      onUpdateData({ worries: [...(kidsData.worries || []), "SOS ALERT TRIGGERED"] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* 1. Chat Buddy Column */}
      <div className="bg-white rounded-3xl shadow-xl flex flex-col h-[600px] overflow-hidden border-2 border-teal/20">
        <div className="bg-teal p-4 text-white flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">🦁</div>
          <div>
            <h3 className="font-black leading-tight text-lg">Buddy the Lion</h3>
            <span className="text-xs text-white/80 font-medium">Always here to listen</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth">
          {buddyMessages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${m.sender === 'user' ? 'bg-teal text-white rounded-tr-none' : 'bg-white text-dark-text rounded-tl-none'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isBuddyTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl animate-pulse text-xs text-gray-400 font-bold">Buddy is thinking...</div>
            </div>
          )}
        </div>
        <form onSubmit={handleBuddyChat} className="p-3 border-t bg-white flex gap-2">
          <input 
            type="text" 
            value={buddyInput}
            onChange={(e) => setBuddyInput(e.target.value)}
            placeholder="Type here..."
            className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal bg-gray-50"
          />
          <button type="submit" className="bg-teal text-white p-3 rounded-xl hover:bg-teal/90 transition-colors shadow-md">
            <SendIcon />
          </button>
        </form>
      </div>

      {/* 2. Right Column: Worry Box & SOS */}
      <div className="space-y-6">
        {/* Worry Box */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border-4 border-double border-red-200">
          <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-dark-text">
            <span className="text-2xl">🗳️</span> The Worry Box
          </h3>
          <p className="text-sm text-gray-600 mb-4 font-medium">Got a worry? Write it down and lock it away. It stays private here.</p>
          {worryLocked ? (
            <div className="py-10 text-center animate-bounce">
              <div className="text-5xl mb-2">🔒</div>
              <p className="font-black text-teal">Worry Locked Away!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea 
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                placeholder="What's on your mind?..."
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[120px] resize-none"
              />
              <button 
                onClick={handleLockWorry}
                className="w-full bg-red-400 text-white font-black py-3 rounded-2xl hover:bg-red-500 transition-colors shadow-md"
              >
                Lock It Away
              </button>
            </div>
          )}
        </div>

        {/* SOS ALERT BUTTON */}
        <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 text-center">
            <h4 className="font-black text-red-800 mb-2">Feeling Unsafe? 🆘</h4>
            <p className="text-sm text-red-600 mb-4">If you feel scared or unsafe, press this button to tell your grown-up.</p>
            <button 
              onClick={handleSOS}
              className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
               <span className="text-2xl animate-pulse">🚨</span> ALERT MY GROWN-UP
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpZone;