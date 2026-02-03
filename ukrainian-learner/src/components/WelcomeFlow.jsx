import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useProgressStore from '../stores/useProgressStore'

const slides = [
  {
    id: 'intro',
    title: 'Welcome!',
    emoji: '🇺🇦',
    content: 'This app uses comprehensible input—the idea that you acquire language naturally by understanding messages, not by studying rules.',
    tip: 'Based on Stephen Krashen\'s Input Hypothesis',
  },
  {
    id: 'choice',
    title: 'Choose Your Path',
    emoji: '🛤️',
    content: 'Both paths lead to fluency. Pick what feels right for you:',
    isChoice: true,
    options: [
      {
        label: 'Start with Listening',
        description: 'Jump into comprehensible input right away. Literacy isn\'t required for oral comprehension!',
        icon: '🎧',
        path: 'listening-first',
        route: '/listening',
      },
      {
        label: 'Learn Letters First',
        description: 'Master the Cyrillic alphabet. Helpful if you want to read along with audio.',
        icon: '🔤',
        path: 'alphabet-first',
        route: '/cyrillic',
      },
    ],
  },
  {
    id: 'encouragement',
    title: 'No Pressure, Ever',
    emoji: '🌱',
    content: 'This app will never guilt you about missed days. Language acquisition happens on your timeline. Every bit of input counts.',
    tip: 'Your brain is working even when progress feels slow',
  },
]

function WelcomeFlow({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedPath, setSelectedPath] = useState(null)
  const { completeWelcome } = useProgressStore()
  const navigate = useNavigate()

  const slide = slides[currentSlide]
  const isLastSlide = currentSlide === slides.length - 1
  const isChoiceSlide = slide.isChoice

  const handleNext = () => {
    if (isLastSlide) {
      completeWelcome(selectedPath)
      onComplete?.()
    } else {
      setCurrentSlide(prev => prev + 1)
    }
  }

  const handleChoose = (option) => {
    setSelectedPath(option.path)
    completeWelcome(option.path)
    navigate(option.route)
    onComplete?.()
  }

  const handleSkip = () => {
    completeWelcome(null)
    onComplete?.()
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-ukrainian-blue/5 to-ukrainian-yellow/5 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentSlide ? 'bg-ukrainian-blue' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">{slide.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{slide.title}</h2>
          <p className="text-gray-600 leading-relaxed">{slide.content}</p>

          {slide.tip && (
            <p className="mt-4 text-sm text-ukrainian-blue bg-ukrainian-blue/5 rounded-lg p-3">
              💡 {slide.tip}
            </p>
          )}

          {/* Choice options */}
          {isChoiceSlide && (
            <div className="mt-6 space-y-3">
              {slide.options.map((option) => (
                <button
                  key={option.path}
                  onClick={() => handleChoose(option)}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-ukrainian-blue hover:bg-ukrainian-blue/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {option.icon}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8">
          {!isChoiceSlide && (
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-ukrainian-blue text-white rounded-xl font-medium hover:bg-ukrainian-blue/90 transition-colors"
              >
                {isLastSlide ? 'Get Started' : 'Next'}
              </button>
            </div>
          )}

          {isChoiceSlide && (
            <button
              onClick={handleSkip}
              className="w-full py-3 text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              I'll decide later
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default WelcomeFlow
