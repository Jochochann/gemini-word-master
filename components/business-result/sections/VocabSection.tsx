import { useState } from 'react'
import { PlayButton } from '../PlayButton'
import styles from './Section.module.css'

interface VocabItem {
  word: string
  ja: string
  defEn: string
  defJa: string
}

interface Props {
  data: VocabItem[]
  speak: (id: string, text: string) => void
  playingId: string | null
  onDone: () => void
}

export function VocabSection({ data, speak, playingId, onDone }: Props) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})

  function toggle(i: number) {
    setFlipped((prev) => ({ ...prev, [i]: !prev[i] }))
  }

  return (
    <div>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.badge}>Vocabulary</span>
          Key words — タップで意味を確認・🔊 で発音
        </h2>
        <div className={styles.vocabGrid}>
          {data.map((item, i) => (
            <div
              key={i}
              className={`${styles.vocabItem} ${flipped[i] ? styles.vocabFlipped : ''}`}
              onClick={() => toggle(i)}
            >
              <div className={styles.vocabTop}>
                <span className={styles.vocabWord}>{item.word}</span>
                <PlayButton id={`vocab-${i}`} text={item.word} speak={speak} playingId={playingId} small />
              </div>
              {!flipped[i] && <span className={styles.vocabHint}>tap to reveal</span>}
              {flipped[i] && (
                <>
                  <p className={styles.vocabJa}>{item.ja}</p>
                  <p className={styles.vocabDef}>{item.defEn}</p>
                  <p className={styles.vocabDefJa}>{item.defJa}</p>
                </>
              )}
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
