
import React from 'https://esm.sh/react@19.2.4';
import { WordItem } from '../types';
import {
  Search,
  ExternalLink,
  Image as ImageIcon,
  Book,
  Globe,
  MessageSquare,
  Languages,
  BookOpen,
  HelpCircle
} from 'https://esm.sh/lucide-react?external=react';

interface SearchAssistantProps {
  currentWord: WordItem;
  lang?: string;
}

const GeminiAssistant: React.FC<SearchAssistantProps> = ({ currentWord, lang = 'en-US' }) => {
  const { word } = currentWord;

  const openSearch = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSearchResources = () => {
    const encodedWord = encodeURIComponent(word);

    // Start with a generic search resource
    const resources = [
      {
        id: 'google',
        name: 'Google 検索',
        icon: <Search className="text-blue-500" />,
        url: `https://www.google.com/search?q=${encodedWord}+meaning+japanese`,
        description: 'Googleで一般的な意味や使い方を調べる'
      }
    ];

    if (lang === 'zh-TW') {
      // Traditional Chinese specific resources
      resources.push(
        {
          id: 'moedict',
          name: '萌典 (MoeDict)',
          icon: <Book className="text-red-500" />,
          url: `https://www.moedict.tw/${encodedWord}`,
          description: '台湾華語の標準的な辞書'
        },
        {
          id: 'images',
          name: '画像検索',
          icon: <ImageIcon className="text-purple-500" />,
          url: `https://www.google.com/search?tbm=isch&q=${encodedWord}`,
          description: '画像で視覚的なイメージを掴む'
        },
        {
          id: 'google-zh',
          name: 'Google 台湾',
          icon: <Globe className="text-green-500" />,
          url: `https://www.google.com.tw/search?q=${encodedWord}+意思`,
          description: '台湾のサイトから用例を探す'
        }
      );
    } else {
      // English specific - YouGlish moved to 2nd position
      resources.push(
        {
          id: 'youglish',
          name: 'YouGlish',
          icon: <MessageSquare className="text-red-600" />,
          url: `https://youglish.com/pronounce/${encodedWord}/english`,
          description: 'YouTubeのリアルな発音を聞く'
        },
        {
          id: 'images',
          name: '画像検索',
          icon: <ImageIcon className="text-purple-500" />,
          url: `https://www.google.com/search?tbm=isch&q=${encodedWord}`,
          description: '画像で視覚的なイメージを掴む'
        },
        {
          id: 'weblio',
          name: 'Weblio 英和辞典',
          icon: <Book className="text-blue-600" />,
          url: `https://ejje.weblio.jp/content/${encodedWord}`,
          description: '詳しい和訳と例文を確認する'
        },
        {
          id: 'cambridge',
          name: 'Cambridge Dict',
          icon: <Languages className="text-orange-500" />,
          url: `https://dictionary.cambridge.org/dictionary/english/${encodedWord}`,
          description: '英英辞典で正確な定義を確認する'
        }
      );
    }

    return resources;
  };

  const resources = getSearchResources();

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <BookOpen className="text-blue-500" size={22} />
          <h3 className="font-bold text-lg text-slate-800 tracking-tight">辞書・検索ツール</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-2">学習中の単語</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-none mb-2">{word}</h2>
          <p className="text-xl sm:text-2xl text-blue-700 font-bold">{currentWord.translation}</p>
        </div>

        <div className="space-y-3">
          <p className="text-base font-bold text-slate-400 uppercase tracking-widest ml-1">リソースを選択</p>

          {resources.map((res) => (
            <button
              key={res.id}
              onClick={() => openSearch(res.url)}
              className="w-full text-left p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all group flex items-start space-x-4 shadow-sm active:scale-[0.98]"
            >
              <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                {res.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">{res.name}</span>
                  <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-500" />
                </div>
                <p className="text-base text-slate-500 mt-1">{res.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <div className="flex items-center space-x-2 mb-3">
            <HelpCircle size={18} className="text-slate-400" />
            <span className="text-base font-bold text-slate-500">学習のヒント</span>
          </div>
          <ul className="text-base text-slate-600 space-y-2 list-disc pl-5">
            <li>YouGlishはYouTubeから生の会話音声を探せる最強のツールです。</li>
            <li>画像検索で「言葉のイメージ」を覚えるのが近道です。</li>
            <li>和訳だけでなく英英辞典の定義も読むと深まります。</li>
          </ul>
        </div>
      </div>

      <div className="p-5 border-t border-slate-100 bg-slate-50 text-center">
        <p className="text-sm text-slate-400 font-medium">
          外部ブラウザで詳細情報を開きます
        </p>
      </div>
    </div>
  );
};

export default GeminiAssistant;
