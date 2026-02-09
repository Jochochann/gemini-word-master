
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

  // 自動読み上げのロジック
  useEffect(() => {
    let timeoutId: number | undefined;

    if (item.word) {
      // 以前の音声を停止
      window.speechSynthesis.cancel();

      // 1. 単語/熟語の読み上げ準備
      const wordUtterance = new SpeechSynthesisUtterance(item.word);
      wordUtterance.lang = lang;
      wordUtterance.rate = 0.85;

      // 2. 単語の読み上げが終了した時のイベント
      wordUtterance.onend = () => {
        // 繁体字中国語（台湾）の場合は熟語のみを読み上げ、例文はスキップする
        // それ以外の言語（英語など）は、単語の後に例文も自動で読み上げる
        if (item.example && lang !== 'zh-TW') {
          // 少し間（500ms）を置いてから例文を読み上げる
          timeoutId = window.setTimeout(() => {
            const exampleUtterance = new SpeechSynthesisUtterance(item.example!);
            exampleUtterance.lang = lang;
            exampleUtterance.rate = 0.85;
            window.speechSynthesis.speak(exampleUtterance);
          }, 500);
        }
      };

      // 3. 再生開始
      window.speechSynthesis.speak(wordUtterance);
    }

    // クリーンアップ: コンポーネントが更新・アンマウントされる際にタイマーと音声をクリア
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
    <div className="relative w-full max-w-xl mx-auto px-1 sm:px-0 flex flex-col items-center">
      {/* Fixed height card with internal scroll */}
      <div className="w-full h-[480px] sm:h-[620px] bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col p-7 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 z-0" />

        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-start mb-5 sm:mb-8 flex-shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded-md uppercase tracking-widest mb-3 w-fit">
                {lang === 'zh-TW' ? 'Taiwanese' : 'English'}
              </span>
              <h2 className="text-3xl sm:text-6xl font-extrabold text-slate-900 tracking-tight break-words pr-4 leading-none">
                {item.word}
              </h2>
            </div>
            <button
              onClick={handleManualSpeak}
              className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all active:scale-95 flex-shrink-0 mt-1"
              title="単語を読み上げる"
            >
              <Volume2 size={26} />
            </button>
          </div>

          <div className="h-px bg-slate-100 w-full mb-6 sm:mb-8 flex-shrink-0" />

          {/* Scrollable content within fixed-height card */}
          <div className="flex-1 overflow-y-auto pr-2 custom-card-scrollbar space-y-6 sm:space-y-8">
            <p className="text-2xl sm:text-4xl font-bold text-blue-700 leading-snug">{item.translation}</p>

            {item.example && (
              <div className="bg-slate-50 p-5 sm:p-7 rounded-2xl border border-slate-100 relative group">
                <div className="flex justify-between items-start mb-2">
                  <Quote className="text-slate-200" size={24} />
                  {/* zh-TWの場合は、例文の読み上げボタンを非表示にする */}
                  {lang !== 'zh-TW' && (
                    <button
                      onClick={handleSpeakExample}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all active:scale-90"
                      title="例文を読み上げる"
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>
                <p className="text-lg sm:text-2xl text-slate-700 italic leading-relaxed pr-2">"{item.example}"</p>
              </div>
            )}

            {item.notes && (
              <div className="flex items-start space-x-3.5 p-5 sm:p-7 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                <Lightbulb size={22} className="text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-medium">{item.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav arrows */}
        <button disabled={isFirst} onClick={(e) => { e.stopPropagation(); onPrev(); }} className={`hidden sm:flex absolute -left-16 top-1/2 -translate-y-1/2 p-3.5 rounded-full transition-all ${isFirst ? 'text-slate-200' : 'bg-white shadow-lg text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
          <ChevronLeft size={30} />
        </button>
        <button disabled={isLast} onClick={(e) => { e.stopPropagation(); onNext(); }} className={`hidden sm:flex absolute -right-16 top-1/2 -translate-y-1/2 p-3.5 rounded-full transition-all ${isLast ? 'text-slate-200' : 'bg-white shadow-lg text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
          <ChevronRight size={30} />
        </button>
      </div>

      {/* Mobile nav buttons - Centered and compact */}
      <div className="mt-8 flex sm:hidden justify-center items-center space-x-8">
        <button
          disabled={isFirst}
          onClick={onPrev}
          className={`p-5 rounded-full transition-all shadow-lg active:scale-90 ${isFirst ? 'bg-slate-200 text-slate-400' : 'bg-white text-slate-700 border border-slate-200'}`}
        >
          <ChevronLeft size={28} />
        </button>
        <div className="px-6 py-3 bg-slate-800 text-white rounded-full font-bold text-sm tracking-widest shadow-inner">
          {item.id}
        </div>
        <button
          disabled={isLast}
          onClick={onNext}
          className={`p-5 rounded-full transition-all shadow-lg active:scale-90 ${isLast ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-200'}`}
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <style>{`
        .custom-card-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-card-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default WordCard;
