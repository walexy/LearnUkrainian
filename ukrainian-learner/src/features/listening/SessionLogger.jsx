import { useState } from 'react'
import WordCapture from './WordCapture'

const intentionOptions = [
  { value: 'focused', label: 'Focused listening', description: 'Active attention, trying to understand' },
  { value: 'casual', label: 'Casual listening', description: 'Background while doing other things' },
  { value: 'repeated', label: 'Repeated content', description: 'Listening to something again' },
]

const energyOptions = [
  { value: 'focused', label: 'Focused', icon: '🎯', description: 'Ready to concentrate', suggestion: 'Great for challenging content!' },
  { value: 'casual', label: 'Relaxed', icon: '😌', description: 'Taking it easy', suggestion: 'Try familiar or musical content' },
  { value: 'tired', label: 'Tired', icon: '😴', description: 'Low energy today', suggestion: 'Music or repeated content works well' },
]

function SessionLogger({ content, onSave, onCancel }) {
  const [step, setStep] = useState('pre') // 'pre' or 'post'
  const [energy, setEnergy] = useState(null)
  const [intention, setIntention] = useState('focused')
  const [duration, setDuration] = useState(content?.duration ? Math.round(content.duration / 60) : 30)
  const [comprehension, setComprehension] = useState(50)
  const [notes, setNotes] = useState('')
  const [wouldListenAgain, setWouldListenAgain] = useState(null)
  const [wordsLogged, setWordsLogged] = useState(false)

  const handleStartSession = () => {
    setStep('post')
  }

  const handleSaveSession = () => {
    const session = {
      id: `session_${Date.now()}`,
      contentId: content?.id || 'custom',
      contentTitle: content?.title || 'Custom content',
      contentTier: content?.tier || 'gateway',
      date: new Date().toISOString(),
      energy: energy || 'casual',
      intention,
      durationMinutes: duration,
      comprehension,
      notes: notes.trim() || null,
      wouldListenAgain,
    }
    onSave(session)
  }

  // Pre-session screen
  if (step === 'pre') {
    const selectedEnergy = energyOptions.find(e => e.value === energy)

    return (
      <div className="card max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4">Start Listening Session</h2>

        {content && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h3 className="font-medium">{content.title}</h3>
            <p className="text-sm text-gray-500">{content.source}</p>
          </div>
        )}

        {/* Energy level (Affective State) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How's your energy right now?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {energyOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setEnergy(option.value)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  energy === option.value
                    ? 'border-ukrainian-blue bg-ukrainian-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">{option.icon}</span>
                <span className="text-sm font-medium block">{option.label}</span>
              </button>
            ))}
          </div>
          {selectedEnergy && (
            <p className="text-sm text-ukrainian-blue mt-2 bg-ukrainian-blue/5 p-2 rounded-lg">
              💡 {selectedEnergy.suggestion}
            </p>
          )}
        </div>

        {/* Intention */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What's your intention?
          </label>
          <div className="space-y-2">
            {intentionOptions.map(option => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  intention === option.value
                    ? 'border-ukrainian-blue bg-ukrainian-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="intention"
                  value={option.value}
                  checked={intention === option.value}
                  onChange={(e) => setIntention(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Estimated duration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="480"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ukrainian-blue"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleStartSession} className="btn btn-primary flex-1">
            Start Session
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Come back after listening to log your comprehension
        </p>
      </div>
    )
  }

  // Post-session screen
  return (
    <div className="card max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Log Completed Session</h2>

      {content && (
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <h3 className="font-medium">{content.title}</h3>
          <p className="text-sm text-gray-500">{content.source}</p>
        </div>
      )}

      {/* Actual duration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How long did you listen? (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="480"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ukrainian-blue"
        />
      </div>

      {/* Comprehension slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How much did you understand?
        </label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={comprehension}
            onChange={(e) => setComprehension(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ukrainian-blue"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Nothing</span>
            <span>Some words</span>
            <span>Half</span>
            <span>Most</span>
            <span>Everything</span>
          </div>
        </div>
        <div className="text-center mt-3">
          <span className={`text-3xl font-bold ${
            comprehension >= 80 ? 'text-green-600' :
            comprehension >= 50 ? 'text-yellow-600' :
            comprehension >= 20 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {comprehension}%
          </span>
        </div>
      </div>

      {/* Would listen again */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Would you listen to this again?
        </label>
        <div className="flex gap-2">
          {[
            { value: true, label: 'Yes', icon: '👍' },
            { value: false, label: 'No', icon: '👎' },
            { value: null, label: 'Maybe', icon: '🤔' },
          ].map(option => (
            <button
              key={String(option.value)}
              onClick={() => setWouldListenAgain(option.value)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                wouldListenAgain === option.value
                  ? 'border-ukrainian-blue bg-ukrainian-blue/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{option.icon}</span>
              <span className="block text-sm mt-1">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Word Capture */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Words you heard
        </label>
        <WordCapture onWordsLogged={() => setWordsLogged(true)} />
      </div>

      {/* Additional Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any other notes? (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Thoughts about the content, phrases you noticed..."
          rows={2}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ukrainian-blue resize-none"
        />
      </div>

      {/* Encouragement */}
      <div className="p-4 bg-green-50 rounded-lg mb-6 text-sm text-green-800">
        {comprehension < 20 ? (
          <>🌱 Every hour of input counts, even when you understand little. Your brain is noticing patterns.</>
        ) : comprehension < 50 ? (
          <>📈 You're catching some! This is exactly where comprehension starts to build.</>
        ) : comprehension < 80 ? (
          <>🔥 Understanding half or more is great progress. You're in the acquisition zone.</>
        ) : (
          <>⭐ Excellent comprehension! You might be ready for harder content soon.</>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="btn btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={handleSaveSession} className="btn btn-primary flex-1">
          Save Session
        </button>
      </div>
    </div>
  )
}

export default SessionLogger
