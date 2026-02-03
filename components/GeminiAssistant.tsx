
import React, { useState, useRef, useEffect } from 'react';
import { askAboutWord, streamAssistantResponse } from '../services/geminiService';
import { WordItem, ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, Loader2, Key, AlertCircle } from 'lucide-react';

interface GeminiAssistantProps {
  currentWord: WordItem;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ currentWord }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleOpenApiKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setError(null);
      setNeedsApiKey(false);
    }
  };

  const handleSend = async (customInput?: string) => {
    const finalInput = customInput || input;
    if (!finalInput.trim() || isTyping) return;

    setInput('');
    setError(null);
    setNeedsApiKey(false);
    setMessages(prev => [...prev, { role: 'user', text: finalInput }]);
    setIsTyping(true);

    try {
      let fullResponse = '';
      const stream = streamAssistantResponse(
        currentWord.word,
        currentWord.translation,
        finalInput
      );

      // Add placeholder message for model
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (e: any) {
      console.error(e);
      let errorMessage = 'エラーが発生しました。';
      const isAuthError = e.message?.includes('leaked') || e.message?.includes('403') || e.message?.includes('PERMISSION_DENIED');

      if (isAuthError) {
        errorMessage = 'APIキーが無効、または漏洩の可能性があります。新しいキーを選択してください。';
        setNeedsApiKey(true);
      } else if (e.message?.includes('entity was not found')) {
        errorMessage = 'APIキーまたはプロジェクトが見つかりません。';
        setNeedsApiKey(true);
      }

      setError(errorMessage);
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'model' && !prev[prev.length - 1].text) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "例文を3つ作って",
    "類義語との違いは？",
    "覚え方のコツ（語源など）を教えて",
    "ビジネスでの使い方は？"
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="text-blue-500" size={22} />
          <h3 className="font-bold text-lg text-slate-800 tracking-tight">Gemini 講師</h3>
        </div>
        {error && <AlertCircle className="text-red-500" size={18} />}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <Bot className="mx-auto text-slate-200 mb-5" size={72} />
            {/* Increased font size of placeholder text */}
            <p className="text-slate-500 text-lg leading-relaxed">
              <span className="font-bold text-blue-600 text-2xl block mb-2">{currentWord.word}</span> について何でも聞いてください。
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Increased text size of messages from text-base to text-lg sm:text-xl */}
            <div className={`max-w-[92%] rounded-2xl p-5 text-lg sm:text-xl flex space-x-3 ${msg.role === 'user'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                : 'bg-slate-100 text-slate-800 border border-slate-200 shadow-sm'
              }`}>
              <div className="mt-1.5 flex-shrink-0">
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-blue-500" />}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text || (msg.role === 'model' && isTyping && i === messages.length - 1 ? <Loader2 size={20} className="animate-spin inline" /> : '')}
              </div>
            </div>
          </div>
        ))}

        {error && (
          <div className="p-5 bg-red-50 border border-red-100 rounded-2xl space-y-4">
            <div className="text-red-600 text-base flex items-start space-x-2.5 font-bold">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {needsApiKey && (
              <button
                onClick={handleOpenApiKey}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg active:scale-95 transition-all"
              >
                <Key size={16} />
                <span>新しいAPIキーを選択</span>
              </button>
            )}
          </div>
        )}

        {isTyping && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            {/* Increased text size of typing indicator */}
            <div className="bg-slate-50 rounded-2xl p-4 text-lg flex items-center space-x-3 border border-slate-100">
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <span className="text-slate-500 italic font-medium">Gemini が回答を作成中...</span>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Quick Questions Area */}
      <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100">
        <div className="flex flex-wrap gap-2.5">
          {quickQuestions.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={isTyping}
              /* Increased text size of quick question buttons slightly */
              className="text-sm font-bold px-3.5 py-2.5 bg-white hover:bg-blue-600 text-slate-600 hover:text-white rounded-xl border border-slate-200 hover:border-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 pt-3 border-t border-slate-100">
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
            placeholder="質問を入力..."
            /* Increased text size of input area to text-lg sm:text-xl */
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 resize-none text-lg sm:text-xl transition-all outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all active:scale-90 ${input.trim() && !isTyping ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-300'
              }`}
          >
            <Send size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
