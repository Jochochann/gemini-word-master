
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
  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let timeoutId: number | undefined;

    if (item.word) {
      window.speechSynthesis.cancel();
      const wordUtterance = new SpeechSynthesisUtterance(item.word);
      wordUtterance.lang = lang;
      wordUtterance.rate = 0.85;

      wordUtterance.onend = () => {
        if (item.example && lang !== 'zh-TW') {
          timeoutId = window.setTimeout(() => {
            const exampleUtterance = new SpeechSynthesisUtterance(item.example!);
            exampleUtterance.lang = lang;
            exampleUtterance.rate = 0.85;
            window.speechSynthesis.speak(exampleUtterance);
          }, 500);
        }
      };

      window.speechSynthesis.speak(wordUtterance);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.speechSynthesis.cancel();
    };
  }, [item.word, lang]);

  const handleManualSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(item.word);
  };

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.example) {
      speakText(item.example);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 sm:px-0 flex flex-col items-center">
      <div className="w-full h-[520px] sm:h-[680px] bg-slate-900 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-800 flex flex-col p-8 sm:p-14 relative overflow-hidden group">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-[80px] opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full -ml-24 -mb-24 blur-[60px] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-start mb-8 flex-shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 w-fit border border-indigo-400/20">
                {lang === 'zh-TW' ? 'Taiwanese' : 'English'}
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight break-words pr-4 leading-[1.1]">
                {item.word}
              </h2>
            </div>
            <button 
              onClick={handleManualSpeak} 
              className="p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex-shrink-0 mt-1"
            >
              <Volume2 size={28} strokeWidth={2.5} />
            </button>
          </div>

          <div className="h-px bg-slate-800/50 w-full mb-8 flex-shrink-0" />

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
            <p className="text-3xl sm:text-5xl font-bold text-indigo-300 leading-tight">
              {item.translation}
            </p>

            {item.example && (
              <div className="bg-slate-950/40 p-6 sm:p-8 rounded-[2rem] border border-slate-800/50 relative group/example backdrop-blur-sm">
                <div className="flex justify-between items-start mb-3">
                  <Quote className="text-slate-700" size={28} />
                  {lang !== 'zh-TW' && (
                    <button 
                      onClick={handleSpeakExample} 
                      className="p-2.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all"
                    >
                      <Volume2 size={22} />
                    </button>
                  )}
                </div>
                <p className="text-lg sm:text-2xl text-slate-300 italic font-medium leading-relaxed pr-2">
                  "{item.example}"
                </p>
              </div>
            )}

            {item.notes && (
              <div className="flex items-start space-x-4 p-6 sm:p-8 bg-amber-500/5 rounded-[2rem] border border-amber-500/10">
                <Lightbulb size={24} className="text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-base sm:text-xl text-slate-400 leading-relaxed font-medium">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <button 
          disabled={isFirst} 
          onClick={(e) => { e.stopPropagation(); onPrev(); }} 
          className={`hidden sm:flex absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all ${isFirst ? 'text-slate-800' : 'bg-slate-900 border border-slate-800 shadow-2xl text-slate-400 hover:text-indigo-400 hover:scale-110 active:scale-95'}`}
        >
          <ChevronLeft size={36} />
        </button>
        <button 
          disabled={isLast} 
          onClick={(e) => { e.stopPropagation(); onNext(); }} 
          className={`hidden sm:flex absolute -right-12 lg:-right-20 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all ${isLast ? 'text-slate-800' : 'bg-slate-900 border border-slate-800 shadow-2xl text-slate-400 hover:text-indigo-400 hover:scale-110 active:scale-95'}`}
        >
          <ChevronRight size={36} />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="mt-10 flex sm:hidden justify-center items-center space-x-10">
        <button 
          disabled={isFirst} 
          onClick={onPrev} 
          className={`p-5 rounded-full border transition-all ${isFirst ? 'bg-slate-900/50 border-slate-800 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-300 shadow-xl active:scale-90'}`}
        >
          <ChevronLeft size={32} />
        </button>
        <div className="px-8 py-3.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-full font-black text-xs tracking-widest shadow-inner">
          {item.id.padStart(2, '0')}
        </div>
        <button 
          disabled={isLast} 
          onClick={onNext} 
          className={`p-5 rounded-full border transition-all ${isLast ? 'bg-slate-900/50 border-slate-800 text-slate-800' : 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-90'}`}
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default WordCard;
