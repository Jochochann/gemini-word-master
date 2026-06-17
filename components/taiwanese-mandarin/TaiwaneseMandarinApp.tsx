import { useState } from 'react'
import { lessons } from '../../data/taiwanese-mandarin/lessons'
import TopScreen from './TopScreen'
import TextReader from './TextReader'
import Flashcard from './Flashcard'
import GrammarViewer from './GrammarViewer'
import '../../styles/taiwanese-mandarin.css'

type Tab = 'text' | 'vocab' | 'grammar'
type Page = 'top' | 'lesson'

interface Props {
  onBack: () => void
}

export default function TaiwaneseMandarinApp({ onBack }: Props) {
  const [page, setPage] = useState<Page>('top')
  const [selectedVol, setSelectedVol] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('text')

  const handleSelectLesson = (vol: number, lessonId: number) => {
    setSelectedVol(vol)
    setSelectedLessonId(lessonId)
    setActiveTab('text')
    setPage('lesson')
  }

  const handleBack = () => {
    setPage('top')
  }

  const lesson = page === 'lesson'
    ? lessons.find((l) => l.vol === selectedVol && l.id === selectedLessonId)
    : null

  return (
    <div className="tw-root" style={{ position: 'fixed', inset: 0, overflowY: 'auto', zIndex: 100 }}>
      {/* Persistent back-to-home bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => {
            if (page === 'lesson') {
              handleBack()
            } else {
              onBack()
            }
          }}
          style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
        >
          ← {page === 'lesson' ? 'レッスン一覧' : 'ホームへ'}
        </button>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>台湾華語</span>
      </div>

      {page === 'top' && (
        <TopScreen onSelectLesson={handleSelectLesson} />
      )}

      {page === 'lesson' && lesson && (
        <div>
          <header className="app-header">
            <div className="app-header-top">
              <div className="lesson-badge">Vol {lesson.vol} · Lesson {lesson.id}</div>
            </div>
            <h1>{lesson.summary}</h1>
          </header>

          <nav className="tab-bar">
            <button
              className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <span className="tab-icon">📖</span>
              本文リーダー
            </button>
            <button
              className={`tab-btn ${activeTab === 'vocab' ? 'active' : ''}`}
              onClick={() => setActiveTab('vocab')}
            >
              <span className="tab-icon">📋</span>
              単語一覧
            </button>
            <button
              className={`tab-btn ${activeTab === 'grammar' ? 'active' : ''}`}
              onClick={() => setActiveTab('grammar')}
            >
              <span className="tab-icon">📝</span>
              文法解説
            </button>
          </nav>

          <main className="main-content">
            {activeTab === 'text' && <TextReader dialogues={lesson.dialogues} />}
            {activeTab === 'vocab' && <Flashcard vocabulary={lesson.vocabulary} />}
            {activeTab === 'grammar' && <GrammarViewer grammar={lesson.grammar} />}
          </main>
        </div>
      )}
    </div>
  )
}
