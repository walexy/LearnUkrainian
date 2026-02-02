import { useState, useEffect, useCallback } from 'react'

const useSpeech = () => {
  const [voices, setVoices] = useState([])
  const [ukrainianVoice, setUkrainianVoice] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)

      // Try to find a Ukrainian voice
      const ukVoice = availableVoices.find(v =>
        v.lang.startsWith('uk') || v.lang === 'uk-UA'
      )
      setUkrainianVoice(ukVoice || null)
    }

    // Load voices - they may not be immediately available
    loadVoices()

    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  const speak = useCallback((text, options = {}) => {
    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Use Ukrainian voice if available, otherwise use the best available option
    if (ukrainianVoice) {
      utterance.voice = ukrainianVoice
    }
    utterance.lang = options.lang || 'uk-UA'
    utterance.rate = options.rate || 0.8 // Slower for learning
    utterance.pitch = options.pitch || 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthesis.speak(utterance)
  }, [ukrainianVoice])

  const speakLetter = useCallback((letterData) => {
    // Speak the letter itself, then an example word
    const text = letterData.letter
    speak(text, { rate: 0.6 })
  }, [speak])

  const speakWord = useCallback((word) => {
    speak(word, { rate: 0.7 })
  }, [speak])

  const speakSound = useCallback((soundDescription) => {
    // For sounds that might not render well in TTS,
    // we speak the letter name or a word containing the sound
    speak(soundDescription, { rate: 0.6 })
  }, [speak])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    speak,
    speakLetter,
    speakWord,
    speakSound,
    stop,
    isSpeaking,
    hasUkrainianVoice: !!ukrainianVoice,
    voices,
  }
}

export default useSpeech
