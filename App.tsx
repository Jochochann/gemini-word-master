
import React, { useState, useEffect } from 'react';
import { AppState, WordItem, ViewMode } from './types.ts';
import WordCard from './components/WordCard.tsx';
import WordList from './components/WordList.tsx';
import GeminiAssistant from './components/GeminiAssistant.tsx';
import { 
  Database, 
  Settings, 
  ExternalLink, 
  Loader2, 
  BookOpen, 
  Menu, 
  X,
  Plus,
  Layers,
  LayoutGrid,
  CreditCard
} from 'lucide-react';

const DEFAULT_SHEET_ID = '1Ul94nfm4HbnoIeUyElhBXC6gPOsbbU-nsDjkzoY_gPU';
const DEFAULT_GIDS = '420352437'; // Can be comma-separated like "0, 420352437"

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    words: [],
    currentIndex: 0,
    isLoading: true,
    spreadsheetId: '',
    isSettingsOpen: false,
    viewMode: 'card'
  });

  const [inputUrl, setInputUrl] = useState('');
  const [inputGids, setInputGids] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize and auto-fetch
  useEffect(() => {
    const savedId = localStorage.getItem('gemini_word_master_sheet_id');
    const savedGids = localStorage.getItem('gemini_word_master_sheet_gids');
    
    const targetId = savedId || DEFAULT_SHEET_ID;
    const targetGids = savedGids || DEFAULT_GIDS;
    
    setInputUrl(`https://docs.google.com/spreadsheets/d/${targetId}/edit`);
    setInputGids(targetGids);
    
    fetchMultipleSheets(targetId, targetGids);
  }, []);

  const fetchSingleSheet = async (id: string, gid: string): Promise<Omit<WordItem, 'id'>[]> => {
    let url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
    if (gid && gid !== '0') {
      url += `&gid=${gid}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch sheet ${gid}`);
    const csvText = await response.text();
    
    const lines = csvText.split('\n');
    return lines.slice(1).map((line) => {
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
      return {
        word: parts[1] || '',
        translation: parts[2] || '',
        example: parts[3] || '',
        notes: parts[4] || ''
      };
    }).filter(w => w.word !== '');
  };

  const fetchMultipleSheets = async (id: string, gidsString: string) => {
    if (!id) return;
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const gidList = gidsString.split(',').map(g => g.trim()).filter(g => g !== '');
      if (gidList.length === 0) gidList.push('0');

      const results = await Promise.all(gidList.map(gid => fetchSingleSheet(id, gid)));
      
      const mergedWords: WordItem[] = results.flat().map((w, idx) => ({
        ...w,
        id: (idx + 1).toString()
      }));

      if (mergedWords.length > 0) {
        setState(prev => ({ 
          ...prev, 
          words: mergedWords, 
          spreadsheetId: id,
          currentIndex: 0,
          isLoading: false
        }));
        localStorage.setItem('gemini_word_master_sheet_id', id);
        localStorage.setItem('gemini_word_master_sheet_gids', gidsString);
      } else {
        throw new Error('No data found in any of the sheets');
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      setState(prev => ({ ...prev, isLoading: false }));
      alert('スプレッドシートの読み込みに失敗しました。各シートが公開設定になっているか確認してください。');
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let id = '';
    
    if (inputUrl.includes('docs.google.com/spreadsheets')) {
      const idMatch = inputUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (idMatch) id = idMatch[1];
    } else {
      id = inputUrl;
    }

    if (id) {
      fetchMultipleSheets(id, inputGids);
      setState(prev => ({ ...prev, isSettingsOpen: false }));
    } else {
      alert('無効なURLまたはIDです。');
    }
  };

  const setViewMode = (mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const handleSelectWordFromList = (index: number) => {
    setState(prev => ({ ...prev, currentIndex: index, viewMode: 'card' }));
  };

  const currentWord = state.words[state.currentIndex];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BookOpen size={20} />
            </div>
            <h1 className="font-bold text-lg text-slate-800">Word Master</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your List ({state.words.length})</h2>
            <button 
              onClick={() => setState(prev => ({ ...prev, isSettingsOpen: true }))}
              className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-1">
            {state.words.map((w, idx) => (
              <button
                key={`${w.id}-${idx}`}
                onClick={() => setState(prev => ({ ...prev, currentIndex: idx, viewMode: 'card' }))}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group ${
                  idx === state.currentIndex && state.viewMode === 'card'
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-semibold text-sm truncate">{w.word}</div>
                  <div className={`text-xs truncate ${idx === state.currentIndex && state.viewMode === 'card' ? 'text-blue-500' : 'text-slate-400'}`}>
                    {w.translation}
                  </div>
                </div>
                {idx === state.currentIndex && state.viewMode === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={() => setState(prev => ({ ...prev, isSettingsOpen: true }))}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Settings size={18} />
            <span className="font-medium text-sm">Settings & Merge</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <Menu size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium leading-none">Flashcards</span>
              <span className="text-sm text-slate-700 font-bold">
                {state.viewMode === 'card' ? 'Practice Mode' : 'Library View'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('card')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                state.viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CreditCard size={14} />
              <span>Card</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                state.viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={14} />
              <span>List</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
             {state.isLoading && <Loader2 size={18} className="animate-spin text-blue-600" />}
             <div className="hidden sm:flex items-center bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold text-slate-500">
               {state.words.length > 0 ? `${state.currentIndex + 1} / ${state.words.length}` : '0 / 0'}
             </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 overflow-y-auto">
            {state.isLoading ? (
              <div className="text-center">
                <Loader2 className="mx-auto text-blue-500 animate-spin mb-4" size={48} />
                <p className="text-slate-600 font-bold">Merging multiple sheets...</p>
                <p className="text-slate-400 text-sm mt-2">Syncing all tabs into one list.</p>
              </div>
            ) : state.viewMode === 'card' ? (
              currentWord ? (
                <div className="p-8 w-full flex justify-center">
                  <WordCard 
                    item={currentWord}
                    onNext={() => setState(prev => ({ ...prev, currentIndex: Math.min(prev.words.length - 1, prev.currentIndex + 1) }))}
                    onPrev={() => setState(prev => ({ ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) }))}
                    isFirst={state.currentIndex === 0}
                    isLast={state.currentIndex === state.words.length - 1}
                  />
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-sm text-center">
                  <Database className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-600 mb-6">No words found in the provided sheets.</p>
                  <button 
                    onClick={() => setState(prev => ({ ...prev, isSettingsOpen: true }))}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    Configure Sources
                  </button>
                </div>
              )
            ) : (
              <WordList 
                words={state.words} 
                onSelectWord={handleSelectWordFromList} 
              />
            )}
          </div>

          {state.viewMode === 'card' && currentWord && (
            <div className="w-full lg:w-96 hidden md:block">
              <GeminiAssistant key={currentWord.id + currentWord.word} currentWord={currentWord} />
            </div>
          )}
        </div>
      </main>

      {state.isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Layers size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Merge Sheets</h2>
              </div>
              <button onClick={() => setState(prev => ({ ...prev, isSettingsOpen: false }))} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Spreadsheet URL</label>
                <input 
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target GIDs</label>
                <input 
                  type="text"
                  value={inputGids}
                  onChange={(e) => setInputGids(e.target.value)}
                  placeholder="e.g., 0, 420352437"
                  className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={state.isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50"
              >
                Apply & Sync All
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
