// POST /api/record-session
// Records a listening session

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
    const {
      language = 'uk',
      contentId,
      contentTitle,
      contentTier,
      durationMinutes,
      comprehension,
      notes,
      energyState,
    } = body

    if (!contentTitle || durationMinutes === undefined || comprehension === undefined) {
      return errorResponse('Content title, duration, and comprehension are required')
    }

    const db = await getDb()

    // Insert listening session
    const result = await db`
      INSERT INTO listening_sessions (
        user_id, language_code, content_id, content_title, content_tier,
        duration_minutes, comprehension, notes, energy_state
      )
      VALUES (
        ${user.userId}, ${language}, ${contentId}, ${contentTitle}, ${contentTier},
        ${durationMinutes}, ${comprehension}, ${notes}, ${energyState}
      )
      RETURNING id, created_at
    `

    // Update streak
    await updateStreak(db, user.userId, language)

    return jsonResponse({
      success: true,
      session: {
        id: result[0].id,
        createdAt: result[0].created_at,
      },
    })
  } catch (error) {
    console.error('Error recording session:', error)
    return errorResponse('Failed to record session', 500)
  }
}

async function updateStreak(db, userId, language) {
  const today = new Date().toISOString().split('T')[0]

  const result = await db`
    SELECT current_streak, last_practice_date
    FROM user_streaks
    WHERE user_id = ${userId} AND language_code = ${language}
  `

  const existing = result[0]

  if (!existing) {
    await db`
      INSERT INTO user_streaks (user_id, language_code, current_streak, last_practice_date)
      VALUES (${userId}, ${language}, 1, ${today})
    `
    return
  }

  const lastDate = existing.last_practice_date
  if (lastDate === today) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = lastDate === yesterdayStr ? existing.current_streak + 1 : 1

  await db`
    UPDATE user_streaks
    SET current_streak = ${newStreak}, last_practice_date = ${today}
    WHERE user_id = ${userId} AND language_code = ${language}
  `
}
