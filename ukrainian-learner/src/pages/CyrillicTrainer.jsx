import { useState } from 'react'
import useAlphabet from '../hooks/useAlphabet'
import MnemonicCard from '../features/cyrillic/MnemonicCard'
import LetterDrill from '../features/cyrillic/LetterDrill'
import LetterProgress from '../features/cyrillic/LetterProgress'

const tabs = [
  { id: 'learn', label: 'Learn', icon: '📚' },
  { id: 'practice', label: 'Practice', icon: '🎯' },
  { id: 'progress', label: 'Progress', icon: '📊' },
]

function CyrillicTrainer() {
  const { alphabet, loading, error, getLetters } = useAlphabet()
  const [activeTab, setActiveTab] = useState('learn')
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)

  const letters = getLetters()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading alphabet data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Make sure the alphabet.json file exists in the public/data/ directory.
        </p>
      </div>
    )
  }

  if (letters.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-500">No alphabet data found.</p>
      </div>
    )
  }

  const currentLetter = letters[currentLetterIndex]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cyrillic Trainer</h1>
        <p className="text-gray-600 mt-1">
          Master the 33 letters of the Ukrainian alphabet
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'learn' && (
          <div>
            {/* Learning phase selector */}
            <div className="mb-6">
              <label className="text-sm text-gray-500 mb-2 block">Jump to:</label>
              <div className="flex flex-wrap gap-2">
                {alphabet?.learningOrder && Object.entries(alphabet.learningOrder).map(([phase, phaseLetters]) => {
                  const phaseIndex = letters.findIndex(l => l.letter === phaseLetters[0])
                  const phaseLabels = {
                    'phase1_instant': 'Instant Wins',
                    'phase2_falseFriends': 'False Friends',
                    'phase3_newShapes': 'New Shapes',
                    'phase4_complex': 'Complex',
                    'phase5_specials': 'Specials',
                  }
                  return (
                    <button
                      key={phase}
                      onClick={() => setCurrentLetterIndex(phaseIndex)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        currentLetterIndex >= phaseIndex &&
                        (Object.values(alphabet.learningOrder).findIndex(p => p[0] === letters[currentLetterIndex]?.letter) === Object.keys(alphabet.learningOrder).indexOf(phase))
                          ? 'bg-ukrainian-blue text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {phaseLabels[phase] || phase}
                    </button>
                  )
                })}
              </div>
            </div>

            <MnemonicCard
              letter={currentLetter}
              currentIndex={currentLetterIndex}
              totalCount={letters.length}
              onPrevious={() => setCurrentLetterIndex(Math.max(0, currentLetterIndex - 1))}
              onNext={() => setCurrentLetterIndex(Math.min(letters.length - 1, currentLetterIndex + 1))}
            />
          </div>
        )}

        {activeTab === 'practice' && (
          <LetterDrill
            letters={letters}
            onComplete={() => setActiveTab('progress')}
          />
        )}

        {activeTab === 'progress' && (
          <LetterProgress letters={letters} />
        )}
      </div>
    </div>
  )
}

export default CyrillicTrainer
