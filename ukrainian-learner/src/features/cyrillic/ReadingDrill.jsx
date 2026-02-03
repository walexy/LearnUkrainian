import { useState, useEffect, useCallback, useMemo } from 'react'
import useSpeech from '../../hooks/useSpeech'
import useProgressStore from '../../stores/useProgressStore'
import { shuffle } from '../../utils/shuffle'

const WORDS_PER_SESSION = 10

function ReadingDrill({ letters, onComplete }) {
  const { speakWord, isSpeaking } = useSpeech()
  const { letterProgress, getMasteredCount } = useProgressStore()

  const [sessionWords, setSessionWords] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionResults, setSessionResults] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [totalReadingTime, setTotalReadingTime] = useState(0)

  // Collect all words from letters
  const allWords = useMemo(() => {
    const words = []
    letters.forEach(letter => {
      if (letter.exampleWords) {
        letter.exampleWords.forEach(wordObj => {
          words.push({
            ...wordObj,
            letter: letter.letter,
            letterName: letter.name,
          })
        })
      }
    })
    return words
  }, [letters])

  // Filter words based on mastery - prefer words using mastered letters
  const prioritizedWords = useMemo(() => {
    const masteredLetters = new Set(
      Object.entries(letterProgress)
        .filter(([_, progress]) => progress.total >= 5 && (progress.correct / progress.total) >= 0.8)
        .map(([letter]) => letter)
    )

    // Score words by how many mastered letters they contain
    const scoredWords = allWords.map(wordObj => {
      const wordLetters = wordObj.word.toUpperCase().split('')
      const masteredCount = wordLetters.filter(l => masteredLetters.has(l)).length
      return {
        ...wordObj,
        masteryScore: masteredCount / wordLetters.length,
      }
    })

    // Sort by mastery score (prioritize words with more mastered letters)
    return scoredWords.sort((a, b) => b.masteryScore - a.masteryScore)
  }, [allWords, letterProgress])

  // Generate session words on mount
  useEffect(() => {
    if (prioritizedWords.length === 0) return

    // Take top words by mastery score, then shuffle
    const topWords = prioritizedWords.slice(0, Math.min(30, prioritizedWords.length))
    const sessionSelection = shuffle(topWords).slice(0, WORDS_PER_SESSION)
    setSessionWords(sessionSelection)
    setStartTime(Date.now())
  }, [prioritizedWords])

  const currentWord = sessionWords[currentWordIndex]

  // Handle revealing the answer
  const handleReveal = useCallback(() => {
    if (showAnswer) return

    const readTime = Date.now() - startTime
    setShowAnswer(true)

    // Auto-play pronunciation
    if (currentWord) {
      speakWord(currentWord)
    }
  }, [showAnswer, startTime, currentWord, speakWord])

  // Handle rating and moving to next word
  const handleRate = useCallback((rating) => {
    const readTime = Date.now() - startTime

    setSessionResults(prev => [...prev, {
      word: currentWord.word,
      transliteration: currentWord.transliteration,
      readTime,
      rating, // 'easy', 'medium', 'hard'
    }])

    setTotalReadingTime(prev => prev + readTime)

    if (currentWordIndex < sessionWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setShowAnswer(false)
      setStartTime(Date.now())
    } else {
      setIsComplete(true)
    }
  }, [currentWord, currentWordIndex, sessionWords.length, startTime])

  const handleRestart = useCallback(() => {
    const topWords = prioritizedWords.slice(0, Math.min(30, prioritizedWords.length))
    const sessionSelection = shuffle(topWords).slice(0, WORDS_PER_SESSION)
    setSessionWords(sessionSelection)
    setCurrentWordIndex(0)
    setShowAnswer(false)
    setSessionResults([])
    setIsComplete(false)
    setStartTime(Date.now())
    setTotalReadingTime(0)
  }, [prioritizedWords])

  const handleReplay = useCallback(() => {
    if (currentWord) {
      speakWord(currentWord)
    }
  }, [currentWord, speakWord])

  // Not enough words
  if (allWords.length < 5) {
    return (
      <div className="card max-w-lg mx-auto text-center py-8">
        <p className="text-gray-500">Not enough words available for reading practice.</p>
        <p className="text-sm text-gray-400 mt-2">Learn more letters first!</p>
      </div>
    )
  }

  // Session complete view
  if (isComplete) {
    const avgTimeMs = Math.round(totalReadingTime / sessionResults.length)
    const avgTimeSec = (avgTimeMs / 1000).toFixed(1)
    const wordsPerMinute = Math.round((sessionResults.length / totalReadingTime) * 60000)

    const easyCount = sessionResults.filter(r => r.rating === 'easy').length
    const mediumCount = sessionResults.filter(r => r.rating === 'medium').length
    const hardCount = sessionResults.filter(r => r.rating === 'hard').length

    return (
      <div className="card max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Reading Session Complete!</h2>

        <div className="grid grid-cols-2 gap-4 py-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-ukrainian-blue">{wordsPerMinute}</div>
            <div className="text-sm text-gray-500">words/minute</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-600">{avgTimeSec}s</div>
            <div className="text-sm text-gray-500">avg per word</div>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{easyCount}</div>
              <div className="text-gray-500">Easy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{mediumCount}</div>
              <div className="text-gray-500">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{hardCount}</div>
              <div className="text-gray-500">Hard</div>
            </div>
          </div>
        </div>

        {/* Encouragement */}
        <p className="text-gray-600 mt-6">
          {easyCount >= 7
            ? "Excellent! Your reading fluency is strong."
            : easyCount >= 4
            ? "Good progress! Speed comes with practice."
            : "Keep reading! Your brain is building recognition patterns."}
        </p>

        <div className="flex gap-3 justify-center mt-6">
          <button onClick={handleRestart} className="btn btn-primary">
            Practice Again
          </button>
          {onComplete && (
            <button onClick={onComplete} className="btn btn-secondary">
              Done
            </button>
          )}
        </div>
      </div>
    )
  }

  // Loading state
  if (!currentWord) {
    return (
      <div className="card max-w-lg mx-auto text-center py-12">
        <div className="text-gray-500">Loading words...</div>
      </div>
    )
  }

  return (
    <div className="card max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">
          Word {currentWordIndex + 1} of {sessionWords.length}
        </span>
        <div className="flex gap-1">
          {sessionWords.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentWordIndex
                  ? sessionResults[i]?.rating === 'easy'
                    ? 'bg-green-500'
                    : sessionResults[i]?.rating === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                  : i === currentWordIndex
                  ? 'bg-ukrainian-blue'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">
          {showAnswer ? 'How did you do?' : 'Try to read this word, then tap to check'}
        </p>
      </div>

      {/* Word display */}
      <div className="text-center py-8">
        <div className="text-7xl font-bold text-gray-900 mb-4">
          {currentWord.word}
        </div>

        {showAnswer ? (
          <div className="space-y-3 animate-fadeIn">
            <div className="text-2xl text-ukrainian-blue font-medium">
              {currentWord.transliteration}
            </div>
            <div className="text-lg text-gray-600">
              "{currentWord.meaning}"
            </div>
            {currentWord.note && (
              <div className="text-sm text-gray-400 italic">
                {currentWord.note}
              </div>
            )}
            <button
              onClick={handleReplay}
              disabled={isSpeaking}
              className="btn btn-secondary inline-flex items-center gap-2 mt-2"
            >
              <span>🔈</span>
              <span>Hear again</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleReveal}
            className="btn btn-primary text-lg px-8"
          >
            Reveal Answer
          </button>
        )}
      </div>

      {/* Rating buttons */}
      {showAnswer && (
        <div className="border-t border-gray-100 pt-6 mt-6">
          <p className="text-sm text-gray-500 text-center mb-4">
            How well did you read it?
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRate('easy')}
              className="p-4 rounded-xl bg-green-50 hover:bg-green-100 border-2 border-green-200 transition-colors"
            >
              <div className="text-2xl mb-1">😊</div>
              <div className="text-sm font-medium text-green-700">Easy</div>
              <div className="text-xs text-green-600">Read it instantly</div>
            </button>
            <button
              onClick={() => handleRate('medium')}
              className="p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 transition-colors"
            >
              <div className="text-2xl mb-1">🤔</div>
              <div className="text-sm font-medium text-yellow-700">Medium</div>
              <div className="text-xs text-yellow-600">Had to think</div>
            </button>
            <button
              onClick={() => handleRate('hard')}
              className="p-4 rounded-xl bg-red-50 hover:bg-red-100 border-2 border-red-200 transition-colors"
            >
              <div className="text-2xl mb-1">😅</div>
              <div className="text-sm font-medium text-red-700">Hard</div>
              <div className="text-xs text-red-600">Couldn't get it</div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadingDrill
