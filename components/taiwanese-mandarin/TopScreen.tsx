import { useState } from 'react'
import { volumeMeta, lessons } from '../../data/taiwanese-mandarin/lessons'

interface Props {
  onSelectLesson: (vol: number, lessonId: number) => void
}

export default function TopScreen({ onSelectLesson }: Props) {
  const [openVol, setOpenVol] = useState<number | null>(null)

  const toggleVol = (vol: number) => {
    setOpenVol((prev) => (prev === vol ? null : vol))
  }

  const availableMap = new Map(
    lessons.map((l) => [`${l.vol}-${l.id}`, l])
  )

  return (
    <div className="top-screen">
      <header className="top-header">
        <div className="top-logo">🇹🇼</div>
        <h1 className="top-title">台湾華語</h1>
        <p className="top-subtitle">Taiwanese Mandarin Learning App</p>
      </header>

      <main className="top-main">
        <div className="vol-list">
          {volumeMeta.map(({ vol, lessonCount }) => {
            const isOpen = openVol === vol
            const availableCount = lessons.filter((l) => l.vol === vol).length

            return (
              <div key={vol} className={`vol-card ${isOpen ? 'open' : ''}`}>
                <button
                  className="vol-card-header"
                  onClick={() => toggleVol(vol)}
                >
                  <div className="vol-card-left">
                    <span className="vol-badge">Vol {vol}</span>
                    <span className="vol-lesson-count">
                      {availableCount > 0
                        ? `${lessonCount}課 （${availableCount}課 学習可能）`
                        : `${lessonCount}課`}
                    </span>
                  </div>
                  <span className="vol-chevron">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="lesson-grid">
                    {Array.from({ length: lessonCount }, (_, i) => {
                      const lessonId = i + 1
                      const lesson = availableMap.get(`${vol}-${lessonId}`)
                      const available = !!lesson

                      return (
                        <button
                          key={lessonId}
                          className={`lesson-btn ${available ? 'available' : 'locked'}`}
                          onClick={() => available && onSelectLesson(vol, lessonId)}
                          disabled={!available}
                          title={available ? lesson!.summary : '準備中'}
                        >
                          <span className="lesson-num">Lesson {lessonId}</span>
                          {available && (
                            <span className="lesson-summary">{lesson!.summary}</span>
                          )}
                          {!available && (
                            <span className="lesson-locked-label">準備中</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
