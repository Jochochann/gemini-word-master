
import React, { useEffect } from 'react';
import { WordItem } from '../types';
import { Volume2, Lightbulb, ChevronRight, ChevronLeft, Quote } from 'lucide-react';

interface WordCardProps {
  item: WordItem;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  lang?: string;
}

const WordCard: React.FC<WordCardProps> = ({ item, onNext, onPrev, isFirst, isLast, lang = 'en-US' }) => {
  const speakWord = (word: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (item.word) {
      speakWord(item.word);
    }
  }, [item.word, lang]);

  const handleManualSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(item.word);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-1 sm:px-0 flex flex-col items-center">
      {/* Fixed height card with internal scroll */}
      <div className="w-full h-[450px] sm:h-[600px] bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 z-0" />

        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-start mb-4 sm:mb-6 flex-shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest mb-2 w-fit">
                {lang === 'zh-TW' ? 'Taiwanese' : 'English'}
              </span>
              <h2 className="text-2xl sm:text-5xl font-extrabold text-slate-900 tracking-tight break-words pr-4">
                {item.word}
              </h2>
            </div>
            <button onClick={handleManualSpeak} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all active:scale-95 flex-shrink-0">
              <Volume2 size={24} />
            </button>
          </div>

          <div className="h-px bg-slate-100 w-full mb-4 sm:mb-6 flex-shrink-0" />

          {/* Scrollable content within fixed-height card */}
          <div className="flex-1 overflow-y-auto pr-2 custom-card-scrollbar space-y-4 sm:space-y-6">
            <p className="text-xl sm:text-3xl font-bold text-blue-700 leading-tight">{item.translation}</p>
            {item.example && (
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 relative">
                <Quote className="absolute top-3 right-4 text-slate-200" size={20} />
                <p className="text-xs sm:text-lg text-slate-700 italic leading-relaxed pr-8">"{item.example}"</p>
              </div>
            )}
            {item.notes && (
              <div className="flex items-start space-x-3 p-4 sm:p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                <Lightbulb size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-base text-slate-600 leading-relaxed">{item.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav arrows */}
        <button disabled={isFirst} onClick={(e) => { e.stopPropagation(); onPrev(); }} className={`hidden sm:flex absolute -left-16 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${isFirst ? 'text-slate-200' : 'bg-white shadow-lg text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
          <ChevronLeft size={28} />
        </button>
        <button disabled={isLast} onClick={(e) => { e.stopPropagation(); onNext(); }} className={`hidden sm:flex absolute -right-16 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${isLast ? 'text-slate-200' : 'bg-white shadow-lg text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Mobile nav buttons - Centered and compact */}
      <div className="mt-6 flex sm:hidden justify-center items-center space-x-6">
        <button
          disabled={isFirst}
          onClick={onPrev}
          className={`p-4 rounded-full transition-all shadow-lg active:scale-90 ${isFirst ? 'bg-slate-200 text-slate-400' : 'bg-white text-slate-700 border border-slate-200'}`}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="px-5 py-2 bg-slate-800 text-white rounded-full font-bold text-xs tracking-widest shadow-inner">
          {item.id}
        </div>
        <button
          disabled={isLast}
          onClick={onNext}
          className={`p-4 rounded-full transition-all shadow-lg active:scale-90 ${isLast ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-200'}`}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <style>{`
        .custom-card-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-card-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default WordCard;
