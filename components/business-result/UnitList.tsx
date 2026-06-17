import { UNITS } from '../../data/business-result/units'
import styles from './UnitList.module.css'

interface Props {
  onSelect: (num: number) => void
}

export function UnitList({ onSelect }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.heroHeader}>
        <div>
          <h1 className={styles.heroTitle}>Business Result</h1>
          <p className={styles.heroSub}>Upper-Intermediate — 全15ユニット</p>
        </div>
        <div className={styles.heroBadge}>
          {UNITS.filter((u) => u.available).length} / {UNITS.length} 公開中
        </div>
      </div>

      <div className={styles.grid}>
        {UNITS.map((unit) => (
          <button
            key={unit.number}
            className={`${styles.card} ${unit.available ? styles.available : styles.locked}`}
            onClick={() => unit.available && onSelect(unit.number)}
            disabled={!unit.available}
            aria-disabled={!unit.available}
          >
            <div className={styles.cardTop}>
              <span className={styles.unitNum}>{unit.number}</span>
              {unit.available
                ? <span className={styles.statusBadge}>学習できます</span>
                : <span className={`${styles.statusBadge} ${styles.comingSoon}`}>準備中</span>
              }
            </div>
            <h2 className={styles.unitTitle}>{unit.title}</h2>
            <p className={styles.unitTopic}>{unit.topic}</p>
            {unit.available && (
              <ul className={styles.outcomes}>
                {unit.outcomes.map((o, i) => (
                  <li key={i}><i className="ti ti-check" aria-hidden="true" />{o}</li>
                ))}
              </ul>
            )}
            {!unit.available && (
              <div className={styles.lockedIcon}>
                <i className="ti ti-lock" aria-hidden="true" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
