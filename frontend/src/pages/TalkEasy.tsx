/**
 * ============================================
 * TALKEASY - AI Mental Health Chat
 * ============================================
 * @version     3.0.0
 * @author      ArogoClin
 * @updated     2025-12-05
 * @description Professional AI chat inspired by modern design
 * ============================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Copy,
  MoreHorizontal,
  Share2,
  MessageCircle,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../config/api';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  sentiment?: string;
  timestamp?: string;
  crisis?: boolean;
  isTyping?: boolean;
  image?: string;
}

const TalkEasy: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hi there, I'm TalkEasy, your mental health companion. This is a safe, confidential space to talk about what's on your mind. How are you feeling today?",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState<string>(`session-${Date.now()}`);
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const typeMessage = async (messageId: string, fullText: string, speed: number = 15) => {
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
    if (! input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef. current.style.height = 'auto';
    }

    try {
      const response = await api.post('/talkeasy/chat', {
        message: input,
        sessionId: sessionId,
      });

      if (response.data.success) {
        const messageId = `ai-${Date.now()}`;
        const fullResponse = response.data.data.response;
        
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
        
        await typeMessage(messageId, fullResponse);

        if (response.data.crisis) {
          toast.error('If you need immediate help, please call 0722 178 177');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      let errorText = "I'm having trouble connecting.  Please try again.";
      
      if (err.response?.status === 429) {
        errorText = "Please slow down - you're sending messages too quickly.";
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorText = "Your session expired. Please log in again.";
      }
      
      toast. error(errorText);
      
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

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleRegenerateResponse = async (messageId: string) => {
    toast('Regenerate feature coming soon!');
  };

  const formatMessageText = (text: string) => {
    return text. split('\n\n').map((paragraph, pIdx) => {
      const lines = paragraph.split('\n');
      
      return (
        <div key={pIdx} className="mb-4 last:mb-0">
          {lines.map((line, lIdx) => {
            // Bold headings
            if (line.match(/^\*\*(. +)\*\*$/)) {
              return (
                <p key={lIdx} className="font-bold text-gray-900 mb-2">
                  {line.replace(/\*\*/g, '')}
                </p>
              );
            }
            
            // Bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
              return (
                <li key={lIdx} className="ml-4 mb-1">
                  {line.replace(/^[-•]\s*/, '')}
                </li>
              );
            }
            
            // Regular text with inline bold
            const parts = line.split(/(\*\*. +?\*\*)/g);
            return (
              <p key={lIdx} className="leading-relaxed">
                {parts.map((part, i) => 
                  part.match(/^\*\*. +\*\*$/) ? (
                    <strong key={i} className="font-semibold">{part. replace(/\*\*/g, '')}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left Side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <MessageCircle className="w-6 h-6 text-teal" />
              <h1 className="text-lg font-bold text-gray-900">TalkEasy Chat</h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:flex items-center gap-2 px-3 py-1. 5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <AlertCircle className="w-4 h-4" />
                Crisis: 0722 178 177
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-4 py-2">
                {/* Avatar */}
                {message.sender === 'user' ?  (
                  <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-semibold flex-shrink-0">
                    {localStorage.getItem('user') 
                      ? JSON.parse(localStorage.getItem('user')! ).name?. charAt(0). toUpperCase() 
                      : 'U'}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Message Content */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="pt-1. 5">
                    <div className={`text-sm text-gray-900 ${message.crisis ? 'border-l-4 border-red-500 pl-4' : ''}`}>
                      {formatMessageText(message.text)}
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  {message.isTyping && (
                    <div className="flex gap-1">
                      <span className="w-1. 5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  )}

                  {/* AI Message Actions */}
                  {message.sender === 'ai' && ! message.isTyping && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyMessage(message.text)}
                        className="p-1. 5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleRegenerateResponse(message. id)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Regenerate"
                      >
                        <RotateCw className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Good response">
                        <ThumbsUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1. 5 hover:bg-gray-100 rounded transition-colors" title="Bad response">
                        <ThumbsDown className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-start gap-4 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 pt-1. 5">
                  <div className="flex gap-1. 5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-3">
              <button
                type="button"
                className="p-1. 5 hover:bg-gray-200 rounded transition-colors"
                title="Add attachment"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e. target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
                placeholder="Chat with me..."
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-[150px] text-sm"
                rows={1}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={! input.trim() || isLoading}
                className="p-2 bg-teal text-white rounded-full hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              AI can make mistakes. Always double check responses.  For crisis: 0722 178 177
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TalkEasy;