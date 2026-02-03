// generate_conversation_context tool
// Returns full learner context for AI tutoring

import { fetchStats, fetchProgress, getConfig, StatsData, ProgressData } from '../api-client.js'

type FocusArea = 'alphabet' | 'listening' | 'vocabulary' | 'all'

export async function generateConversationContext(
  language?: string,
  focusArea: FocusArea = 'all'
): Promise<string> {
  const config = getConfig()
  const lang = language || config.defaultLanguage

  const [stats, progress] = await Promise.all([
    fetchStats(lang),
    fetchProgress(lang),
  ])

  if (!stats || !progress) {
    return `Unable to fetch learner data. Please check API configuration.`
  }

  const languageNames: Record<string, string> = {
    uk: 'Ukrainian',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
  }

  const langName = languageNames[lang] || lang.toUpperCase()

  let context = `## ${langName} Learning Context\n\n`

  // Always include summary
  context += `**Quick Summary**: ${stats.letterStats.mastered}/${stats.letterStats.totalLetters} letters mastered, `
  context += `${stats.listeningStats.totalHours} hours listened, `
  context += `${stats.wordStats.total} words acquired, `
  context += `${stats.currentStreak} day streak\n\n`

  // Alphabet section
  if (focusArea === 'all' || focusArea === 'alphabet') {
    context += `### Alphabet Status\n\n`
    context += `- Mastered: ${stats.letterStats.mastered}/${stats.letterStats.totalLetters} letters\n`
    context += `- Overall accuracy: ${stats.letterStats.overallAccuracy}%\n`

    if (stats.weakAreas.strugglingLetters.length > 0) {
      context += `- **Struggling letters**: ${stats.weakAreas.strugglingLetters.map(l => `${l.letter} (${l.accuracy}%)`).join(', ')}\n`
      context += `\n**Teaching opportunity**: These letters need focused practice. Consider word pairs or mnemonics.\n`
    } else if (stats.letterStats.lettersStarted < stats.letterStats.totalLetters) {
      context += `- Not yet started: ${stats.letterStats.totalLetters - stats.letterStats.lettersStarted} letters\n`
    }
    context += `\n`
  }

  // Listening section
  if (focusArea === 'all' || focusArea === 'listening') {
    context += `### Listening Status\n\n`
    context += `- Total hours: ${stats.listeningStats.totalHours}\n`
    context += `- Sessions: ${stats.listeningStats.sessionCount}\n`
    context += `- Average comprehension: ${stats.listeningStats.avgComprehension}%\n`
    context += `- Recommended tier: ${stats.tierReadiness.recommendedTier || 'Gateway'}\n`

    if (stats.tierReadiness.gateway.readyForNext && !stats.tierReadiness.bridge.readyForNext) {
      context += `\n**Teaching opportunity**: Ready to advance from Gateway to Bridge content!\n`
    } else if (stats.tierReadiness.bridge.readyForNext) {
      context += `\n**Teaching opportunity**: Ready for Native-level content!\n`
    } else if (stats.listeningStats.avgComprehension < 50) {
      context += `\n**Teaching opportunity**: Comprehension is low. Suggest easier content or re-listening.\n`
    }
    context += `\n`
  }

  // Vocabulary section
  if (focusArea === 'all' || focusArea === 'vocabulary') {
    context += `### Vocabulary Status\n\n`
    context += `- Total words: ${stats.wordStats.total}\n`
    context += `- Milestone words (5+): ${stats.wordStats.milestoneCount}\n`
    context += `- New this week: ${stats.wordStats.thisWeek}\n`

    if (stats.wordStats.recentWords.length > 0) {
      context += `\n**Recent words**: ${stats.wordStats.recentWords.slice(0, 5).map(w => w.word).join(', ')}\n`
    }

    if (stats.wordStats.milestoneWords.length > 0) {
      context += `**Milestone words to reinforce**: ${stats.wordStats.milestoneWords.slice(0, 5).map(w => w.word).join(', ')}\n`
    }
    context += `\n`
  }

  // Tutoring guidance
  context += `### Tutoring Guidance\n\n`

  if (stats.currentStreak > 7) {
    context += `- Learner has a ${stats.currentStreak}-day streak - acknowledge consistency!\n`
  }

  if (stats.letterStats.mastered < 10) {
    context += `- Still early in alphabet learning - keep encouragement high\n`
  }

  if (stats.listeningStats.sessionCount > 20 && stats.letterStats.mastered < 15) {
    context += `- Heavy listener but light on alphabet - might benefit from reading practice\n`
  }

  if (stats.letterStats.mastered > 20 && stats.listeningStats.sessionCount < 5) {
    context += `- Good alphabet progress but limited listening - encourage more input\n`
  }

  return context
}
