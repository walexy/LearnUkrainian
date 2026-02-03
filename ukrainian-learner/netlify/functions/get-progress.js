// GET /api/get-progress?language=uk
// Returns all progress data for a user and language

import { getDb } from './_shared/db.js'
import { getUser, requireAuth, jsonResponse, errorResponse, handleCors } from './_shared/auth.js'

export async function handler(event, context) {
  // Handle CORS preflight
  const corsResponse = handleCors(event)
  if (corsResponse) return corsResponse

  // For development/testing, allow unauthenticated access with a test user
  let user = getUser(context)
  if (!user && process.env.NODE_ENV !== 'production') {
    user = { userId: 'test-user', email: 'test@example.com' }
  }

  if (!user) {
    return requireAuth(context)
  }

  const language = event.queryStringParameters?.language || 'uk'

  try {
    const db = await getDb()

    // Fetch all progress data in parallel
    const [
      letterProgress,
      listeningSessions,
      acquiredWords,
      streak,
      milestones,
      onboarding,
      settings,
    ] = await Promise.all([
      db`SELECT letter, correct, total, last_practiced
         FROM letter_progress
         WHERE user_id = ${user.userId} AND language_code = ${language}`,

      db`SELECT id, content_id, content_title, content_tier, duration_minutes,
                comprehension, notes, energy_state, created_at
         FROM listening_sessions
         WHERE user_id = ${user.userId} AND language_code = ${language}
         ORDER BY created_at DESC
         LIMIT 100`,

      db`SELECT word, meaning, first_heard, last_seen, times_encountered, source
         FROM acquired_words
         WHERE user_id = ${user.userId} AND language_code = ${language}
         ORDER BY last_seen DESC`,

      db`SELECT current_streak, last_practice_date
         FROM user_streaks
         WHERE user_id = ${user.userId} AND language_code = ${language}`,

      db`SELECT milestone_id, unlocked_at
         FROM unlocked_milestones
         WHERE user_id = ${user.userId} AND language_code = ${language}`,

      db`SELECT has_seen_welcome, preferred_path, seen_hints
         FROM user_onboarding
         WHERE user_id = ${user.userId} AND language_code = ${language}`,

      db`SELECT ui_language_level, theme
         FROM user_settings
         WHERE user_id = ${user.userId}`,
    ])

    // Transform letter progress to object format (matching Zustand store)
    const letterProgressObj = {}
    letterProgress.forEach(row => {
      letterProgressObj[row.letter] = {
        correct: row.correct,
        total: row.total,
        lastPracticed: row.last_practiced,
      }
    })

    // Transform listening sessions
    const sessions = listeningSessions.map(row => ({
      id: row.id,
      contentId: row.content_id,
      contentTitle: row.content_title,
      contentTier: row.content_tier,
      durationMinutes: row.duration_minutes,
      comprehension: row.comprehension,
      notes: row.notes,
      energyState: row.energy_state,
      date: row.created_at,
    }))

    // Transform acquired words
    const words = acquiredWords.map(row => ({
      word: row.word,
      meaning: row.meaning,
      firstHeard: row.first_heard,
      lastSeen: row.last_seen,
      timesEncountered: row.times_encountered,
      source: row.source,
    }))

    // Get streak data
    const streakData = streak[0] || { current_streak: 0, last_practice_date: null }

    // Get onboarding state
    const onboardingData = onboarding[0] || {
      has_seen_welcome: false,
      preferred_path: null,
      seen_hints: '[]',
    }

    // Get settings
    const settingsData = settings[0] || {
      ui_language_level: 'none',
      theme: 'light',
    }

    return jsonResponse({
      userId: user.userId,
      language,
      letterProgress: letterProgressObj,
      listeningSessions: sessions,
      acquiredWords: words,
      currentStreak: streakData.current_streak,
      lastPracticeDate: streakData.last_practice_date,
      unlockedMilestones: milestones.map(m => m.milestone_id),
      onboarding: {
        hasSeenWelcome: onboardingData.has_seen_welcome,
        preferredPath: onboardingData.preferred_path,
        seenHints: JSON.parse(onboardingData.seen_hints || '[]'),
      },
      uiSettings: {
        ukrainianUILevel: settingsData.ui_language_level,
        theme: settingsData.theme,
      },
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return errorResponse('Failed to fetch progress data', 500)
  }
}
