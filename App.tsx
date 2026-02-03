
import React, { useState, useEffect } from 'react';
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
  Key
} from 'lucide-react';

const DEFAULT_SHEET_ID = '1Ul94nfm4HbnoIeUyElhBXC6gPOsbbU-nsDjkzoY_gPU';
const DEFAULT_SHEETS: SheetConfig[] = [
  { name: 'GoFluent', gid: '420352437', lang: 'en-US' },
  { name: 'Atsueigo', gid: '0', lang: 'en-US' },
  { name: '台湾華語', gid: '1574869365', lang: 'zh-TW' }
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
    viewMode: 'card'
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

  // Initialize App
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
    
    setState(prev => ({ 
      ...prev, 
      spreadsheetId: targetId, 
      sheets: sanitizedSheets,
      currentSheetGid: sanitizedSheets[0]?.gid || '0'
    }));

    fetchSheetData(targetId, sanitizedSheets[0]?.gid || '0');
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
      if (!response.ok) throw new Error(`Failed to fetch sheet (Status: ${response.status})`);
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
      alert('シートの読み込みに失敗しました。URLとGID、またはスプレッドシートの「ウェブに公開」設定を確認してください。');
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
    } else {
      alert('有効なURLと、少なくとも1つのシート設定が必要です。');
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

  const handleJsonImport = () => {
    try {
      const config = JSON.parse(jsonInput);
      if (config.spreadsheetId && Array.isArray(config.sheets)) {
        const sanitized = config.sheets.map((s: any) => ({
          name: s.name || 'Untitled',
          gid: String(s.gid || '0'),
          lang: s.lang || 'en-US'
        }));
        setInputUrl(`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`);
        setTempSheets(sanitized);
        updateAllSettings(config.spreadsheetId, sanitized);
        setJsonInput('');
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (e) {
      alert('JSONの形式が正しくありません。正しい設定オブジェクトを貼り付けてください。');
    }
  };

  const handleJsonExport = () => {
    const config = {
      spreadsheetId: state.spreadsheetId,
      sheets: state.sheets
    };
    const jsonStr = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const addTempSheet = () => {
    if (newSheetName && newSheetGid) {
      setTempSheets([...tempSheets, { name: newSheetName, gid: newSheetGid, lang: newSheetLang }]);
      setNewSheetName('');
      setNewSheetGid('');
    }
  };

  const removeTempSheet = (index: number) => {
    setTempSheets(tempSheets.filter((_, i) => i !== index));
  };

  const currentWord = state.words[state.currentIndex];
  const currentSheet = state.sheets.find(s => s.gid === state.currentSheetGid);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative font-sans">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-transform duration-300 flex flex-col w-80 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md"><BookOpen size={20} /></div>
            <h1 className="font-bold text-lg text-slate-800">Word Master</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 p-1 hover:bg-slate-100 rounded lg:hidden"><X size={20} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {currentSheet?.name} ({state.words.length})
            </h2>
          </div>
          
          <div className="space-y-1">
            {state.words.map((w, idx) => (
              <button
                key={`${w.id}-${idx}`}
                onClick={() => {
                  setState(prev => ({ ...prev, currentIndex: idx, viewMode: 'card' }));
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center justify-between group ${idx === state.currentIndex && state.viewMode === 'card' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="truncate pr-2">
                  <div className="font-bold text-sm truncate">{w.word}</div>
                  <div className={`text-xs truncate ${idx === state.currentIndex && state.viewMode === 'card' ? 'text-blue-500' : 'text-slate-400'}`}>{w.translation}</div>
                </div>
                {idx === state.currentIndex && state.viewMode === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {!hasApiKey && (
            <button 
              onClick={handleOpenApiKey}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-100 shadow-sm transition-all"
            >
              <Key size={18} /><span className="font-bold text-xs uppercase tracking-wider">Connect Gemini</span>
            </button>
          )}
          <button onClick={() => { setTempSheets([...state.sheets]); setState(prev => ({ ...prev, isSettingsOpen: true })); }} className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Settings size={18} /><span className="font-bold text-xs uppercase tracking-wider">Settings</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden ${isSidebarOpen ? 'invisible' : 'visible'}`}><Menu size={20} /></button>
            
            <div className="relative">
              <button 
                onClick={() => setIsSheetSelectorOpen(!isSheetSelectorOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <Languages size={16} className="text-blue-600" />
                <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-none">{currentSheet?.name || 'Select Sheet'}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isSheetSelectorOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSheetSelectorOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsSheetSelectorOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1 animate-in slide-in-from-top-2 duration-200">
                    {state.sheets.map((sheet, sIdx) => (
                      <button
                        key={`${sheet.gid}-${sheet.name}-${sIdx}`}
                        onClick={() => {
                          setIsSheetSelectorOpen(false);
                          fetchSheetData(state.spreadsheetId, sheet.gid);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-colors ${state.currentSheetGid === sheet.gid ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <Hash size={14} className={state.currentSheetGid === sheet.gid ? 'text-blue-600' : 'text-slate-400'} />
                        <div className="flex-1 truncate flex flex-col">
                          <span>{sheet.name}</span>
                          <span className="text-[10px] opacity-60 uppercase font-bold">{sheet.lang === 'zh-TW' ? 'Chinese (TW)' : 'English'}</span>
                        </div>
                        {state.currentSheetGid === sheet.gid && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setState(prev => ({ ...prev, viewMode: 'card' }))} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${state.viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <CreditCard size={14} /><span className="hidden xs:inline">Card</span>
            </button>
            <button onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${state.viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <LayoutGrid size={14} /><span className="hidden xs:inline">List</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 overflow-y-auto p-4 sm:p-8 pb-32 lg:pb-8">
            {state.isLoading ? (
              <div className="text-center animate-pulse">
                <Loader2 className="mx-auto text-blue-500 animate-spin mb-4" size={48} />
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Loading Data...</p>
              </div>
            ) : state.viewMode === 'card' ? (
              currentWord ? (
                <div className="w-full flex justify-center py-4">
                  <WordCard 
                    item={currentWord} 
                    lang={currentSheet?.lang}
                    onNext={() => setState(prev => ({ ...prev, currentIndex: Math.min(prev.words.length - 1, prev.currentIndex + 1) }))} 
                    onPrev={() => setState(prev => ({ ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) }))} 
                    isFirst={state.currentIndex === 0} 
                    isLast={state.currentIndex === state.words.length - 1} 
                  />
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 max-w-sm text-center">
                  <Database className="mx-auto text-slate-300 mb-4" size={48} /><p className="text-slate-600 font-bold mb-6">No words found.</p>
                </div>
              )
            ) : (
              <WordList 
                words={state.words} 
                lang={currentSheet?.lang}
                onSelectWord={(idx) => setState(prev => ({ ...prev, currentIndex: idx, viewMode: 'card' }))} 
              />
            )}
          </div>

          {/* Assistant Side Panel */}
          <div className={`fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-96 bg-white transition-transform duration-300 ${state.viewMode === 'card' && currentWord ? 'block' : 'hidden'} ${isAssistantOpenMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:block lg:border-l lg:border-slate-200`}>
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <span className="font-bold text-slate-700">Gemini Tutor</span>
              <button onClick={() => setIsAssistantOpenMobile(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            {currentWord && <GeminiAssistant key={currentWord.id + currentWord.word} currentWord={currentWord} />}
          </div>

          {/* Floating Assistant Button (Mobile) */}
          {state.viewMode === 'card' && currentWord && !isAssistantOpenMobile && (
            <button onClick={() => setIsAssistantOpenMobile(true)} className="lg:hidden fixed right-6 bottom-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-40 border-4 border-white active:scale-90 transition-transform">
              <MessageSquare size={24} />
            </button>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {state.isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><Settings size={24} /></div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">App Configuration</h2>
              </div>
              <button onClick={() => setState(prev => ({ ...prev, isSettingsOpen: false }))} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              <section>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Spreadsheet URL / ID</label>
                <input type="text" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-sm transition-all shadow-inner" placeholder="Paste spreadsheet link here..." />
              </section>

              <section>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sheet Tabs (Menu Items)</label>
                <div className="space-y-2 mb-4">
                  {tempSheets.map((sheet, index) => (
                    <div key={`${sheet.gid}-${index}`} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 group transition-all hover:border-blue-200">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-700 truncate">{sheet.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">GID: {sheet.gid} • {sheet.lang === 'zh-TW' ? 'Taiwanese' : 'English'}</div>
                      </div>
                      <button onClick={() => removeTempSheet(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {tempSheets.length === 0 && <p className="text-xs text-slate-400 italic text-center py-2">No sheets added.</p>}
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Tab Name (e.g. Basic)" value={newSheetName} onChange={(e) => setNewSheetName(e.target.value)} className="px-3 py-2 bg-white rounded-xl text-sm border-none outline-none ring-1 ring-blue-100 focus:ring-blue-400 transition-shadow" />
                    <input type="text" placeholder="GID (e.g. 0)" value={newSheetGid} onChange={(e) => setNewSheetGid(e.target.value)} className="px-3 py-2 bg-white rounded-xl text-sm border-none outline-none ring-1 ring-blue-100 focus:ring-blue-400 transition-shadow" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex-shrink-0">Language:</label>
                    <select 
                      value={newSheetLang}
                      onChange={(e) => setNewSheetLang(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white rounded-xl text-sm border-none outline-none ring-1 ring-blue-100 focus:ring-blue-400 transition-shadow"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="zh-TW">Taiwanese Mandarin (繁体中文)</option>
                    </select>
                  </div>
                  <button onClick={addTempSheet} disabled={!newSheetName || !newSheetGid} className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-blue-700 shadow-md">
                    <Plus size={16} /><span>Add Tab</span>
                  </button>
                </div>
              </section>

              {/* JSON Import/Export Section */}
              <section className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                    <FileJson size={14} /><span>JSON Config</span>
                  </label>
                  <button 
                    onClick={handleJsonExport}
                    className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase"
                  >
                    {copyFeedback ? <ClipboardCheck size={14} /> : <Copy size={14} />}
                    <span>{copyFeedback ? 'Copied!' : 'Export Config'}</span>
                  </button>
                </div>
                
                <div className="relative group">
                  <textarea 
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='Paste configuration JSON here to import...'
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner"
                  />
                  {jsonInput && (
                    <button 
                      onClick={handleJsonImport}
                      className="absolute bottom-3 right-3 flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-lg hover:bg-blue-700 transition-all"
                    >
                      <Upload size={12} /><span>Import JSON</span>
                    </button>
                  )}
                </div>
              </section>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button onClick={handleApplySettings} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @media (max-width: 400px) { .xs\\:inline { display: inline !important; } }
      `}</style>
    </div>
  );
};

export default App;
