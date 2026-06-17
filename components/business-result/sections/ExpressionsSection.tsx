import { useState } from 'react'
import { PlayButton } from '../PlayButton'
import styles from './Section.module.css'

interface ExprItem {
  en: string
  ja: string
  speak: string
  tag?: string
}

interface ExprGroup {
  category: string
  items: ExprItem[]
}

interface Props {
  data: ExprGroup[]
  speak: (id: string, text: string) => void
  playingId: string | null
  onDone: () => void
}

export function ExpressionsSection({ data, speak, playingId, onDone }: Props) {
  const [showJa, setShowJa] = useState(false)

  return (
    <div>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.badge}>Business Communication</span>
          Key expressions
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

        {data.map((group, gi) => (
          <div key={gi} className={styles.exprGroup}>
            <h3 className={styles.exprGroupTitle}>{group.category}</h3>
            <div className={styles.exprList}>
              {group.items.map((item, ii) => {
                const id = `expr-${gi}-${ii}`
                return (
                  <div key={ii} className={styles.exprItem}>
                    <div className={styles.exprTop}>
                      <PlayButton id={id} text={item.speak} speak={speak} playingId={playingId} />
                      <span className={styles.exprText}>
                        {item.en}
                        {item.tag && <span className={styles.exprTag}>({item.tag})</span>}
                      </span>
                    </div>
                    {showJa && <p className={styles.exprJa}>{item.ja}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onDone}>
        完了にする <i className="ti ti-check" aria-hidden="true" />
      </button>
    </div>
  )
}
