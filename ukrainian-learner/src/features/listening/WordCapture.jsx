import { useState } from 'react'
import useProgressStore from '../../stores/useProgressStore'

const commonWords = [
  { word: 'дякую', meaning: 'thank you' },
  { word: 'добре', meaning: 'good/okay' },
  { word: 'так', meaning: 'yes' },
  { word: 'ні', meaning: 'no' },
  { word: 'привіт', meaning: 'hello' },
  { word: 'будь ласка', meaning: 'please' },
]

function WordCapture({ onWordsLogged }) {
  const { logWord, getRecentWords, acquiredWords } = useProgressStore()
  const [newWord, setNewWord] = useState('')
  const [newMeaning, setNewMeaning] = useState('')
  const [loggedThisSession, setLoggedThisSession] = useState([])
  const [heardAgain, setHeardAgain] = useState([])

  const recentWords = getRecentWords(8)

  const handleAddWord = () => {
    if (newWord.trim()) {
      logWord(newWord.trim(), newMeaning.trim(), 'listening')
      setLoggedThisSession([...loggedThisSession, newWord.trim()])
      setNewWord('')
      setNewMeaning('')
      onWordsLogged?.()
    }
  }

  const handleQuickAdd = (word, meaning) => {
    logWord(word, meaning, 'listening')
    setLoggedThisSession([...loggedThisSession, word])
    onWordsLogged?.()
  }

  const handleHeardAgain = (word) => {
    if (heardAgain.includes(word.id)) {
      setHeardAgain(heardAgain.filter(id => id !== word.id))
    } else {
      logWord(word.word, word.meaning, 'listening')
      setHeardAgain([...heardAgain, word.id])
      onWordsLogged?.()
    }
  }

  const isAlreadyLogged = (word) => {
    return acquiredWords.some(w => w.word.toLowerCase() === word.toLowerCase())
  }

  return (
    <div className="space-y-4">
      {/* Quick add common words */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick add common words
        </label>
        <div className="flex flex-wrap gap-2">
          {commonWords.map(({ word, meaning }) => {
            const logged = loggedThisSession.includes(word) || isAlreadyLogged(word)
            return (
              <button
                key={word}
                onClick={() => !logged && handleQuickAdd(word, meaning)}
                disabled={logged}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  logged
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-gray-100 hover:bg-ukrainian-blue/10 hover:text-ukrainian-blue'
                }`}
              >
                {logged && '✓ '}{word}
              </button>
            )
          })}
        </div>
      </div>

      {/* Previously heard words - did you hear these again? */}
      {recentWords.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Did you hear these again?
          </label>
          <div className="flex flex-wrap gap-2">
            {recentWords.slice(0, 6).map((word) => {
              const marked = heardAgain.includes(word.id)
              return (
                <button
                  key={word.id}
                  onClick={() => handleHeardAgain(word)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    marked
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {marked && '✓ '}{word.word}
                  <span className="text-gray-400 ml-1">({word.timesEncountered}x)</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Add custom word */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a new word you heard
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Ukrainian word"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ukrainian-blue"
          />
          <input
            type="text"
            value={newMeaning}
            onChange={(e) => setNewMeaning(e.target.value)}
            placeholder="Meaning (optional)"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ukrainian-blue"
          />
          <button
            onClick={handleAddWord}
            disabled={!newWord.trim()}
            className="px-4 py-2 bg-ukrainian-blue text-white rounded-lg text-sm hover:bg-ukrainian-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Session summary */}
      {loggedThisSession.length > 0 && (
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <span className="font-medium">Words logged this session:</span>{' '}
            {loggedThisSession.join(', ')}
          </p>
        </div>
      )}

      {heardAgain.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Heard again:</span>{' '}
            {heardAgain.length} word{heardAgain.length !== 1 ? 's' : ''} reinforced!
          </p>
        </div>
      )}
    </div>
  )
}

export default WordCapture
