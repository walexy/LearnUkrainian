import { useState, useMemo } from 'react'
import useProgressStore from '../../stores/useProgressStore'
import useSpeech from '../../hooks/useSpeech'

// Common words that appear in most Ukrainian content
const commonExpectedWords = [
  { word: 'привіт', meaning: 'hello', tier: 'gateway' },
  { word: 'дякую', meaning: 'thank you', tier: 'gateway' },
  { word: 'добре', meaning: 'good/okay', tier: 'gateway' },
  { word: 'так', meaning: 'yes', tier: 'gateway' },
  { word: 'ні', meaning: 'no', tier: 'gateway' },
  { word: 'будь ласка', meaning: 'please', tier: 'gateway' },
  { word: 'вибачте', meaning: 'excuse me/sorry', tier: 'gateway' },
  { word: 'україна', meaning: 'Ukraine', tier: 'gateway' },
  { word: 'людина', meaning: 'person', tier: 'bridge' },
  { word: 'робота', meaning: 'work', tier: 'bridge' },
  { word: 'сьогодні', meaning: 'today', tier: 'bridge' },
  { word: 'дуже', meaning: 'very', tier: 'gateway' },
]

// Extract unique letters from a word
const getLettersFromWord = (word) => {
  return [...new Set(word.toLowerCase().split('').filter(c => /[а-яіїєґь']/i.test(c)))]
}

function PreListeningScaffold({ content, onClose, onStartSession }) {
  const { letterProgress, getMasteredCount, acquiredWords } = useProgressStore()
  const { speakWord } = useSpeech()
  const [selectedTab, setSelectedTab] = useState('words')

  const masteredCount = getMasteredCount()

  // Get mastered letters
  const masteredLetters = useMemo(() => {
    return new Set(
      Object.entries(letterProgress)
        .filter(([_, progress]) => progress.total >= 5 && (progress.correct / progress.total) >= 0.8)
        .map(([letter]) => letter.toLowerCase())
    )
  }, [letterProgress])

  // Filter expected words by content tier
  const expectedWords = useMemo(() => {
    const tierOrder = { gateway: 0, bridge: 1, native: 2 }
    const contentTierLevel = tierOrder[content?.tier] || 0

    // Get words appropriate for this tier
    const wordsForTier = commonExpectedWords.filter(w => {
      const wordTierLevel = tierOrder[w.tier] || 0
      return wordTierLevel <= contentTierLevel
    })

    // Add any content-specific expected words
    const specificWords = (content?.expectedWords || []).map(w => ({
      word: w.word || w,
      meaning: w.meaning || '',
      tier: content.tier,
      specific: true,
    }))

    return [...specificWords, ...wordsForTier]
  }, [content])

  // Get words user has already logged
  const knownWords = useMemo(() => {
    return new Set(acquiredWords.map(w => w.word.toLowerCase()))
  }, [acquiredWords])

  // Analyze letter readiness
  const letterReadiness = useMemo(() => {
    const allLetters = new Set()
    expectedWords.forEach(w => {
      getLettersFromWord(w.word).forEach(l => allLetters.add(l))
    })

    const total = allLetters.size
    const known = [...allLetters].filter(l => masteredLetters.has(l)).length

    return {
      total,
      known,
      percentage: total > 0 ? Math.round((known / total) * 100) : 0,
      unknown: [...allLetters].filter(l => !masteredLetters.has(l)),
    }
  }, [expectedWords, masteredLetters])

  // Get relevant phrases (placeholder - could connect to interference patterns)
  const relevantPhrases = useMemo(() => {
    // These would ideally come from the interference patterns or phrase database
    return [
      { phrase: 'Як справи?', meaning: 'How are you?', context: 'Common greeting' },
      { phrase: 'Доброго дня', meaning: 'Good day', context: 'Formal greeting' },
      { phrase: 'До побачення', meaning: 'Goodbye', context: 'Parting' },
    ]
  }, [content])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Prepare for Listening</h2>
              <p className="text-gray-500 text-sm mt-1">{content?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Readiness indicator */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Letter Readiness</span>
              <span className={`text-sm font-bold ${
                letterReadiness.percentage >= 80 ? 'text-green-600' :
                letterReadiness.percentage >= 50 ? 'text-yellow-600' : 'text-orange-600'
              }`}>
                {letterReadiness.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  letterReadiness.percentage >= 80 ? 'bg-green-500' :
                  letterReadiness.percentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${letterReadiness.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You know {letterReadiness.known} of {letterReadiness.total} letters in expected words
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-100">
          {[
            { id: 'words', label: 'Words', icon: '📝' },
            { id: 'letters', label: 'Letters', icon: '🔤' },
            { id: 'phrases', label: 'Phrases', icon: '💬' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'text-ukrainian-blue border-b-2 border-ukrainian-blue bg-ukrainian-blue/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'words' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Words you might hear in this content. Tap to hear pronunciation.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {expectedWords.map((wordObj, i) => {
                  const isKnown = knownWords.has(wordObj.word.toLowerCase())
                  return (
                    <button
                      key={`${wordObj.word}-${i}`}
                      onClick={() => speakWord(wordObj.word)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        isKnown
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 border-2 border-transparent hover:border-ukrainian-blue/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{wordObj.word}</span>
                        {isKnown && <span className="text-green-600 text-sm">✓ Known</span>}
                        {wordObj.specific && !isKnown && (
                          <span className="text-ukrainian-blue text-xs">Key word</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{wordObj.meaning}</span>
                    </button>
                  )
                })}
              </div>

              {expectedWords.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  No specific words listed for this content.
                </p>
              )}
            </div>
          )}

          {selectedTab === 'letters' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Letters you'll encounter. Green = mastered, gray = still learning.
              </p>

              {letterReadiness.unknown.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Letters to Focus On</h4>
                  <div className="flex flex-wrap gap-2">
                    {letterReadiness.unknown.map(letter => (
                      <span
                        key={letter}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-lg font-medium"
                      >
                        {letter.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    You might struggle with these letters. That's okay - you'll learn through exposure!
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Your Mastered Letters</h4>
                <div className="flex flex-wrap gap-2">
                  {[...masteredLetters].sort().map(letter => (
                    <span
                      key={letter}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-lg font-medium"
                    >
                      {letter.toUpperCase()}
                    </span>
                  ))}
                  {masteredLetters.size === 0 && (
                    <p className="text-gray-400 text-sm">
                      No letters mastered yet. Don't worry - you can still enjoy listening!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'phrases' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Common phrases you might hear. Tap to hear pronunciation.
              </p>

              <div className="space-y-2">
                {relevantPhrases.map((phraseObj, i) => (
                  <button
                    key={i}
                    onClick={() => speakWord(phraseObj.phrase)}
                    className="w-full p-4 rounded-lg text-left bg-gray-50 hover:bg-ukrainian-blue/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{phraseObj.phrase}</span>
                      <span className="text-xs text-gray-400">{phraseObj.context}</span>
                    </div>
                    <span className="text-sm text-gray-500">{phraseObj.meaning}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <button onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => {
                onClose()
                onStartSession?.(content)
              }}
              className="btn btn-primary flex-1"
            >
              I'm Ready - Start Session
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Don't stress about understanding everything. Exposure is the goal!
          </p>
        </div>
      </div>
    </div>
  )
}

export default PreListeningScaffold
