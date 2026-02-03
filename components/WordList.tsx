
import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Search, ExternalLink } from 'lucide-react';

interface WordListProps {
  words: WordItem[];
  onSelectWord: (index: number) => void;
}

const WordList: React.FC<WordListProps> = ({ words, onSelectWord }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const speakWord = (word: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vocabulary Library</h2>
          <p className="text-slate-500 text-sm">Review all {words.length} words from your collection.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search words or meanings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16 text-center">No.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Word</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Meaning</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Example</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWords.map((w, idx) => {
                const originalIndex = words.findIndex(ow => ow.id === w.id);
                return (
                  <tr key={w.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-400 text-center">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onSelectWord(originalIndex)}
                        className="font-bold text-slate-800 hover:text-blue-600 hover:underline text-left"
                      >
                        {w.word}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{w.translation}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 italic hidden md:table-cell max-w-xs truncate">
                      {w.example || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => speakWord(w.word)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                          title="Speak"
                        >
                          <Volume2 size={18} />
                        </button>
                        <button 
                          onClick={() => onSelectWord(originalIndex)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all md:hidden"
                          title="View Card"
                        >
                          <ExternalLink size={18} />
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
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <Search size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500">No words found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordList;
