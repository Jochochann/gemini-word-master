
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 7 * 24 * 60 * 60 * 1000, // 7日間はデータを新鮮とみなす
      gcTime: 7 * 24 * 60 * 60 * 1000,    // キャッシュを7日間保持
      refetchOnWindowFocus: false,        // ウィンドウフォーカス時の自動更新を無効化
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'GEMINI_WORD_MASTER_OFFLINE_CACHE',
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 7 * 24 * 60 * 60 * 1000 }}
    >
      <App />
    </PersistQueryClientProvider>
  </React.StrictMode>
);
