// pages/TalkEasy.tsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  sentiment?: string;
  timestamp?: string;
  crisis?: boolean;
  isTyping?: boolean;
}

const TalkEasy: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hi there 👋 I'm TalkEasy, your mental health companion. This is a safe, confidential space to talk about what's on your mind. How are you feeling today?",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState<string>(`session-${Date.now()}`);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Please log in.');
    }
  }, []);

  // Typing effect function
  const typeMessage = async (messageId: string, fullText: string, speed: number = 30) => {
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text: fullText.substring(0, currentIndex), isTyping: true }
            : msg
        ));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text: fullText, isTyping: false }
            : msg
        ));
      }
    }, speed);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await api.post('/talkeasy/chat', {
        message: input,
        sessionId: sessionId,
      });

      if (response.data.success) {
        const messageId = `ai-${Date.now()}`;
        const fullResponse = response.data.data.response;
        
        // Add message placeholder
        const aiMessage: Message = {
          id: messageId,
          text: '',
          sender: 'ai',
          sentiment: response.data.data.sentiment,
          timestamp: response.data.data.timestamp,
          crisis: response.data.crisis || false,
          isTyping: true,
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
        
        // Start typing effect
        await typeMessage(messageId, fullResponse, 20);

        if (response.data.crisis) {
          console.warn('⚠️ Crisis detected');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      let errorText = "I'm having trouble connecting. Please try again.";
      
      if (err.response?.status === 429) {
        errorText = "Please slow down - you're sending messages too quickly.";
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorText = "Your session expired. Please log in again.";
      }
      
      setError(errorText);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: errorText,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      textareaRef.current?.focus();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleBack = () => {
    window.history.back();
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-semibold mt-3 mb-2">{line.replace(/\*\*/g, '')}</p>;
      }
      
      const boldRegex = /\*\*(.+?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={idx} className="mb-2">
            {parts.map((part, i) => 
              i % 2 === 0 ? part : <strong key={i} className="font-semibold">{part}</strong>
            )}
          </p>
        );
      }
      
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return <li key={idx} className="ml-5 mb-1.5 list-disc">{line.replace(/^[•\-*]\s*/, '')}</li>;
      }
      
      if (line.trim().startsWith('📚') || line.trim().startsWith('💚') || line.trim().startsWith('🆘')) {
        return <p key={idx} className="font-semibold mt-4 mb-2 text-teal-600">{line}</p>;
      }
      
      return line.trim() ? <p key={idx} className="mb-2 leading-relaxed">{line}</p> : <br key={idx} />;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">TalkEasy</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>
            
            {/* Crisis Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-red-900">Crisis: 0722 178 177</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Crisis Banner (Mobile) */}
          <div className="sm:hidden mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-red-900">24/7 Crisis Support</p>
                <p className="text-xs text-red-800 mt-0.5">Befrienders Kenya: <span className="font-bold">0722 178 177</span></p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.sender === 'ai' ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${message.sender === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`inline-block max-w-[85%] shadow-sm ${
                    message.sender === 'user' 
                      ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm' 
                      : message.crisis
                      ? 'bg-red-50 border-2 border-red-200 text-gray-900 rounded-2xl rounded-tl-sm'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm'
                  } px-4 py-3`}>
                    {message.crisis && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-red-200">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-bold text-red-700 uppercase">Urgent Support</span>
                      </div>
                    )}
                    
                    <div className="text-sm leading-relaxed">
                      {formatMessageText(message.text)}
                      {message.isTyping && (
                        <span className="inline-block w-1 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                      )}
                    </div>
                    
                    {message.timestamp && !message.isTyping && (
                      <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Message TalkEasy..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm bg-gray-50"
                  disabled={isLoading}
                  rows={1}
                  maxLength={1000}
                  style={{ maxHeight: '200px' }}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {input.length}/1000
                </div>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors flex items-center justify-center shadow-lg"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TalkEasy;