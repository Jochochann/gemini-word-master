
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, WordItem, ViewMode, SheetConfig } from './types.ts';
import WordCard from './components/WordCard.tsx';
import WordList from './components/WordList.tsx';
import GeminiAssistant from './components/GeminiAssistant.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Loader2, 
  BookOpen, 
  Menu, 
  X,
  LayoutGrid,
  CreditCard,
  Trash2,
  ChevronDown,
  Languages,
  AlertCircle,
  Play,
  Search,
  RefreshCw
} from 'lucide-react';

const DEFAULT_SHEET_ID = '1Ul94nfm4HbnoIeUyElhBXC6gPOsbbU-nsDjkzoY_gPU';
const DEFAULT_SHEETS: SheetConfig[] = [
  { name: 'GoFluent', gid: '0', lang: 'en-US' },
  { name: 'Atsueigo', gid: '420352437', lang: 'en-US' },
  { name: '台湾旅行', gid: '1574869365', lang: 'zh-TW' }
];

const fetchSpreadsheetWords = async (id: string, gid: string): Promise<WordItem[]> => {
  if (!id) return [];
  let url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
  if (gid && gid !== '0') {
    url += `&gid=${gid}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch sheet`);
  const csvText = await response.text();
  
  const lines = csvText.split('\n');
  return lines.slice(1).map((line, idx) => {
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
    return {
      id: (idx + 1).toString(),
      word: parts[1] || '',
      translation: parts[2] || '',
      example: parts[3] || '',
      notes: parts[4] || ''
    };
  }).filter(w => w.word !== '');
};

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
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetGid, setNewSheetGid] = useState('');
  const [newSheetLang, setNewSheetLang] = useState('en-US');
  const [tempSheets, setTempSheets] = useState<SheetConfig[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpenMobile, setIsAssistantOpenMobile] = useState(false);
  const [isSheetSelectorOpen, setIsSheetSelectorOpen] = useState(false);
  
  const { data: fetchedWords, isLoading: isQueryLoading, error: queryError, status } = useQuery<WordItem[]>({
    queryKey: ['spreadsheet-words', state.spreadsheetId, state.currentSheetGid],
    queryFn: () => fetchSpreadsheetWords(state.spreadsheetId, state.currentSheetGid),
    enabled: !!state.spreadsheetId,
  });

  const currentSheet = useMemo(() => {
    return state.sheets.find((s: SheetConfig) => s.gid === state.currentSheetGid) || state.sheets[0];
  }, [state.sheets, state.currentSheetGid]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }

    const savedId = localStorage.getItem('gemini_word_master_sheet_id');
    const savedSheetsStr = localStorage.getItem('gemini_word_master_sheets');
    
    let targetId = savedId || DEFAULT_SHEET_ID;
    let targetSheets: SheetConfig[] = DEFAULT_SHEETS;

    if (savedSheetsStr) {
      try {
        const parsed = JSON.parse(savedSheetsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          targetSheets = parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved sheets", e);
      }
    }
    
    const sanitizedSheets = targetSheets.map((s: SheetConfig) => ({ ...s, lang: s.lang || 'en-US' }));
    
    setInputUrl(`https://docs.google.com/spreadsheets/d/${targetId}/edit`);
    setTempSheets(sanitizedSheets);
    
    const initialGid = sanitizedSheets[0]?.gid || '0';
    setState((prev: AppState) => ({ 
      ...prev, 
      spreadsheetId: targetId, 
      sheets: sanitizedSheets,
      currentSheetGid: initialGid,
      isLoading: false
    }));
  }, []);

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    let id = '';
    if (inputUrl.includes('docs.google.com/spreadsheets')) {
      const idMatch = inputUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (idMatch) id = idMatch[1];
    } else {
      id = inputUrl.trim();
    }
    if (id && tempSheets.length > 0) {
      const firstGid = tempSheets[0]?.gid || '0';
      setState((prev: AppState) => ({ 
        ...prev, 
        spreadsheetId: id, 
        sheets: tempSheets, 
        isSettingsOpen: false,
        currentSheetGid: firstGid,
        currentIndex: 0
      }));
      localStorage.setItem('gemini_word_master_sheet_id', id);
      localStorage.setItem('gemini_word_master_sheets', JSON.stringify(tempSheets));
    }
  };

  const handleClearCache = () => {
    queryClient.invalidateQueries({ queryKey: ['spreadsheet-words'] });
    queryClient.resetQueries({ queryKey: ['spreadsheet-words'] });
    alert('キャッシュをリセットしました。');
  };

  const addTempSheet = () => {
    if (newSheetName.trim() && newSheetGid.trim()) {
      const newSheet: SheetConfig = {
        name: newSheetName.trim(),
        gid: newSheetGid.trim(),
        lang: newSheetLang
      };
      setTempSheets((prev: SheetConfig[]) => [...prev, newSheet]);
      setNewSheetName('');
      setNewSheetGid('');
    }
  };

  const displayWords = fetchedWords || [];
  const currentWord = displayWords[state.currentIndex];

  const isDataReady = status === 'success' || (status === 'pending' && displayWords.length > 0);
  const showSpinner = isQueryLoading && !isDataReady;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transition-transform duration-300 flex flex-col w-72 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5 group">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight">Word Master</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 p-1.5 hover:bg-slate-800 rounded-lg lg:hidden transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <nav className="space-y-1.5">
            <button 
              onClick={() => setState(p => ({...p, viewMode: 'card'}))} 
              className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center space-x-3 mb-2 ${state.viewMode === 'card' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Play size={18} /><span className="font-bold text-sm">カード学習</span>
            </button>
            <button 
              onClick={() => setState(p => ({...p, viewMode: 'list'}))} 
              className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center space-x-3 mb-2 ${state.viewMode === 'list' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <LayoutGrid size={18} /><span className="font-bold text-sm">単語一覧</span>
            </button>
            <div className="h-px bg-slate-800 w-full my-4" />
            {showSpinner ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-700" /></div>
            ) : (
              displayWords.map((w, idx) => (
                <button 
                  key={w.id} 
                  onClick={() => setState(p => ({...p, currentIndex: idx, viewMode: 'card'}))} 
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all mb-1 group ${idx === state.currentIndex && state.viewMode === 'card' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'}`}
                >
                  <div className="truncate text-xs font-medium group-hover:translate-x-1 transition-transform">{w.word}</div>
                </button>
              ))
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={() => setState(p => ({...p, isSettingsOpen: true}))} 
            className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white shadow-sm transition-all active:scale-95"
          >
            <Settings size={16} /><span className="font-bold text-xs uppercase tracking-widest">Settings</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-slate-950">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg lg:hidden transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsSheetSelectorOpen(!isSheetSelectorOpen)} 
                className="flex items-center space-x-2.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              >
                <Languages size={14} className="text-indigo-500" />
                <span className="text-xs font-bold tracking-tight">{currentSheet?.name}</span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isSheetSelectorOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSheetSelectorOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsSheetSelectorOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in duration-200">
                    {state.sheets.map((sheet, sIdx) => (
                      <button 
                        key={sIdx} 
                        onClick={() => { setIsSheetSelectorOpen(false); setState(p => ({...p, currentSheetGid: sheet.gid, currentIndex: 0})); }} 
                        className={`w-full text-left px-4 py-3 text-xs font-medium transition-colors ${state.currentSheetGid === sheet.gid ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                      >
                        {sheet.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setState(p => ({...p, viewMode: 'card'}))} 
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${state.viewMode === 'card' ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              CARD
            </button>
            <button 
              onClick={() => setState(p => ({...p, viewMode: 'list'}))} 
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${state.viewMode === 'list' ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              LIST
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto pt-8 pb-32 lg:pb-12">
            {showSpinner ? (
              <div className="flex flex-col items-center py-20 animate-pulse">
                <Loader2 className="text-indigo-500 animate-spin mb-6" size={48} />
                <p className="text-slate-500 font-medium text-sm tracking-widest">LOADING VOCABULARY...</p>
              </div>
            ) : queryError && !displayWords.length ? (
              <div className="flex flex-col items-center py-20 text-center px-6">
                <div className="p-4 bg-red-500/10 rounded-full mb-6">
                  <AlertCircle className="text-red-500" size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2">Failed to load data</h3>
                <p className="text-slate-500 text-sm max-w-xs">Check your spreadsheet URL and sharing permissions.</p>
              </div>
            ) : state.viewMode === 'card' ? (
              currentWord && <WordCard item={currentWord} lang={currentSheet?.lang} onNext={() => setState(p => ({...p, currentIndex: Math.min(displayWords.length-1, p.currentIndex+1)}))} onPrev={() => setState(p => ({...p, currentIndex: Math.max(0, p.currentIndex-1)}))} isFirst={state.currentIndex === 0} isLast={state.currentIndex === displayWords.length-1} />
            ) : (
              <WordList words={displayWords} lang={currentSheet?.lang} onSelectWord={(idx) => setState(p => ({...p, currentIndex: idx, viewMode: 'card'}))} />
            )}
          </div>

          <div className={`fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-96 bg-slate-900 border-l border-slate-800 transition-transform duration-300 ${state.viewMode === 'card' && currentWord ? 'block' : 'hidden'} ${isAssistantOpenMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:block`}>
            <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
              <span className="font-bold text-sm tracking-widest text-slate-400">ASSISTANT</span>
              <button onClick={() => setIsAssistantOpenMobile(false)} className="p-1 text-slate-500"><X size={24} /></button>
            </div>
            {currentWord && <GeminiAssistant key={currentWord.id + currentWord.word} currentWord={currentWord} lang={currentSheet?.lang} />}
          </div>

          {state.viewMode === 'card' && currentWord && !isAssistantOpenMobile && (
            <button 
              onClick={() => setIsAssistantOpenMobile(true)} 
              className="lg:hidden fixed right-6 bottom-28 bg-indigo-600 text-white p-5 rounded-full shadow-2xl shadow-indigo-500/40 z-40 border border-white/10 active:scale-90 transition-transform"
            >
              <Search size={24} />
            </button>
          )}
        </div>
      </main>

      {state.isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold tracking-tight">Settings</h2>
              <button onClick={() => setState(p => ({...p, isSettingsOpen: false}))} className="p-2 text-slate-500 hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
              <div className="p-5 bg-slate-950/50 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold">Refresh Storage</span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Clear local data</p>
                </div>
                <button onClick={handleClearCache} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-colors">
                  <RefreshCw size={14} className="inline mr-2" />RESET
                </button>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Spreadsheet URL</label>
                <input 
                  type="text" 
                  value={inputUrl} 
                  onChange={(e) => setInputUrl(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Active Sheets</label>
                <div className="space-y-2">
                  {tempSheets.map((s, i) => (
                    <div key={i} className="flex items-center space-x-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 group">
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-200">{s.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">{s.lang} • GID: {s.gid}</div>
                      </div>
                      <button onClick={() => setTempSheets(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-indigo-600/5 rounded-3xl border border-indigo-500/20 space-y-4">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Add New Sheet</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Tab Name (e.g. TOEFL)" value={newSheetName} onChange={(e) => setNewSheetName(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm" />
                  <input type="text" placeholder="GID (The number after gid=)" value={newSheetGid} onChange={(e) => setNewSheetGid(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm" />
                  <select value={newSheetLang} onChange={(e) => setNewSheetLang(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300">
                    <option value="en-US">English (US)</option>
                    <option value="zh-TW">Taiwanese (繁體中文)</option>
                  </select>
                  <button onClick={addTempSheet} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                    ADD SHEET
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleApplySettings} className="w-full py-5 mt-8 bg-white text-slate-950 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-200 transition-colors shadow-xl">
              SAVE CHANGES
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
