import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useProgressStore = create(
  persist(
    (set, get) => ({
      // Letter progress tracking
      letterProgress: {},

      // Listening session tracking
      listeningSessions: [],
      totalListeningMinutes: 0,

      // Milestones
      unlockedMilestones: [],

      // Streak tracking
      currentStreak: 0,
      lastPracticeDate: null,

      // Record a drill attempt
      recordAttempt: (letter, isCorrect) => {
        const today = new Date().toISOString().split('T')[0]

        set((state) => {
          const current = state.letterProgress[letter] || { correct: 0, total: 0, lastPracticed: null }

          // Update streak
          let newStreak = state.currentStreak
          if (state.lastPracticeDate !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]

            if (state.lastPracticeDate === yesterdayStr) {
              newStreak = state.currentStreak + 1
            } else if (state.lastPracticeDate !== today) {
              newStreak = 1
            }
          }

          return {
            letterProgress: {
              ...state.letterProgress,
              [letter]: {
                correct: current.correct + (isCorrect ? 1 : 0),
                total: current.total + 1,
                lastPracticed: today,
              },
            },
            currentStreak: newStreak,
            lastPracticeDate: today,
          }
        })
      },

      // Get accuracy for a specific letter
      getAccuracy: (letter) => {
        const progress = get().letterProgress[letter]
        if (!progress || progress.total === 0) return null
        return Math.round((progress.correct / progress.total) * 100)
      },

      // Check if a letter is mastered (>= 80% accuracy with at least 5 attempts)
      isMastered: (letter) => {
        const progress = get().letterProgress[letter]
        if (!progress || progress.total < 5) return false
        return (progress.correct / progress.total) >= 0.8
      },

      // Get count of mastered letters
      getMasteredCount: () => {
        const { letterProgress, isMastered } = get()
        return Object.keys(letterProgress).filter(letter => {
          const progress = letterProgress[letter]
          return progress && progress.total >= 5 && (progress.correct / progress.total) >= 0.8
        }).length
      },

      // Get letters that need more practice (< 80% accuracy or < 5 attempts)
      getWeakLetters: (allLetters) => {
        const { letterProgress } = get()
        return allLetters.filter(letter => {
          const progress = letterProgress[letter]
          if (!progress || progress.total < 5) return true
          return (progress.correct / progress.total) < 0.8
        })
      },

      // Get overall stats
      getStats: () => {
        const { letterProgress, currentStreak } = get()
        const letters = Object.keys(letterProgress)
        const totalAttempts = letters.reduce((sum, l) => sum + letterProgress[l].total, 0)
        const totalCorrect = letters.reduce((sum, l) => sum + letterProgress[l].correct, 0)

        return {
          lettersStarted: letters.length,
          totalAttempts,
          totalCorrect,
          overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
          currentStreak,
        }
      },

      // Record a listening session
      recordListeningSession: (session) => {
        const today = new Date().toISOString().split('T')[0]

        set((state) => {
          // Update streak
          let newStreak = state.currentStreak
          if (state.lastPracticeDate !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]

            if (state.lastPracticeDate === yesterdayStr) {
              newStreak = state.currentStreak + 1
            } else if (state.lastPracticeDate !== today) {
              newStreak = 1
            }
          }

          return {
            listeningSessions: [...state.listeningSessions, session],
            totalListeningMinutes: state.totalListeningMinutes + (session.durationMinutes || 0),
            currentStreak: newStreak,
            lastPracticeDate: today,
          }
        })
      },

      // Get listening stats
      getListeningStats: () => {
        const { listeningSessions, totalListeningMinutes } = get()

        const sessionCount = listeningSessions.length
        const totalHours = Math.round(totalListeningMinutes / 60 * 10) / 10

        // Average comprehension
        const sessionsWithComprehension = listeningSessions.filter(s => s.comprehension != null)
        const avgComprehension = sessionsWithComprehension.length > 0
          ? Math.round(sessionsWithComprehension.reduce((sum, s) => sum + s.comprehension, 0) / sessionsWithComprehension.length)
          : 0

        // Sessions by tier
        const sessionsByTier = {
          gateway: listeningSessions.filter(s => s.contentTier === 'gateway').length,
          bridge: listeningSessions.filter(s => s.contentTier === 'bridge').length,
          native: listeningSessions.filter(s => s.contentTier === 'native').length,
        }

        // Recent sessions (last 7 days)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const recentSessions = listeningSessions.filter(s => new Date(s.date) >= weekAgo)
        const recentMinutes = recentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

        return {
          sessionCount,
          totalMinutes: totalListeningMinutes,
          totalHours,
          avgComprehension,
          sessionsByTier,
          recentSessions: recentSessions.length,
          recentMinutes,
          recentHours: Math.round(recentMinutes / 60 * 10) / 10,
        }
      },

      // Get recent listening sessions
      getRecentSessions: (limit = 10) => {
        const { listeningSessions } = get()
        return [...listeningSessions]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit)
      },

      // Unlock a milestone
      unlockMilestone: (milestoneId) => {
        set((state) => {
          if (state.unlockedMilestones.includes(milestoneId)) {
            return state
          }
          return {
            unlockedMilestones: [...state.unlockedMilestones, milestoneId],
          }
        })
      },

      // Check if milestone is unlocked
      isMilestoneUnlocked: (milestoneId) => {
        return get().unlockedMilestones.includes(milestoneId)
      },

      // Reset all progress
      resetProgress: () => {
        set({
          letterProgress: {},
          listeningSessions: [],
          totalListeningMinutes: 0,
          unlockedMilestones: [],
          currentStreak: 0,
          lastPracticeDate: null,
        })
      },

      // Reset only listening progress
      resetListeningProgress: () => {
        set({
          listeningSessions: [],
          totalListeningMinutes: 0,
        })
      },
    }),
    {
      name: 'ukrainian-learner-progress',
    }
  )
)

export default useProgressStore
