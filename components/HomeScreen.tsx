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
  primary: string
  onPrimary: string
}[] = [
  {
    id: 'word-master',
    emoji: '📚',
    title: 'Word Master',
    subtitle: 'Everyday English & 繁中',
    description: 'Googleスプレッドシート連携の英単語・繁体字中文学習。Gemini AIによる解説、エッセイリーディング、カード学習。',
    primary: '#818CF8',
    onPrimary: '#0C0A20',
  },
  {
    id: 'business',
    emoji: '💼',
    title: 'Business Result',
    subtitle: 'Upper-Intermediate — 全15ユニット',
    description: 'ビジネス英語テキスト「Business Result」の学習アプリ。Reading、Vocabulary、Key Expressions、Grammarをカバー。',
    primary: '#34D399',
    onPrimary: '#052E16',
  },
  {
    id: 'taiwanese',
    emoji: '🇹🇼',
    title: '台湾華語',
    subtitle: 'Taiwanese Mandarin Learning',
    description: '台湾華語（繁体字中文）学習アプリ。複数ボリュームのレッスンで本文・語彙・文法を体系的に学習。',
    primary: '#F87171',
    onPrimary: '#450A0A',
  },
]

const HomeScreen: React.FC<Props> = ({ onSelect }) => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: 'var(--md-sys-color-background)',
        color: 'var(--md-sys-color-on-background)',
        fontFamily: 'var(--md-sys-typescale-font-family)',
      }}
    >
      {/* Header */}
      <header className="text-center py-16 px-6">
        <div className="flex items-center justify-center mb-4">
          <img
            src="/logo.png"
            alt="Learning Hub Logo"
            className="w-16 h-16 object-cover"
            style={{
              borderRadius: 'var(--md-sys-shape-corner-full)',
              boxShadow: '0 4px 16px rgba(129, 140, 248, 0.3)',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <h1
          className="font-black mb-3 tracking-tight"
          style={{
            fontSize: 'var(--md-sys-typescale-headline-large-size)',
            lineHeight: 'var(--md-sys-typescale-headline-large-line-height)',
            color: 'var(--md-sys-color-on-background)',
          }}
        >
          Learning Hub
        </h1>
        <p
          style={{
            fontSize: 'var(--md-sys-typescale-body-large-size)',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          学習アプリを選んでください
        </p>
      </header>

      {/* App Cards */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelect(app.id)}
              className="group relative flex flex-col items-start text-left p-6 gap-4 transition-all"
              style={
                {
                  '--app-primary': app.primary,
                  backgroundColor: `color-mix(in srgb, ${app.primary} 10%, var(--md-sys-color-surface))`,
                  border: `1px solid color-mix(in srgb, ${app.primary} 30%, var(--md-sys-color-outline-variant))`,
                  borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transition: `box-shadow var(--md-sys-duration-medium2) var(--md-sys-motion-standard),
                               transform var(--md-sys-duration-short4) var(--md-sys-motion-standard)`,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px color-mix(in srgb, ${app.primary} 50%, transparent)`
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
              }}
            >
              <div
                className="text-5xl mb-1 flex items-center justify-center w-14 h-14"
                style={{
                  borderRadius: 'var(--md-sys-shape-corner-large)',
                  backgroundColor: `color-mix(in srgb, ${app.primary} 20%, var(--md-sys-color-surface))`,
                }}
              >
                {app.emoji}
              </div>

              <div className="flex-1">
                <h2
                  className="font-black mb-1"
                  style={{
                    fontSize: 'var(--md-sys-typescale-title-large-size)',
                    lineHeight: 'var(--md-sys-typescale-title-large-line-height)',
                    color: app.primary,
                  }}
                >
                  {app.title}
                </h2>
                <p
                  className="font-bold uppercase tracking-wider mb-3"
                  style={{
                    fontSize: 'var(--md-sys-typescale-label-small-size)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  {app.subtitle}
                </p>
                <p
                  className="leading-relaxed"
                  style={{
                    fontSize: 'var(--md-sys-typescale-body-medium-size)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  {app.description}
                </p>
              </div>

              <div
                className="mt-auto flex items-center space-x-1 font-bold transition-opacity opacity-70 group-hover:opacity-100"
                style={{
                  fontSize: 'var(--md-sys-typescale-label-large-size)',
                  color: app.primary,
                }}
              >
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
