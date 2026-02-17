
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, WordItem, ViewMode, SheetConfig } from './types.ts';
import WordCard from './components/WordCard.tsx';
import WordList from './components/WordList.tsx';
import GeminiAssistant from './components/GeminiAssistant.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSpreadsheetWords, extractId, DEFAULT_SHEETS, DEFAULT_SHEET_ID } from './services/spreadsheet';
import LanguageSelector from './components/LanguageSelector';
import {
  Settings,
  Loader2,
  BookOpen,
  Menu,
  X,
  LayoutGrid,
  ChevronDown,
  Languages,
  AlertCircle,
  Play,
  Search,
  RefreshCw,
  Sparkles,
  Link2,
  Plus,
  Trash2,
  Type
} from 'lucide-react';








const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AppState>({
    words: [],
    currentIndex: 0,
    isLoading: true,
    spreadsheetId: '',
    sheets: [],
    currentSheetGid: '',
    isSettingsOpen: false,
    viewMode: 'list'
  });

  const [inputUrl, setInputUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpenMobile, setIsAssistantOpenMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'en' | 'tw' | null>(null);

  const { data: fetchedWords, isLoading: isQueryLoading, error: queryError, refetch, isRefetching } = useQuery<WordItem[]>({
    queryKey: ['spreadsheet-words', state.spreadsheetId, state.currentSheetGid],
    queryFn: () => fetchSpreadsheetWords(state.spreadsheetId, state.currentSheetGid),
    enabled: !!state.spreadsheetId,
  });

  const currentSheet = useMemo(() => {
    return state.sheets.find((s: SheetConfig) => s.gid === state.currentSheetGid) || state.sheets[0];
  }, [state.sheets, state.currentSheetGid]);

  const englishSheets = useMemo(() => state.sheets.filter(s => s.lang === 'en-US'), [state.sheets]);
  const taiwaneseSheets = useMemo(() => state.sheets.filter(s => s.lang === 'zh-TW'), [state.sheets]);

  useEffect(() => {
    if (window.innerWidth >= 1024) setIsSidebarOpen(true);
    const savedId = localStorage.getItem('gemini_word_master_sheet_id') || DEFAULT_SHEET_ID;
    const savedSheetsStr = localStorage.getItem('gemini_word_master_sheets');

    let targetSheets = [...DEFAULT_SHEETS];
    if (savedSheetsStr) {
      try {
        const saved = JSON.parse(savedSheetsStr);
        // マージロジック: 保存されたデータにないGIDをDEFAULT_SHEETSから探して追加
        const savedGids = new Set(saved.map((s: any) => s.gid));
        const missingDefaults = DEFAULT_SHEETS.filter(d => !savedGids.has(d.gid));
        targetSheets = [...saved, ...missingDefaults];
      } catch (e) {
        console.error("Failed to parse saved sheets", e);
      }
    }

    setInputUrl(`https://docs.google.com/spreadsheets/d/${savedId}/edit`);

    setState(prev => ({
      ...prev,
      spreadsheetId: savedId,
      sheets: targetSheets,
      currentSheetGid: targetSheets[0]?.gid || '0',
      isLoading: false
    }));
  }, []);

  const handleApplySettings = () => {
    const id = extractId(inputUrl);
    if (id) {
      setState(prev => ({
        ...prev,
        spreadsheetId: id,
        isSettingsOpen: false,
        currentIndex: 0
      }));
      localStorage.setItem('gemini_word_master_sheet_id', id);
      localStorage.setItem('gemini_word_master_sheets', JSON.stringify(state.sheets));
    }
  };

  const handleClearCache = async () => {
    setIsRefreshing(true);
    queryClient.removeQueries({ queryKey: ['spreadsheet-words'] });
    await refetch();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const addSheetRow = (lang: string) => {
    const newSheet = { name: `New Sheet`, gid: '0', lang };
    setState(p => ({ ...p, sheets: [...p.sheets, newSheet] }));
  };

  const removeSheetRow = (gid: string) => {
    const newSheets = state.sheets.filter(s => s.gid !== gid);
    setState(p => ({ ...p, sheets: newSheets }));
  };

  const updateSheetRow = (indexInAll: number, updates: Partial<SheetConfig>) => {
    const newSheets = [...state.sheets];
    newSheets[indexInAll] = { ...newSheets[indexInAll], ...updates };
    setState(p => ({ ...p, sheets: newSheets }));
  };

  const displayWords = fetchedWords || [];
  const currentWord = displayWords[state.currentIndex];



  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative font-sans">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transition-transform duration-300 flex flex-col w-72 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5 group">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight">Word Master</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg lg:hidden"><X size={20} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <nav className="space-y-1.5">
            <button onClick={() => setState(p => ({ ...p, viewMode: 'card' }))} className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center space-x-3 mb-2 ${state.viewMode === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Play size={18} /><span className="font-bold text-sm">カード学習</span></button>
            <button onClick={() => setState(p => ({ ...p, viewMode: 'list' }))} className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center space-x-3 mb-2 ${state.viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><LayoutGrid size={18} /><span className="font-bold text-sm">単語一覧</span></button>
            <div className="h-px bg-slate-800 w-full my-4" />
            <div className="px-3 mb-4 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Vocabulary List</span>
              {(isRefetching || isQueryLoading) && <Loader2 size={12} className="animate-spin text-indigo-500" />}
            </div>
            {displayWords.map((w, idx) => (
              <button key={w.id} onClick={() => setState(p => ({ ...p, currentIndex: idx, viewMode: 'card' }))} className={`w-full text-left px-3.5 py-3 rounded-xl transition-all mb-1 group ${idx === state.currentIndex && state.viewMode === 'card' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-800'}`}>
                <div className="truncate text-xs font-medium">{w.word}</div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button onClick={() => setState(p => ({ ...p, isSettingsOpen: true }))} className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700"><Settings size={16} /><span className="font-bold text-xs uppercase tracking-widest">Settings</span></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        <header className="h-20 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 lg:hidden flex-shrink-0 hover:bg-slate-800 rounded-lg"><Menu size={20} /></button>
            <LanguageSelector
              label="EN"
              sheets={englishSheets}
              type="en"
              active={currentSheet?.lang === 'en-US'}
              currentSheetName={currentSheet?.name}
              onSelectSheet={(gid) => setState(p => ({ ...p, currentSheetGid: gid, currentIndex: 0 }))}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              currentSheetGid={state.currentSheetGid}
            />
            <LanguageSelector
              label="TW"
              sheets={taiwaneseSheets}
              type="tw"
              active={currentSheet?.lang === 'zh-TW'}
              currentSheetName={currentSheet?.name}
              onSelectSheet={(gid) => setState(p => ({ ...p, currentSheetGid: gid, currentIndex: 0 }))}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              currentSheetGid={state.currentSheetGid}
            />
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            {state.viewMode === 'card' && (
              <button
                onClick={() => setIsAssistantOpenMobile(!isAssistantOpenMobile)}
                className={`p-2.5 rounded-xl border transition-all ${isAssistantOpenMobile ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-indigo-400 shadow-lg shadow-indigo-600/10 hover:bg-slate-800'} ${isAssistantOpenMobile ? '' : 'lg:hidden'}`}
              >
                <Sparkles size={20} />
              </button>
            )}

            <div className="hidden sm:flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button onClick={() => setState(p => ({ ...p, viewMode: 'card' }))} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold ${state.viewMode === 'card' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>CARD</button>
              <button onClick={() => setState(p => ({ ...p, viewMode: 'list' }))} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold ${state.viewMode === 'list' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>LIST</button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          <div className="flex-1 overflow-y-auto pt-8 pb-32 custom-scrollbar">
            {(isQueryLoading && displayWords.length === 0) ? (
              <div className="flex flex-col items-center py-20 animate-pulse">
                <Loader2 className="text-indigo-500 animate-spin mb-6" size={48} />
                <p className="text-slate-500 text-sm tracking-widest uppercase">Fetching Words...</p>
              </div>
            ) : queryError ? (
              <div className="flex flex-col items-center py-20 text-center px-6">
                <div className="p-4 bg-red-500/10 rounded-full mb-6"><AlertCircle className="text-red-500" size={48} /></div>
                <h3 className="text-xl font-bold mb-2">データの読み込みに失敗しました</h3>
                <p className="text-slate-500 text-sm max-w-xs mb-8">スプレッドシートが「ウェブに公開」されていることを確認してください。</p>
                <button onClick={() => setState(p => ({ ...p, isSettingsOpen: true }))} className="px-6 py-3 bg-slate-800 rounded-xl text-xs font-bold">設定を確認する</button>
              </div>
            ) : state.viewMode === 'card' ? (
              currentWord && <WordCard
                item={currentWord}
                lang={currentSheet?.lang}
                currentIndex={state.currentIndex}
                totalCount={displayWords.length}
                onNext={() => setState(p => ({ ...p, currentIndex: (p.currentIndex + 1) % displayWords.length }))}
                onPrev={() => setState(p => ({ ...p, currentIndex: (p.currentIndex - 1 + displayWords.length) % displayWords.length }))}
              />
            ) : (
              <WordList words={displayWords} lang={currentSheet?.lang} onSelectWord={(idx) => setState(p => ({ ...p, currentIndex: idx, viewMode: 'card' }))} />
            )}
          </div>

          <div className={`fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-96 bg-slate-900 border-l border-slate-800 transition-transform duration-300 ${isAssistantOpenMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:block ${state.viewMode === 'card' ? 'block' : 'hidden'}`}>
            {isAssistantOpenMobile && (
              <button
                onClick={() => setIsAssistantOpenMobile(false)}
                className="absolute top-4 right-4 z-[60] p-2 bg-slate-800 text-slate-400 rounded-full lg:hidden"
              >
                <X size={20} />
              </button>
            )}
            {currentWord && <GeminiAssistant key={currentWord.id + currentWord.word} currentWord={currentWord} lang={currentSheet?.lang} />}
          </div>
        </div>
      </main>

      {state.isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[95vh] animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black flex items-center space-x-3"><Settings className="text-indigo-500" /><span>Cloud Settings</span></h2>
              <button onClick={() => setState(p => ({ ...p, isSettingsOpen: false }))} className="p-2 text-slate-500 hover:bg-slate-800 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2"><Link2 size={12} /><span>Spreadsheet URL</span></label>
                <input type="text" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="https://docs.google.com/spreadsheets/d/..." />
                <p className="text-[10px] text-slate-500 italic">※「共有」→「ウェブに公開」の設定が必要です。</p>
              </div>

              {[
                { label: 'English Sheets', lang: 'en-US', list: englishSheets, icon: <Type size={14} className="text-blue-400" /> },
                { label: 'Taiwanese Sheets', lang: 'zh-TW', list: taiwaneseSheets, icon: <Languages size={14} className="text-red-400" /> }
              ].map((group) => (
                <div key={group.lang} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      {group.icon}
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{group.label}</label>
                    </div>
                    <button onClick={() => addSheetRow(group.lang)} className="flex items-center space-x-1 text-[9px] font-black bg-indigo-600/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all">
                      <Plus size={10} /><span>ADD</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {group.list.length > 0 ? group.list.map((s) => {
                      const allIndex = state.sheets.findIndex(os => os.gid === s.gid && os.name === s.name);
                      return (
                        <div key={s.gid + s.name} className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => updateSheetRow(allIndex, { name: e.target.value })}
                            className="flex-1 bg-slate-900 px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 focus:border-indigo-500 outline-none"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={s.gid}
                            onChange={(e) => updateSheetRow(allIndex, { gid: e.target.value })}
                            className="w-20 sm:w-28 bg-slate-900 px-3 py-2 rounded-xl text-[10px] font-mono border border-slate-800 focus:border-indigo-500 outline-none"
                            placeholder="GID"
                          />
                          <button onClick={() => removeSheetRow(s.gid)} className="p-2 text-slate-700 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    }) : (
                      <p className="text-[10px] text-slate-700 italic ml-1">None configured.</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="p-5 bg-indigo-600/5 rounded-[2rem] border border-indigo-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs font-bold flex items-center space-x-2 text-slate-400">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span>Cache Management</span>
                </span>
                <button
                  onClick={handleClearCache}
                  disabled={isRefreshing}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                >
                  {isRefreshing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                  <span>REFRESH</span>
                </button>
              </div>
            </div>

            <button onClick={handleApplySettings} className="w-full py-4 mt-6 bg-white text-slate-950 rounded-2xl font-black text-sm tracking-[0.1em] uppercase shadow-2xl active:scale-[0.98]">SAVE & CONNECT</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
