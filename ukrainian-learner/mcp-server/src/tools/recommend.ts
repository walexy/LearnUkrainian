// get_practice_recommendation tool
// Suggests what to practice next based on progress

import { fetchStats, getConfig } from '../api-client.js'

interface Recommendation {
  activity: 'alphabet' | 'listening' | 'vocabulary' | 'review'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  estimatedMinutes?: number
  specificFocus?: string[]
}

export async function getPracticeRecommendation(
  language?: string,
  availableMinutes?: number
): Promise<string> {
  const config = getConfig()
  const lang = language || config.defaultLanguage
  const stats = await fetchStats(lang)

  if (!stats) {
    return `Unable to fetch progress data. Please check your configuration.`
  }

  const recommendations: Recommendation[] = []
  const minutes = availableMinutes || 30 // Default 30 minutes

  // Priority 1: Struggling letters
  if (stats.weakAreas.strugglingLetters.length > 0) {
    recommendations.push({
      activity: 'alphabet',
      priority: 'high',
      title: 'Letter Practice',
      description: `Focus on struggling letters: ${stats.weakAreas.strugglingLetters.map(l => l.letter).join(', ')}`,
      estimatedMinutes: 10,
      specificFocus: stats.weakAreas.strugglingLetters.map(l => l.letter),
    })
  }

  // Priority 2: Not enough listening
  if (stats.listeningStats.sessionCount < 10 || stats.listeningStats.recentHours < 1) {
    recommendations.push({
      activity: 'listening',
      priority: 'high',
      title: 'Listening Session',
      description: `Build your ear with ${stats.tierReadiness.recommendedTier || 'Gateway'}-level content`,
      estimatedMinutes: Math.max(15, minutes - 10),
    })
  }

  // Priority 3: Ready to advance tier
  if (stats.tierReadiness.gateway.readyForNext && stats.listeningStats.sessionsByTier.bridge < 3) {
    recommendations.push({
      activity: 'listening',
      priority: 'medium',
      title: 'Try Bridge Content',
      description: 'Your Gateway comprehension is strong! Challenge yourself with Bridge-level content.',
      estimatedMinutes: 20,
    })
  }

  // Priority 4: Low vocabulary logging
  if (stats.wordStats.total < 50 || stats.wordStats.thisWeek < 3) {
    recommendations.push({
      activity: 'vocabulary',
      priority: 'medium',
      title: 'Word Logging',
      description: 'After your next listening session, log 5+ words you heard',
      estimatedMinutes: 5,
    })
  }

  // Priority 5: Alphabet not started/incomplete
  if (stats.letterStats.lettersStarted < stats.letterStats.totalLetters) {
    const remaining = stats.letterStats.totalLetters - stats.letterStats.lettersStarted
    recommendations.push({
      activity: 'alphabet',
      priority: remaining > 15 ? 'high' : 'medium',
      title: 'Learn New Letters',
      description: `${remaining} letters remaining. Learn 3-5 new letters.`,
      estimatedMinutes: 10,
    })
  }

  // Priority 6: Review milestone words
  if (stats.wordStats.milestoneCount > 5) {
    recommendations.push({
      activity: 'review',
      priority: 'low',
      title: 'Vocabulary Review',
      description: `Review your ${stats.wordStats.milestoneCount} milestone words`,
      estimatedMinutes: 10,
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  // Build response
  let response = `## Practice Recommendation\n\n`
  response += `**Available time**: ${minutes} minutes\n\n`

  if (recommendations.length === 0) {
    response += `Great progress! You're doing well across all areas.\n\n`
    response += `**Suggestion**: Continue with your current routine or try:\n`
    response += `- A longer listening session with Native content\n`
    response += `- Review all letters for speed practice\n`
  } else {
    // Top recommendation
    const top = recommendations[0]
    response += `### Primary Focus: ${top.title}\n\n`
    response += `**Priority**: ${top.priority.toUpperCase()}\n`
    response += `**Time**: ~${top.estimatedMinutes} minutes\n\n`
    response += `${top.description}\n\n`

    if (top.specificFocus) {
      response += `**Focus on**: ${top.specificFocus.join(', ')}\n\n`
    }

    // Additional recommendations
    if (recommendations.length > 1) {
      response += `### Also Consider\n\n`
      recommendations.slice(1, 3).forEach(rec => {
        response += `- **${rec.title}** (${rec.priority}): ${rec.description}\n`
      })
    }
  }

  // Encouragement based on streak
  if (stats.currentStreak > 0) {
    response += `\n---\n`
    response += `**Streak**: ${stats.currentStreak} day${stats.currentStreak > 1 ? 's' : ''}! Keep it going! 🔥\n`
  }

  return response
}
