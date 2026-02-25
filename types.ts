
export interface WordItem {
  id: string;
  word: string;
  translation: string;
  partOfSpeech?: string;
  pronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  notes?: string;
}

export interface EssayVocabItem {
  word: string;
  pinyin?: string;
  meaning: string;
}

export interface EssayItem {
  id: string;
  title: string;
  essay: string;
  pinyin?: string;
  translation: string;
  vocabulary: EssayVocabItem[];
  lang: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewMode = 'card' | 'list' | 'essay';

export interface SheetConfig {
  name: string;
  gid: string;
  lang: string; // e.g., 'en-US', 'zh-TW'
}

export interface AppState {
  currentIndex: number;
  isLoading: boolean;
  spreadsheetId: string;
  sheets: SheetConfig[];
  currentSheetGid: string;
  isSettingsOpen: boolean;
  viewMode: ViewMode;
  isAutoPlay?: boolean;
  isShuffle?: boolean;
  autoPlayTrigger?: number;
  isFavoritesOnly?: boolean;
  isPracticeMode?: boolean;
}

// AI Studioのグローバルプロパティを型定義
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
