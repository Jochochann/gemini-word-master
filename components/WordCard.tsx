
import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { Volume2, RotateCw, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react';

interface WordCardProps {
  item: WordItem;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  lang?: string;
}

const WordCard: React.FC<WordCardProps> = ({ item, onNext, onPrev, isFirst, isLast, lang = 'en-US' }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const speakWord = (word: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = 0.85; // Slightly slower for clearer learning
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (item.word) {
      speakWord(item.word);
    }
    setIsFlipped(false);
  }, [item.word, lang]);

  const handleManualSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(item.word);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 sm:px-0">
      <div className="perspective-1000 h-[320px] sm:h-96 relative group">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center justify-center p-6 sm:p-8">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <button 
                onClick={handleManualSpeak}
                className="p-2.5 sm:p-3 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-full transition-colors"
                title="Speak"
              >
                <Volume2 size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-800 tracking-tight text-center px-4 break-words w-full">
              {item.word}
            </h2>
            <div className="mt-4 flex flex-col items-center">
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest mb-4">
                {lang === 'zh-TW' ? 'Taiwanese Mandarin' : 'English'}
              </span>
              <p className="text-slate-400 text-xs sm:text-sm font-medium animate-pulse flex items-center">
                <RotateCw size={14} className="mr-2" /> Click to flip
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-blue-50 rounded-3xl shadow-xl border border-blue-200 flex flex-col p-6 sm:p-8 overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">{item.translation}</h3>
              {item.example && (
                <div className="bg-white/60 p-3 sm:p-4 rounded-xl border border-blue-100 w-full mb-4">
                  <p className="text-sm sm:text-base text-slate-700 italic font-serif leading-relaxed">"{item.example}"</p>
                </div>
              )}
              {item.notes && (
                <div className="flex items-start text-left w-full space-x-2 text-slate-600 text-xs sm:text-sm">
                  <Lightbulb size={16} className="text-amber-500 mt-1 flex-shrink-0" />
                  <p className="leading-tight">{item.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Side Arrows */}
        <button
          disabled={isFirst}
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className={`hidden sm:flex absolute -left-20 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all active:scale-90 ${isFirst ? 'text-slate-200 cursor-not-allowed' : 'bg-white shadow-lg text-slate-600 hover:bg-slate-50'}`}
        >
          <ChevronLeft size={32} />
        </button>
        <button
          disabled={isLast}
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className={`hidden sm:flex absolute -right-20 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all active:scale-90 ${isLast ? 'text-slate-200 cursor-not-allowed' : 'bg-blue-600 shadow-lg text-white hover:bg-blue-700'}`}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Mobile Navigation Controls */}
      <div className="mt-8 flex sm:hidden justify-between items-center">
        <button
          disabled={isFirst}
          onClick={onPrev}
          className={`p-4 rounded-full transition-all active:scale-90 ${isFirst ? 'text-slate-300' : 'bg-white shadow-md text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
        >
          <ChevronLeft size={28} />
        </button>
        <div className="bg-slate-200/50 px-4 py-2 rounded-full text-slate-500 font-bold text-xs">
          {item.id}
        </div>
        <button
          disabled={isLast}
          onClick={onNext}
          className={`p-4 rounded-full transition-all active:scale-90 ${isLast ? 'text-slate-300' : 'bg-blue-600 shadow-md text-white hover:bg-blue-700'}`}
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default WordCard;
