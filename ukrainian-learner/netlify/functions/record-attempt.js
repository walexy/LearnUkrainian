// POST /api/record-attempt
// Records a letter practice attempt

import { getDb } from './_shared/db.js'
import { getUser, requireAuth, jsonResponse, errorResponse, handleCors } from './_shared/auth.js'

export async function handler(event, context) {
  // Handle CORS preflight
  const corsResponse = handleCors(event)
  if (corsResponse) return corsResponse

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  // For development/testing, allow unauthenticated access
  let user = getUser(context)
  if (!user && process.env.NODE_ENV !== 'production') {
    user = { userId: 'test-user', email: 'test@example.com' }
  }

  if (!user) {
    return requireAuth(context)
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { language = 'uk', letter, isCorrect } = body

    if (!letter) {
      return errorResponse('Letter is required')
    }

    const db = await getDb()

    // Upsert letter progress
    await db`
      INSERT INTO letter_progress (user_id, language_code, letter, correct, total, last_practiced)
      VALUES (${user.userId}, ${language}, ${letter}, ${isCorrect ? 1 : 0}, 1, NOW())
      ON CONFLICT (user_id, language_code, letter)
      DO UPDATE SET
        correct = letter_progress.correct + ${isCorrect ? 1 : 0},
        total = letter_progress.total + 1,
        last_practiced = NOW()
    `

    // Update streak
    await updateStreak(db, user.userId, language)

    return jsonResponse({ success: true })
  } catch (error) {
    console.error('Error recording attempt:', error)
    return errorResponse('Failed to record attempt', 500)
  }
}

async function updateStreak(db, userId, language) {
  const today = new Date().toISOString().split('T')[0]

  // Get current streak info
  const result = await db`
    SELECT current_streak, last_practice_date
    FROM user_streaks
    WHERE user_id = ${userId} AND language_code = ${language}
  `

  const existing = result[0]

  if (!existing) {
    // First practice ever - create streak record
    await db`
      INSERT INTO user_streaks (user_id, language_code, current_streak, last_practice_date)
      VALUES (${userId}, ${language}, 1, ${today})
    `
    return
  }

  const lastDate = existing.last_practice_date
  if (lastDate === today) {
    // Already practiced today, no change
    return
  }

  // Check if yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak
  if (lastDate === yesterdayStr) {
    // Consecutive day - increment streak
    newStreak = existing.current_streak + 1
  } else {
    // Streak broken - reset to 1
    newStreak = 1
  }

  await db`
    UPDATE user_streaks
    SET current_streak = ${newStreak}, last_practice_date = ${today}
    WHERE user_id = ${userId} AND language_code = ${language}
  `
}
