
import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Search, ArrowRight, Hash, Star } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

interface WordListProps {
  words: WordItem[];
  onSelectWord: (index: number) => void;
  lang?: string;
  bookmarks: Set<string>;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  isPracticeMode?: boolean;
}

const WordList: React.FC<WordListProps> = ({ words, onSelectWord, lang = 'en-US', bookmarks, onToggleBookmark, isPracticeMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { speak } = useSpeech();

  const filteredWords = words.filter((w: WordItem) =>
    w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const speakWord = (word: string) => {
    speak(word, lang, 0.9);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full mx-auto p-2 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-1 bg-indigo-500 rounded-full" />
            <h2 className="text-3xl font-black text-slate-100 tracking-tight uppercase">Library</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            EXPLORING {words.length} VOCABULARY ITEMS ({lang === 'zh-TW' ? '繁體中文' : 'ENGLISH'})
          </p>
        </div>
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search words or meanings..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none shadow-2xl text-slate-200 placeholder:text-slate-600 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex-1 bg-slate-900/50 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col backdrop-blur-sm">
        <div className="overflow-x-hidden overflow-y-auto max-h-full custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-900/95 border-b border-slate-700 sticky top-0 z-10 backdrop-blur-xl">
                <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] w-1/2 sm:w-1/3">Word</th>
                <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hidden sm:table-cell w-1/2 sm:w-2/3">Example</th>
                <th className="px-4 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] w-20 text-center">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredWords.map((w: WordItem, idx: number) => {
                const originalIndex = words.findIndex((ow: WordItem) => ow.id === w.id);
                return (
                  <tr key={w.id} className="hover:bg-indigo-500/5 transition-all group/row">
                    <td className="px-6 py-3">
                      <button
                        onClick={() => onSelectWord(originalIndex)}
                        className="font-bold text-base text-white group-hover/row:text-indigo-400 transition-colors text-left leading-tight truncate w-full block"
                      >
                        {w.word}
                      </button>
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell group/example">
                      {isPracticeMode ? (
                        <div className="relative w-full cursor-pointer group/reveal">
                          {/* Japanese Translation (Always Visible) */}
                          <p className="text-xs text-amber-400 font-bold mb-1 truncate">
                            {w.exampleTranslation || 'No translation available'}
                          </p>
                          {/* English Original (Hidden/Blurred) - Reveal on Hover */}
                          <p className="text-xs text-slate-300 italic font-medium truncate block w-full blur-sm group-hover/reveal:blur-0 transition-all duration-300 select-none">
                            {w.example || '-'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-medium truncate block w-full group-hover/row:text-slate-300 transition-colors">
                          {w.example || '-'}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => onToggleBookmark(w.id, e)}
                          className={`p-2 rounded-lg transition-all ${bookmarks.has(w.id) ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-amber-400 hover:bg-slate-800'}`}
                        >
                          <Star size={18} fill={bookmarks.has(w.id) ? "currentColor" : "none"} strokeWidth={bookmarks.has(w.id) ? 2.5 : 2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredWords.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-slate-600 font-medium italic">
                    No words found matching your search...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WordList;
