import { useState } from 'react'
import { PlayButton } from '../PlayButton'
import styles from './Section.module.css'
import tp from './TalkingPoint.module.css'

interface Diagram {
  label: string
  ja: string
  description: string
}

interface DiscussionItem {
  en: string
  ja: string
}

interface TalkingPointData {
  title: string
  textEn: string
  textJa: string
  diagrams?: Diagram[]
  discussion: DiscussionItem[]
}

interface Props {
  data: TalkingPointData
  speak: (id: string, text: string) => void
  playingId: string | null
  onDone: () => void
}

export function TalkingPointSection({ data, speak, playingId, onDone }: Props) {
  const [showJa, setShowJa] = useState(false)

  return (
    <div>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.badge}>Talking Point</span>
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

        <div className={styles.paraBlock}>
          <div className={styles.paraHeader}>
            <PlayButton id="tp-text" text={data.textEn} speak={speak} playingId={playingId} />
            <p className={styles.paraEn}>{data.textEn}</p>
          </div>
          {showJa && <p className={styles.paraJa}>{data.textJa}</p>}
        </div>

        {data.diagrams && data.diagrams.length >= 2 && (
          <div className={tp.diagramWrap}>
            <div className={tp.diagramItem}>
              <p className={tp.diagramLabel}>{data.diagrams[0].label}</p>
              <p className={tp.diagramLabelJa}>{data.diagrams[0].ja}</p>
              <svg viewBox="0 0 180 120" className={tp.vennSvg} aria-label="Frustrated person: little overlap">
                <circle cx="70" cy="60" r="50" fill="#9FE1CB" fillOpacity="0.5" stroke="#1D9E75" strokeWidth="1.5" />
                <circle cx="115" cy="60" r="50" fill="#B5D4F4" fillOpacity="0.5" stroke="#378ADD" strokeWidth="1.5" />
                <text x="52" y="55" textAnchor="middle" fontSize="8" fill="#085041" fontWeight="500">PERSONAL</text>
                <text x="52" y="65" textAnchor="middle" fontSize="8" fill="#085041" fontWeight="500">LIFE</text>
                <text x="133" y="55" textAnchor="middle" fontSize="8" fill="#0C447C" fontWeight="500">WORK</text>
                <text x="133" y="65" textAnchor="middle" fontSize="8" fill="#0C447C" fontWeight="500">LIFE</text>
              </svg>
              <p className={tp.diagramDesc}>{data.diagrams[0].description}</p>
            </div>

            <div className={tp.diagramItem}>
              <p className={tp.diagramLabel}>{data.diagrams[1].label}</p>
              <p className={tp.diagramLabelJa}>{data.diagrams[1].ja}</p>
              <svg viewBox="0 0 160 120" className={tp.vennSvg} aria-label="Reconciled person: strong overlap">
                <circle cx="75" cy="60" r="50" fill="#9FE1CB" fillOpacity="0.45" stroke="#1D9E75" strokeWidth="1.5" />
                <circle cx="95" cy="60" r="50" fill="#B5D4F4" fillOpacity="0.45" stroke="#378ADD" strokeWidth="1.5" />
                <text x="85" y="52" textAnchor="middle" fontSize="7.5" fill="#085041" fontWeight="500">PERSONAL</text>
                <text x="85" y="62" textAnchor="middle" fontSize="7.5" fill="#085041" fontWeight="500">AND</text>
                <text x="85" y="72" textAnchor="middle" fontSize="7.5" fill="#0C447C" fontWeight="500">WORK LIFE</text>
              </svg>
              <p className={tp.diagramDesc}>{data.diagrams[1].description}</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.badge}>Discussion</span>
          考えてみましょう
        </h2>
        <div className={tp.discussionList}>
          {data.discussion.map((item, i) => (
            <div key={i} className={tp.discussionItem}>
              <div className={tp.discussionNum}>{i + 1}</div>
              <div className={tp.discussionBody}>
                <div className={tp.discussionTop}>
                  <PlayButton id={`tp-disc-${i}`} text={item.en} speak={speak} playingId={playingId} />
                  <p className={tp.discussionEn}>{item.en}</p>
                </div>
                {showJa && <p className={tp.discussionJa}>{item.ja}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onDone}>
        完了にする <i className="ti ti-check" aria-hidden="true" />
      </button>
    </div>
  )
}
