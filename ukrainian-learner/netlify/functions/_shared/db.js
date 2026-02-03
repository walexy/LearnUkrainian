// Database helper for Netlify Functions
// Uses Netlify DB (PostgreSQL via Neon) when available, falls back to in-memory for local dev

let neonClient = null

export async function getDb() {
  // Try to use Netlify DB if available
  if (process.env.NETLIFY_DATABASE_URL) {
    if (!neonClient) {
      const { neon } = await import('@neondatabase/serverless')
      neonClient = neon(process.env.NETLIFY_DATABASE_URL)
    }
    return neonClient
  }

  // Fallback for local development - return a mock that logs queries
  console.warn('No NETLIFY_DATABASE_URL found, using mock database')
  return async (query, params) => {
    console.log('Mock DB query:', query, params)
    return []
  }
}

// Helper to execute queries with user context for RLS
export async function queryWithUser(userId, query, params = []) {
  const db = await getDb()

  // Set the user context for Row-Level Security
  await db`SET LOCAL app.user_id = ${userId}`

  // Execute the actual query
  return db(query, params)
}

// Schema initialization (run once on setup)
export const schema = `
-- Users table (extends Netlify Identity)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Language enrollments
CREATE TABLE IF NOT EXISTS user_languages (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, language_code)
);

-- Letter/character progress
CREATE TABLE IF NOT EXISTS letter_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  letter TEXT NOT NULL,
  correct INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  last_practiced TIMESTAMP,
  UNIQUE(user_id, language_code, letter)
);

-- Listening sessions
CREATE TABLE IF NOT EXISTS listening_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  content_id TEXT,
  content_title TEXT,
  content_tier TEXT,
  duration_minutes INTEGER,
  comprehension INTEGER,
  notes TEXT,
  energy_state TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Acquired words
CREATE TABLE IF NOT EXISTS acquired_words (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT,
  first_heard TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  times_encountered INTEGER DEFAULT 1,
  source TEXT,
  UNIQUE(user_id, language_code, word)
);

-- User streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  UNIQUE(user_id, language_code)
);

-- Unlocked milestones
CREATE TABLE IF NOT EXISTS unlocked_milestones (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  milestone_id TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, language_code, milestone_id)
);

-- Manual achievements
CREATE TABLE IF NOT EXISTS manual_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  emoji TEXT,
  label TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User settings (language-agnostic)
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  ui_language_level TEXT DEFAULT 'none',
  theme TEXT DEFAULT 'light'
);

-- Onboarding state
CREATE TABLE IF NOT EXISTS user_onboarding (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  has_seen_welcome BOOLEAN DEFAULT false,
  preferred_path TEXT,
  seen_hints TEXT DEFAULT '[]',
  UNIQUE(user_id, language_code)
);

-- Row-Level Security Policies (for production)
-- ALTER TABLE letter_progress ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY user_isolation ON letter_progress FOR ALL USING (user_id = current_setting('app.user_id'));
-- (Repeat for other tables)
`
