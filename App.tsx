
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, WordItem, ViewMode, SheetConfig } from './types.ts';
import WordCard from './components/WordCard.tsx';
import WordList from './components/WordList.tsx';
import GeminiAssistant from './components/GeminiAssistant.tsx';
import {
  Database,
  Settings,
  Loader2,
  BookOpen,
  Menu,
  X,
  Plus,
  LayoutGrid,
  CreditCard,
  MessageSquare,
  Trash2,
  ChevronDown,
  Hash,
  Languages,
  Copy,
  ClipboardCheck,
  FileJson,
  Upload,
  AlertCircle,
  Key,
  Home,
  Play,
  Search
} from 'lucide-react';

const DEFAULT_SHEET_ID = '1Ul94nfm4HbnoIeUyElhBXC6gPOsbbU-nsDjkzoY_gPU';
const DEFAULT_SHEETS: SheetConfig[] = [
  { name: 'GoFluent', gid: '0', lang: 'en-US' },
  { name: 'Atsueigo', gid: '420352437', lang: 'en-US' },
  { name: '台湾旅行', gid: '1574869365', lang: 'zh-TW' }
];

const App: React.FC = () => {
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
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  const [jsonInput, setJsonInput] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const currentSheet = useMemo(() => {
    return state.sheets.find(s => s.gid === state.currentSheetGid) || state.sheets[0];
  }, [state.sheets, state.currentSheetGid]);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();

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

    const sanitizedSheets = targetSheets.map(s => ({ ...s, lang: s.lang || 'en-US' }));

    setInputUrl(`https://docs.google.com/spreadsheets/d/${targetId}/edit`);
    setTempSheets(sanitizedSheets);

    const initialGid = sanitizedSheets[0]?.gid || '0';
    setState(prev => ({
      ...prev,
      spreadsheetId: targetId,
      sheets: sanitizedSheets,
      currentSheetGid: initialGid
    }));

    fetchSheetData(targetId, initialGid);
  }, []);

  const fetchSheetData = async (id: string, gid: string) => {
    if (!id) return;
    setState(prev => ({ ...prev, isLoading: true, currentSheetGid: gid }));

    try {
      let url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
      if (gid && gid !== '0') {
        url += `&gid=${gid}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch sheet`);
      const csvText = await response.text();

      const lines = csvText.split('\n');
      const words: WordItem[] = lines.slice(1).map((line, idx) => {
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
        return {
          id: (idx + 1).toString(),
          word: parts[1] || '',
          translation: parts[2] || '',
          example: parts[3] || '',
          notes: parts[4] || ''
        };
      }).filter(w => w.word !== '');

      setState(prev => ({
        ...prev,
        words,
        currentIndex: 0,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to fetch data', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleOpenApiKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

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
      updateAllSettings(id, tempSheets);
    }
  };

  const updateAllSettings = (id: string, sheets: SheetConfig[]) => {
    const firstGid = sheets[0]?.gid || '0';
    setState(prev => ({
      ...prev,
      spreadsheetId: id,
      sheets: sheets,
      isSettingsOpen: false,
      currentSheetGid: firstGid
    }));
    localStorage.setItem('gemini_word_master_sheet_id', id);
    localStorage.setItem('gemini_word_master_sheets', JSON.stringify(sheets));
    fetchSheetData(id, firstGid);
  };

  const addTempSheet = () => {
    if (newSheetName.trim() && newSheetGid.trim()) {
      const newSheet: SheetConfig = {
        name: newSheetName.trim(),
        gid: newSheetGid.trim(),
        lang: newSheetLang
      };
      setTempSheets(prev => [...prev, newSheet]);
      setNewSheetName('');
      setNewSheetGid('');
    }
  };

  const switchToCard = () => {
    setState(prev => ({ ...prev, viewMode: 'card' }));
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const switchToList = () => {
    setState(prev => ({ ...prev, viewMode: 'list' }));
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const currentWord = state.words[state.currentIndex];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-transform duration-300 flex flex-col w-80 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <button onClick={switchToCard} className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">Word Master</h1>
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 p-1 hover:bg-slate-100 rounded lg:hidden"><X size={20} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-1.5">
            {/* Study Mode - Main Action */}
            <button
              onClick={switchToCard}
              className={`w-full text-left px-4 py-4 rounded-xl transition-all flex items-center space-x-3 group mb-2 ${state.viewMode === 'card' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
            >
              <Play size={20} className={state.viewMode === 'card' ? 'text-blue-200' : 'text-blue-500'} />
              <span className="font-bold text-base">学習を始める (カード)</span>
            </button>

            {/* List View - Secondary Action */}
            <button
              onClick={switchToList}
              className={`w-full text-left px-4 py-4 rounded-xl transition-all flex items-center space-x-3 group mb-2 ${state.viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
            >
              <LayoutGrid size={20} className={state.viewMode === 'list' ? 'text-blue-400' : 'text-slate-400'} />
              <span className="font-bold text-base">ライブラリ (一覧)</span>
            </button>

            <div className="h-px bg-slate-100 w-full my-3" />
            <div className="px-2 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">単語リスト</div>

            {state.words.map((w, idx) => (
              <button
                key={`${w.id}-${idx}`}
                onClick={() => {
                  setState(prev => ({ ...prev, currentIndex: idx, viewMode: 'card' }));
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-3.5 rounded-xl transition-all flex items-center justify-between group ${idx === state.currentIndex && state.viewMode === 'card' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="truncate pr-2">
                  <div className="font-bold text-base truncate leading-tight">{w.word}</div>
                  <div className={`text-sm truncate mt-0.5 ${idx === state.currentIndex && state.viewMode === 'card' ? 'text-blue-500' : 'text-slate-400'}`}>{w.translation}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <button onClick={() => { setTempSheets([...state.sheets]); setState(prev => ({ ...prev, isSettingsOpen: true })); }} className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Settings size={18} /><span className="font-bold text-xs uppercase tracking-wider">Settings</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden">
        <header className="h-16 flex items-center justify-between px-2 sm:px-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"><Menu size={20} /></button>

            <div className="relative">
              <button onClick={() => setIsSheetSelectorOpen(!isSheetSelectorOpen)} className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                <Languages size={16} className="text-blue-600 hidden xs:inline" />
                <span className="text-sm font-bold truncate max-w-[100px] sm:max-w-none">{currentSheet?.name}</span>
                <ChevronDown size={14} className={isSheetSelectorOpen ? 'rotate-180' : ''} />
              </button>
              {isSheetSelectorOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsSheetSelectorOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                    {state.sheets.map((sheet, sIdx) => (
                      <button key={sIdx} onClick={() => { setIsSheetSelectorOpen(false); fetchSheetData(state.spreadsheetId, sheet.gid); }} className={`w-full text-left px-4 py-3.5 text-sm transition-colors ${state.currentSheetGid === sheet.gid ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {sheet.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl">
            <button onClick={() => setState(prev => ({ ...prev, viewMode: 'card' }))} className={`px-2 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${state.viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
              <CreditCard size={14} className="inline sm:mr-2" /><span className="hidden sm:inline">Card</span>
            </button>
            <button onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))} className={`px-2 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${state.viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
              <LayoutGrid size={14} className="inline sm:mr-2" /><span className="hidden sm:inline">List</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          <div className="flex-1 flex flex-col items-center justify-start bg-slate-50/50 overflow-y-auto px-2 sm:px-0 pt-4 pb-32 lg:pb-8">
            {state.isLoading ? (
              <Loader2 className="mx-auto text-blue-500 animate-spin py-20" size={48} />
            ) : state.viewMode === 'card' ? (
              currentWord && <WordCard
                item={currentWord}
                lang={currentSheet?.lang}
                onNext={() => setState(prev => ({ ...prev, currentIndex: Math.min(prev.words.length - 1, prev.currentIndex + 1) }))}
                onPrev={() => setState(prev => ({ ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) }))}
                isFirst={state.currentIndex === 0}
                isLast={state.currentIndex === state.words.length - 1}
              />
            ) : (
              <WordList words={state.words} lang={currentSheet?.lang} onSelectWord={(idx) => setState(prev => ({ ...prev, currentIndex: idx, viewMode: 'card' }))} />
            )}
          </div>

          <div className={`fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-96 bg-white transition-transform duration-300 ${state.viewMode === 'card' && currentWord ? 'block' : 'hidden'} ${isAssistantOpenMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:block lg:border-l lg:border-slate-200`}>
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <span className="font-bold text-slate-700">辞書・検索</span>
              <button onClick={() => setIsAssistantOpenMobile(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            {currentWord && <GeminiAssistant key={currentWord.id + currentWord.word} currentWord={currentWord} lang={currentSheet?.lang} />}
          </div>

          {state.viewMode === 'card' && currentWord && !isAssistantOpenMobile && (
            <button onClick={() => setIsAssistantOpenMobile(true)} className="lg:hidden fixed right-4 bottom-28 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-40 border-2 border-white active:scale-90 transition-transform">
              <Search size={24} />
            </button>
          )}
        </div>
      </main>

      {state.isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Configuration</h2>
              <button onClick={() => setState(prev => ({ ...prev, isSettingsOpen: false }))} className="text-slate-400 p-2"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Spreadsheet URL</label>
                <input type="text" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} className="w-full px-4 py-3 bg-slate-100 rounded-2xl outline-none" placeholder="Spreadsheet link..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Current Tabs</label>
                <div className="space-y-2">
                  {tempSheets.map((sheet, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold truncate">{sheet.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">GID: {sheet.gid} • {sheet.lang}</div>
                      </div>
                      <button onClick={() => setTempSheets(tempSheets.filter((_, i) => i !== index))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl space-y-3">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-widest ml-1">Add New Tab</label>
                <input type="text" placeholder="Tab Name (e.g., General)" value={newSheetName} onChange={(e) => setNewSheetName(e.target.value)} className="w-full px-3 py-2.5 bg-white rounded-xl text-sm" />
                <input type="text" placeholder="GID (from browser URL)" value={newSheetGid} onChange={(e) => setNewSheetGid(e.target.value)} className="w-full px-3 py-2.5 bg-white rounded-xl text-sm" />
                <select
                  value={newSheetLang}
                  onChange={(e) => setNewSheetLang(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white rounded-xl text-sm outline-none border-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="en-US">English (US)</option>
                  <option value="zh-TW">Traditional Chinese (TW)</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="ko-KR">Korean</option>
                  <option value="fr-FR">French</option>
                  <option value="es-ES">Spanish</option>
                </select>
                <button onClick={addTempSheet} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all">Add Tab</button>
              </div>
            </div>
            <button onClick={handleApplySettings} className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors active:scale-[0.98]">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
