
import React from 'react';
import { WordItem } from '../types';
import {
  Search,
  ExternalLink,
  Image as ImageIcon,
  Book,
  Globe,
  MessageSquare,
  Languages,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface SearchAssistantProps {
  currentWord: WordItem | undefined;
  lang?: string;
}

const GeminiAssistant: React.FC<SearchAssistantProps> = ({ currentWord, lang = 'en-US' }) => {
  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-slate-700 bg-slate-900">
        <div className="p-8 rounded-full bg-slate-950 border border-slate-800 mb-6">
          <BookOpen size={64} className="opacity-20" />
        </div>
        <p className="text-xs font-black tracking-[0.2em] uppercase">Select a word to explore</p>
      </div>
    );
  }

  const { word } = currentWord;
  const openSearch = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const getSearchResources = () => {
    const encodedWord = encodeURIComponent(word);
    const resources = [{ id: 'google', name: 'Google Search', icon: <Search className="text-blue-400" />, url: `https://www.google.com/search?q=${encodedWord}+meaning+japanese`, description: 'General meaning and usage' }];

    if (lang === 'zh-TW') {
      resources.push(
        { id: 'moedict', name: 'MoeDict (萌典)', icon: <Book className="text-red-400" />, url: `https://www.moedict.tw/${encodedWord}`, description: 'Standard Taiwanese dictionary' },
        { id: 'images', name: 'Image Search', icon: <ImageIcon className="text-purple-400" />, url: `https://www.google.com/search?tbm=isch&q=${encodedWord}`, description: 'Visual context' },
        { id: 'google-zh', name: 'Google TW', icon: <Globe className="text-emerald-400" />, url: `https://www.google.com.tw/search?q=${encodedWord}+意思`, description: 'Search local examples' }
      );
    } else {
      resources.push(
        { id: 'youglish', name: 'YouGlish', icon: <MessageSquare className="text-red-400" />, url: `https://youglish.com/pronounce/${encodedWord}/english`, description: 'Real YouTube pronunciations' },
        { id: 'images', name: 'Image Search', icon: <ImageIcon className="text-purple-400" />, url: `https://www.google.com/search?tbm=isch&q=${encodedWord}`, description: 'Visual context' },
        { id: 'weblio', name: 'Weblio JP', icon: <Book className="text-indigo-400" />, url: `https://ejje.weblio.jp/content/${encodedWord}`, description: 'Detailed Japanese definitions' }
      );
    }
    return resources;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden border-l border-slate-800">


      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-slate-950 rounded-[2rem] border border-indigo-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <span className="text-[10px] font-black text-indigo-400/70 uppercase tracking-[0.2em] block mb-3">CURRENT WORD</span>
          <h2 className="text-4xl font-black text-slate-50 leading-tight mb-3 tracking-tight">{word}</h2>
          <p className="text-xl text-indigo-300 font-bold">{currentWord.translation}</p>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Learning Resources</p>
          <div className="space-y-3">
            {getSearchResources().map((res) => (
              <button
                key={res.id}
                onClick={() => openSearch(res.url)}
                className="w-full text-left p-5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800/80 rounded-[1.5rem] transition-all group flex items-start space-x-5 hover:border-slate-700"
              >
                <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-slate-950 transition-colors">
                  {res.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {res.name}
                    </span>
                    <ExternalLink size={16} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{res.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
