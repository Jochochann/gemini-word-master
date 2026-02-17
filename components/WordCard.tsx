
import React, { useEffect } from 'react';
import { WordItem } from '../types';
import { Volume2, Lightbulb, ChevronRight, ChevronLeft, Quote } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

interface WordCardProps {
  item: WordItem;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalCount: number;
  lang?: string;
  onSpeechComplete?: () => void;
}

const WordCard: React.FC<WordCardProps> = ({ item, onNext, onPrev, currentIndex, totalCount, lang = 'en-US', onSpeechComplete }) => {
  const { speak, cancel } = useSpeech();

  const speakText = (text: string) => {
    speak(text, lang, 0.85);
  };

  useEffect(() => {
    let timeoutId: number | undefined;

    if (item.word) {
      speak(item.word, lang, 0.85, () => {
        if (item.example && lang !== 'zh-TW') {
          timeoutId = window.setTimeout(() => {
            speak(item.example!, lang, 0.85, () => {
              if (onSpeechComplete) onSpeechComplete();
            });
          }, 500);
        } else {
          if (onSpeechComplete) onSpeechComplete();
        }
      });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      cancel();
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
      {/* Container Padding: p-6 sm:p-10 -> p-5 sm:p-8 */}
      <div className="w-full h-[500px] sm:h-[620px] bg-slate-900 rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-800 flex flex-col p-5 sm:p-8 relative overflow-hidden group">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-[80px] opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full -ml-24 -mb-24 blur-[60px] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          {/* Header Margin: mb-4 -> mb-2 */}
          <div className="flex justify-between items-start mb-2 flex-shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full uppercase tracking-[0.2em] mb-2 w-fit border border-indigo-400/20">
                {lang === 'zh-TW' ? 'Taiwanese' : 'English'}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-50 tracking-tight break-words pr-4 leading-tight">
                {item.word}
              </h2>
            </div>
            <button
              onClick={handleManualSpeak}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex-shrink-0 mt-1"
            >
              <Volume2 size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Divider Margin: mb-6 -> mb-3 */}
          <div className="h-px bg-slate-800/50 w-full mb-3 flex-shrink-0" />

          {/* Content Area space-y: space-y-5 -> space-y-3 */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            <p className="text-2xl sm:text-4xl font-bold text-indigo-300 leading-tight">
              {item.translation}
            </p>

            {item.example && (
              /* Example Box: Reduced padding and integrated header */
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 relative backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Quote className="text-slate-600" size={14} />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Example</span>
                  </div>
                  {lang !== 'zh-TW' && (
                    <button
                      onClick={handleSpeakExample}
                      className="p-1 text-slate-500 hover:text-indigo-400 transition-all"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-base sm:text-xl text-slate-300 italic font-medium leading-snug">
                  {item.example}
                </p>
              </div>
            )}

            {item.notes && (
              /* Notes: Reduced padding and space */
              <div className="flex items-start space-x-2.5 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <Lightbulb size={16} className="text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-sm sm:text-lg text-slate-400 leading-snug font-medium">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="hidden sm:flex absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all bg-slate-900 border border-slate-800 shadow-2xl text-slate-400 hover:text-indigo-400 hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={36} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="hidden sm:flex absolute -right-12 lg:-right-20 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all bg-slate-900 border border-slate-800 shadow-2xl text-slate-400 hover:text-indigo-400 hover:scale-110 active:scale-95"
        >
          <ChevronRight size={36} />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="mt-6 flex sm:hidden justify-center items-center space-x-8">
        <button
          onClick={onPrev}
          className="p-3.5 rounded-full border transition-all bg-slate-900 border-slate-700 text-slate-300 shadow-xl active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="px-5 py-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-full font-black text-[10px] tracking-widest shadow-inner">
          {currentIndex + 1} / {totalCount}
        </div>
        <button
          onClick={onNext}
          className="p-3.5 rounded-full border transition-all bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default WordCard;
