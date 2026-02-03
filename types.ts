
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

export interface AppState {
  words: WordItem[];
  currentIndex: number;
  isLoading: boolean;
  spreadsheetId: string;
  isSettingsOpen: boolean;
  viewMode: ViewMode;
}
