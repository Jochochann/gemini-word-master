import styles from './PlayButton.module.css'

interface Props {
  id: string
  text: string
  speak: (id: string, text: string) => void
  playingId: string | null
  small?: boolean
}

export function PlayButton({ id, text, speak, playingId, small = false }: Props) {
  const isPlaying = playingId === id

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    speak(id, text)
  }

  return (
    <button
      className={`${styles.btn} ${small ? styles.small : ''} ${isPlaying ? styles.playing : ''}`}
      onClick={handleClick}
      aria-label={isPlaying ? '停止' : '読み上げ'}
    >
      <i className={`ti ${isPlaying ? 'ti-player-pause' : small ? 'ti-volume' : 'ti-player-play'}`} aria-hidden="true" />
    </button>
  )
}
