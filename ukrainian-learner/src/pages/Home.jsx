import { Link } from 'react-router-dom'
import useProgressStore from '../stores/useProgressStore'
import ProgressBar from '../components/ProgressBar'

function Home() {
  const { getMasteredCount, getStats, getListeningStats } = useProgressStore()
  const stats = getStats()
  const listeningStats = getListeningStats()
  const masteredCount = getMasteredCount()

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Learn Ukrainian
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Master the Cyrillic alphabet through comprehensible input.
          No pressure, no guilt—just progress.
        </p>
      </div>

      {/* Progress overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Progress</h2>
          <Link to="/dashboard" className="text-sm text-ukrainian-blue hover:underline">
            View Dashboard →
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Letters Mastered</span>
              <span className="font-medium">{masteredCount} of 33</span>
            </div>
            <ProgressBar value={masteredCount} max={33} color="blue" showLabel={false} />
          </div>

          <div className="grid grid-cols-4 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-ukrainian-blue">
                {stats.lettersStarted}
              </div>
              <div className="text-xs text-gray-500">Letters Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.overallAccuracy}%
              </div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {listeningStats.totalHours}
              </div>
              <div className="text-xs text-gray-500">Hours Listened</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {stats.currentStreak}
              </div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/cyrillic" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🔤</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-ukrainian-blue transition-colors">
                Cyrillic Trainer
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Learn the Ukrainian alphabet with mnemonics and practice drills.
              </p>
              <div className="mt-3 text-sm font-medium text-ukrainian-blue">
                Start learning →
              </div>
            </div>
          </div>
        </Link>

        <Link to="/listening" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎧</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-ukrainian-blue transition-colors">
                Listening Library
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Curated Ukrainian content for comprehensible input.
              </p>
              <div className="mt-3 text-sm font-medium text-ukrainian-blue">
                Browse content →
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Motivation */}
      {stats.totalAttempts === 0 && listeningStats.sessionCount === 0 && (
        <div className="bg-ukrainian-blue/5 border border-ukrainian-blue/20 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            <span className="font-medium">Tip:</span> Start with the Cyrillic Trainer.
            You can't absorb written input if you're still decoding letters.
          </p>
        </div>
      )}

      {stats.totalAttempts > 0 && stats.totalAttempts < 50 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            <span className="font-medium">Keep going!</span> You've made {stats.totalAttempts} attempts.
            Every practice session rewires your brain a little more.
          </p>
        </div>
      )}

      {masteredCount >= 15 && listeningStats.sessionCount === 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            <span className="font-medium">Ready for input!</span> You've mastered {masteredCount} letters.
            Time to start the Listening Library and get some comprehensible input!
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
