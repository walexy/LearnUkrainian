import { Link } from 'react-router-dom'
import useProgressStore from '../stores/useProgressStore'
import useMilestones from '../hooks/useMilestones'
import ProgressBar from '../components/ProgressBar'

function Dashboard() {
  const { getStats, getMasteredCount, getListeningStats, getRecentSessions, resetProgress } = useProgressStore()
  const { getAllMilestones, getUnlockedMilestones, getCelebrationMessage } = useMilestones()

  const cyrillicStats = getStats()
  const listeningStats = getListeningStats()
  const masteredCount = getMasteredCount()
  const recentSessions = getRecentSessions(5)
  const allMilestones = getAllMilestones()
  const unlockedMilestones = getUnlockedMilestones()

  const celebrationMessage = getCelebrationMessage()

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

      {/* Data management */}
      <div className="text-center text-sm text-gray-400">
        <details className="inline-block">
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
  )
}

export default Dashboard
