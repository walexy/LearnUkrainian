// learner://profile resource
// Returns a summary of the learner's progress

import { fetchStats, getConfig } from '../api-client.js'

export async function getProfileResource(language?: string): Promise<string> {
  const config = getConfig()
  const lang = language || config.defaultLanguage
  const stats = await fetchStats(lang)

  if (!stats) {
    return `# Language Learner Profile

**Status**: Unable to fetch progress data

Please ensure:
1. The API is accessible at ${config.apiUrl}
2. You have a valid auth token configured
3. You have practiced at least once

Configure your credentials at:
~/.language-learner/config.json
`
  }

  const languageNames: Record<string, string> = {
    uk: 'Ukrainian',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
  }

  const langName = languageNames[lang] || lang.toUpperCase()

  return `# ${langName} Learner Profile

## Alphabet Progress
- **Letters Mastered**: ${stats.letterStats.mastered} / ${stats.letterStats.totalLetters}
- **Letters Started**: ${stats.letterStats.lettersStarted}
- **Overall Accuracy**: ${stats.letterStats.overallAccuracy}%
- **Total Practice Attempts**: ${stats.letterStats.totalAttempts}

## Listening Progress
- **Total Sessions**: ${stats.listeningStats.sessionCount}
- **Total Hours**: ${stats.listeningStats.totalHours}
- **Average Comprehension**: ${stats.listeningStats.avgComprehension}%
- **Hours This Week**: ${stats.listeningStats.recentHours}

### Sessions by Tier
- Gateway (Beginner): ${stats.listeningStats.sessionsByTier.gateway}
- Bridge (Intermediate): ${stats.listeningStats.sessionsByTier.bridge}
- Native (Advanced): ${stats.listeningStats.sessionsByTier.native}

### Tier Readiness
- **Recommended Tier**: ${stats.tierReadiness.recommendedTier || 'Start with Gateway'}
${stats.tierReadiness.gateway.avgComprehension !== null ? `- Gateway Comprehension: ${stats.tierReadiness.gateway.avgComprehension}% ${stats.tierReadiness.gateway.readyForNext ? '✓ Ready for Bridge!' : ''}` : '- Gateway: Need more practice'}
${stats.tierReadiness.bridge.avgComprehension !== null ? `- Bridge Comprehension: ${stats.tierReadiness.bridge.avgComprehension}% ${stats.tierReadiness.bridge.readyForNext ? '✓ Ready for Native!' : ''}` : '- Bridge: Not enough data yet'}

## Vocabulary
- **Words Acquired**: ${stats.wordStats.total}
- **Milestone Words (5+ encounters)**: ${stats.wordStats.milestoneCount}
- **New Words This Week**: ${stats.wordStats.thisWeek}

## Streak
- **Current Streak**: ${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}
`
}
