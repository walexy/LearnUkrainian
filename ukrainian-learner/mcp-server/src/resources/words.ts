// learner://words resource
// Returns vocabulary progress

import { fetchProgress, getConfig } from '../api-client.js'

export async function getWordsResource(language?: string): Promise<string> {
  const config = getConfig()
  const lang = language || config.defaultLanguage
  const progress = await fetchProgress(lang)

  if (!progress) {
    return `# Vocabulary

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
  const words = progress.acquiredWords || []

  let content = `# ${langName} Vocabulary\n\n`
  content += `**Total Words**: ${words.length}\n\n`

  // Milestone words (5+ encounters)
  const milestoneWords = words.filter(w => w.timesEncountered >= 5)
  if (milestoneWords.length > 0) {
    content += `## Milestone Words (5+ encounters)\n\n`
    content += `These words are becoming part of your active vocabulary:\n\n`

    milestoneWords.forEach(word => {
      content += `- **${word.word}**`
      if (word.meaning) content += ` - ${word.meaning}`
      content += ` (${word.timesEncountered}x)\n`
    })
    content += `\n`
  }

  // Recent words
  const recentWords = words.slice(0, 20)
  if (recentWords.length > 0) {
    content += `## Recent Words\n\n`

    recentWords.forEach(word => {
      content += `- **${word.word}**`
      if (word.meaning) content += ` - ${word.meaning}`
      content += ` (${word.timesEncountered}x, ${word.source})\n`
    })
    content += `\n`
  }

  // Words by source
  const bySource: Record<string, typeof words> = {}
  words.forEach(word => {
    const source = word.source || 'unknown'
    if (!bySource[source]) bySource[source] = []
    bySource[source].push(word)
  })

  content += `## Words by Source\n\n`
  Object.entries(bySource).forEach(([source, sourceWords]) => {
    content += `- ${source}: ${sourceWords.length} words\n`
  })

  return content
}
