import { useState, useEffect } from 'react'
import { useSpeechEN } from '../../hooks/useSpeechEN'
import { ReadingSection } from './sections/ReadingSection'
import { VocabSection } from './sections/VocabSection'
import { ExpressionsSection } from './sections/ExpressionsSection'
import { GrammarSection } from './sections/GrammarSection'
import { TalkingPointSection } from './sections/TalkingPointSection'
import { loadUnit } from '../../data/business-result/loader'
import styles from './UnitView.module.css'

const SECTION_DEFS = [
  { id: 'reading',     label: 'Reading',         icon: 'ti-book',           dataKey: 'reading' },
  { id: 'vocab',       label: 'Vocabulary',      icon: 'ti-vocabulary',     dataKey: 'vocabulary' },
  { id: 'expressions', label: 'Key Expressions', icon: 'ti-message-circle', dataKey: 'expressions' },
  { id: 'grammar',     label: 'Grammar',         icon: 'ti-pencil',         dataKey: 'grammar' },
  { id: 'talking',     label: 'Talking Point',   icon: 'ti-messages',       dataKey: 'talkingPoint' },
]

interface Props {
  unitNumber: number
  onBack: () => void
}

export function UnitView({ unitNumber, onBack }: Props) {
  const [unitData, setUnitData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, boolean>>({})
  const { speak, stop, playingId } = useSpeechEN()

  useEffect(() => {
    setLoading(true)
    setError(null)
    loadUnit(unitNumber)
      .then((data) => {
        setUnitData(data)
        const firstSection = SECTION_DEFS.find((s) => data[s.dataKey])
        setActiveTab(firstSection?.id ?? null)
        setDone({})
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [unitNumber])

  const activeSections = unitData
    ? SECTION_DEFS.filter((s) => unitData[s.dataKey])
    : []

  function markDone(id: string) {
    setDone((prev) => ({ ...prev, [id]: true }))
    const idx = activeSections.findIndex((s) => s.id === id)
    if (idx < activeSections.length - 1) {
      stop()
      setActiveTab(activeSections[idx + 1].id)
    }
  }

  function switchTab(id: string) {
    stop()
    setActiveTab(id)
  }

  const doneCount = Object.values(done).filter(Boolean).length
  const progress = activeSections.length > 0 ? (doneCount / activeSections.length) * 100 : 0

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loadingWrap}>
          <i className="ti ti-loader-2" style={{ fontSize: 28, color: 'var(--color-green)' }} aria-hidden="true" />
          <p>Unit {unitNumber} を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.errorWrap}>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.backBtn} onClick={onBack}>
            <i className="ti ti-arrow-left" aria-hidden="true" /> ユニット一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  if (!unitData) return null

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => { stop(); onBack() }}>
            <i className="ti ti-arrow-left" aria-hidden="true" />
            一覧に戻る
          </button>
          <h1 className={styles.headerTitle}>
            <span className={styles.unitNumBadge}>{unitNumber}</span>
            {unitData.title as string}
          </h1>
          <p className={styles.headerSub}>{unitData.subtitle as string}</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.progressLabel}>{doneCount} / {activeSections.length} sections</p>
          </div>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="セクション">
        {activeSections.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => switchTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <i className={`ti ${tab.icon}`} aria-hidden="true" />
            {tab.label}
            {done[tab.id] && (
              <i className="ti ti-circle-check" aria-hidden="true"
                style={{ color: activeTab === tab.id ? '#fff' : 'var(--color-green)', marginLeft: 4 }} />
            )}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'reading' && !!unitData.reading && (
          <ReadingSection
            data={unitData.reading as any}
            speak={speak} playingId={playingId}
            onDone={() => markDone('reading')}
          />
        )}
        {activeTab === 'vocab' && !!unitData.vocabulary && (
          <VocabSection
            data={unitData.vocabulary as any}
            speak={speak} playingId={playingId}
            onDone={() => markDone('vocab')}
          />
        )}
        {activeTab === 'expressions' && !!unitData.expressions && (
          <ExpressionsSection
            data={unitData.expressions as any}
            speak={speak} playingId={playingId}
            onDone={() => markDone('expressions')}
          />
        )}
        {activeTab === 'grammar' && !!unitData.grammar && (
          <GrammarSection
            data={unitData.grammar as any}
            speak={speak} playingId={playingId}
            onDone={() => markDone('grammar')}
          />
        )}
        {activeTab === 'talking' && !!unitData.talkingPoint && (
          <TalkingPointSection
            data={unitData.talkingPoint as any}
            speak={speak} playingId={playingId}
            onDone={() => markDone('talking')}
          />
        )}
      </main>
    </div>
  )
}
