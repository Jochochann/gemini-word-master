import type { GrammarPoint } from '../../data/taiwanese-mandarin/lessons'

interface Props {
  grammar: GrammarPoint[]
}

export default function GrammarViewer({ grammar }: Props) {
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
                  <div className="example-chinese">{ex.chinese}</div>
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
