import useSpeech from '../../hooks/useSpeech'
import useProgressStore from '../../stores/useProgressStore'

const categoryLabels = {
  familiar: 'Familiar Friend',
  falseFriends: 'False Friend',
  newLearnable: 'New Shape',
  ukrainianSpecials: 'Ukrainian Special',
}

function MnemonicCard({ letter, onPrevious, onNext, currentIndex, totalCount }) {
  const { speakLetter, speakWord, isSpeaking, hasUkrainianVoice } = useSpeech()
  const { getAccuracy, letterProgress } = useProgressStore()

  const accuracy = getAccuracy(letter.letter)
  const progress = letterProgress[letter.letter]

  return (
    <div className="card max-w-lg mx-auto">
      {/* Header with category badge */}
      <div className="flex justify-between items-start mb-4">
        <span className={`badge badge-${letter.category}`}>
          {categoryLabels[letter.category]}
        </span>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {totalCount}
        </span>
      </div>

      {/* Main letter display */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-4">
          <span className="text-8xl font-bold text-gray-900">{letter.letter}</span>
          <span className="text-6xl text-gray-400">{letter.lowercase}</span>
        </div>

        {/* Sound description */}
        <div className="mt-4 text-xl text-gray-600">
          "{letter.name}" — {letter.sound}
        </div>

        {/* IPA */}
        <div className="mt-1 text-sm text-gray-400 font-mono">
          /{letter.ipa}/
        </div>

        {/* Speak button */}
        <button
          onClick={() => speakLetter(letter)}
          disabled={isSpeaking}
          className="mt-4 btn btn-primary inline-flex items-center gap-2"
        >
          <span>{isSpeaking ? '🔊' : '🔈'}</span>
          <span>Hear it</span>
        </button>

        {!hasUkrainianVoice && (
          <p className="mt-2 text-xs text-amber-600">
            Ukrainian voice not available. Using default voice.
          </p>
        )}
      </div>

      {/* Mnemonic section with image */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Memory Hook
        </h3>

        {/* Mnemonic image */}
        {letter.mnemonic.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={letter.mnemonic.imageUrl}
              alt={letter.mnemonic.imageAlt || letter.mnemonic.hook}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
          </div>
        )}

        <p className="text-lg font-medium text-gray-800 mb-1">
          {letter.mnemonic.hook}
        </p>
        <p className="text-gray-600">
          {letter.mnemonic.story}
        </p>
        {!letter.mnemonic.imageUrl && (
          <p className="text-sm text-gray-500 mt-2 italic">
            Visual: {letter.mnemonic.visual}
          </p>
        )}
      </div>

      {/* Example words */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Example Words
        </h3>
        <div className="space-y-2">
          {letter.exampleWords.map((example, i) => (
            <button
              key={i}
              onClick={() => speakWord(example.word)}
              className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-medium text-gray-900">{example.word}</span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className="text-gray-600">{example.transliteration}</span>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">🔈</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {example.meaning}
                {example.note && <span className="text-gray-400"> — {example.note}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Confusions warning */}
      {letter.commonConfusions && letter.commonConfusions.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <h3 className="text-sm font-medium text-amber-600 uppercase tracking-wide mb-2">
            Watch Out
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {letter.commonConfusions.map((confusion, i) => (
              <li key={i}>⚠️ {confusion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress indicator */}
      {progress && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Your progress</span>
            <span className={`font-medium ${
              accuracy >= 80 ? 'text-green-600' :
              accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {accuracy}% ({progress.correct}/{progress.total})
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="btn btn-secondary disabled:opacity-50"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === totalCount - 1}
          className="btn btn-secondary disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default MnemonicCard
