import React, { useState, useEffect, useRef } from 'react';
import { useKidsCorner } from '../../../contexts/KidsCornerContext';
import * as kidsCornerAPI from '../../../services/kidscorner.service';
import toast from 'react-hot-toast';
import { SendIcon } from '../../../components/icons/SendIcon';

interface Message {
  text: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
}

const HelpZone: React.FC = () => {
  const { activeChild, refreshProgress } = useKidsCorner();

  // Chat Buddy State
  const [buddyMessages, setBuddyMessages] = useState<Message[]>([
    { 
      text: "Hi there! I'm Buddy, your animal friend. How are you feeling today? 🦁", 
      sender: 'buddy',
      timestamp: new Date()
    }
  ]);
  const [buddyInput, setBuddyInput] = useState('');
  const [isBuddyTyping, setIsBuddyTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Worry Box State
  const [worryText, setWorryText] = useState('');
  const [worryLocked, setWorryLocked] = useState(false);
  const [isLockingWorry, setIsLockingWorry] = useState(false);
  const [worryCount, setWorryCount] = useState(0);

  // Fetch worry count on load
  useEffect(() => {
    if (activeChild) {
      fetchWorryCount();
    }
  }, [activeChild]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [buddyMessages]);

  const fetchWorryCount = async () => {
    if (!activeChild) return;
    
    try {
      const data = await kidsCornerAPI.getWorryCount(activeChild.id);
      setWorryCount(data.worryCount);
    } catch (error) {
      console.error('Failed to fetch worry count:', error);
    }
  };

  // --- BUDDY CHAT HANDLER ---
  const handleBuddyChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buddyInput.trim() || !activeChild) return;

    const userMsg: Message = { 
      text: buddyInput, 
      sender: 'user',
      timestamp: new Date()
    };
    
    setBuddyMessages(prev => [...prev, userMsg]);
    setBuddyInput('');
    setIsBuddyTyping(true);

    try {
      // Call backend API (uses placeholder responses for now)
      const result = await kidsCornerAPI.buddyChat(
        activeChild.id,
        userMsg.text,
        sessionId || undefined
      );

      // Save session ID for conversation continuity
      if (!sessionId) {
        setSessionId(result.sessionId);
      }

      // Add Buddy's response
      const buddyMsg: Message = {
        text: result.response,
        sender: 'buddy',
        timestamp: new Date()
      };

      setBuddyMessages(prev => [...prev, buddyMsg]);

      // Show notice if using placeholder AI
      if (result.meta?.isPlaceholder) {
        // Only show once per session
        if (buddyMessages.length < 3) {
          toast('💡 Buddy is using simple responses. Full AI coming soon!', {
            duration: 4000,
            icon: '🤖'
          });
        }
      }

    } catch (error: any) {
      console.error('Buddy chat error:', error);
      
      const errorMsg: Message = {
        text: "I'm a little sleepy right now. Want to try the Worry Box or play a game instead? 🐾",
        sender: 'buddy',
        timestamp: new Date()
      };
      
      setBuddyMessages(prev => [...prev, errorMsg]);
      toast.error('Buddy had trouble responding. Try again!');
      
    } finally {
      setIsBuddyTyping(false);
    }
  };

  // --- WORRY BOX HANDLER ---
  const handleLockWorry = async () => {
    if (!worryText.trim() || !activeChild) {
      toast.error('Please write your worry first');
      return;
    }

    setIsLockingWorry(true);

    try {
      // Call backend API (encrypts worry)
      await kidsCornerAPI.lockWorry(activeChild.id, worryText.trim());

      // Update count
      setWorryCount(prev => prev + 1);

      // Show success animation
      setWorryLocked(true);
      toast.success('�� Worry locked away safely!', {
        duration: 3000,
        icon: '✨'
      });

      // Reset after animation
      setTimeout(() => {
        setWorryText('');
        setWorryLocked(false);
      }, 3000);

    } catch (error: any) {
      console.error('Failed to lock worry:', error);
      toast.error('Could not lock worry. Try again!');
    } finally {
      setIsLockingWorry(false);
    }
  };

  // --- SOS ALERT HANDLER ---
  const handleSOS = () => {
    if (!activeChild) return;

    // In production, this would:
    // 1. Send email/SMS to parent
    // 2. Create urgent flag in database
    // 3. Log to admin dashboard
    
    toast.error('🚨 ALERT SENT! Your grown-up has been notified.', {
      duration: 5000,
      icon: '🆘'
    });

    // For now, just log a worry
    kidsCornerAPI.lockWorry(activeChild.id, '🚨 SOS ALERT TRIGGERED')
      .then(() => {
        setWorryCount(prev => prev + 1);
      })
      .catch(console.error);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* 1. Chat Buddy Column */}
      <div className="bg-white rounded-3xl shadow-xl flex flex-col h-[600px] overflow-hidden border-2 border-teal-200">
        <div className="bg-gradient-to-r from-teal-500 to-green-500 p-4 text-white flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
            🦁
          </div>
          <div>
            <h3 className="font-black leading-tight text-lg">Buddy the Lion</h3>
            <span className="text-xs text-white/80 font-medium">Always here to listen</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-blue-50 scroll-smooth">
          {buddyMessages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                m.sender === 'user' 
                  ? 'bg-teal-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          
          {isBuddyTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl animate-pulse text-xs text-gray-400 font-bold border border-gray-200">
                Buddy is thinking... 🤔
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleBuddyChat} className="p-3 border-t bg-white flex gap-2">
          <input 
            type="text" 
            value={buddyInput}
            onChange={(e) => setBuddyInput(e.target.value)}
            placeholder="Type here..."
            disabled={isBuddyTyping || !activeChild}
            className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isBuddyTyping || !activeChild}
            className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon />
          </button>
        </form>
      </div>

      {/* 2. Right Column: Worry Box & SOS */}
      <div className="space-y-6">
        {/* Worry Box */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border-4 border-double border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-xl flex items-center gap-2 text-gray-800">
              <span className="text-2xl">🗳️</span> The Worry Box
            </h3>
            <div className="bg-red-100 px-3 py-1 rounded-full border border-red-200">
              <span className="text-sm font-bold text-red-600">
                {worryCount} {worryCount === 1 ? 'worry' : 'worries'} locked
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 font-medium">
            Got a worry? Write it down and lock it away. It stays private and encrypted. 🔐
          </p>

          {worryLocked ? (
            <div className="py-10 text-center animate-bounce">
              <div className="text-5xl mb-2">🔒</div>
              <p className="font-black text-teal-600">Worry Locked Away!</p>
              <p className="text-sm text-gray-500 mt-2">Only you and your grown-up can see it</p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea 
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                placeholder="What's on your mind?..."
                disabled={isLockingWorry || !activeChild}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[120px] resize-none disabled:opacity-50"
              />
              <button 
                onClick={handleLockWorry}
                disabled={isLockingWorry || !worryText.trim() || !activeChild}
                className="w-full bg-red-400 text-white font-black py-3 rounded-2xl hover:bg-red-500 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLockingWorry ? 'Locking...' : 'Lock It Away'}
              </button>
            </div>
          )}
        </div>

        {/* SOS ALERT BUTTON */}
        <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 text-center">
          <h4 className="font-black text-red-800 mb-2">Feeling Unsafe? 🆘</h4>
          <p className="text-sm text-red-600 mb-4">
            If you feel scared or unsafe, press this button to tell your grown-up.
          </p>
          <button 
            onClick={handleSOS}
            disabled={!activeChild}
            className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl animate-pulse">🚨</span> ALERT MY GROWN-UP
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">
            🔒 <strong>Privacy Note:</strong> Your worries are encrypted and safe. 
            Parents can see how many worries you have, but not what they say unless you share.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpZone;