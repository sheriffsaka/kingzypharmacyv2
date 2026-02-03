
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToAI } from '../services/geminiService';
import { ChatBubbleIcon, SendIcon } from './Icons';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! I am your AI Pharmacy Assistant. How can I help you today? You can ask me about medications, side effects, or general health questions.", sender: 'ai' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: userInput,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const aiResponseText = await sendMessageToAI(userInput);
    
    const aiMessage: ChatMessage = {
      id: Date.now() + 1,
      text: aiResponseText,
      sender: 'ai',
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto h-[70vh] flex flex-col bg-white shadow-2xl rounded-lg border border-gray-200">
      <div className="p-4 border-b flex items-center bg-brand-primary text-white rounded-t-lg">
        <ChatBubbleIcon className="w-6 h-6 mr-3" />
        <h2 className="text-xl font-semibold">AI Pharmacy Assistant</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-brand-light/50">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-xl shadow ${
              msg.sender === 'user' 
                ? 'bg-brand-secondary text-white' 
                : 'bg-gray-200 text-brand-dark'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-lg px-4 py-3 rounded-xl shadow bg-gray-200 text-brand-dark flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t bg-white rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about a medication..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="p-3 bg-brand-secondary text-white rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-brand-primary transition-colors duration-300"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
