// Authentication helper for Netlify Functions
// Extracts and verifies user from Netlify Identity JWT

/**
 * Get authenticated user from request context
 * @param {Object} context - Netlify function context
 * @returns {{ userId: string, email: string } | null}
 */
export function getUser(context) {
  // Netlify Identity provides user info in context.clientContext.user
  const user = context?.clientContext?.user

  if (!user || !user.sub) {
    return null
  }

  return {
    userId: user.sub,
    email: user.email,
    name: user.user_metadata?.full_name,
  }
}

/**
 * Middleware to require authentication
 * Returns error response if not authenticated
 */
export function requireAuth(context) {
  const user = getUser(context)

  if (!user) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Unauthorized',
        message: 'Please log in to access this resource',
      }),
    }
  }

  return null // No error, user is authenticated
}

/**
 * Create standard JSON response
 */
export function jsonResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(data),
  }
}

/**
 * Create error response
 */
export function errorResponse(message, statusCode = 400) {
  return jsonResponse({ error: message }, statusCode)
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    }
  }
  return null
}
