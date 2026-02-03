
import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Search, ArrowRight } from 'lucide-react';

interface WordListProps {
  words: WordItem[];
  onSelectWord: (index: number) => void;
  lang?: string;
}

const WordList: React.FC<WordListProps> = ({ words, onSelectWord, lang = 'en-US' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const speakWord = (word: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">Library</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Browsing {words.length} items ({lang === 'zh-TW' ? '繁體中文' : 'English'})</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[320px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-12 sm:w-16">No.</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Word</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meaning</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Example</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWords.map((w, idx) => {
                const originalIndex = words.findIndex(ow => ow.id === w.id);
                return (
                  <tr key={w.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-4 text-xs text-slate-400 text-center">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => onSelectWord(originalIndex)}
                        className="font-bold text-sm sm:text-base text-slate-800 hover:text-blue-600 transition-colors text-left"
                      >
                        {w.word}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs sm:text-sm text-slate-600">{w.translation}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 italic hidden sm:table-cell max-w-[150px] lg:max-w-xs truncate">
                      {w.example || '-'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                        <button 
                          onClick={() => speakWord(w.word)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all active:scale-90"
                          title="Listen"
                        >
                          <Volume2 size={18} />
                        </button>
                        <button 
                          onClick={() => onSelectWord(originalIndex)}
                          className="p-2 text-slate-300 group-hover:text-blue-500 transition-all"
                          title="Open Card"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredWords.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Search size={40} className="text-slate-200 mb-4" />
            <p className="text-slate-400 text-sm font-medium">No results for "{searchTerm}"</p>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default WordList;
