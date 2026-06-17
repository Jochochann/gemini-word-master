import { useState } from 'react'
import { UnitList } from './UnitList'
import { UnitView } from './UnitView'
import '../../styles/business-result.css'

interface Props {
  onBack: () => void
}

export default function BusinessResultApp({ onBack }: Props) {
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null)

  return (
    <div className="br-root" style={{ position: 'fixed', inset: 0, overflowY: 'auto', zIndex: 100 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface-2)', borderBottom: '0.5px solid var(--color-border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => {
            if (selectedUnit !== null) {
              setSelectedUnit(null)
            } else {
              onBack()
            }
          }}
          style={{ background: 'none', border: '1.5px solid var(--color-border-hover)', borderRadius: 8, padding: '6px 14px', fontSize: 15, color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <i className="ti ti-arrow-left" aria-hidden="true" />
          {selectedUnit !== null ? 'ユニット一覧' : 'ホームへ'}
        </button>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-muted)' }}>Business Result</span>
      </div>

      {selectedUnit !== null ? (
        <UnitView unitNumber={selectedUnit} onBack={() => setSelectedUnit(null)} />
      ) : (
        <UnitList onSelect={(num) => setSelectedUnit(num)} />
      )}
    </div>
  )
}
