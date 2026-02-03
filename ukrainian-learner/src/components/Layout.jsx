import { Link, useLocation } from 'react-router-dom'
import useProgressStore from '../stores/useProgressStore'
import { t } from '../utils/i18n'

function Layout({ children }) {
  const location = useLocation()
  const { getMasteredCount, getStats, getListeningStats, uiSettings } = useProgressStore()
  const stats = getStats()
  const listeningStats = getListeningStats()
  const uiLevel = uiSettings?.ukrainianUILevel || 'none'

  const navItems = [
    { path: '/', labelKey: 'nav.home', icon: '🏠' },
    { path: '/cyrillic', labelKey: 'nav.cyrillic', icon: '🔤' },
    { path: '/listening', labelKey: 'nav.listening', icon: '🎧' },
    { path: '/colleague', labelKey: 'nav.colleague', icon: '🤝' },
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: '📊' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🇺🇦</span>
              <span className="font-semibold text-lg hidden sm:inline">Learn Ukrainian</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    location.pathname === item.path
                      ? 'bg-ukrainian-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="sm:hidden">{item.icon}</span>
                  <span className="hidden sm:inline">{t(item.labelKey, uiLevel)}</span>
                </Link>
              ))}
            </nav>

            {/* Quick stats */}
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-orange-500" title="Day streak">
                  <span>🔥</span>
                  <span className="font-medium">{stats.currentStreak}</span>
                </div>
              )}
              <div className="text-gray-500 hidden sm:block" title="Letters mastered">
                <span className="font-medium text-gray-700">{getMasteredCount()}</span>
                <span>/33</span>
              </div>
              {listeningStats.totalHours > 0 && (
                <div className="text-purple-600 hidden md:block" title="Hours listened">
                  <span className="font-medium">{listeningStats.totalHours}h</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          Ready when you are
        </div>
      </footer>
    </div>
  )
}

export default Layout
