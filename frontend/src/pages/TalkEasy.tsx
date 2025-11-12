
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SendIcon } from '../components/icons/SendIcon';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const TalkEasy: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm TalkEasy, your supportive assistant. I'm here to help you navigate difficult conversations with your child. How can I help you today?",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: input,
        config: {
            systemInstruction: "You are TalkEasy, a friendly and supportive AI assistant for caregivers. Your purpose is to help parents and guardians navigate difficult conversations with children about their mental well-being. Your tone should always be empathetic, reassuring, non-judgmental, and easy to understand. Provide practical, gentle advice and conversation starters. Do not provide medical diagnoses or replace professional help. Keep responses concise and encouraging.",
        }
      });

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I'm having a little trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="talkeasy" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
            Chat with TalkEasy
          </h2>
          <p className="mt-4 text-lg text-dark-text/60 max-w-2xl mx-auto">
            Get instant support for difficult conversations. This is a safe space to explore ways to connect with your child.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-light-bg">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs md:max-w-md p-3 px-4 rounded-2xl shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-teal text-white rounded-br-none'
                      : 'bg-white text-dark-text rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md p-3 px-4 rounded-2xl shadow-sm bg-white text-dark-text rounded-bl-none">
                  <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-teal rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-teal rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-teal rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t border-gray-200 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you want to talk about?"
              className="flex-grow p-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="ml-4 bg-teal text-white p-3 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-teal/90 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default TalkEasy;
