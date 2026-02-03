
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
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-blue-500" size={20} />
          <h3 className="font-bold text-slate-700">Gemini 講師</h3>
        </div>
        {error && <AlertCircle className="text-red-500" size={16} />}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-500 text-sm">
              <span className="font-bold text-blue-600">{currentWord.word}</span> について何でも聞いてください。
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-3 text-sm flex space-x-2 ${msg.role === 'user'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-800 border border-slate-200 shadow-sm'
              }`}>
              <div className="mt-1 flex-shrink-0">
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-blue-500" />}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text || (msg.role === 'model' && isTyping && i === messages.length - 1 ? <Loader2 size={14} className="animate-spin inline" /> : '')}
              </div>
            </div>
          </div>
        ))}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-3">
            <div className="text-red-600 text-xs flex items-start space-x-2 font-medium">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {needsApiKey && (
              <button
                onClick={handleOpenApiKey}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-lg active:scale-95 transition-all"
              >
                <Key size={14} />
                <span>新しいAPIキーを選択</span>
              </button>
            )}
          </div>
        )}

        {isTyping && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-3 text-sm flex items-center space-x-2">
              <Loader2 size={14} className="animate-spin text-blue-500" />
              <span className="text-slate-500 italic">Gemini が回答を作成中...</span>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Quick Questions Area */}
      <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100">
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={isTyping}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pt-2 border-t border-slate-100">
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
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 resize-none text-sm transition-all outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all active:scale-90 ${input.trim() && !isTyping ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
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
