import { useState, useEffect, useCallback } from 'react'
import useSpeech from '../../hooks/useSpeech'
import useProgressStore from '../../stores/useProgressStore'
import { shuffle, pickRandomExcluding } from '../../utils/shuffle'

const QUESTIONS_PER_SESSION = 10

function LetterDrill({ letters, onComplete }) {
  const { speakLetter, isSpeaking } = useSpeech()
  const { recordAttempt, getWeakLetters } = useProgressStore()

  const [sessionQuestions, setSessionQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [sessionResults, setSessionResults] = useState([])
  const [isComplete, setIsComplete] = useState(false)

  // Generate session questions on mount
  useEffect(() => {
    if (letters.length === 0) return

    const allLetterChars = letters.map(l => l.letter)

    // Prioritize weak letters, but include some random ones too
    const weakLetters = getWeakLetters(allLetterChars)
    const strongLetters = allLetterChars.filter(l => !weakLetters.includes(l))

    // Mix: mostly weak letters, some strong for review
    let questionLetters = []
    const weakCount = Math.min(Math.ceil(QUESTIONS_PER_SESSION * 0.7), weakLetters.length)
    const strongCount = QUESTIONS_PER_SESSION - weakCount

    questionLetters = [
      ...shuffle(weakLetters).slice(0, weakCount),
      ...shuffle(strongLetters).slice(0, strongCount),
    ]

    // If we don't have enough, pad with random letters
    while (questionLetters.length < QUESTIONS_PER_SESSION) {
      const random = shuffle(allLetterChars)[0]
      questionLetters.push(random)
    }

    // Shuffle the final question order
    questionLetters = shuffle(questionLetters).slice(0, QUESTIONS_PER_SESSION)

    // Generate questions with options
    const questions = questionLetters.map(letterChar => {
      const correctLetter = letters.find(l => l.letter === letterChar)
      const wrongOptions = pickRandomExcluding(
        letters.filter(l => l.letter !== letterChar),
        3
      )
      const options = shuffle([correctLetter, ...wrongOptions])

      return {
        letter: correctLetter,
        options,
        correctAnswer: correctLetter.letter,
      }
    })

    setSessionQuestions(questions)
  }, [letters, getWeakLetters])

  const currentQuestion = sessionQuestions[currentQuestionIndex]

  // Auto-play the letter sound when question changes
  useEffect(() => {
    if (currentQuestion && !showResult) {
      // Small delay before playing
      const timer = setTimeout(() => {
        speakLetter(currentQuestion.letter)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentQuestionIndex, currentQuestion, showResult, speakLetter])

  const handleAnswer = useCallback((selectedLetter) => {
    if (showResult) return

    setSelectedAnswer(selectedLetter)
    setShowResult(true)

    const isCorrect = selectedLetter === currentQuestion.correctAnswer
    recordAttempt(currentQuestion.letter.letter, isCorrect)

    setSessionResults(prev => [...prev, {
      letter: currentQuestion.letter.letter,
      correct: isCorrect,
      selected: selectedLetter,
    }])
  }, [showResult, currentQuestion, recordAttempt])

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setIsComplete(true)
    }
  }, [currentQuestionIndex, sessionQuestions.length])

  const handleReplay = useCallback(() => {
    if (currentQuestion) {
      speakLetter(currentQuestion.letter)
    }
  }, [currentQuestion, speakLetter])

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setSessionResults([])
    setIsComplete(false)
    // Re-generate questions
    const allLetterChars = letters.map(l => l.letter)
    const shuffled = shuffle(allLetterChars).slice(0, QUESTIONS_PER_SESSION)
    const questions = shuffled.map(letterChar => {
      const correctLetter = letters.find(l => l.letter === letterChar)
      const wrongOptions = pickRandomExcluding(
        letters.filter(l => l.letter !== letterChar),
        3
      )
      const options = shuffle([correctLetter, ...wrongOptions])
      return {
        letter: correctLetter,
        options,
        correctAnswer: correctLetter.letter,
      }
    })
    setSessionQuestions(questions)
  }, [letters])

  // Session complete view
  if (isComplete) {
    const correctCount = sessionResults.filter(r => r.correct).length
    const accuracy = Math.round((correctCount / sessionResults.length) * 100)

    return (
      <div className="card max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>

        <div className="py-6">
          <div className={`text-6xl font-bold ${
            accuracy >= 80 ? 'text-green-500' :
            accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {accuracy}%
          </div>
          <div className="text-gray-600 mt-2">
            {correctCount} of {sessionResults.length} correct
          </div>
        </div>

        {/* Results breakdown */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex flex-wrap justify-center gap-2">
            {sessionResults.map((result, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                  result.correct
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {result.letter}
              </div>
            ))}
          </div>
        </div>

        {/* Encouragement */}
        <p className="text-gray-600 mt-6">
          {accuracy >= 80
            ? "Excellent work! You're mastering these letters."
            : accuracy >= 60
            ? "Good progress! Keep practicing the tricky ones."
            : "Every attempt rewires your brain. Keep going!"}
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
  if (!currentQuestion) {
    return (
      <div className="card max-w-lg mx-auto text-center py-12">
        <div className="text-gray-500">Loading questions...</div>
      </div>
    )
  }

  return (
    <div className="card max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {sessionQuestions.length}
        </span>
        <div className="flex gap-1">
          {sessionQuestions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentQuestionIndex
                  ? sessionResults[i]?.correct
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : i === currentQuestionIndex
                  ? 'bg-ukrainian-blue'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">What letter is this?</p>

        <div className="text-9xl font-bold text-gray-900 mb-4">
          {currentQuestion.letter.letter}
        </div>

        <button
          onClick={handleReplay}
          disabled={isSpeaking}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          <span>🔈</span>
          <span>Hear again</span>
        </button>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedAnswer === option.letter
          const isCorrect = option.letter === currentQuestion.correctAnswer
          const showCorrect = showResult && isCorrect
          const showWrong = showResult && isSelected && !isCorrect

          return (
            <button
              key={option.letter}
              onClick={() => handleAnswer(option.letter)}
              disabled={showResult}
              className={`p-4 rounded-xl text-left transition-all ${
                showCorrect
                  ? 'bg-green-100 border-2 border-green-500'
                  : showWrong
                  ? 'bg-red-100 border-2 border-red-500'
                  : isSelected
                  ? 'bg-ukrainian-blue/10 border-2 border-ukrainian-blue'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="text-lg font-medium">
                {option.name} — "{option.sound.split(' ')[0]}"
              </div>
              <div className="text-sm text-gray-500 mt-1">
                e.g., {option.exampleWords[0]?.word}
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback and next button */}
      {showResult && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className={`text-center mb-4 ${
            selectedAnswer === currentQuestion.correctAnswer
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <span className="text-lg font-medium">✓ Correct!</span>
            ) : (
              <span className="text-lg font-medium">
                ✗ It was "{currentQuestion.letter.name}"
              </span>
            )}
          </div>

          <button
            onClick={handleNext}
            className="btn btn-primary w-full"
          >
            {currentQuestionIndex < sessionQuestions.length - 1 ? 'Next' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  )
}

export default LetterDrill
