import { useState } from 'react'
import { PlayButton } from '../PlayButton'
import styles from './Section.module.css'

function highlightText(text: string, highlights: string[]): React.ReactNode {
  if (!highlights || highlights.length === 0) return text
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    highlights.some((h) => h.toLowerCase() === part.toLowerCase())
      ? <mark key={i} className={styles.highlight}>{part}</mark>
      : part
  )
}

interface Paragraph {
  en: string
  ja: string
  highlights?: string[]
}

interface Email {
  to: string
  from: string
  subject: string
  bodyEn: string
  bodyJa: string
  speakText: string
}

interface ReadingData {
  title: string
  paragraphs: Paragraph[]
  email?: Email | null
}

interface Props {
  data: ReadingData
  speak: (id: string, text: string) => void
  playingId: string | null
  onDone: () => void
}

export function ReadingSection({ data, speak, playingId, onDone }: Props) {
  const [showJa, setShowJa] = useState(false)
  const [showEmailJa, setShowEmailJa] = useState(false)

  return (
    <div>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.badge}>Reading</span>
          {data.title}
        </h2>

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>日本語訳</span>
          <button
            className={`${styles.toggleBtn} ${showJa ? styles.toggleOn : ''}`}
            onClick={() => setShowJa((v) => !v)}
          >
            {showJa ? '隠す' : '表示する'}
          </button>
        </div>

        {data.paragraphs.map((para, i) => (
          <div key={i} className={styles.paraBlock}>
            <div className={styles.paraHeader}>
              <PlayButton id={`para-${i}`} text={para.en} speak={speak} playingId={playingId} />
              <p className={styles.paraEn}>{highlightText(para.en, para.highlights ?? [])}</p>
            </div>
            {showJa && (
              <p className={styles.paraJa}>{highlightText(para.ja, [])}</p>
            )}
          </div>
        ))}
      </div>

      {data.email && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.badge}>Email</span>
            Sample: Arranging a meeting
          </h2>
          <div className={styles.emailPlayRow}>
            <PlayButton id="email" text={data.email.speakText} speak={speak} playingId={playingId} />
            <span className={styles.toggleLabel}>メールを読み上げ</span>
            <span style={{ flex: 1 }} />
            <span className={styles.toggleLabel}>日本語訳</span>
            <button
              className={`${styles.toggleBtn} ${showEmailJa ? styles.toggleOn : ''}`}
              onClick={() => setShowEmailJa((v) => !v)}
            >
              {showEmailJa ? '隠す' : '表示する'}
            </button>
          </div>
          <div className={styles.emailBox}>
            <div className={styles.emailMeta}>
              <span className={styles.emailMetaLabel}>To:</span> {data.email.to}<br />
              <span className={styles.emailMetaLabel}>From:</span> {data.email.from}<br />
              <span className={styles.emailMetaLabel}>Subject:</span> {data.email.subject}
            </div>
            <hr className={styles.emailDivider} />
            <p className={styles.emailBody}>{data.email.bodyEn}</p>
            {showEmailJa && (
              <div className={styles.emailJa}>
                <hr className={styles.emailDivider} />
                <p>{data.email.bodyJa}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onDone}>
        完了にする <i className="ti ti-check" aria-hidden="true" />
      </button>
    </div>
  )
}
