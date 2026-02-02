import { useState, useEffect } from 'react'

const useAlphabet = () => {
  const [alphabet, setAlphabet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAlphabet = async () => {
      try {
        const response = await fetch('/data/alphabet.json')
        if (!response.ok) {
          throw new Error('Failed to load alphabet data')
        }
        const data = await response.json()
        setAlphabet(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAlphabet()
  }, [])

  // Get all letters as a flat array
  const getLetters = () => alphabet?.letters || []

  // Get letters by category
  const getLettersByCategory = (category) => {
    return getLetters().filter(l => l.category === category)
  }

  // Get letters for a specific learning phase
  const getLettersByPhase = (phase) => {
    if (!alphabet?.learningOrder) return []
    const phaseLetters = alphabet.learningOrder[phase] || []
    return getLetters().filter(l => phaseLetters.includes(l.letter))
  }

  // Get a specific letter by its character
  const getLetter = (char) => {
    return getLetters().find(l => l.letter === char || l.lowercase === char)
  }

  // Get all letter characters as an array
  const getAllLetterChars = () => {
    return getLetters().map(l => l.letter)
  }

  // Get practice words by level
  const getPracticeWords = (level) => {
    return alphabet?.practiceWords?.[level] || []
  }

  return {
    alphabet,
    loading,
    error,
    getLetters,
    getLettersByCategory,
    getLettersByPhase,
    getLetter,
    getAllLetterChars,
    getPracticeWords,
  }
}

export default useAlphabet
