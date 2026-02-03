// GET /api/get-stats?language=uk
// Returns computed stats for MCP server and dashboard

import { getDb } from './_shared/db.js'
import { getUser, requireAuth, jsonResponse, errorResponse, handleCors } from './_shared/auth.js'

export async function handler(event, context) {
  // Handle CORS preflight
  const corsResponse = handleCors(event)
  if (corsResponse) return corsResponse

  // For development/testing, allow unauthenticated access
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

    // Fetch raw data
    const [letterProgress, listeningSessions, acquiredWords, streak] = await Promise.all([
      db`SELECT letter, correct, total FROM letter_progress
         WHERE user_id = ${user.userId} AND language_code = ${language}`,

      db`SELECT content_tier, duration_minutes, comprehension, created_at
         FROM listening_sessions
         WHERE user_id = ${user.userId} AND language_code = ${language}
         ORDER BY created_at DESC`,

      db`SELECT word, meaning, times_encountered, last_seen
         FROM acquired_words
         WHERE user_id = ${user.userId} AND language_code = ${language}`,

      db`SELECT current_streak FROM user_streaks
         WHERE user_id = ${user.userId} AND language_code = ${language}`,
    ])

    // Compute letter stats
    const letterStats = computeLetterStats(letterProgress)

    // Compute listening stats
    const listeningStats = computeListeningStats(listeningSessions)

    // Compute tier readiness
    const tierReadiness = computeTierReadiness(listeningSessions)

    // Compute word stats
    const wordStats = computeWordStats(acquiredWords)

    // Get weak areas
    const weakAreas = computeWeakAreas(letterProgress, tierReadiness)

    return jsonResponse({
      userId: user.userId,
      language,
      letterStats,
      listeningStats,
      tierReadiness,
      wordStats,
      weakAreas,
      currentStreak: streak[0]?.current_streak || 0,
    })
  } catch (error) {
    console.error('Error computing stats:', error)
    return errorResponse('Failed to compute stats', 500)
  }
}

function computeLetterStats(letterProgress) {
  const totalLetters = 33 // Ukrainian alphabet
  const letters = letterProgress || []

  let totalAttempts = 0
  let totalCorrect = 0
  let mastered = 0
  const strugglingLetters = []

  letters.forEach(row => {
    totalAttempts += row.total
    totalCorrect += row.correct
    const accuracy = row.total > 0 ? row.correct / row.total : 0

    // Mastered: 80%+ accuracy with 5+ attempts
    if (row.total >= 5 && accuracy >= 0.8) {
      mastered++
    }

    // Struggling: <60% accuracy with 3+ attempts
    if (row.total >= 3 && accuracy < 0.6) {
      strugglingLetters.push({
        letter: row.letter,
        accuracy: Math.round(accuracy * 100),
        attempts: row.total,
      })
    }
  })

  return {
    totalLetters,
    lettersStarted: letters.length,
    mastered,
    totalAttempts,
    overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    strugglingLetters,
  }
}

function computeListeningStats(sessions) {
  const sessionCount = sessions.length
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10

  // Average comprehension
  const sessionsWithComprehension = sessions.filter(s => s.comprehension != null)
  const avgComprehension = sessionsWithComprehension.length > 0
    ? Math.round(sessionsWithComprehension.reduce((sum, s) => sum + s.comprehension, 0) / sessionsWithComprehension.length)
    : 0

  // Sessions by tier
  const sessionsByTier = { gateway: 0, bridge: 0, native: 0 }
  sessions.forEach(s => {
    if (s.content_tier && sessionsByTier[s.content_tier] !== undefined) {
      sessionsByTier[s.content_tier]++
    }
  })

  // Recent hours (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentMinutes = sessions
    .filter(s => new Date(s.created_at) > weekAgo)
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0)

  return {
    sessionCount,
    totalMinutes,
    totalHours,
    avgComprehension,
    sessionsByTier,
    recentHours: Math.round(recentMinutes / 60 * 10) / 10,
  }
}

function computeTierReadiness(sessions) {
  const getAvgComprehension = (tier) => {
    const tierSessions = sessions
      .filter(s => s.content_tier === tier && s.comprehension != null)
      .slice(0, 10) // Last 10 sessions

    if (tierSessions.length < 5) return null

    return Math.round(
      tierSessions.reduce((sum, s) => sum + s.comprehension, 0) / tierSessions.length
    )
  }

  const gateway = getAvgComprehension('gateway')
  const bridge = getAvgComprehension('bridge')
  const native = getAvgComprehension('native')

  return {
    gateway: {
      avgComprehension: gateway,
      sessionCount: sessions.filter(s => s.content_tier === 'gateway').length,
      readyForNext: gateway !== null && gateway >= 70,
    },
    bridge: {
      avgComprehension: bridge,
      sessionCount: sessions.filter(s => s.content_tier === 'bridge').length,
      readyForNext: bridge !== null && bridge >= 70,
    },
    native: {
      avgComprehension: native,
      sessionCount: sessions.filter(s => s.content_tier === 'native').length,
      readyForNext: false,
    },
    recommendedTier:
      sessions.length < 3 ? null :
      gateway === null || gateway < 70 ? 'gateway' :
      bridge === null || bridge < 70 ? 'bridge' : 'native',
  }
}

function computeWordStats(words) {
  const total = words.length
  const milestoneWords = words.filter(w => w.times_encountered >= 5)

  // Words this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeek = words.filter(w => new Date(w.last_seen) > weekAgo).length

  // Recent words (last 10)
  const recentWords = words.slice(0, 10).map(w => ({
    word: w.word,
    meaning: w.meaning,
    timesEncountered: w.times_encountered,
  }))

  return {
    total,
    milestoneCount: milestoneWords.length,
    thisWeek,
    recentWords,
    milestoneWords: milestoneWords.map(w => ({
      word: w.word,
      meaning: w.meaning,
      timesEncountered: w.times_encountered,
    })),
  }
}

function computeWeakAreas(letterProgress, tierReadiness) {
  const strugglingLetters = []

  letterProgress.forEach(row => {
    const accuracy = row.total > 0 ? row.correct / row.total : 0
    if (row.total >= 3 && accuracy < 0.6) {
      strugglingLetters.push({
        letter: row.letter,
        accuracy: Math.round(accuracy * 100),
        attempts: row.total,
      })
    }
  })

  // Sort by accuracy (worst first)
  strugglingLetters.sort((a, b) => a.accuracy - b.accuracy)

  return {
    strugglingLetters: strugglingLetters.slice(0, 5),
    lowComprehensionTier: tierReadiness.gateway?.avgComprehension < 50 ? 'gateway' :
                          tierReadiness.bridge?.avgComprehension < 50 ? 'bridge' : null,
  }
}
