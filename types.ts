
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

// AI Studioのグローバルプロパティを型定義
declare global {
  // Fix: Move the AIStudio interface inside declare global to prevent namespace conflicts 
  // between exported module types and global types, which causes "type is AIStudio but must be AIStudio" errors.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
