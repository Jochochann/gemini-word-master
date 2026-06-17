import { PlayButton } from '../PlayButton'
import styles from './Section.module.css'

interface GrammarItem {
  en: string
  ja: string
  speak?: string
}

interface GrammarColumn {
  label: string
  items: GrammarItem[]
}

interface TipItem {
  label: string
  desc: string
  speak: string
  speakLabel: string
}

interface GrammarData {
  simple?: GrammarColumn
  continuous?: GrammarColumn
  simpleAdverbs?: GrammarColumn
  continuousAdverbs?: GrammarColumn
  tip?: { items: TipItem[] }
}

interface Props {
  data: GrammarData
  speak: (id: string, text: string) => void
  playingId: string | null
  onDone: () => void
}

export function GrammarSection({ data, speak, playingId, onDone }: Props) {
  const tenseColumns = [data.simple, data.continuous].filter(Boolean) as GrammarColumn[]
  const adverbColumns = [data.simpleAdverbs, data.continuousAdverbs].filter(Boolean) as GrammarColumn[]

  return (
    <div>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.badge}>Grammar</span>
          Grammar Points
        </h2>

        {tenseColumns.length > 0 && (
          <div className={styles.grammarRow}>
            {tenseColumns.map((col, ci) => (
              <div key={ci} className={styles.grammarBox}>
                <h3 className={styles.grammarBoxTitle}>{col.label}</h3>
                <ul className={styles.grammarList}>
                  {col.items.map((item, i) => (
                    <li key={i} className={styles.grammarLi}>
                      {item.speak && (
                        <PlayButton id={`gram-${ci}-${i}`} text={item.speak} speak={speak} playingId={playingId} />
                      )}
                      <div className={styles.gramLiText}>
                        <em className={styles.gramEn}>{item.en}</em>
                        <span className={styles.gramJa}>{item.ja}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {adverbColumns.length > 0 && (
          <div className={styles.grammarBox} style={{ marginTop: 0 }}>
            <div className={styles.grammarRow}>
              {adverbColumns.map((col, ci) => (
                <div key={ci}>
                  <h4 className={styles.grammarColLabel}>{col.label}</h4>
                  <ul className={styles.grammarList}>
                    {col.items.map((item, i) => (
                      <li key={i} className={styles.grammarLi}>
                        <PlayButton id={`adv-${ci}-${i}`} text={item.en} speak={speak} playingId={playingId} />
                        <div className={styles.gramLiText}>
                          <span className={styles.gramEn} style={{ fontStyle: 'normal' }}>{item.en}</span>
                          <span className={styles.gramJa}>{item.ja}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.tip && (
          <div className={styles.tipBox}>
            {data.tip.items.map((item, i) => (
              <div key={i} style={{ marginBottom: i < (data.tip?.items.length ?? 0) - 1 ? '0.75rem' : 0 }}>
                <p className={styles.tipBody}>
                  <strong>{item.label}</strong> = {item.desc}
                </p>
                <div className={styles.tipExampleRow}>
                  <PlayButton id={`tip-${i}`} text={item.speak} speak={speak} playingId={playingId} />
                  <em className={styles.tipExample}>{item.speakLabel}</em>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onDone}>
        完了にする <i className="ti ti-check" aria-hidden="true" />
      </button>
    </div>
  )
}
