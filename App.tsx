
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

  const { data: fetchedWords, isLoading: isQueryLoading, error: queryError } = useQuery<WordItem[]>({
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-transform duration-300 flex flex-col w-80 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">Word Master</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 p-1 hover:bg-slate-100 rounded lg:hidden"><X size={20} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-1.5">
            <button onClick={() => setState(p => ({ ...p, viewMode: 'card' }))} className={`w-full text-left px-4 py-4 rounded-xl transition-all flex items-center space-x-3 mb-2 ${state.viewMode === 'card' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Play size={20} /><span className="font-bold">カード学習</span>
            </button>
            <button onClick={() => setState(p => ({ ...p, viewMode: 'list' }))} className={`w-full text-left px-4 py-4 rounded-xl transition-all flex items-center space-x-3 mb-2 ${state.viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LayoutGrid size={20} /><span className="font-bold">単語一覧</span>
            </button>
            <div className="h-px bg-slate-100 w-full my-3" />
            {(isQueryLoading || state.isLoading) ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : (
              displayWords.map((w, idx) => (
                <button key={w.id} onClick={() => setState(p => ({ ...p, currentIndex: idx, viewMode: 'card' }))} className={`w-full text-left px-3 py-3 rounded-xl transition-all mb-1 ${idx === state.currentIndex && state.viewMode === 'card' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <div className="truncate text-sm">{w.word}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={() => setState(p => ({ ...p, isSettingsOpen: true }))} className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Settings size={18} /><span className="font-bold text-xs">Settings</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"><Menu size={20} /></button>
            <button onClick={() => setIsSheetSelectorOpen(!isSheetSelectorOpen)} className="flex items-center space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
              <Languages size={16} className="text-blue-600" />
              <span className="text-sm font-bold">{currentSheet?.name}</span>
              <ChevronDown size={14} className={isSheetSelectorOpen ? 'rotate-180' : ''} />
            </button>
            {isSheetSelectorOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsSheetSelectorOpen(false)} />
                <div className="absolute top-full left-4 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 py-1">
                  {state.sheets.map((sheet, sIdx) => (
                    <button key={sIdx} onClick={() => { setIsSheetSelectorOpen(false); setState(p => ({ ...p, currentSheetGid: sheet.gid, currentIndex: 0 })); }} className={`w-full text-left px-4 py-3 text-sm ${state.currentSheetGid === sheet.gid ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>{sheet.name}</button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setState(p => ({ ...p, viewMode: 'card' }))} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${state.viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Card</button>
            <button onClick={() => setState(p => ({ ...p, viewMode: 'list' }))} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${state.viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>List</button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          <div className="flex-1 flex flex-col items-center justify-start bg-slate-50/50 overflow-y-auto pt-4 pb-32 lg:pb-8">
            {isQueryLoading ? (
              <div className="flex flex-col items-center py-20"><Loader2 className="text-blue-500 animate-spin mb-4" size={48} /><p className="text-slate-400">Loading...</p></div>
            ) : queryError ? (
              <div className="flex flex-col items-center py-20 text-center"><AlertCircle className="text-red-500 mb-4" size={48} /><p className="text-slate-600 font-bold">Failed to load data</p></div>
            ) : state.viewMode === 'card' ? (
              currentWord && <WordCard item={currentWord} lang={currentSheet?.lang} onNext={() => setState(p => ({ ...p, currentIndex: Math.min(displayWords.length - 1, p.currentIndex + 1) }))} onPrev={() => setState(p => ({ ...p, currentIndex: Math.max(0, p.currentIndex - 1) }))} isFirst={state.currentIndex === 0} isLast={state.currentIndex === displayWords.length - 1} />
            ) : (
              <WordList words={displayWords} lang={currentSheet?.lang} onSelectWord={(idx) => setState(p => ({ ...p, currentIndex: idx, viewMode: 'card' }))} />
            )}
          </div>

          <div className={`fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-96 bg-white transition-transform duration-300 ${state.viewMode === 'card' && currentWord ? 'block' : 'hidden'} ${isAssistantOpenMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:block lg:border-l lg:border-slate-200`}>
            <div className="lg:hidden flex items-center justify-between p-4 bg-slate-50 border-b">
              <span className="font-bold">Assistant</span>
              <button onClick={() => setIsAssistantOpenMobile(false)} className="text-slate-400"><X size={24} /></button>
            </div>
            {currentWord && <GeminiAssistant key={currentWord.id + currentWord.word} currentWord={currentWord} lang={currentSheet?.lang} />}
          </div>

          {state.viewMode === 'card' && currentWord && !isAssistantOpenMobile && (
            <button onClick={() => setIsAssistantOpenMobile(true)} className="lg:hidden fixed right-4 bottom-28 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-40 border-2 border-white"><Search size={24} /></button>
          )}
        </div>
      </main>

      {state.isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Settings</h2><button onClick={() => setState(p => ({ ...p, isSettingsOpen: false }))}><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                <span className="text-sm font-bold">Refresh Cache</span>
                <button onClick={handleClearCache} className="px-4 py-2 bg-white border rounded-xl text-xs font-bold"><RefreshCw size={14} className="inline mr-2" />Reset</button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Spreadsheet URL</label>
                <input type="text" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} className="w-full px-4 py-3 bg-slate-100 rounded-2xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Tabs</label>
                {tempSheets.map((s, i) => (
                  <div key={i} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-2xl border">
                    <div className="flex-1 font-bold text-sm">{s.name} ({s.lang})</div>
                    <button onClick={() => setTempSheets(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl space-y-3">
                <input type="text" placeholder="Tab Name" value={newSheetName} onChange={(e) => setNewSheetName(e.target.value)} className="w-full px-3 py-2 bg-white rounded-xl text-sm" />
                <input type="text" placeholder="GID" value={newSheetGid} onChange={(e) => setNewSheetGid(e.target.value)} className="w-full px-3 py-2 bg-white rounded-xl text-sm" />
                <select value={newSheetLang} onChange={(e) => setNewSheetLang(e.target.value)} className="w-full px-3 py-2 bg-white rounded-xl text-sm">
                  <option value="en-US">English</option>
                  <option value="zh-TW">Taiwanese</option>
                </select>
                <button onClick={addTempSheet} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold">Add Tab</button>
              </div>
            </div>
            <button onClick={handleApplySettings} className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-bold">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
