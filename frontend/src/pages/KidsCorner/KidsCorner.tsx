
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { KidsData, Mood } from '../../types/kidscorner.types';
import { SendIcon } from '../../components/icons/SendIcon';
import { XIcon } from './../../components/icons/XIcon';
import Phaser from 'phaser';

declare global {
  interface Window {
    Phaser: any;
  }
}

interface KidsCornerProps {
  kidsData: KidsData;
  onUpdateData: (newData: Partial<KidsData>) => void;
  onBackToHome: () => void;
}

const MOODS: { type: Mood; emoji: string; label: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy' },
  { type: 'calm', emoji: '😌', label: 'Calm' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
  { type: 'silly', emoji: '🤪', label: 'Silly' },
  { type: 'worried', emoji: '😟', label: 'Worried' },
];

const DAILY_FACTS = [
  "Did you know? Taking deep breaths can tell your brain to feel calm!",
  "Fun fact: Your brain is like a muscle – the more you use it to be kind, the stronger it gets!",
  "Stretching your body can help your mind feel more awake and happy.",
  "Drinking a glass of water is like giving your brain a big, refreshing hug!",
  "Smiling can actually trick your brain into feeling a little bit happier!",
];

const KidsCorner: React.FC<KidsCornerProps> = ({ kidsData, onUpdateData, onBackToHome }) => {
  const [activeZone, setActiveZone] = useState<'hub' | 'play' | 'learn' | 'help'>('hub');
  const [moodSelected, setMoodSelected] = useState(false);
  const [dailyFact] = useState(DAILY_FACTS[Math.floor(Math.random() * DAILY_FACTS.length)]);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserInstance = useRef<any>(null);

  // Buddy state
  const [buddyMessages, setBuddyMessages] = useState<{ text: string; sender: 'user' | 'buddy' }[]>([
    { text: "Hi there! I'm Buddy, your animal friend. How are you feeling today?", sender: 'buddy' }
  ]);
  const [buddyInput, setBuddyInput] = useState('');
  const [isBuddyTyping, setIsBuddyTyping] = useState(false);
  const [worryText, setWorryText] = useState('');
  const [worryLocked, setWorryLocked] = useState(false);

  // Phaser Game Logic
  useEffect(() => {
    // Check if we are in the 'play' zone and have a container
    if (activeZone === 'play' && gameContainerRef.current && !phaserInstance.current) {
      
      const config: Phaser.Types.Core.GameConfig = { // Added type for better intellisense
        type: Phaser.AUTO, // Changed from window.Phaser.AUTO
        parent: gameContainerRef.current,
        width: 800,
        height: 500,
        backgroundColor: '#ffffff',
        physics: {
          default: 'arcade',
          arcade: { gravity: { x: 0, y: 0 } } // Fixed syntax slightly
        },
        scene: {
          preload: preload,
          create: create,
          update: update
        }
      };

      function preload(this: Phaser.Scene) {
        // No assets to load for this demo
      }

      function create(this: Phaser.Scene) {
        // Note: We use 'this' which refers to the Phaser Scene
        const scene = this;
        
        // Background circles
        scene.add.circle(400, 250, 200, 0xA8D5BA, 0.1);
        scene.add.circle(400, 250, 150, 0xA8D5BA, 0.2);

        // Breathing Balloon
        const balloon = scene.add.circle(400, 250, 60, 0xff7675);
        balloon.setStrokeStyle(4, 0xd63031);

        const text = scene.add.text(400, 420, 'Breathe in...', {
          fontSize: '28px',
          fontFamily: 'Poppins',
          color: '#17252A',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        // Breathing cycle
        scene.tweens.add({
          targets: balloon,
          radius: 140,
          duration: 4000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          onYoyo: () => { text.setText('Breathe out...'); },
          onRepeat: () => { text.setText('Breathe in...'); }
        });

        // Interactive "Win" condition
        let clicks = 0;
        balloon.setInteractive();
        balloon.on('pointerdown', () => {
          clicks++;
          scene.cameras.main.shake(100, 0.01);
          if (clicks === 5) {
             text.setText('Great job! Sticker earned!');
             text.setColor('#3AAFA9');
             balloon.setFillStyle(0xfdcb6e);
             
             // We call the React prop function here
             onUpdateData({ stickers: [...kidsData.stickers, '🎈'] });
             clicks = 0;
          }
        });

        // Instructions
        scene.add.text(400, 50, 'The Calming Balloon', {
          fontSize: '20px',
          color: '#3AAFA9'
        }).setOrigin(0.5);
      }

      function update() {}

      // Initialize the game using the import
      phaserInstance.current = new Phaser.Game(config);
    }

    return () => {
      // Cleanup when component unmounts or activeZone changes
      if (phaserInstance.current) {
        phaserInstance.current.destroy(true);
        phaserInstance.current = null;
      }
    };
  }, [activeZone]); // removed kidsData from dependency array to prevent game reload on sticker update

  const handleMoodSelect = (mood: Mood) => {
    onUpdateData({ lastMood: mood, streak: (kidsData.streak || 0) + 1 });
    setMoodSelected(true);
  };

  const handleBuddyChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buddyInput.trim()) return;

    const userMsg = { text: buddyInput, sender: 'user' as const };
    setBuddyMessages(prev => [...prev, userMsg]);
    setBuddyInput('');
    setIsBuddyTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: buddyInput,
        config: {
          systemInstruction: "You are Buddy, a friendly, wise, and gentle animal friend (like an owl or a kind lion) in a digital safe space for kids. Your job is to listen, provide comfort, and give simple, kid-friendly advice. Use short sentences and emojis. If a child seems very upset or mentions danger, gently suggest they talk to a trusted adult. Stay encouraging and non-judgmental.",
        }
      });
      setBuddyMessages(prev => [...prev, { text: response.text, sender: 'buddy' }]);
    } catch (e) {
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

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* Top Nav */}
      <nav className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-pastel-green/20">
        <button onClick={onBackToHome} className="flex items-center gap-2 text-teal font-bold">
          <span className="text-xl">🏠</span> Home
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-2 border border-yellow-200 shadow-sm">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-yellow-700">{kidsData.streak || 0} Streak</span>
          </div>
          <div className="bg-teal text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-sm font-bold">
             <span>🎒</span> 
             <span>{kidsData.stickers.length} Stickers</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {!moodSelected && activeZone === 'hub' ? (
          <div className="max-w-2xl mx-auto text-center mt-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-dark-text mb-4">Hello there! 👋</h1>
            <p className="text-xl text-dark-text/70 mb-10">How are you feeling right now?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {MOODS.map(m => (
                <button 
                  key={m.type}
                  onClick={() => handleMoodSelect(m.type)}
                  className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 border-4 border-transparent hover:border-pastel-green group"
                >
                  <div className="text-6xl mb-3 group-hover:animate-bounce">{m.emoji}</div>
                  <div className="font-bold text-dark-text">{m.label}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Zones Grid */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
              {[
                { id: 'hub', label: 'My Hub', icon: '🏠' },
                { id: 'play', label: 'Play Zone', icon: '🎮' },
                { id: 'learn', label: 'Learn Zone', icon: '📚' },
                { id: 'help', label: 'Help Zone', icon: '🛡️' },
              ].map(z => (
                <button
                  key={z.id}
                  onClick={() => setActiveZone(z.id as any)}
                  className={`px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all shadow-md ${activeZone === z.id ? 'bg-teal text-white scale-105' : 'bg-white text-teal hover:bg-teal/10'}`}
                >
                  <span className="mr-2">{z.icon}</span> {z.label}
                </button>
              ))}
            </div>

            {/* Hub Content */}
            {activeZone === 'hub' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal to-pastel-green p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-heading font-black mb-2">Welcome Back, Explorer!</h2>
                    <p className="text-white/90 text-lg italic">"{dailyFact}"</p>
                  </div>
                  <div className="absolute top-[-20%] right-[-5%] text-9xl opacity-20 rotate-12">🌟</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-dashed border-pastel-green">
                      <h3 className="font-black text-xl mb-4 text-dark-text">Your Sticker Book 📓</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {[...Array(12)].map((_, i) => (
                           <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center text-3xl shadow-inner ${i < kidsData.stickers.length ? 'bg-pastel-green/20' : 'bg-gray-100 grayscale opacity-30'}`}>
                             {i < kidsData.stickers.length ? kidsData.stickers[i] : '❓'}
                           </div>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-center text-gray-500">Collect more by trying new activities!</p>
                   </div>
                   <div className="bg-white p-6 rounded-3xl shadow-lg">
                      <h3 className="font-black text-xl mb-4 text-dark-text">Daily Progress 📈</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                           <span>Mood Check-in</span>
                           <span className="text-green-500">Done! ✅</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                           <span>Play a Game</span>
                           <span className={kidsData.stickers.length > 0 ? 'text-green-500' : 'text-gray-400 italic'}>
                             {kidsData.stickers.length > 0 ? 'Done! ✅' : 'Not yet'}
                           </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                           <span>Read a Story</span>
                           <span className="text-gray-400 italic">Not yet</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Play Zone (PHASER) */}
            {activeZone === 'play' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-[2rem] shadow-xl overflow-hidden">
                  <h2 className="text-2xl font-black mb-4 px-4 text-center">Mindful Playground 🎈</h2>
                  <div 
                    ref={gameContainerRef} 
                    className="w-full h-[500px] bg-gray-50 rounded-2xl mx-auto border-4 border-pastel-green shadow-inner"
                  >
                    {/* Phaser Game Mounts Here */}
                  </div>
                  <p className="mt-4 text-center font-bold text-dark-text/60 italic">
                    Tap the balloon to interact! Collect stickers by finishing the breathing exercise.
                  </p>
                </div>
              </div>
            )}

            {/* Learn Zone */}
            {activeZone === 'learn' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-lg border-b-4 border-teal flex flex-col items-center text-center">
                  <div className="text-5xl mb-4">📖</div>
                  <h3 className="font-black text-xl mb-2">The Brave Little Bear</h3>
                  <p className="text-gray-600 mb-6 italic">A story about feeling scared on the first day of school.</p>
                  <button className="bg-teal text-white w-full py-3 rounded-2xl font-bold hover:bg-teal/90 transition-all">Start Reading</button>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border-b-4 border-pastel-green flex flex-col items-center text-center">
                  <div className="text-5xl mb-4">🕵️‍♂️</div>
                  <h3 className="font-black text-xl mb-2">Emotion Detective</h3>
                  <p className="text-gray-600 mb-6 italic">Can you guess how the characters are feeling in these pictures?</p>
                  <button className="bg-pastel-green text-dark-text w-full py-3 rounded-2xl font-bold hover:bg-pastel-green/80 transition-all">Play Quiz</button>
                </div>
              </div>
            )}

            {/* Help Zone */}
            {activeZone === 'help' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chat Buddy */}
                <div className="bg-white rounded-3xl shadow-xl flex flex-col h-[500px] overflow-hidden border-2 border-teal/20">
                  <div className="bg-teal p-4 text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">🦁</div>
                    <div>
                      <h3 className="font-black leading-tight">Buddy the Lion</h3>
                      <span className="text-xs text-white/80">Always here to listen</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {buddyMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${m.sender === 'user' ? 'bg-teal text-white rounded-tr-none' : 'bg-white text-dark-text rounded-tl-none'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {isBuddyTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl animate-pulse text-xs text-gray-400">Buddy is thinking...</div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleBuddyChat} className="p-3 border-t bg-white flex gap-2">
                    <input 
                      type="text" 
                      value={buddyInput}
                      onChange={(e) => setBuddyInput(e.target.value)}
                      placeholder="Type here..."
                      className="flex-1 p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                    <button type="submit" className="bg-teal text-white p-2 rounded-xl">
                      <SendIcon />
                    </button>
                  </form>
                </div>

                {/* Worry Box */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-lg border-4 border-double border-red-200">
                    <h3 className="font-black text-xl mb-4 flex items-center gap-2">
                      <span className="text-2xl">🗳️</span> The Worry Box
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Got a worry? Write it down and lock it away. It stays private here.</p>
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
                          className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[120px]"
                        />
                        <button 
                          onClick={handleLockWorry}
                          className="w-full bg-red-400 text-white font-black py-3 rounded-2xl hover:bg-red-500 transition-colors"
                        >
                          Lock It Away
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 p-6 rounded-3xl shadow-sm border border-blue-100">
                    <h4 className="font-black text-blue-800 mb-2">Need a Grown-up's Help? 🆘</h4>
                    <p className="text-sm text-blue-700 mb-4 italic">It's always okay to ask for help when things feel big.</p>
                    <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700">
                      View Safe Resources
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default KidsCorner;
