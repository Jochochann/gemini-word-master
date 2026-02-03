
import React, { useState, useRef, useEffect } from 'react';
import { askAboutWord } from '../services/geminiService';
import { WordItem, ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface GeminiAssistantProps {
  currentWord: WordItem;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ currentWord }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await askAboutWord(
        currentWord.word, 
        userMessage, 
        currentWord.translation
      );
      setMessages(prev => [...prev, { role: 'model', text: response || 'Sorry, I couldn\'t generate an answer.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to Gemini API. Please check your network or key.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "Give me 3 example sentences.",
    "What is the nuance compared to synonyms?",
    "Explain the etymology.",
    "How do I use this in a business context?"
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
        <Sparkles className="text-blue-500" size={20} />
        <h3 className="font-bold text-slate-700">Gemini Tutor</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 text-sm">
              Ask me anything about <span className="font-bold text-blue-600">{currentWord.word}</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex space-x-2 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-800'
            }`}>
              <div className="mt-1">
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-blue-500" />}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-3 text-sm flex items-center space-x-2">
              <Loader2 size={14} className="animate-spin text-blue-500" />
              <span className="text-slate-500 italic">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="relative">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 resize-none text-sm transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 bottom-2 p-2 rounded-xl transition-colors ${
              input.trim() && !isTyping ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
