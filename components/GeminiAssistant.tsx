
import React from 'react';
import { WordItem } from '../types';
import {
  Search,
  ExternalLink,
  Image as ImageIcon,
  Book,
  Globe,
  MessageSquare,
  Languages,
  BookOpen
} from 'lucide-react';

interface SearchAssistantProps {
  currentWord: WordItem | undefined;
  lang?: string;
}

const GeminiAssistant: React.FC<SearchAssistantProps> = ({ currentWord, lang = 'en-US' }) => {
  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-slate-400">
        <BookOpen size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">単語を選択してください</p>
      </div>
    );
  }

  const { word } = currentWord;
  const openSearch = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const getSearchResources = () => {
    const encodedWord = encodeURIComponent(word);
    const resources = [{ id: 'google', name: 'Google 検索', icon: <Search className="text-blue-500" />, url: `https://www.google.com/search?q=${encodedWord}+meaning+japanese`, description: '一般的な意味や使い方を調べる' }];

    if (lang === 'zh-TW') {
      resources.push(
        { id: 'moedict', name: '萌典 (MoeDict)', icon: <Book className="text-red-500" />, url: `https://www.moedict.tw/${encodedWord}`, description: '台湾華語の標準的な辞書' },
        { id: 'images', name: '画像検索', icon: <ImageIcon className="text-purple-500" />, url: `https://www.google.com/search?tbm=isch&q=${encodedWord}`, description: '画像でイメージを掴む' },
        { id: 'google-zh', name: 'Google 台湾', icon: <Globe className="text-green-500" />, url: `https://www.google.com.tw/search?q=${encodedWord}+意思`, description: '台湾の用例を探す' }
      );
    } else {
      resources.push(
        { id: 'youglish', name: 'YouGlish', icon: <MessageSquare className="text-red-600" />, url: `https://youglish.com/pronounce/${encodedWord}/english`, description: 'YouTubeでリアルな発音を聞く' },
        { id: 'images', name: '画像検索', icon: <ImageIcon className="text-purple-500" />, url: `https://www.google.com/search?tbm=isch&q=${encodedWord}`, description: '画像でイメージを掴む' },
        { id: 'weblio', name: 'Weblio 英和辞典', icon: <Book className="text-blue-600" />, url: `https://ejje.weblio.jp/content/${encodedWord}`, description: '詳しい和訳と例文を確認' }
      );
    }
    return resources;
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center space-x-2.5">
        <BookOpen className="text-blue-500" size={22} /><h3 className="font-bold text-lg text-slate-800">辞書・検索ツール</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-2">学習中の単語</span>
          <h2 className="text-3xl font-black text-slate-900 leading-none mb-2">{word}</h2>
          <p className="text-xl text-blue-700 font-bold">{currentWord.translation}</p>
        </div>
        <div className="space-y-3">
          <p className="text-base font-bold text-slate-400 uppercase tracking-widest">リソースを選択</p>
          {getSearchResources().map((res) => (
            <button key={res.id} onClick={() => openSearch(res.url)} className="w-full text-left p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all group flex items-start space-x-4">
              <div className="p-3 bg-slate-50 rounded-xl">{res.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between"><span className="text-xl font-bold text-slate-800">{res.name}</span><ExternalLink size={18} className="text-slate-300" /></div>
                <p className="text-base text-slate-500 mt-1">{res.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
