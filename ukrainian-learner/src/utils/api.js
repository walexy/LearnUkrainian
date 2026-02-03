// API client for Netlify Functions
// Handles cloud sync with authentication

const API_BASE = import.meta.env.VITE_API_URL || '/.netlify/functions'

// Get auth token from Netlify Identity
const getAuthToken = () => {
  try {
    const user = window.netlifyIdentity?.currentUser()
    return user?.token?.access_token || null
  } catch {
    return null
  }
}

// Make authenticated API request
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

// ============ PROGRESS APIs ============

/**
 * Fetch all progress data for a language
 * @param {string} language - Language code (e.g., 'uk')
 * @returns {Promise<Object>} Progress data matching store structure
 */
export const fetchProgress = async (language = 'uk') => {
  return apiRequest(`get-progress?language=${language}`)
}

/**
 * Record a letter drill attempt
 * @param {string} letter - The letter practiced
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {string} language - Language code
 */
export const recordAttempt = async (letter, isCorrect, language = 'uk') => {
  return apiRequest('record-attempt', {
    method: 'POST',
    body: JSON.stringify({ letter, isCorrect, language }),
  })
}

/**
 * Record a listening session
 * @param {Object} session - Session data
 * @param {string} language - Language code
 */
export const recordSession = async (session, language = 'uk') => {
  return apiRequest('record-session', {
    method: 'POST',
    body: JSON.stringify({
      language,
      contentId: session.contentId,
      contentTitle: session.title,
      contentTier: session.contentTier,
      durationMinutes: session.durationMinutes,
      comprehension: session.comprehension,
      notes: session.notes,
    }),
  })
}

/**
 * Log a word encounter
 * @param {string} word - The word
 * @param {string} meaning - Word meaning
 * @param {string} source - Where the word was encountered
 * @param {string} language - Language code
 */
export const logWord = async (word, meaning = '', source = 'listening', language = 'uk') => {
  return apiRequest('log-word', {
    method: 'POST',
    body: JSON.stringify({ word, meaning, source, language }),
  })
}

/**
 * Fetch computed stats
 * @param {string} language - Language code
 * @returns {Promise<Object>} Computed statistics
 */
export const fetchStats = async (language = 'uk') => {
  return apiRequest(`get-stats?language=${language}`)
}

// ============ AUTH HELPERS ============

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getAuthToken()
}

/**
 * Get current user info
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  try {
    return window.netlifyIdentity?.currentUser() || null
  } catch {
    return null
  }
}

/**
 * Initialize Netlify Identity widget
 * @param {Function} onLogin - Callback when user logs in
 * @param {Function} onLogout - Callback when user logs out
 */
export const initAuth = (onLogin, onLogout) => {
  if (typeof window === 'undefined') return

  // Load Netlify Identity widget if not already loaded
  if (!window.netlifyIdentity) {
    const script = document.createElement('script')
    script.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      window.netlifyIdentity.on('init', user => {
        if (user) onLogin?.(user)
      })
      window.netlifyIdentity.on('login', onLogin)
      window.netlifyIdentity.on('logout', onLogout)
      window.netlifyIdentity.init()
    }
  } else {
    window.netlifyIdentity.on('login', onLogin)
    window.netlifyIdentity.on('logout', onLogout)
  }
}

/**
 * Open login modal
 */
export const openLogin = () => {
  window.netlifyIdentity?.open('login')
}

/**
 * Open signup modal
 */
export const openSignup = () => {
  window.netlifyIdentity?.open('signup')
}

/**
 * Logout user
 */
export const logout = () => {
  window.netlifyIdentity?.logout()
}

export default {
  fetchProgress,
  recordAttempt,
  recordSession,
  logWord,
  fetchStats,
  isAuthenticated,
  getCurrentUser,
  initAuth,
  openLogin,
  openSignup,
  logout,
}
