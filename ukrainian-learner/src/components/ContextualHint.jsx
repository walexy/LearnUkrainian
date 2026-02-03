import { useState, useEffect } from 'react'
import useProgressStore from '../stores/useProgressStore'

function ContextualHint({ hintId, children, position = 'bottom' }) {
  const { hasSeenHint, markHintSeen } = useProgressStore()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Show hint after a short delay if not seen before
    if (!hasSeenHint(hintId) && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [hintId, hasSeenHint, isDismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    markHintSeen(hintId)
  }

  if (!isVisible) {
    return null
  }

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-ukrainian-blue border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-ukrainian-blue border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-ukrainian-blue border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-ukrainian-blue border-t-transparent border-b-transparent border-l-transparent',
  }

  return (
    <div className={`absolute z-50 ${positionClasses[position]}`}>
      <div className="relative bg-ukrainian-blue text-white rounded-lg shadow-lg p-3 max-w-xs animate-fadeIn">
        {/* Arrow */}
        <div
          className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`}
        />

        {/* Content */}
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="flex-1">
            <p className="text-sm">{children}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white text-sm font-bold"
            aria-label="Dismiss hint"
          >
            ✕
          </button>
        </div>

        {/* Got it button */}
        <button
          onClick={handleDismiss}
          className="mt-2 w-full py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

export default ContextualHint
