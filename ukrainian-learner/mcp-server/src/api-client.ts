// API client for fetching progress data
// Supports two modes:
// 1. Local file (default) - reads from exported JSON file, no account needed
// 2. Cloud API (with auth token) - fetches from Netlify Functions

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

interface Config {
  apiUrl: string
  authToken?: string
  defaultLanguage: string
  localDataPath: string
}

interface ProgressData {
  userId: string
  language: string
  letterProgress: Record<string, { correct: number; total: number; lastPracticed?: string }>
  listeningSessions: Array<{
    id: number
    contentId?: string
    contentTitle: string
    contentTier: string
    durationMinutes: number
    comprehension: number
    notes?: string
    date: string
  }>
  acquiredWords: Array<{
    word: string
    meaning?: string
    firstHeard: string
    lastSeen: string
    timesEncountered: number
    source: string
  }>
  currentStreak: number
  lastPracticeDate?: string
  unlockedMilestones: string[]
  totalListeningMinutes: number
  onboarding: {
    hasSeenWelcome: boolean
    preferredPath?: string
    seenHints: string[]
  }
  uiSettings: {
    ukrainianUILevel: string
  }
}

interface StatsData {
  userId: string
  language: string
  letterStats: {
    totalLetters: number
    lettersStarted: number
    mastered: number
    totalAttempts: number
    overallAccuracy: number
    strugglingLetters: Array<{ letter: string; accuracy: number; attempts: number }>
  }
  listeningStats: {
    sessionCount: number
    totalMinutes: number
    totalHours: number
    avgComprehension: number
    sessionsByTier: { gateway: number; bridge: number; native: number }
    recentHours: number
  }
  tierReadiness: {
    gateway: { avgComprehension: number | null; sessionCount: number; readyForNext: boolean }
    bridge: { avgComprehension: number | null; sessionCount: number; readyForNext: boolean }
    native: { avgComprehension: number | null; sessionCount: number; readyForNext: boolean }
    recommendedTier: string | null
  }
  wordStats: {
    total: number
    milestoneCount: number
    thisWeek: number
    recentWords: Array<{ word: string; meaning?: string; timesEncountered: number }>
    milestoneWords: Array<{ word: string; meaning?: string; timesEncountered: number }>
  }
  weakAreas: {
    strugglingLetters: Array<{ letter: string; accuracy: number; attempts: number }>
    lowComprehensionTier: string | null
  }
  currentStreak: number
}

const CONFIG_PATH = path.join(os.homedir(), '.language-learner', 'config.json')
const LOCAL_DATA_PATH = path.join(os.homedir(), '.language-learner', 'progress.json')

// Default API URL - your Netlify deployment
const DEFAULT_API_URL = 'https://learn-ukrainian.netlify.app'

function loadConfig(): Config {
  // Priority: env vars > config file > defaults
  const envConfig: Partial<Config> = {
    apiUrl: process.env.LANGUAGE_LEARNER_API_URL,
    authToken: process.env.LANGUAGE_LEARNER_AUTH_TOKEN,
    defaultLanguage: process.env.LANGUAGE_LEARNER_LANGUAGE,
    localDataPath: process.env.LANGUAGE_LEARNER_DATA_PATH,
  }

  // Try loading config file for additional settings
  let fileConfig: Partial<Config> = {}
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, 'utf-8')
      fileConfig = JSON.parse(content)
    }
  } catch (error) {
    // Config file is optional
  }

  return {
    apiUrl: envConfig.apiUrl || fileConfig.apiUrl || DEFAULT_API_URL,
    authToken: envConfig.authToken || fileConfig.authToken,
    defaultLanguage: envConfig.defaultLanguage || fileConfig.defaultLanguage || 'uk',
    localDataPath: envConfig.localDataPath || fileConfig.localDataPath || LOCAL_DATA_PATH,
  }
}

export function getConfig(): Config {
  return loadConfig()
}

// Read progress from local JSON file (exported from browser)
function readLocalProgress(): ProgressData | null {
  const config = loadConfig()

  try {
    if (fs.existsSync(config.localDataPath)) {
      const content = fs.readFileSync(config.localDataPath, 'utf-8')
      const data = JSON.parse(content)

      // The local file is the Zustand store format
      return {
        userId: 'local',
        language: config.defaultLanguage,
        letterProgress: data.letterProgress || {},
        listeningSessions: (data.listeningSessions || []).map((s: any, i: number) => ({
          id: i,
          contentId: s.contentId,
          contentTitle: s.title || s.contentTitle || 'Unknown',
          contentTier: s.contentTier || 'gateway',
          durationMinutes: s.durationMinutes || 0,
          comprehension: s.comprehension || 0,
          notes: s.notes,
          date: s.date || new Date().toISOString(),
        })),
        acquiredWords: (data.acquiredWords || []).map((w: any) => ({
          word: w.word,
          meaning: w.meaning,
          firstHeard: w.firstHeard || new Date().toISOString(),
          lastSeen: w.lastSeen || new Date().toISOString(),
          timesEncountered: w.timesEncountered || 1,
          source: w.source || 'unknown',
        })),
        currentStreak: data.currentStreak || 0,
        lastPracticeDate: data.lastPracticeDate,
        unlockedMilestones: data.unlockedMilestones || [],
        totalListeningMinutes: data.totalListeningMinutes || 0,
        onboarding: data.onboarding || { hasSeenWelcome: false, seenHints: [] },
        uiSettings: data.uiSettings || { ukrainianUILevel: 'none' },
      }
    }
  } catch (error) {
    console.error('Failed to read local progress:', error)
  }

  return null
}

// Compute stats from progress data (same logic as get-stats.js)
function computeStatsFromProgress(progress: ProgressData): StatsData {
  const letterProgress = progress.letterProgress || {}
  const sessions = progress.listeningSessions || []
  const words = progress.acquiredWords || []

  // Letter stats
  const letters = Object.keys(letterProgress)
  let totalAttempts = 0
  let totalCorrect = 0
  let mastered = 0
  const strugglingLetters: Array<{ letter: string; accuracy: number; attempts: number }> = []

  letters.forEach(letter => {
    const p = letterProgress[letter]
    totalAttempts += p.total
    totalCorrect += p.correct
    const accuracy = p.total > 0 ? p.correct / p.total : 0

    if (p.total >= 5 && accuracy >= 0.8) mastered++
    if (p.total >= 3 && accuracy < 0.6) {
      strugglingLetters.push({
        letter,
        accuracy: Math.round(accuracy * 100),
        attempts: p.total,
      })
    }
  })

  strugglingLetters.sort((a, b) => a.accuracy - b.accuracy)

  // Listening stats
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
  const sessionsWithComp = sessions.filter(s => s.comprehension != null)
  const avgComprehension = sessionsWithComp.length > 0
    ? Math.round(sessionsWithComp.reduce((sum, s) => sum + s.comprehension, 0) / sessionsWithComp.length)
    : 0

  const sessionsByTier = { gateway: 0, bridge: 0, native: 0 }
  sessions.forEach(s => {
    if (s.contentTier && sessionsByTier[s.contentTier as keyof typeof sessionsByTier] !== undefined) {
      sessionsByTier[s.contentTier as keyof typeof sessionsByTier]++
    }
  })

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentMinutes = sessions
    .filter(s => new Date(s.date) > weekAgo)
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

  // Tier readiness
  const getAvgComp = (tier: string) => {
    const tierSessions = sessions
      .filter(s => s.contentTier === tier && s.comprehension != null)
      .slice(-10)
    if (tierSessions.length < 5) return null
    return Math.round(tierSessions.reduce((sum, s) => sum + s.comprehension, 0) / tierSessions.length)
  }

  const gatewayAvg = getAvgComp('gateway')
  const bridgeAvg = getAvgComp('bridge')
  const nativeAvg = getAvgComp('native')

  // Word stats
  const milestoneWords = words.filter(w => w.timesEncountered >= 5)
  const thisWeekWords = words.filter(w => new Date(w.firstHeard) > weekAgo).length
  const recentWords = [...words]
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    .slice(0, 10)

  return {
    userId: progress.userId,
    language: progress.language,
    letterStats: {
      totalLetters: 33,
      lettersStarted: letters.length,
      mastered,
      totalAttempts,
      overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      strugglingLetters: strugglingLetters.slice(0, 5),
    },
    listeningStats: {
      sessionCount: sessions.length,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      avgComprehension,
      sessionsByTier,
      recentHours: Math.round(recentMinutes / 60 * 10) / 10,
    },
    tierReadiness: {
      gateway: {
        avgComprehension: gatewayAvg,
        sessionCount: sessionsByTier.gateway,
        readyForNext: gatewayAvg !== null && gatewayAvg >= 70,
      },
      bridge: {
        avgComprehension: bridgeAvg,
        sessionCount: sessionsByTier.bridge,
        readyForNext: bridgeAvg !== null && bridgeAvg >= 70,
      },
      native: {
        avgComprehension: nativeAvg,
        sessionCount: sessionsByTier.native,
        readyForNext: false,
      },
      recommendedTier:
        sessions.length < 3 ? null :
        gatewayAvg === null || gatewayAvg < 70 ? 'gateway' :
        bridgeAvg === null || bridgeAvg < 70 ? 'bridge' : 'native',
    },
    wordStats: {
      total: words.length,
      milestoneCount: milestoneWords.length,
      thisWeek: thisWeekWords,
      recentWords: recentWords.map(w => ({
        word: w.word,
        meaning: w.meaning,
        timesEncountered: w.timesEncountered,
      })),
      milestoneWords: milestoneWords.map(w => ({
        word: w.word,
        meaning: w.meaning,
        timesEncountered: w.timesEncountered,
      })),
    },
    weakAreas: {
      strugglingLetters: strugglingLetters.slice(0, 5),
      lowComprehensionTier:
        gatewayAvg !== null && gatewayAvg < 50 ? 'gateway' :
        bridgeAvg !== null && bridgeAvg < 50 ? 'bridge' : null,
    },
    currentStreak: progress.currentStreak,
  }
}

export async function fetchProgress(language?: string): Promise<ProgressData | null> {
  const config = loadConfig()

  // Try local file first (no account needed)
  const localData = readLocalProgress()
  if (localData) {
    console.error('Using local progress data from:', config.localDataPath)
    return localData
  }

  // Fall back to cloud API if auth token is configured
  if (!config.authToken) {
    console.error('No local data and no auth token. Export your progress from the app.')
    return null
  }

  const lang = language || config.defaultLanguage

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.authToken}`,
    }

    const response = await fetch(
      `${config.apiUrl}/.netlify/functions/get-progress?language=${lang}`,
      { headers }
    )

    if (!response.ok) {
      console.error('API error:', response.status, await response.text())
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch progress:', error)
    return null
  }
}

export async function fetchStats(language?: string): Promise<StatsData | null> {
  const config = loadConfig()

  // Try local file first
  const localData = readLocalProgress()
  if (localData) {
    return computeStatsFromProgress(localData)
  }

  // Fall back to cloud API
  if (!config.authToken) {
    console.error('No local data and no auth token.')
    return null
  }

  const lang = language || config.defaultLanguage

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.authToken}`,
    }

    const response = await fetch(
      `${config.apiUrl}/.netlify/functions/get-stats?language=${lang}`,
      { headers }
    )

    if (!response.ok) {
      console.error('API error:', response.status, await response.text())
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return null
  }
}

export type { ProgressData, StatsData, Config }
