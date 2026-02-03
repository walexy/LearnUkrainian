// POST /api/log-word
// Logs a word acquisition or encounter

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
    const { language = 'uk', word, meaning, source = 'listening' } = body

    if (!word) {
      return errorResponse('Word is required')
    }

    const db = await getDb()

    // Upsert word - increment encounter count if exists
    await db`
      INSERT INTO acquired_words (user_id, language_code, word, meaning, source)
      VALUES (${user.userId}, ${language}, ${word}, ${meaning}, ${source})
      ON CONFLICT (user_id, language_code, word)
      DO UPDATE SET
        times_encountered = acquired_words.times_encountered + 1,
        last_seen = NOW(),
        meaning = COALESCE(${meaning}, acquired_words.meaning)
    `

    return jsonResponse({ success: true })
  } catch (error) {
    console.error('Error logging word:', error)
    return errorResponse('Failed to log word', 500)
  }
}
