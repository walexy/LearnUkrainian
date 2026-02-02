import { useEffect, useState } from 'react'

function MilestoneToast({ milestone, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 100)

    // Auto-dismiss after 6 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, 6000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(dismissTimer)
    }
  }, [])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss?.()
    }, 300)
  }

  if (!milestone) return null

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header with emoji */}
        <div className="bg-gradient-to-r from-ukrainian-blue to-blue-600 px-4 py-3 flex items-center gap-3">
          <span className="text-3xl">{milestone.emoji}</span>
          <div className="flex-1">
            <h3 className="font-bold text-white">{milestone.name}</h3>
            <p className="text-sm text-blue-100">{milestone.description}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <p className="text-gray-700">{milestone.message}</p>
          {milestone.encouragement && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {milestone.encouragement}
            </p>
          )}
        </div>

        {/* Progress bar animation */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-ukrainian-blue transition-all duration-[6000ms] ease-linear"
            style={{ width: isVisible && !isLeaving ? '0%' : '100%' }}
          />
        </div>
      </div>
    </div>
  )
}

function MilestoneToastContainer({ milestones, onDismiss }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleDismiss = () => {
    onDismiss?.(milestones[currentIndex]?.id)
    setCurrentIndex(prev => prev + 1)
  }

  if (currentIndex >= milestones.length) return null

  return (
    <MilestoneToast
      key={milestones[currentIndex].id}
      milestone={milestones[currentIndex]}
      onDismiss={handleDismiss}
    />
  )
}

export { MilestoneToast, MilestoneToastContainer }
export default MilestoneToast
