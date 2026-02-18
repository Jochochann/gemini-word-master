
import React, { useEffect, useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Lightbulb, ChevronRight, ChevronLeft, Quote, Star, Mic, MicOff, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { calculateSimilarity } from '../utils/similarity';

interface WordCardProps {
  item: WordItem;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalCount: number;
  lang?: string;
  onSpeechComplete?: () => void;
  autoPlayTrigger?: number;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  isPracticeMode?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ item, onNext, onPrev, currentIndex, totalCount, lang = 'en-US', onSpeechComplete, autoPlayTrigger, isBookmarked, onToggleBookmark, isPracticeMode = false }) => {
  const { speak, cancel } = useSpeech();
  const [isRevealed, setIsRevealed] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, hasRecognitionSupport } = useSpeechRecognition();
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'close' | 'incorrect' | null, score: number }>({ type: null, score: 0 });

  useEffect(() => {
    setIsRevealed(false);
    resetTranscript();
    stopListening();
    setFeedback({ type: null, score: 0 });
  }, [item.id, isPracticeMode]);

  useEffect(() => {
    if (transcript && item.example) {
      const score = calculateSimilarity(transcript, item.example);
      let type: 'correct' | 'close' | 'incorrect' = 'incorrect';
      if (score >= 90) type = 'correct';
      else if (score >= 70) type = 'close';

      setFeedback({ type, score });

      if (score >= 90) {
        setIsRevealed(true);
      }
    }
  }, [transcript, item.example]);

  const speakText = (text: string) => {
    speak(text, lang, 0.85);
  };

  useEffect(() => {
    let timeoutId: number | undefined;

    if (item.word && !isPracticeMode) {
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
  }, [item.word, lang, autoPlayTrigger]);

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
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                {item.partOfSpeech && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-black tracking-widest uppercase border border-indigo-500/30">
                    {item.partOfSpeech}
                  </span>
                )}
                {item.pronunciation && (
                  <span className="text-slate-300 text-xs font-mono tracking-tight opacity-80">/{item.pronunciation}/</span>
                )}
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                {item.word}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              {onToggleBookmark && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
                  className={`p-3 rounded-xl shadow-xl transition-all active:scale-95 flex-shrink-0 mt-1 ${isBookmarked ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  <Star size={20} strokeWidth={isBookmarked ? 2.5 : 2} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
              )}
              <button
                onClick={handleManualSpeak}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex-shrink-0 mt-1"
              >
                <Volume2 size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Divider Margin: mb-6 -> mb-3 */}
          <div className="h-px bg-slate-800/50 w-full mb-3 flex-shrink-0" />

          {/* Content Area space-y: space-y-5 -> space-y-3 */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">

            {/* Definition / Meaning Box */}
            {!isPracticeMode && (
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Lightbulb size={48} className="text-amber-400" />
                </div>
                <div className="flex items-start space-x-3 relative z-10">
                  <Lightbulb className="text-amber-400 flex-shrink-0 mt-1" size={20} />
                  <p className="text-xl sm:text-2xl font-bold text-indigo-100 leading-relaxed tracking-wide">
                    {item.definition || item.translation}
                  </p>
                </div>
              </div>
            )}

            {/* Example Box */}
            {item.example && (
              <div className="flex items-start space-x-3 p-5 rounded-2xl bg-slate-800/30 border border-slate-800/30 hover:bg-slate-800/50 transition-colors group/example cursor-pointer min-h-[100px]">
                <Quote className="text-slate-500 flex-shrink-0 mt-1" size={18} />
                <div className="space-y-3 w-full">
                  {isPracticeMode ? (
                    <>
                      {/* Japanese Translation (Always Visible) */}
                      <p className="text-base sm:text-lg text-amber-400/90 font-bold leading-relaxed tracking-wide">
                        {item.exampleTranslation || 'No translation available'}
                      </p>
                      {/* English Original (Hidden/Blurred) - Reveal on Click/Tap */}
                      <div
                        className="border-t border-slate-700/50 pt-3"
                        onClick={(e) => { e.stopPropagation(); setIsRevealed(!isRevealed); }}
                      >
                        <p className={`text-lg sm:text-xl text-slate-300 italic font-medium leading-relaxed font-serif transition-all duration-300 select-none ${isRevealed ? 'blur-0' : 'blur-md'}`}>
                          "{item.example}"
                        </p>
                      </div>

                      {/* Voice Input Controls */}
                      {hasRecognitionSupport && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col items-center space-y-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-4 rounded-full transition-all flex items-center justify-center shadow-lg ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                          >
                            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                          </button>

                          {isListening && <p className="text-xs text-rose-400 font-bold uppercase tracking-wider animate-pulse">Listening...</p>}

                          {transcript && (
                            <div className="w-full bg-slate-900/80 p-3 rounded-xl border border-slate-700/50">
                              <p className="text-sm text-slate-300 font-mono text-center break-words mb-2">
                                "{transcript}"
                              </p>
                              <div className="flex justify-end items-center border-t border-white/10 pt-2">
                                <span className="text-xs font-bold">{feedback.score}% Match</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-lg sm:text-xl text-slate-300 italic font-medium leading-relaxed font-serif">"{item.example}"</p>
                      {item.exampleTranslation && <p className="text-slate-500 text-sm border-t border-slate-700/50 pt-2">{item.exampleTranslation}</p>}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="flex items-start space-x-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <div className="bg-amber-500/10 p-1.5 rounded-lg">
                  <Lightbulb size={14} className="text-amber-500" />
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium mt-0.5">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="hidden sm:flex absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all bg-slate-900 border border-slate-800 shadow-2xl text-slate-300 hover:text-indigo-400 hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={36} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="hidden sm:flex absolute -right-12 lg:-right-20 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all bg-slate-900 border border-slate-800 shadow-2xl text-slate-300 hover:text-indigo-400 hover:scale-110 active:scale-95"
        >
          <ChevronRight size={36} />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="mt-8 flex sm:hidden justify-center items-center space-x-6 pb-4">
        <button
          onClick={onPrev}
          className="p-4 rounded-full border transition-all bg-slate-900 border-slate-700 text-slate-300 shadow-lg active:scale-95"
        >
          <ChevronLeft size={26} />
        </button>
        <div className="px-6 py-2.5 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-2xl font-black text-sm tracking-widest shadow-inner backdrop-blur-sm min-w-[100px] text-center">
          {currentIndex + 1} <span className="text-slate-500">/</span> {totalCount}
        </div>
        <button
          onClick={onNext}
          className="p-4 rounded-full border transition-all bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </div>
  );
};

export default WordCard;
