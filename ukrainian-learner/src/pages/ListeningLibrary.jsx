import { useState } from 'react'
import useContent from '../hooks/useContent'
import useProgressStore from '../stores/useProgressStore'
import ContentBrowser from '../features/listening/ContentBrowser'
import SessionLogger from '../features/listening/SessionLogger'
import ProgressBar from '../components/ProgressBar'

const tabs = [
  { id: 'browse', label: 'Browse', icon: '📚' },
  { id: 'log', label: 'Log Session', icon: '✍️' },
  { id: 'history', label: 'History', icon: '📊' },
]

const tierLabels = {
  gateway: 'Gateway',
  bridge: 'Bridge',
  native: 'Native',
}

const tierColors = {
  gateway: 'green',
  bridge: 'yellow',
  native: 'purple',
}

function ListeningLibrary() {
  const { loading, error, getContent, getSchedule } = useContent()
  const { recordListeningSession, getListeningStats, getRecentSessions, getTierReadiness } = useProgressStore()

  const [activeTab, setActiveTab] = useState('browse')
  const [selectedContent, setSelectedContent] = useState(null)
  const [selectedTierFilter, setSelectedTierFilter] = useState(null)

  const content = getContent()
  const stats = getListeningStats()
  const recentSessions = getRecentSessions(10)
  const tierReadiness = getTierReadiness()

  const handleStartSession = (contentItem) => {
    setSelectedContent(contentItem)
    setActiveTab('log')
  }

  const handleSaveSession = (session) => {
    recordListeningSession(session)
    setSelectedContent(null)
    setActiveTab('history')
  }

  const handleCancelSession = () => {
    setSelectedContent(null)
    setActiveTab('browse')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading content library...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Content</h2>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Listening Library</h1>
        <p className="text-gray-600 mt-1">
          Comprehensible input is where acquisition happens
        </p>
      </div>

      {/* Quick stats */}
      <div className="card">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-ukrainian-blue">{stats.totalHours}</div>
            <div className="text-xs text-gray-500">Hours Listened</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sessionCount}</div>
            <div className="text-xs text-gray-500">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.avgComprehension}%</div>
            <div className="text-xs text-gray-500">Avg. Comprehension</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.recentHours}</div>
            <div className="text-xs text-gray-500">Hours This Week</div>
          </div>
        </div>

        {/* Progress to milestones */}
        {stats.totalHours < 50 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500 mb-2">
              Progress to 50 hours ({Math.round((stats.totalHours / 50) * 100)}%)
            </div>
            <ProgressBar value={stats.totalHours} max={50} showLabel={false} color="blue" />
          </div>
        )}
      </div>

      {/* Tier readiness banner */}
      {tierReadiness.gateway.readyForNext && !tierReadiness.bridge.readyForNext && stats.sessionsByTier.bridge < 3 && (
        <div className="card bg-gradient-to-r from-green-50 to-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚀</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Ready for Bridge Content!</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your Gateway comprehension is strong at {tierReadiness.gateway.avgComprehension}%.
                Time to challenge yourself with Bridge-level content!
              </p>
              <button
                onClick={() => {
                  setSelectedTierFilter('bridge')
                  setActiveTab('browse')
                }}
                className="mt-3 text-sm font-medium text-yellow-700 hover:text-yellow-800"
              >
                Browse Bridge Content →
              </button>
            </div>
          </div>
        </div>
      )}

      {tierReadiness.bridge.readyForNext && stats.sessionsByTier.native < 3 && (
        <div className="card bg-gradient-to-r from-yellow-50 to-purple-50 border-l-4 border-purple-400">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Ready for Native Content!</h3>
              <p className="text-sm text-gray-600 mt-1">
                Impressive! Your Bridge comprehension is at {tierReadiness.bridge.avgComprehension}%.
                You're ready for authentic native-speed content!
              </p>
              <button
                onClick={() => {
                  setSelectedTierFilter('native')
                  setActiveTab('browse')
                }}
                className="mt-3 text-sm font-medium text-purple-700 hover:text-purple-800"
              >
                Browse Native Content →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier progress summary (for users not yet ready) */}
      {stats.sessionCount > 0 && tierReadiness.gateway.avgComprehension !== null && tierReadiness.gateway.avgComprehension < 70 && (
        <div className="card bg-blue-50 border-l-4 border-blue-400">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💪</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Building Your Foundation</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gateway comprehension: {tierReadiness.gateway.avgComprehension}% (target: 70% to unlock Bridge).
                Keep listening! Every session strengthens your understanding.
              </p>
              <div className="mt-3">
                <ProgressBar
                  value={tierReadiness.gateway.avgComprehension}
                  max={70}
                  showLabel={false}
                  color="blue"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'browse' && (
          <ContentBrowser
            content={content}
            onStartSession={handleStartSession}
            initialTierFilter={selectedTierFilter}
            recommendedTier={tierReadiness.recommendedTier}
          />
        )}

        {activeTab === 'log' && (
          <SessionLogger
            content={selectedContent}
            onSave={handleSaveSession}
            onCancel={handleCancelSession}
          />
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Tier breakdown */}
            <div className="card">
              <h3 className="font-semibold mb-4">Sessions by Content Tier</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-700">Gateway</span>
                    <span className="text-gray-500">{stats.sessionsByTier.gateway} sessions</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${stats.sessionCount > 0 ? (stats.sessionsByTier.gateway / stats.sessionCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yellow-700">Bridge</span>
                    <span className="text-gray-500">{stats.sessionsByTier.bridge} sessions</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-yellow-500 rounded-full"
                      style={{ width: `${stats.sessionCount > 0 ? (stats.sessionsByTier.bridge / stats.sessionCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-700">Native</span>
                    <span className="text-gray-500">{stats.sessionsByTier.native} sessions</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-purple-500 rounded-full"
                      style={{ width: `${stats.sessionCount > 0 ? (stats.sessionsByTier.native / stats.sessionCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent sessions */}
            <div className="card">
              <h3 className="font-semibold mb-4">Recent Sessions</h3>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No listening sessions yet.</p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-2 text-ukrainian-blue hover:underline"
                  >
                    Browse content to get started
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map(session => (
                    <div key={session.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{session.contentTitle}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString()} · {session.durationMinutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${
                            session.comprehension >= 80 ? 'text-green-600' :
                            session.comprehension >= 50 ? 'text-yellow-600' : 'text-orange-600'
                          }`}>
                            {session.comprehension}%
                          </span>
                          <p className="text-xs text-gray-400">comprehension</p>
                        </div>
                      </div>
                      {session.notes && (
                        <p className="mt-2 text-sm text-gray-600 italic">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListeningLibrary
