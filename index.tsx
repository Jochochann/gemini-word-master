
import React from 'https://esm.sh/react@19.2.4';
import ReactDOM from 'https://esm.sh/react-dom@19.2.4/client';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from 'https://esm.sh/@tanstack/react-query@5.66.0?external=react,react-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 7 * 24 * 60 * 60 * 1000, // 7日間はデータを新鮮とみなす
      gcTime: 7 * 24 * 60 * 60 * 1000,    // キャッシュを7日間保持
      refetchOnWindowFocus: false,        // ウィンドウフォーカス時の自動更新を無効化
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
