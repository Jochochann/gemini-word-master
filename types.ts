
export interface WordItem {
  id: string;
  word: string;
  translation: string;
  example?: string;
  notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewMode = 'card' | 'list';

export interface SheetConfig {
  name: string;
  gid: string;
  lang: string; // e.g., 'en-US', 'zh-TW'
}

export interface AppState {
  words: WordItem[];
  currentIndex: number;
  isLoading: boolean;
  spreadsheetId: string;
  sheets: SheetConfig[];
  currentSheetGid: string;
  isSettingsOpen: boolean;
  viewMode: ViewMode;
}

// Define AIStudio interface to match the environment's expected type
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// AI Studioのグローバルプロパティを型定義
declare global {
  interface Window {
    // Fixed: Use the named AIStudio interface instead of an inline type to resolve type conflict
    aistudio?: AIStudio;
  }
}
