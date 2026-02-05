import { useState } from 'react'
import { Link } from 'react-router-dom'
import useProgressStore from '../stores/useProgressStore'
import useMilestones from '../hooks/useMilestones'
import ProgressBar from '../components/ProgressBar'
import ComprehensionChart from '../components/ComprehensionChart'

const achievementTypes = [
  { id: 'understood_colleague', label: 'Understood a colleague', emoji: '🎉', description: 'First time understanding Ukrainian at work' },
  { id: 'said_dyakuyu', label: 'Said Дякую', emoji: '🙏', description: 'Used Ukrainian to say thank you' },
  { id: 'recognized_word', label: 'Recognized a word', emoji: '💡', description: 'Caught a word I learned while listening' },
  { id: 'conversation', label: 'Had a conversation', emoji: '💬', description: 'Exchanged words in Ukrainian' },
  { id: 'read_sign', label: 'Read something', emoji: '📖', description: 'Read Ukrainian text in the wild' },
  { id: 'other', label: 'Other breakthrough', emoji: '✨', description: 'Another special moment' },
]

function Dashboard() {
  const { getStats, getMasteredCount, getListeningStats, getRecentSessions, listeningSessions, getManualAchievements, logManualAchievement, resetProgress, getWordStats, getMilestoneWords, uiSettings, setUkrainianUILevel } = useProgressStore()
  const { getAllMilestones, getUnlockedMilestones, getCelebrationMessage } = useMilestones()

  const [showAchievementModal, setShowAchievementModal] = useState(false)
  const [selectedAchievementType, setSelectedAchievementType] = useState(null)
  const [achievementNote, setAchievementNote] = useState('')

  const cyrillicStats = getStats()
  const listeningStats = getListeningStats()
  const masteredCount = getMasteredCount()
  const recentSessions = getRecentSessions(5)
  const allMilestones = getAllMilestones()
  const unlockedMilestones = getUnlockedMilestones()
  const manualAchievements = getManualAchievements()
  const wordStats = getWordStats()
  const milestoneWords = getMilestoneWords()

  const celebrationMessage = getCelebrationMessage()

  const handleLogAchievement = () => {
    if (selectedAchievementType) {
      const typeInfo = achievementTypes.find(t => t.id === selectedAchievementType)
      logManualAchievement({
        type: selectedAchievementType,
        emoji: typeInfo?.emoji || '✨',
        label: typeInfo?.label || 'Achievement',
        note: achievementNote,
      })
      setShowAchievementModal(false)
      setSelectedAchievementType(null)
      setAchievementNote('')
    }
  }

  // Calculate overall progress
  const cyrillicProgress = Math.round((masteredCount / 33) * 100)
  const listeningHoursGoal = 100
  const listeningProgress = Math.min(100, Math.round((listeningStats.totalHours / listeningHoursGoal) * 100))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Your Ukrainian learning journey at a glance
        </p>
      </div>

      {/* Celebration message */}
      {celebrationMessage && (cyrillicStats.totalAttempts > 0 || listeningStats.sessionCount > 0) && (
        <div className="bg-gradient-to-r from-ukrainian-blue/10 to-ukrainian-yellow/10 border border-ukrainian-blue/20 rounded-xl p-4 text-center">
          <p className="text-gray-700">{celebrationMessage}</p>
        </div>
      )}

      {/* Main stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Streak */}
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Current Streak</span>
            <span className="text-2xl">🔥</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-orange-500">{cyrillicStats.currentStreak}</span>
            <span className="text-gray-500 ml-1">days</span>
          </div>
        </div>

        {/* Letters Mastered */}
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Letters Mastered</span>
            <span className="text-2xl">🔤</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-ukrainian-blue">{masteredCount}</span>
            <span className="text-gray-500 ml-1">/ 33</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={masteredCount} max={33} showLabel={false} size="sm" />
          </div>
        </div>

        {/* Listening Hours */}
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Listening Time</span>
            <span className="text-2xl">🎧</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-purple-600">{listeningStats.totalHours}</span>
            <span className="text-gray-500 ml-1">hours</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{listeningStats.sessionCount} sessions</p>
        </div>

        {/* Average Comprehension */}
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Avg Comprehension</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="mt-2">
            <span className={`text-3xl font-bold ${
              listeningStats.avgComprehension >= 80 ? 'text-green-600' :
              listeningStats.avgComprehension >= 50 ? 'text-yellow-600' : 'text-orange-600'
            }`}>
              {listeningStats.avgComprehension}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {listeningStats.avgComprehension >= 80 ? 'Excellent!' :
             listeningStats.avgComprehension >= 50 ? 'Making progress' : 'Keep practicing'}
          </p>
        </div>
      </div>

      {/* Word Acquisition Stats */}
      {wordStats.totalWords > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Words Acquired</h2>
            <span className="text-sm text-gray-500">
              {wordStats.totalWords} words tracked
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-ukrainian-blue">{wordStats.totalWords}</div>
              <div className="text-xs text-gray-500">Words</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{wordStats.totalEncounters}</div>
              <div className="text-xs text-gray-500">Encounters</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{milestoneWords.length}</div>
              <div className="text-xs text-gray-500">Milestones</div>
            </div>
          </div>

          {/* Recent words */}
          {wordStats.recentWords.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Words</h3>
              <div className="flex flex-wrap gap-2">
                {wordStats.recentWords.slice(0, 8).map(word => (
                  <span
                    key={word.id}
                    className="px-3 py-1 bg-ukrainian-blue/10 text-ukrainian-blue rounded-full text-sm"
                    title={word.meaning || 'No meaning logged'}
                  >
                    {word.word}
                    {word.timesEncountered > 1 && (
                      <span className="text-ukrainian-blue/60 ml-1">×{word.timesEncountered}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Milestone words */}
          {milestoneWords.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                🎉 Milestone Words (5+ encounters)
              </h3>
              <div className="flex flex-wrap gap-2">
                {milestoneWords.map(word => (
                  <span
                    key={word.id}
                    className="px-3 py-1 bg-gradient-to-r from-ukrainian-blue/20 to-ukrainian-yellow/20 text-gray-800 rounded-full text-sm font-medium"
                    title={`${word.meaning || 'No meaning'} - heard ${word.timesEncountered} times`}
                  >
                    {word.word} ×{word.timesEncountered}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cyrillic Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Cyrillic Progress</h2>
            <Link to="/cyrillic" className="text-sm text-ukrainian-blue hover:underline">
              Practice →
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span className="font-medium">{cyrillicProgress}%</span>
              </div>
              <ProgressBar
                value={masteredCount}
                max={33}
                showLabel={false}
                color={cyrillicProgress >= 80 ? 'green' : cyrillicProgress >= 50 ? 'yellow' : 'blue'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-gray-900">{cyrillicStats.totalAttempts}</div>
                <div className="text-xs text-gray-500">Total Attempts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{cyrillicStats.overallAccuracy}%</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Listening Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Listening Progress</h2>
            <Link to="/listening" className="text-sm text-ukrainian-blue hover:underline">
              Browse Content →
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress to 100 hours</span>
                <span className="font-medium">{listeningProgress}%</span>
              </div>
              <ProgressBar
                value={listeningStats.totalHours}
                max={100}
                showLabel={false}
                color={listeningProgress >= 80 ? 'green' : listeningProgress >= 50 ? 'yellow' : 'blue'}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{listeningStats.sessionsByTier.gateway}</div>
                <div className="text-xs text-gray-500">Gateway</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">{listeningStats.sessionsByTier.bridge}</div>
                <div className="text-xs text-gray-500">Bridge</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{listeningStats.sessionsByTier.native}</div>
                <div className="text-xs text-gray-500">Native</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehension Growth Chart */}
      {listeningStats.sessionCount >= 2 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Comprehension Growth</h2>
            <span className="text-sm text-gray-500">Last {Math.min(30, listeningStats.sessionCount)} sessions</span>
          </div>
          <ComprehensionChart sessions={listeningSessions} />
        </div>
      )}

      {/* Personal Breakthroughs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Personal Breakthroughs</h2>
          <button
            onClick={() => setShowAchievementModal(true)}
            className="btn btn-primary text-sm"
          >
            + Log Moment
          </button>
        </div>

        {manualAchievements.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-3xl mb-2">✨</p>
            <p className="text-sm">Log your first breakthrough moment!</p>
            <p className="text-xs text-gray-400 mt-1">
              Understanding a colleague, saying дякую, recognizing words...
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...manualAchievements].reverse().slice(0, 5).map(achievement => (
              <div key={achievement.id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-ukrainian-blue/5 to-ukrainian-yellow/5 rounded-lg">
                <span className="text-xl">{achievement.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement.label}</div>
                  {achievement.note && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{achievement.note}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(achievement.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Milestones</h2>
          <span className="text-sm text-gray-500">
            {unlockedMilestones.length} / {allMilestones.length} unlocked
          </span>
        </div>

        {allMilestones.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Loading milestones...</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {allMilestones.map(milestone => (
              <div
                key={milestone.id}
                title={milestone.unlocked ? `${milestone.name}: ${milestone.description}` : 'Locked'}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl transition-all ${
                  milestone.unlocked
                    ? 'bg-gradient-to-br from-ukrainian-blue/10 to-ukrainian-yellow/10 border-2 border-ukrainian-blue/30'
                    : 'bg-gray-100 grayscale opacity-40'
                }`}
              >
                {milestone.emoji}
              </div>
            ))}
          </div>
        )}

        {/* Recent unlocks */}
        {unlockedMilestones.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Achievements</h3>
            <div className="space-y-2">
              {unlockedMilestones.slice(-3).reverse().map(milestone => (
                <div key={milestone.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-xl">{milestone.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{milestone.name}</div>
                    <div className="text-xs text-gray-500">{milestone.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-lg mb-4">Recent Listening Sessions</h2>
          <div className="space-y-2">
            {recentSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{session.contentTitle}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(session.date).toLocaleDateString()} · {session.durationMinutes} min
                  </div>
                </div>
                <span className={`font-bold ${
                  session.comprehension >= 80 ? 'text-green-600' :
                  session.comprehension >= 50 ? 'text-yellow-600' : 'text-orange-600'
                }`}>
                  {session.comprehension}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting started hint */}
      {cyrillicStats.totalAttempts === 0 && listeningStats.sessionCount === 0 && (
        <div className="card bg-ukrainian-blue/5 border-ukrainian-blue/20">
          <h2 className="font-semibold text-lg mb-2">Getting Started</h2>
          <p className="text-gray-600 mb-4">
            Start with the Cyrillic Trainer to learn the alphabet. You can't absorb
            written input if you're still decoding letters!
          </p>
          <Link to="/cyrillic" className="btn btn-primary inline-block">
            Start Cyrillic Trainer
          </Link>
        </div>
      )}

      {/* Settings */}
      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Settings</h2>

        {/* Ukrainian UI Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interface Language
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Gradually immerse yourself in Ukrainian by changing the UI language.
          </p>
          <div className="flex gap-2">
            {[
              { value: 'none', label: 'English', description: 'All English' },
              { value: 'labels', label: 'Mixed', description: 'Ukrainian (English)' },
              { value: 'full', label: 'Українська', description: 'All Ukrainian' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setUkrainianUILevel(option.value)}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  (uiSettings?.ukrainianUILevel || 'none') === option.value
                    ? 'border-ukrainian-blue bg-ukrainian-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Tutor Integration */}
        <div className="pt-4 border-t border-gray-100 mb-6">
          <details className="text-sm">
            <summary className="cursor-pointer hover:text-ukrainian-blue font-medium text-gray-700 flex items-center gap-2">
              <span className="text-lg">🤖</span>
              AI Tutor Setup
            </summary>
            <div className="mt-3 p-4 bg-gradient-to-r from-ukrainian-blue/5 to-purple-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                Get personalized AI tutoring based on your progress! Choose your preferred method:
              </p>

              {/* Option 1: Claude.ai Project (Recommended) */}
              <div className="mb-6 p-4 bg-white rounded-lg border-2 border-ukrainian-blue/30">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <span className="bg-ukrainian-blue text-white text-xs px-2 py-0.5 rounded">Recommended</span>
                  Claude.ai Project
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Works on any device, no setup required. Just paste your progress into a Claude conversation.
                </p>
                <button
                  onClick={() => {
                    const stored = localStorage.getItem('ukrainian-learner-progress')
                    if (!stored) {
                      alert('No progress data yet! Practice some letters or log a listening session first.')
                      return
                    }
                    const data = JSON.parse(stored).state

                    // Build a compact summary
                    const letterProgress = data.letterProgress || {}
                    const letters = Object.keys(letterProgress)
                    const mastered = letters.filter(l => {
                      const p = letterProgress[l]
                      return p.total >= 5 && (p.correct / p.total) >= 0.8
                    })
                    const struggling = letters.filter(l => {
                      const p = letterProgress[l]
                      return p.total >= 3 && (p.correct / p.total) < 0.6
                    }).map(l => `${l} (${Math.round((letterProgress[l].correct / letterProgress[l].total) * 100)}%)`)

                    const sessions = data.listeningSessions || []
                    const totalHours = Math.round((data.totalListeningMinutes || 0) / 60 * 10) / 10
                    const byTier = {
                      gateway: sessions.filter(s => s.contentTier === 'gateway'),
                      bridge: sessions.filter(s => s.contentTier === 'bridge'),
                      native: sessions.filter(s => s.contentTier === 'native'),
                    }
                    const avgComp = tier => {
                      const t = byTier[tier].filter(s => s.comprehension != null)
                      return t.length >= 3 ? Math.round(t.reduce((sum, s) => sum + s.comprehension, 0) / t.length) : null
                    }

                    const words = data.acquiredWords || []
                    const milestoneWords = words.filter(w => w.timesEncountered >= 5)

                    // Find stale letters (not practiced in 7+ days)
                    const now = Date.now()
                    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)
                    const staleLetters = letters.filter(l => {
                      const p = letterProgress[l]
                      return p.lastPracticed && new Date(p.lastPracticed).getTime() < sevenDaysAgo
                    })

                    const prompt = `I'm learning Ukrainian using an app grounded in modern second language acquisition research. The app integrates six pedagogical frameworks:

1. **Krashen's Input Hypothesis** - Acquisition through comprehensible input (i+1)
2. **Spaced Repetition** (Ebbinghaus) - Optimal timing for review
3. **Cognitive Load Theory** - Managing mental effort for effective learning
4. **Zone of Proximal Development** (Vygotsky) - Scaffolding just beyond current ability
5. **Desirable Difficulties** - Strategic challenges that enhance retention
6. **Self-Determination Theory** - Intrinsic motivation through autonomy and competence

Here's my current progress:

**Cyrillic Letters:**
- Mastered (≥80% accuracy): ${mastered.length}/33 letters${mastered.length > 0 ? ` (${mastered.join(', ')})` : ''}
- Struggling (<60% accuracy): ${struggling.length > 0 ? struggling.join(', ') : 'None yet'}
- Stale (not practiced in 7+ days): ${staleLetters.length > 0 ? staleLetters.join(', ') : 'None'}

**Listening:**
- Total time: ${totalHours} hours across ${sessions.length} sessions
- Gateway (beginner): ${byTier.gateway.length} sessions${avgComp('gateway') ? `, avg ${avgComp('gateway')}% comprehension` : ''}
- Bridge (intermediate): ${byTier.bridge.length} sessions${avgComp('bridge') ? `, avg ${avgComp('bridge')}% comprehension` : ''}
- Native: ${byTier.native.length} sessions${avgComp('native') ? `, avg ${avgComp('native')}% comprehension` : ''}

**Vocabulary:**
- Words encountered: ${words.length}
- Milestone words (5+ exposures): ${milestoneWords.length}${milestoneWords.length > 0 ? ` - ${milestoneWords.slice(0, 5).map(w => w.word).join(', ')}${milestoneWords.length > 5 ? '...' : ''}` : ''}

**Streak:** ${data.currentStreak || 0} days

Based on this, what should I focus on today? Apply all six frameworks:
- Prioritize stale items (spaced repetition) and struggling letters
- Use desirable difficulties (retrieval practice, interleaving, varied context)
- Manage cognitive load (don't overwhelm, connect to existing knowledge)
- Offer choices, not assignments (autonomy)
- Celebrate progress, never guilt about what I haven't done`

                    navigator.clipboard.writeText(prompt)
                    alert('Progress summary copied! Paste it into a new Claude.ai conversation.')
                  }}
                  className="btn btn-primary text-sm w-full"
                >
                  Copy Progress for Claude.ai
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Paste this into <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-ukrainian-blue hover:underline">claude.ai</a> to start a tutoring session
                </p>
              </div>

              {/* Option 2: MCP Server (Advanced) */}
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  Advanced: Claude Desktop MCP Server
                </summary>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                  <p className="text-gray-600">
                    For automatic integration with Claude Desktop (requires local setup):
                  </p>

                  <div>
                    <p className="font-medium text-gray-700 mb-1">1. Add to Claude Desktop config:</p>
                    <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-x-auto">
{`"learn-ukrainian": {
  "command": "npx",
  "args": ["-y", "learn-ukrainian-mcp"]
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-1">2. Export progress file:</p>
                    <button
                      onClick={() => {
                        const stored = localStorage.getItem('ukrainian-learner-progress')
                        if (!stored) {
                          alert('No progress data to export yet!')
                          return
                        }
                        const data = JSON.parse(stored)
                        const blob = new Blob([JSON.stringify(data.state, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'progress.json'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="btn btn-secondary text-xs"
                    >
                      Download progress.json
                    </button>
                    <p className="text-gray-500 mt-1">
                      Save to <code className="bg-gray-200 px-1 rounded">~/.language-learner/progress.json</code>
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </details>
        </div>

        {/* Data management */}
        <div className="pt-4 border-t border-gray-100">
          <details className="text-sm text-gray-400">
            <summary className="cursor-pointer hover:text-gray-600">Data Management</summary>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-gray-600 mb-3">
                Your progress is stored locally in your browser.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
                    resetProgress()
                  }
                }}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Reset All Progress
              </button>
            </div>
          </details>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="text-center text-sm text-gray-400">
        <details className="inline-block hidden">
          <summary className="cursor-pointer hover:text-gray-600">Data Management (Legacy)</summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-gray-600 mb-3">
              Moved to Settings above.
            </p>
          </div>
        </details>
      </div>

      {/* Achievement logging modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Log a Breakthrough</h2>
                <button
                  onClick={() => {
                    setShowAchievementModal(false)
                    setSelectedAchievementType(null)
                    setAchievementNote('')
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                What moment would you like to celebrate?
              </p>

              <div className="space-y-2 mb-4">
                {achievementTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedAchievementType(type.id)}
                    className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                      selectedAchievementType === type.id
                        ? 'bg-ukrainian-blue/10 border-2 border-ukrainian-blue'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    <div>
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedAchievementType && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a note (optional)
                  </label>
                  <textarea
                    value={achievementNote}
                    onChange={(e) => setAchievementNote(e.target.value)}
                    placeholder="What made this moment special?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAchievementModal(false)
                    setSelectedAchievementType(null)
                    setAchievementNote('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogAchievement}
                  disabled={!selectedAchievementType}
                  className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Log Moment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
