// learner://weakareas resource
// Returns areas that need practice

import { fetchStats, getConfig } from '../api-client.js'

export async function getWeakAreasResource(language?: string): Promise<string> {
  const config = getConfig()
  const lang = language || config.defaultLanguage
  const stats = await fetchStats(lang)

  if (!stats) {
    return `# Weak Areas

**Status**: Unable to fetch progress data

Configure your credentials at ~/.language-learner/config.json
`
  }

  const languageNames: Record<string, string> = {
    uk: 'Ukrainian',
    es: 'Spanish',
    fr: 'French',
  }

  const langName = languageNames[lang] || lang.toUpperCase()

  let content = `# ${langName} - Areas for Improvement\n\n`

  // Struggling letters
  if (stats.weakAreas.strugglingLetters.length > 0) {
    content += `## Struggling Letters (< 60% accuracy)\n\n`
    content += `These letters need more practice:\n\n`

    stats.weakAreas.strugglingLetters.forEach(letter => {
      content += `- **${letter.letter}** - ${letter.accuracy}% accuracy (${letter.attempts} attempts)\n`
    })

    content += `\n**Suggestion**: Focus on these letters during your next practice session. Consider using mnemonics or word associations.\n\n`
  } else {
    content += `## Alphabet\n\n`
    content += `Great job! No letters are struggling (all practiced letters are above 60% accuracy).\n\n`
  }

  // Listening comprehension
  content += `## Listening Comprehension\n\n`

  if (stats.tierReadiness.recommendedTier === 'gateway') {
    const gatewayComp = stats.tierReadiness.gateway.avgComprehension
    if (gatewayComp !== null && gatewayComp < 70) {
      content += `Your Gateway tier comprehension is at **${gatewayComp}%** (target: 70%).\n\n`
      content += `**Suggestions**:\n`
      content += `- Stick with Gateway content until comprehension improves\n`
      content += `- Try content with subtitles available\n`
      content += `- Re-listen to content you've already heard\n`
      content += `- Focus on podcasts designed for learners\n\n`
    } else {
      content += `Gateway comprehension is on track. Keep practicing!\n\n`
    }
  } else if (stats.tierReadiness.recommendedTier === 'bridge') {
    const bridgeComp = stats.tierReadiness.bridge.avgComprehension
    if (bridgeComp !== null && bridgeComp < 70) {
      content += `Your Bridge tier comprehension is at **${bridgeComp}%** (target: 70%).\n\n`
      content += `**Suggestions**:\n`
      content += `- Mix Bridge content with some Gateway for confidence\n`
      content += `- Watch content with Ukrainian subtitles\n`
      content += `- Try documentaries with clear speech\n\n`
    } else {
      content += `Bridge comprehension is strong! Consider trying Native content.\n\n`
    }
  } else {
    content += `Excellent progress! You're handling Native-level content.\n\n`
  }

  // Vocabulary gaps
  content += `## Vocabulary\n\n`

  if (stats.wordStats.total < 50) {
    content += `You've logged **${stats.wordStats.total}** words. Try to actively log more words you hear during listening sessions.\n\n`
    content += `**Tip**: After each session, note 3-5 words that stood out to you.\n\n`
  } else if (stats.wordStats.thisWeek < 5) {
    content += `Your vocabulary base is good (${stats.wordStats.total} words), but you've only added ${stats.wordStats.thisWeek} new words this week.\n\n`
    content += `**Tip**: Challenge yourself to log at least 5 new words per week.\n\n`
  } else {
    content += `Great vocabulary growth! ${stats.wordStats.thisWeek} new words this week.\n\n`
  }

  // Practice recommendation
  content += `## Recommended Focus\n\n`

  if (stats.weakAreas.strugglingLetters.length > 0) {
    content += `1. **Alphabet practice**: Focus on ${stats.weakAreas.strugglingLetters.map(l => l.letter).join(', ')}\n`
  }

  if (stats.listeningStats.sessionCount < 10) {
    content += `2. **More listening**: Build your ear with more sessions\n`
  }

  if (stats.wordStats.total < 100) {
    content += `3. **Vocabulary logging**: Actively track words you hear\n`
  }

  return content
}
