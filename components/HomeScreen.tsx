import React from 'react'

type AppId = 'word-master' | 'business' | 'taiwanese'

interface Props {
  onSelect: (app: AppId) => void
}

const apps: {
  id: AppId
  emoji: string
  title: string
  subtitle: string
  description: string
  color: string
  bgGradient: string
  borderColor: string
}[] = [
  {
    id: 'word-master',
    emoji: '📚',
    title: 'Word Master',
    subtitle: 'Everyday English & 繁中',
    description: 'Googleスプレッドシート連携の英単語・繁体字中文学習。Gemini AIによる解説、エッセイリーディング、カード学習。',
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-600/20 to-indigo-900/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'business',
    emoji: '💼',
    title: 'Business Result',
    subtitle: 'Upper-Intermediate — 全15ユニット',
    description: 'ビジネス英語テキスト「Business Result」の学習アプリ。Reading、Vocabulary、Key Expressions、Grammarをカバー。',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-600/20 to-emerald-900/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'taiwanese',
    emoji: '🇹🇼',
    title: '台湾華語',
    subtitle: 'Taiwanese Mandarin Learning',
    description: '台湾華語（繁体字中文）学習アプリ。複数ボリュームのレッスンで本文・語彙・文法を体系的に学習。',
    color: 'text-rose-400',
    bgGradient: 'from-rose-600/20 to-rose-900/10',
    borderColor: 'border-rose-500/30',
  },
]

const HomeScreen: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="text-center py-16 px-6">
        <div className="flex items-center justify-center mb-4">
          <img
            src="/logo.png"
            alt="Learning Hub Logo"
            className="w-16 h-16 rounded-full shadow-lg shadow-indigo-500/30 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <h1 className="text-4xl font-black text-slate-100 mb-3 tracking-tight">Learning Hub</h1>
        <p className="text-slate-400 text-lg">学習アプリを選んでください</p>
      </header>

      {/* App Cards */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelect(app.id)}
              className={`
                group relative flex flex-col items-start text-left
                bg-gradient-to-br ${app.bgGradient}
                border ${app.borderColor}
                rounded-3xl p-6 gap-4
                hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                shadow-lg hover:shadow-xl
              `}
            >
              <div className="text-5xl mb-1">{app.emoji}</div>
              <div>
                <h2 className={`text-xl font-black ${app.color} mb-1`}>{app.title}</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{app.subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{app.description}</p>
              </div>
              <div className={`mt-auto flex items-center space-x-1 text-xs font-bold ${app.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                <span>開く</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

export default HomeScreen
