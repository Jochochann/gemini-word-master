import type { GrammarPoint } from '../../data/taiwanese-mandarin/lessons'
import { useSpeechTW } from '../../hooks/useSpeechTW'

interface Props {
  grammar: GrammarPoint[]
}

export default function GrammarViewer({ grammar }: Props) {
  const { speak, isPlaying, supported } = useSpeechTW()

  return (
    <div>
      <div className="section-title">
        <span>📝</span> 文法解説
      </div>

      <div className="grammar-list">
        {grammar.map((point, i) => (
          <div key={i} className="grammar-card">
            <div className="grammar-card-header">
              <div className="grammar-num">GRAMMAR POINT {i + 1}</div>
              <div className="grammar-title">{point.title}</div>
              <div className="grammar-title-en">{point.titleJa}</div>
            </div>
            <div className="grammar-description">{point.description}</div>
            <div className="grammar-examples">
              {point.examples.map((ex, j) => (
                <div key={j} className="grammar-example">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="example-chinese" style={{ flex: 1 }}>{ex.chinese}</div>
                    {supported && (
                      <button
                        className={`speak-btn speak-btn-inline ${isPlaying(ex.chinese) ? 'playing' : ''}`}
                        onClick={() => speak(ex.chinese)}
                        title="発音を聞く"
                      >
                        {isPlaying(ex.chinese) ? '⏹' : '🔊'}
                      </button>
                    )}
                  </div>
                  <div className="example-pinyin">{ex.pinyin}</div>
                  <div className="example-japanese">{ex.japanese}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
