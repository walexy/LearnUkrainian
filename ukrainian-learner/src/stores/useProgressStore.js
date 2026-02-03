import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as api from '../utils/api'

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

      // Manual milestone logs (for subjective achievements)
      manualAchievements: [],

      // Word acquisition tracking
      acquiredWords: [],

      // Onboarding state
      onboarding: {
        hasSeenWelcome: false,
        preferredPath: null, // 'listening-first' | 'alphabet-first'
        seenHints: [],
      },

      // UI settings
      uiSettings: {
        ukrainianUILevel: 'none', // 'none' | 'labels' | 'full'
      },

      // Streak tracking
      currentStreak: 0,
      lastPracticeDate: null,

      // Cloud sync state
      cloudSync: {
        enabled: false,
        lastSynced: null,
        syncing: false,
        error: null,
      },

      // ============ CLOUD SYNC ============

      // Enable cloud sync (called after login)
      enableCloudSync: () => {
        set({ cloudSync: { ...get().cloudSync, enabled: true, error: null } })
      },

      // Disable cloud sync (called after logout)
      disableCloudSync: () => {
        set({ cloudSync: { enabled: false, lastSynced: null, syncing: false, error: null } })
      },

      // Sync progress from cloud
      syncFromCloud: async (language = 'uk') => {
        const { cloudSync } = get()
        if (!cloudSync.enabled) return

        set({ cloudSync: { ...cloudSync, syncing: true, error: null } })

        try {
          const data = await api.fetchProgress(language)

          // Merge cloud data with local state
          set((state) => ({
            letterProgress: data.letterProgress || state.letterProgress,
            listeningSessions: data.listeningSessions || state.listeningSessions,
            totalListeningMinutes: data.totalListeningMinutes || state.totalListeningMinutes,
            unlockedMilestones: data.unlockedMilestones || state.unlockedMilestones,
            manualAchievements: data.manualAchievements || state.manualAchievements,
            acquiredWords: data.acquiredWords || state.acquiredWords,
            onboarding: data.onboarding || state.onboarding,
            uiSettings: data.uiSettings || state.uiSettings,
            currentStreak: data.currentStreak ?? state.currentStreak,
            lastPracticeDate: data.lastPracticeDate || state.lastPracticeDate,
            cloudSync: {
              ...state.cloudSync,
              syncing: false,
              lastSynced: new Date().toISOString(),
            },
          }))
        } catch (error) {
          console.error('Cloud sync failed:', error)
          set((state) => ({
            cloudSync: {
              ...state.cloudSync,
              syncing: false,
              error: error.message,
            },
          }))
        }
      },

      // Record a drill attempt (with cloud sync)
      recordAttempt: async (letter, isCorrect) => {
        const today = new Date().toISOString().split('T')[0]
        const { cloudSync } = get()

        // Update local state immediately
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

        // Sync to cloud if enabled (fire-and-forget)
        if (cloudSync.enabled) {
          api.recordAttempt(letter, isCorrect).catch(err => {
            console.warn('Cloud sync failed for attempt:', err)
          })
        }
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
        const { letterProgress } = get()
        return Object.keys(letterProgress).filter(letter => {
          const progress = letterProgress[letter]
          return progress && progress.total >= 5 && (progress.correct / progress.total) >= 0.8
        }).length
      },

      // Get letters that need more practice (< threshold accuracy or < 5 attempts)
      getWeakLetters: (allLetters, threshold = 0.8) => {
        const { letterProgress } = get()
        return allLetters.filter(letter => {
          const progress = letterProgress[letter]
          if (!progress || progress.total < 5) return true
          return (progress.correct / progress.total) < threshold
        })
      },

      // Get struggling letters (< 60% accuracy with at least 3 attempts)
      getStrugglingLetters: (allLetters) => {
        const { letterProgress } = get()
        return allLetters.filter(letter => {
          const progress = letterProgress[letter]
          if (!progress || progress.total < 3) return false
          return (progress.correct / progress.total) < 0.6
        })
      },

      // Get tier readiness based on comprehension history
      getTierReadiness: () => {
        const { listeningSessions } = get()

        // Need at least 5 sessions at a tier to evaluate readiness
        const getAverageComprehension = (tier) => {
          const tierSessions = listeningSessions
            .filter(s => s.contentTier === tier && s.comprehension != null)
            .slice(-10) // Last 10 sessions
          if (tierSessions.length < 5) return null
          return Math.round(
            tierSessions.reduce((sum, s) => sum + s.comprehension, 0) / tierSessions.length
          )
        }

        const gatewayAvg = getAverageComprehension('gateway')
        const bridgeAvg = getAverageComprehension('bridge')
        const nativeAvg = getAverageComprehension('native')

        return {
          gateway: {
            avgComprehension: gatewayAvg,
            sessionCount: listeningSessions.filter(s => s.contentTier === 'gateway').length,
            readyForNext: gatewayAvg !== null && gatewayAvg >= 70,
          },
          bridge: {
            avgComprehension: bridgeAvg,
            sessionCount: listeningSessions.filter(s => s.contentTier === 'bridge').length,
            readyForNext: bridgeAvg !== null && bridgeAvg >= 70,
          },
          native: {
            avgComprehension: nativeAvg,
            sessionCount: listeningSessions.filter(s => s.contentTier === 'native').length,
            readyForNext: false, // No tier after native
          },
          // Only recommend a tier if user has enough sessions to evaluate
          recommendedTier:
            listeningSessions.length < 3 ? null : // Not enough data yet
            gatewayAvg === null || gatewayAvg < 70 ? 'gateway' :
            bridgeAvg === null || bridgeAvg < 70 ? 'bridge' : 'native',
        }
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

      // Record a listening session (with cloud sync)
      recordListeningSession: async (session) => {
        const today = new Date().toISOString().split('T')[0]
        const { cloudSync } = get()

        // Update local state immediately
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

        // Sync to cloud if enabled (fire-and-forget)
        if (cloudSync.enabled) {
          api.recordSession(session).catch(err => {
            console.warn('Cloud sync failed for session:', err)
          })
        }
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

      // Log a manual achievement (subjective milestones)
      logManualAchievement: (achievement) => {
        const id = Date.now().toString()
        set((state) => ({
          manualAchievements: [
            ...state.manualAchievements,
            {
              id,
              date: new Date().toISOString(),
              ...achievement,
            },
          ],
        }))
        return id
      },

      // Get manual achievements
      getManualAchievements: () => {
        return get().manualAchievements || []
      },

      // ============ WORD ACQUISITION ============

      // Log a word (increment if exists, add if new) - with cloud sync
      logWord: async (word, meaning = '', source = 'listening') => {
        const normalizedWord = word.trim().toLowerCase()
        if (!normalizedWord) return

        const { cloudSync } = get()

        // Update local state immediately
        set((state) => {
          const existing = state.acquiredWords.find(w => w.word.toLowerCase() === normalizedWord)

          if (existing) {
            // Increment encounter count
            return {
              acquiredWords: state.acquiredWords.map(w =>
                w.word.toLowerCase() === normalizedWord
                  ? {
                      ...w,
                      timesEncountered: w.timesEncountered + 1,
                      lastSeen: new Date().toISOString(),
                      encounters: [...(w.encounters || []), { date: new Date().toISOString(), source }],
                    }
                  : w
              ),
            }
          } else {
            // Add new word
            return {
              acquiredWords: [
                ...state.acquiredWords,
                {
                  id: `word_${Date.now()}`,
                  word: word.trim(),
                  meaning,
                  firstHeard: new Date().toISOString(),
                  lastSeen: new Date().toISOString(),
                  timesEncountered: 1,
                  source,
                  encounters: [{ date: new Date().toISOString(), source }],
                },
              ],
            }
          }
        })

        // Sync to cloud if enabled (fire-and-forget)
        if (cloudSync.enabled) {
          api.logWord(word.trim(), meaning, source).catch(err => {
            console.warn('Cloud sync failed for word:', err)
          })
        }
      },

      // Get word stats
      getWordStats: () => {
        const { acquiredWords } = get()
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const thisWeek = acquiredWords.filter(w => new Date(w.firstHeard) >= weekAgo).length
        const milestoneWords = acquiredWords.filter(w => w.timesEncountered >= 5).length

        return {
          total: acquiredWords.length,
          thisWeek,
          milestoneWords,
          bySource: {
            listening: acquiredWords.filter(w => w.source === 'listening').length,
            cyrillic: acquiredWords.filter(w => w.source === 'cyrillic').length,
            colleague: acquiredWords.filter(w => w.source === 'colleague').length,
          },
        }
      },

      // Get recent words
      getRecentWords: (limit = 10) => {
        const { acquiredWords } = get()
        return [...acquiredWords]
          .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
          .slice(0, limit)
      },

      // Get milestone words (encountered 5+ times)
      getMilestoneWords: () => {
        const { acquiredWords } = get()
        return acquiredWords
          .filter(w => w.timesEncountered >= 5)
          .sort((a, b) => b.timesEncountered - a.timesEncountered)
      },

      // ============ ONBOARDING ============

      // Mark welcome as seen
      completeWelcome: (preferredPath = null) => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            hasSeenWelcome: true,
            preferredPath,
          },
        }))
      },

      // Mark a hint as seen
      markHintSeen: (hintId) => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            seenHints: [...new Set([...state.onboarding.seenHints, hintId])],
          },
        }))
      },

      // Check if hint has been seen
      hasSeenHint: (hintId) => {
        return get().onboarding.seenHints.includes(hintId)
      },

      // ============ UI SETTINGS ============

      // Set Ukrainian UI level
      setUkrainianUILevel: (level) => {
        set((state) => ({
          uiSettings: {
            ...state.uiSettings,
            ukrainianUILevel: level,
          },
        }))
      },

      // ============ NEXT STEP RECOMMENDATION ============

      // Get personalized next step recommendation
      getNextStep: () => {
        const state = get()
        const stats = state.getStats()
        const listeningStats = state.getListeningStats()
        const tierReadiness = state.getTierReadiness()
        const masteredCount = state.getMasteredCount()
        const wordStats = state.getWordStats()

        // Brand new user - offer choice
        if (stats.totalAttempts === 0 && listeningStats.sessionCount === 0) {
          return {
            type: 'choice',
            title: 'Choose Your Path',
            description: 'Both paths lead to fluency. Pick what excites you!',
            options: [
              { label: 'Start Listening', path: '/listening', icon: '🎧', description: 'Dive into comprehensible input' },
              { label: 'Learn Letters', path: '/cyrillic', icon: '🔤', description: 'Master the Cyrillic alphabet first' },
            ],
          }
        }

        // Has listening but no alphabet - suggest alphabet to enhance reading
        if (listeningStats.sessionCount >= 3 && stats.totalAttempts === 0) {
          return {
            type: 'suggestion',
            title: 'Enhance Your Listening',
            description: 'Learning Cyrillic letters will help you recognize words you hear.',
            action: { label: 'Start Cyrillic', path: '/cyrillic', icon: '🔤' },
          }
        }

        // Has alphabet but no listening - suggest listening to apply knowledge
        if (masteredCount >= 10 && listeningStats.sessionCount === 0) {
          return {
            type: 'suggestion',
            title: 'Time for Input!',
            description: `You've mastered ${masteredCount} letters. Put them to use with real Ukrainian content!`,
            action: { label: 'Browse Content', path: '/listening', icon: '🎧' },
          }
        }

        // Ready for tier advancement
        if (tierReadiness.gateway.readyForNext && listeningStats.sessionsByTier.bridge < 3) {
          return {
            type: 'milestone',
            title: 'Ready for Bridge!',
            description: `Your Gateway comprehension is ${tierReadiness.gateway.avgComprehension}%. Challenge yourself!`,
            action: { label: 'Try Bridge Content', path: '/listening', icon: '🚀' },
          }
        }

        if (tierReadiness.bridge.readyForNext && listeningStats.sessionsByTier.native < 3) {
          return {
            type: 'milestone',
            title: 'Ready for Native!',
            description: `Bridge comprehension at ${tierReadiness.bridge.avgComprehension}%. You're ready for authentic content!`,
            action: { label: 'Try Native Content', path: '/listening', icon: '🎉' },
          }
        }

        // Has words logged but hasn't visited ColleagueConnection
        if (wordStats.total >= 5 && !state.onboarding.seenHints.includes('colleague-visited')) {
          return {
            type: 'suggestion',
            title: 'Connect with Colleagues',
            description: 'Learn why Ukrainian speakers say things a certain way in English.',
            action: { label: 'Explore Patterns', path: '/colleague', icon: '🤝' },
          }
        }

        // Default: encourage continued practice based on recency
        const lastSession = state.listeningSessions[state.listeningSessions.length - 1]
        const lastPractice = state.lastPracticeDate

        if (listeningStats.sessionCount > 0 && (!lastPractice || new Date(lastPractice) < new Date(lastSession?.date || 0))) {
          return {
            type: 'continue',
            title: 'Keep Listening',
            description: `${listeningStats.totalHours} hours logged. Every session builds acquisition!`,
            action: { label: 'Log Session', path: '/listening', icon: '🎧' },
          }
        }

        // Balanced user - suggest what they've done less of recently
        return {
          type: 'continue',
          title: 'Continue Learning',
          description: 'Keep building your Ukrainian skills!',
          action: {
            label: masteredCount < 20 ? 'Practice Letters' : 'Listen More',
            path: masteredCount < 20 ? '/cyrillic' : '/listening',
            icon: masteredCount < 20 ? '🔤' : '🎧',
          },
        }
      },

      // Reset all progress
      resetProgress: () => {
        set({
          letterProgress: {},
          listeningSessions: [],
          totalListeningMinutes: 0,
          unlockedMilestones: [],
          manualAchievements: [],
          acquiredWords: [],
          onboarding: {
            hasSeenWelcome: false,
            preferredPath: null,
            seenHints: [],
          },
          uiSettings: {
            ukrainianUILevel: 'none',
          },
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
