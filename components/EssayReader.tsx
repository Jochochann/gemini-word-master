import React, { useState } from 'react';
import { EssayItem } from '../types';
import { ChevronLeft, ChevronRight, Volume2, BookOpen, Languages, Play, Square } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

interface EssayReaderProps {
    essays: EssayItem[];
}

const EssayReader: React.FC<EssayReaderProps> = ({ essays }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(true);
    const [showPinyin, setShowPinyin] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const { speak, cancel } = useSpeech();

    if (essays.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
                <div className="p-5 bg-slate-800/50 rounded-full mb-6">
                    <BookOpen className="text-slate-500" size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-300">エッセイがありません</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                    設定からエッセイ用スプレッドシートのシートを追加してください。
                </p>
            </div>
        );
    }

    const essay = essays[currentIndex];
    const isZhTW = essay.lang === 'zh-TW';

    const handlePrev = () => {
        cancel();
        setIsPlaying(false);
        setCurrentIndex(i => (i - 1 + essays.length) % essays.length);
    };
    const handleNext = () => {
        cancel();
        setIsPlaying(false);
        setCurrentIndex(i => (i + 1) % essays.length);
    };

    const handleSpeak = () => {
        if (isPlaying) {
            cancel();
            setIsPlaying(false);
        } else {
            speak(essay.essay, essay.lang, 0.85, () => setIsPlaying(false));
            setIsPlaying(true);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0 bg-slate-900/50">
                <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                        <BookOpen size={18} className="text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-black text-base text-white truncate">{essay.title}</h2>
                        <p className="text-xs text-slate-500 font-mono">{currentIndex + 1} / {essays.length}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    {/* Toggle Pinyin (zh-TW only) */}
                    {isZhTW && essay.pinyin && (
                        <button
                            onClick={() => setShowPinyin(p => !p)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${showPinyin ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                        >
                            拼音
                        </button>
                    )}
                    {/* Toggle Translation */}
                    <button
                        onClick={() => setShowTranslation(p => !p)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${showTranslation ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                        <Languages size={12} className="inline mr-1" />訳
                    </button>
                    {/* Play / Stop button */}
                    <button
                        onClick={handleSpeak}
                        className={`p-2 rounded-xl transition-all active:scale-95 shadow-lg ${isPlaying
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                            }`}
                        title={isPlaying ? '停止' : '読み上げ'}
                    >
                        {isPlaying
                            ? <Square size={16} strokeWidth={2.5} fill="currentColor" />
                            : <Play size={16} strokeWidth={2.5} fill="currentColor" />}
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-6">

                {/* ① Essay Body */}
                <section>
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
                        <BookOpen size={11} />
                        <span>{isZhTW ? 'エッセイ（繁體中文）' : 'Essay (English)'}</span>
                    </label>
                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5 rounded-full -mr-20 -mt-20 blur-[60px] pointer-events-none" />
                        <p className={`relative z-10 leading-loose font-medium text-white ${isZhTW ? 'text-xl tracking-wider' : 'text-lg'}`}
                            style={{ whiteSpace: 'pre-wrap' }}>
                            {essay.essay}
                        </p>
                    </div>
                </section>

                {/* ② Pinyin (zh-TW only) */}
                {isZhTW && essay.pinyin && showPinyin && (
                    <section>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
                            ② 拼音 (Pinyin)
                        </label>
                        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                            <p className="text-slate-300 text-base leading-loose font-mono tracking-wide"
                                style={{ whiteSpace: 'pre-wrap' }}>
                                {essay.pinyin}
                            </p>
                        </div>
                    </section>
                )}

                {/* ③ Japanese Translation */}
                {showTranslation && essay.translation && (
                    <section>
                        <label className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-3 block">
                            {isZhTW ? '③' : '②'} 日本語訳
                        </label>
                        <div className="bg-amber-500/5 rounded-2xl p-5 border border-amber-500/10">
                            <p className="text-slate-200 text-base leading-loose"
                                style={{ whiteSpace: 'pre-wrap' }}>
                                {essay.translation}
                            </p>
                        </div>
                    </section>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-900/30 flex items-center justify-between gap-4">
                <button
                    onClick={handlePrev}
                    disabled={essays.length <= 1}
                    className="flex items-center space-x-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm"
                >
                    <ChevronLeft size={18} />
                    <span>前へ</span>
                </button>

                <div className="flex space-x-1.5">
                    {essays.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`rounded-full transition-all ${i === currentIndex ? 'w-5 h-2 bg-indigo-500' : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={essays.length <= 1}
                    className="flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-indigo-600/20"
                >
                    <span>次へ</span>
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default EssayReader;
