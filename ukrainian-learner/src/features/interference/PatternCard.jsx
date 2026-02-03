import { useState } from 'react'

const patternIcons = {
  articles: '📝',
  aspectsAndTenses: '⏰',
  pronounGender: '👥',
  wordOrder: '🔀',
  prepositions: '📍',
  negation: '🚫',
  modalVerbs: '💭',
  pronunciation: '🗣️',
  falseTranslations: '🔄',
}

const patternLabels = {
  articles: 'Missing Articles',
  aspectsAndTenses: 'Tense Usage',
  pronounGender: 'He/She Confusion',
  wordOrder: 'Word Order',
  prepositions: 'Prepositions',
  negation: 'Double Negatives',
  modalVerbs: 'Modal Verbs',
  pronunciation: 'Pronunciation',
  falseTranslations: 'Direct Translations',
}

function PatternCard({ pattern, expanded = false, onToggle }) {
  const [showAllExamples, setShowAllExamples] = useState(false)

  const icon = patternIcons[pattern.id] || '💡'
  const label = patternLabels[pattern.id] || pattern.id

  // For pronunciation patterns, examples have different structure
  const isPronunciation = pattern.id === 'pronunciation'
  const examples = pattern.examples || []
  const displayExamples = showAllExamples ? examples : examples.slice(0, 2)

  return (
    <div className={`card border-l-4 transition-all ${
      expanded ? 'border-ukrainian-blue' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left flex items-start gap-3"
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-600 mt-1">{pattern.issue}</p>
        </div>
        <span className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {/* Why this happens */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Why This Happens</h4>
            <p className="text-sm text-blue-700">{pattern.ukrainianReason}</p>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Examples</h4>
            <div className="space-y-3">
              {displayExamples.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  {isPronunciation ? (
                    // Pronunciation examples have pattern/example structure
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {example.pattern}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{example.example}</p>
                      <p className="text-xs text-gray-500 mt-1 italic">{example.explanation}</p>
                    </>
                  ) : (
                    // Standard examples with theyMightSay/theyMean
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex-1">
                          <span className="text-xs text-gray-500">They might say:</span>
                          <p className="text-sm font-medium text-red-700">"{example.theyMightSay}"</p>
                        </div>
                        <span className="text-gray-300 hidden sm:block">→</span>
                        <div className="flex-1">
                          <span className="text-xs text-gray-500">They mean:</span>
                          <p className="text-sm font-medium text-green-700">"{example.theyMean}"</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">{example.explanation}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {examples.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAllExamples(!showAllExamples)
                }}
                className="mt-2 text-sm text-ukrainian-blue hover:underline"
              >
                {showAllExamples ? 'Show less' : `Show ${examples.length - 2} more examples`}
              </button>
            )}
          </div>

          {/* How to help */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">How to Help</h4>
            <p className="text-sm text-green-700">{pattern.howToHelp}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatternCard
