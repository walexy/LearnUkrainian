import { useState } from 'react'
import useInterferencePatterns from '../hooks/useInterferencePatterns'
import PatternCard from '../features/interference/PatternCard'
import useSpeech from '../hooks/useSpeech'

const tabs = [
  { id: 'patterns', label: 'Patterns', icon: '🧠' },
  { id: 'phrases', label: 'Quick Phrases', icon: '💬' },
  { id: 'tips', label: 'Tips', icon: '💡' },
]

function ColleagueConnection() {
  const { loading, error, getPatterns, getTips, getPhrases, getMetadata } = useInterferencePatterns()
  const { speakWord, isSpeaking } = useSpeech()

  const [activeTab, setActiveTab] = useState('patterns')
  const [expandedPattern, setExpandedPattern] = useState(null)

  const patterns = getPatterns()
  const tips = getTips()
  const phrases = getPhrases()
  const metadata = getMetadata()

  const handlePatternToggle = (patternId) => {
    setExpandedPattern(expandedPattern === patternId ? null : patternId)
  }

  const handleSpeak = (text) => {
    if (!isSpeaking) {
      speakWord({ word: text })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading patterns...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Colleague Connection</h1>
        <p className="text-gray-600 mt-1">
          {metadata.purpose}
        </p>
      </div>

      {/* Philosophy callout */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-ukrainian-blue">
        <p className="text-sm text-gray-700 italic">{metadata.philosophy}</p>
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
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Click any pattern to learn more about why it happens and how to help.
            </p>
            {patterns.map(pattern => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                expanded={expandedPattern === pattern.id}
                onToggle={() => handlePatternToggle(pattern.id)}
              />
            ))}
          </div>
        )}

        {activeTab === 'phrases' && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-2">Useful Ukrainian Phrases</h2>
              <p className="text-sm text-gray-600">
                Phrases you can use to connect with colleagues, even before you're conversational.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {phrases.map((phrase, index) => (
                <div key={index} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-ukrainian-blue mb-1">
                        {phrase.ukrainian}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {phrase.transliteration}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {phrase.meaning}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSpeak(phrase.ukrainian)}
                      disabled={isSpeaking}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="Hear pronunciation"
                    >
                      🔈
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    {phrase.usage}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-2">Practical Communication Tips</h2>
              <p className="text-sm text-gray-600">
                How to communicate effectively while building understanding.
              </p>
            </div>

            {tips.map((tip, index) => (
              <div key={index} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-ukrainian-blue/10 flex items-center justify-center text-ukrainian-blue font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tip.advice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ColleagueConnection
