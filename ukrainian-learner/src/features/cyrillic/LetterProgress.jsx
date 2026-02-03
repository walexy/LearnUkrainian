import { useState } from 'react'
import useProgressStore from '../../stores/useProgressStore'
import useSpeech from '../../hooks/useSpeech'
import ProgressBar from '../../components/ProgressBar'

const categoryColors = {
  familiar: 'border-green-300',
  falseFriends: 'border-yellow-300',
  newLearnable: 'border-blue-300',
  ukrainianSpecials: 'border-purple-300',
}

const categoryLabels = {
  familiar: 'Familiar Friends',
  falseFriends: 'False Friends',
  newLearnable: 'New Shapes',
  ukrainianSpecials: 'Ukrainian Specials',
}

function LetterProgress({ letters, onFocusPractice }) {
  const { letterProgress, getAccuracy, getMasteredCount, getStats, getStrugglingLetters, resetProgress } = useProgressStore()
  const { speakLetter } = useSpeech()
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const stats = getStats()
  const masteredCount = getMasteredCount()
  const allLetterChars = letters.map(l => l.letter)
  const strugglingLetters = getStrugglingLetters(allLetterChars)

  // Group letters by category
  const lettersByCategory = letters.reduce((acc, letter) => {
    if (!acc[letter.category]) acc[letter.category] = []
    acc[letter.category].push(letter)
    return acc
  }, {})

  const getLetterStatus = (letter) => {
    const progress = letterProgress[letter.letter]
    if (!progress) return 'not-started'
    const accuracy = (progress.correct / progress.total) * 100
    if (progress.total >= 5 && accuracy >= 80) return 'mastered'
    if (accuracy >= 50) return 'learning'
    return 'struggling'
  }

  const statusColors = {
    'not-started': 'bg-gray-100 text-gray-400 hover:bg-gray-200',
    'struggling': 'bg-red-100 text-red-700 hover:bg-red-200',
    'learning': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    'mastered': 'bg-green-100 text-green-700 hover:bg-green-200',
  }

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter)
    speakLetter(letter)
  }

  const handleReset = () => {
    resetProgress()
    setShowResetConfirm(false)
    setSelectedLetter(null)
  }

  return (
    <div className="space-y-6">
      {/* Trouble letters alert */}
      {strugglingLetters.length > 0 && (
        <div className="card bg-red-50 border-l-4 border-red-400">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-red-800 flex items-center gap-2">
                <span>🎯</span>
                Trouble Letters
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {strugglingLetters.length} letter{strugglingLetters.length !== 1 ? 's' : ''} with &lt;60% accuracy need{strugglingLetters.length === 1 ? 's' : ''} extra practice
              </p>
            </div>
            {onFocusPractice && (
              <button
                onClick={() => onFocusPractice(strugglingLetters)}
                className="btn btn-primary text-sm whitespace-nowrap"
              >
                Focus Practice
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {strugglingLetters.map(letterChar => {
              const letter = letters.find(l => l.letter === letterChar)
              const progress = letterProgress[letterChar]
              const accuracy = progress ? Math.round((progress.correct / progress.total) * 100) : 0

              return (
                <button
                  key={letterChar}
                  onClick={() => handleLetterClick(letter)}
                  className="w-12 h-12 rounded-lg bg-red-100 text-red-700 flex flex-col items-center justify-center hover:bg-red-200 transition-colors"
                  title={`${letter?.name} - ${accuracy}% accuracy`}
                >
                  <span className="text-lg font-bold">{letterChar}</span>
                  <span className="text-xs">{accuracy}%</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Overall progress */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>

        <ProgressBar
          value={masteredCount}
          max={33}
          color={masteredCount >= 25 ? 'green' : masteredCount >= 10 ? 'yellow' : 'blue'}
        />

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{masteredCount}</div>
            <div className="text-xs text-gray-500">Mastered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {Object.keys(letterProgress).filter(l => {
                const p = letterProgress[l]
                const acc = (p.correct / p.total) * 100
                return p.total > 0 && (p.total < 5 || acc < 80) && acc >= 50
              }).length}
            </div>
            <div className="text-xs text-gray-500">Learning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {33 - stats.lettersStarted}
            </div>
            <div className="text-xs text-gray-500">Not Started</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ukrainian-blue">{stats.overallAccuracy}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Letter grid by category */}
      <div className="space-y-4">
        {Object.entries(lettersByCategory).map(([category, categoryLetters]) => (
          <div key={category} className={`card border-l-4 ${categoryColors[category]}`}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              {categoryLabels[category]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {categoryLetters.map((letter) => {
                const status = getLetterStatus(letter)
                const progress = letterProgress[letter.letter]
                const isSelected = selectedLetter?.letter === letter.letter

                return (
                  <button
                    key={letter.letter}
                    onClick={() => handleLetterClick(letter)}
                    className={`w-12 h-12 rounded-lg text-xl font-bold transition-all ${statusColors[status]} ${
                      isSelected ? 'ring-2 ring-ukrainian-blue ring-offset-2' : ''
                    }`}
                    title={progress ? `${Math.round((progress.correct / progress.total) * 100)}% (${progress.correct}/${progress.total})` : 'Not started'}
                  >
                    {letter.letter}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected letter details */}
      {selectedLetter && (
        <div className="card border-2 border-ukrainian-blue">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold">{selectedLetter.letter}</span>
                <span className="text-2xl text-gray-400">{selectedLetter.lowercase}</span>
              </div>
              <p className="text-gray-600 mt-1">
                "{selectedLetter.name}" — {selectedLetter.sound}
              </p>
            </div>
            <button
              onClick={() => setSelectedLetter(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {letterProgress[selectedLetter.letter] ? (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold">
                    {getAccuracy(selectedLetter.letter)}%
                  </div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {letterProgress[selectedLetter.letter].correct}
                  </div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {letterProgress[selectedLetter.letter].total}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                Last practiced: {letterProgress[selectedLetter.letter].lastPracticed}
              </p>
            </div>
          ) : (
            <p className="mt-4 pt-4 border-t border-gray-100 text-gray-500 text-center">
              You haven't practiced this letter yet.
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100" />
            <span className="text-gray-600">Not started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100" />
            <span className="text-gray-600">&lt;50% accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100" />
            <span className="text-gray-600">50-79% accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100" />
            <span className="text-gray-600">80%+ mastered</span>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <div className="text-center">
        {showResetConfirm ? (
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-gray-600">Reset all progress?</span>
            <button onClick={handleReset} className="btn btn-danger text-sm">
              Yes, reset
            </button>
            <button onClick={() => setShowResetConfirm(false)} className="btn btn-secondary text-sm">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Reset progress
          </button>
        )}
      </div>
    </div>
  )
}

export default LetterProgress
