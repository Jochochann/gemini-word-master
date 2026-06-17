import { useState, useCallback, useRef } from 'react'

export function useSpeechEN() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((id: string, text: string) => {
    if (!window.speechSynthesis) return

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      if (playingId === id) {
        setPlayingId(null)
        return
      }
    }

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = 1.0

    const voices = window.speechSynthesis.getVoices()
    const enVoice = voices.find((v) => v.lang === 'en-US') || voices.find((v) => v.lang.startsWith('en'))
    if (enVoice) utter.voice = enVoice

    utter.onend = () => setPlayingId(null)
    utter.onerror = () => setPlayingId(null)

    utterRef.current = utter
    setPlayingId(id)
    window.speechSynthesis.speak(utter)
  }, [playingId])

  const stop = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setPlayingId(null)
  }, [])

  return { speak, stop, playingId }
}
