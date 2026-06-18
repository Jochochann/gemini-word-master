import { useState, useCallback, useRef } from 'react'
import type { VocabItem } from '../../data/taiwanese-mandarin/lessons'
import { useSpeechTW } from '../../hooks/useSpeechTW'

interface Props {
  vocabulary: VocabItem[]
}

export default function Flashcard({ vocabulary }: Props) {
  const [index, setIndex] = useState(0)
  const { speak, isPlaying, supported } = useSpeechTW()
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

  const goNext = useCallback(() => {
    const next = Math.min(index + 1, vocabulary.length - 1)
    setIndex(next)
    speak(vocabulary[next].chinese)
  }, [index, vocabulary, speak])

  const goPrev = useCallback(() => {
    const prev = Math.max(index - 1, 0)
    setIndex(prev)
    speak(vocabulary[prev].chinese)
  }, [index, vocabulary, speak])

  const selectRow = useCallback((i: number) => {
    setIndex(i)
  }, [])

  const current = vocabulary[index]

  return (
    <div>
      <div className="section-title">
        <span>📋</span> 単語一覧
      </div>

      <div className="vocab-nav-bar">
        <button
          className="ctrl-btn btn-prev"
          onClick={goPrev}
          disabled={index === 0}
        >
          ← 前へ
        </button>

        <div className="vocab-nav-current">
          <span className="nav-chinese">{current.chinese}</span>
          <span className="nav-pinyin">{current.pinyin}</span>
          {supported && (
            <button
              className={`speak-btn ${isPlaying(current.chinese) ? 'playing' : ''}`}
              onClick={() => speak(current.chinese)}
              title="発音を聞く"
            >
              {isPlaying(current.chinese) ? '⏹' : '🔊'}
            </button>
          )}
        </div>

        <button
          className="ctrl-btn btn-next"
          onClick={goNext}
          disabled={index === vocabulary.length - 1}
        >
          次へ →
        </button>
      </div>

      <div className="vocab-progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${((index + 1) / vocabulary.length) * 100}%` }}
        />
      </div>

      <div className="vocab-table-wrap">
        <table className="vocab-table">
          <thead>
            <tr>
              <th>#</th>
              <th>中国語</th>
              <th>ピンイン</th>
              <th>日本語</th>
              {supported && <th>音声</th>}
            </tr>
          </thead>
          <tbody>
            {vocabulary.map((v, i) => (
              <tr
                key={v.chinese + i}
                ref={(el) => { rowRefs.current[i] = el }}
                className={i === index ? 'row-current' : ''}
                onClick={() => selectRow(i)}
              >
                <td className="col-num">{i + 1}</td>
                <td className="col-chinese">{v.chinese}</td>
                <td className="col-pinyin">{v.pinyin}</td>
                <td className="col-japanese">{v.japanese}</td>
                {supported && (
                  <td className="col-speak">
                    <button
                      className={`speak-btn ${isPlaying(v.chinese) ? 'playing' : ''}`}
                      onClick={(e) => { e.stopPropagation(); speak(v.chinese) }}
                      title="発音を聞く"
                    >
                      {isPlaying(v.chinese) ? '⏹' : '🔊'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
