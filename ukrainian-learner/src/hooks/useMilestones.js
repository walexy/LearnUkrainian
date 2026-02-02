import { useState, useEffect, useCallback } from 'react'
import useProgressStore from '../stores/useProgressStore'

const useMilestones = () => {
  const [milestonesData, setMilestonesData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newlyUnlocked, setNewlyUnlocked] = useState([])

  const {
    letterProgress,
    listeningSessions,
    totalListeningMinutes,
    currentStreak,
    unlockedMilestones,
    unlockMilestone,
    isMilestoneUnlocked,
    getMasteredCount,
    getListeningStats,
  } = useProgressStore()

  // Load milestones data
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch('/data/milestones.json')
        if (!response.ok) {
          throw new Error('Failed to load milestones data')
        }
        const data = await response.json()
        setMilestonesData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
  }, [])

  // Check milestones and return any newly unlocked ones
  const checkMilestones = useCallback(() => {
    if (!milestonesData) return []

    const newUnlocks = []
    const masteredCount = getMasteredCount()
    const listeningStats = getListeningStats()
    const totalHours = listeningStats.totalHours

    // Helper to check and unlock
    const checkAndUnlock = (milestone) => {
      if (isMilestoneUnlocked(milestone.id)) return false

      let triggered = false

      switch (milestone.trigger.type) {
        case 'letters_mastered':
          triggered = masteredCount >= milestone.trigger.count
          break

        case 'category_complete':
          // Would need alphabet data to check this properly
          // For now, skip category-based milestones
          break

        case 'words_read':
          // Would need to track words read
          break

        case 'sessions_completed':
          triggered = listeningSessions.length >= milestone.trigger.count
          break

        case 'total_hours':
          triggered = totalHours >= milestone.trigger.count
          break

        case 'tier_reached':
          const hasTierSession = listeningSessions.some(
            s => s.contentTier === milestone.trigger.tier
          )
          triggered = hasTierSession
          break

        case 'comprehension_threshold':
          const tierSessions = listeningSessions.filter(
            s => s.contentTier === milestone.trigger.tier
          )
          if (tierSessions.length > 0) {
            const avgComprehension = tierSessions.reduce(
              (sum, s) => sum + (s.comprehension || 0), 0
            ) / tierSessions.length
            triggered = avgComprehension >= milestone.trigger.threshold
          }
          break

        case 'streak':
          triggered = currentStreak >= milestone.trigger.days
          break

        case 'manual':
          // Manual milestones are triggered by user action
          break

        default:
          break
      }

      if (triggered) {
        unlockMilestone(milestone.id)
        newUnlocks.push(milestone)
        return true
      }
      return false
    }

    // Check all milestone categories
    const allMilestones = [
      ...(milestonesData.milestones.cyrillic || []),
      ...(milestonesData.milestones.listening || []),
      ...(milestonesData.milestones.streaks || []),
    ]

    allMilestones.forEach(checkAndUnlock)

    if (newUnlocks.length > 0) {
      setNewlyUnlocked(prev => [...prev, ...newUnlocks])
    }

    return newUnlocks
  }, [
    milestonesData,
    getMasteredCount,
    getListeningStats,
    listeningSessions,
    currentStreak,
    isMilestoneUnlocked,
    unlockMilestone,
  ])

  // Clear newly unlocked after showing
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([])
  }, [])

  // Dismiss a specific milestone from the new list
  const dismissMilestone = useCallback((milestoneId) => {
    setNewlyUnlocked(prev => prev.filter(m => m.id !== milestoneId))
  }, [])

  // Get all milestones with their unlock status
  const getAllMilestones = useCallback(() => {
    if (!milestonesData) return []

    const allMilestones = [
      ...(milestonesData.milestones.cyrillic || []).map(m => ({ ...m, category: 'cyrillic' })),
      ...(milestonesData.milestones.listening || []).map(m => ({ ...m, category: 'listening' })),
      ...(milestonesData.milestones.streaks || []).map(m => ({ ...m, category: 'streaks' })),
      ...(milestonesData.milestones.special || []).map(m => ({ ...m, category: 'special' })),
    ]

    return allMilestones.map(m => ({
      ...m,
      unlocked: isMilestoneUnlocked(m.id),
    }))
  }, [milestonesData, isMilestoneUnlocked])

  // Get unlocked milestones only
  const getUnlockedMilestones = useCallback(() => {
    return getAllMilestones().filter(m => m.unlocked)
  }, [getAllMilestones])

  // Get a random celebration message
  const getCelebrationMessage = useCallback(() => {
    if (!milestonesData?.celebrationMessages?.generic) return null
    const messages = milestonesData.celebrationMessages.generic
    return messages[Math.floor(Math.random() * messages.length)]
  }, [milestonesData])

  // Manually unlock a special milestone
  const unlockSpecialMilestone = useCallback((milestoneId) => {
    const milestone = getAllMilestones().find(m => m.id === milestoneId)
    if (milestone && !milestone.unlocked) {
      unlockMilestone(milestoneId)
      setNewlyUnlocked(prev => [...prev, milestone])
    }
  }, [getAllMilestones, unlockMilestone])

  // Check milestones whenever progress changes
  useEffect(() => {
    if (milestonesData) {
      checkMilestones()
    }
  }, [letterProgress, listeningSessions, currentStreak, milestonesData, checkMilestones])

  return {
    loading,
    error,
    newlyUnlocked,
    checkMilestones,
    clearNewlyUnlocked,
    dismissMilestone,
    getAllMilestones,
    getUnlockedMilestones,
    getCelebrationMessage,
    unlockSpecialMilestone,
    unlockedCount: unlockedMilestones.length,
  }
}

export default useMilestones
