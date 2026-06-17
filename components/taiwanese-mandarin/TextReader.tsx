import { useState } from 'react'
import type { DialoguePart } from '../../data/taiwanese-mandarin/lessons'
import { useSpeechTW } from '../../hooks/useSpeechTW'

interface Props {
  dialogues: DialoguePart[]
}

type DisplayMode = 'chinese' | 'pinyin' | 'japanese' | 'all'

export default function TextReader({ dialogues }: Props) {
  const [mode, setMode] = useState<DisplayMode>('all')
  const { speak, isPlaying, supported } = useSpeechTW()

  const modes: { value: DisplayMode; label: string }[] = [
    { value: 'all', label: 'すべて表示' },
    { value: 'chinese', label: '中国語のみ' },
    { value: 'pinyin', label: '中国語＋ピンイン' },
    { value: 'japanese', label: '日本語のみ' },
  ]

  return (
    <div>
      <div className="section-title">
        <span>📖</span> 本文
      </div>

      <div className="toggle-group">
        {modes.map((m) => (
          <button
            key={m.value}
            className={`toggle-btn ${mode === m.value ? 'active' : ''}`}
            onClick={() => setMode(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {dialogues.map((part) => (
        <div key={part.part} className="dialogue-part">
          <div className="part-title">{part.part}</div>
          <div className={`dialogue-block ${part.lines[0]?.speaker === 'NARRATION' ? 'narration' : ''}`}>
            {part.lines.map((line, i) => (
              <div key={i} className="block-line">
                {line.speaker !== 'NARRATION' && (
                  <span className={`inline-speaker speaker-${line.speaker}`}>{line.speaker}:</span>
                )}
                <span className="block-line-text">
                  {(mode === 'all' || mode === 'chinese' || mode === 'pinyin') && (
                    <span className="line-chinese">{line.chinese}</span>
                  )}
                  {(mode === 'all' || mode === 'pinyin') && (
                    <span className="line-pinyin"> {line.pinyin}</span>
                  )}
                  {(mode === 'all' || mode === 'japanese') && (
                    <span className="line-japanese"> {line.japanese}</span>
                  )}
                </span>
                {supported && (
                  <button
                    className={`speak-btn speak-btn-inline ${isPlaying(line.chinese) ? 'playing' : ''}`}
                    onClick={() => speak(line.chinese)}
                    title={isPlaying(line.chinese) ? '停止' : '音声再生'}
                  >
                    {isPlaying(line.chinese) ? '⏹' : '🔊'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
