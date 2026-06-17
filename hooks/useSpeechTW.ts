import { useState, useEffect, useCallback, useRef } from 'react'

export function useSpeechTW() {
  const [speaking, setSpeaking] = useState(false)
  const [currentText, setCurrentText] = useState<string | null>(null)
  const [supported, setSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setSupported('speechSynthesis' in window)
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return

    if (currentText === text && speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      setCurrentText(null)
      return
    }

    window.speechSynthesis.cancel()

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'zh-TW'
    utter.rate = 0.85
    utter.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const twVoice = voices.find((v) => v.lang === 'zh-TW')
      ?? voices.find((v) => v.lang.startsWith('zh'))
    if (twVoice) utter.voice = twVoice

    utter.onstart = () => {
      setSpeaking(true)
      setCurrentText(text)
    }
    utter.onend = () => {
      setSpeaking(false)
      setCurrentText(null)
    }
    utter.onerror = () => {
      setSpeaking(false)
      setCurrentText(null)
    }

    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [currentText, speaking])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setCurrentText(null)
  }, [])

  const isPlaying = useCallback((text: string) => {
    return speaking && currentText === text
  }, [speaking, currentText])

  return { speak, stop, speaking, isPlaying, supported }
}
