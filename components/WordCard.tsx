
import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { Volume2, RotateCw, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react';

interface WordCardProps {
  item: WordItem;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ item, onNext, onPrev, isFirst, isLast }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Function to handle speech synthesis
  const speakWord = (word: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for better clarity
    window.speechSynthesis.speak(utterance);
  };

  // Automatically speak when the word changes
  useEffect(() => {
    if (item.word) {
      speakWord(item.word);
    }
    // Reset flip state when moving to a new word
    setIsFlipped(false);
  }, [item.word]);

  const handleManualSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(item.word);
  };

  return (
    <div className="w-full max-w-xl mx-auto perspective-1000 h-96 relative group">
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center justify-center p-8">
          <div className="absolute top-6 right-6 flex space-x-2">
            <button 
              onClick={handleManualSpeak}
              className="p-3 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-full transition-colors"
              title="Listen again"
            >
              <Volume2 size={24} />
            </button>
          </div>
          <h2 className="text-5xl font-bold text-slate-800 tracking-tight text-center">{item.word}</h2>
          <p className="mt-8 text-slate-400 text-sm font-medium animate-pulse flex items-center">
            <RotateCw size={14} className="mr-2" /> Click to flip
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-blue-50 rounded-3xl shadow-xl border border-blue-200 flex flex-col p-8 overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="text-3xl font-bold text-blue-900 mb-4">{item.translation}</h3>
            {item.example && (
              <div className="bg-white/50 p-4 rounded-xl border border-blue-100 w-full">
                <p className="text-lg text-slate-700 italic font-serif">"{item.example}"</p>
              </div>
            )}
            {item.notes && (
              <div className="mt-4 flex items-start text-left w-full space-x-2 text-slate-600 text-sm">
                <Lightbulb size={16} className="text-amber-500 mt-1 flex-shrink-0" />
                <p>{item.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute -bottom-16 left-0 right-0 flex justify-between items-center px-4">
        <button
          disabled={isFirst}
          onClick={onPrev}
          className={`p-3 rounded-full transition-all ${isFirst ? 'text-slate-300' : 'bg-white shadow-md text-slate-600 hover:bg-slate-50'}`}
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-slate-400 font-medium text-sm">
          Progress: {item.id}
        </div>
        <button
          disabled={isLast}
          onClick={onNext}
          className={`p-3 rounded-full transition-all ${isLast ? 'text-slate-300' : 'bg-blue-600 shadow-md text-white hover:bg-blue-700'}`}
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
