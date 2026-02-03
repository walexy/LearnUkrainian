import { useState, useMemo } from 'react'
import ContentCard from './ContentCard'

const tierOrder = ['gateway', 'bridge', 'native']

const typeLabels = {
  podcast: 'Podcasts',
  video: 'Videos',
  documentary: 'Documentaries',
  news: 'News',
  tv_series: 'TV Series',
  music: 'Music',
  audiobook: 'Audiobooks',
  radio: 'Radio',
  shorts: 'Short-form',
}

function ContentBrowser({ content, onStartSession, onPrepare, initialTierFilter = null, recommendedTier = null }) {
  const [selectedTier, setSelectedTier] = useState(initialTierFilter || 'all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedContent, setSelectedContent] = useState(null)

  // Get unique types from content
  const availableTypes = useMemo(() => {
    const types = new Set(content.map(c => c.type))
    return Array.from(types)
  }, [content])

  // Filter content based on selections
  const filteredContent = useMemo(() => {
    return content.filter(item => {
      // Tier filter
      if (selectedTier !== 'all' && item.tier !== selectedTier) return false

      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(query)
        const matchesDescription = item.description?.toLowerCase().includes(query)
        const matchesTopics = item.topics?.some(t => t.toLowerCase().includes(query))
        const matchesSource = item.source?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription && !matchesTopics && !matchesSource) return false
      }

      return true
    })
  }, [content, selectedTier, selectedType, searchQuery])

  // Group content by tier for display
  const contentByTier = useMemo(() => {
    const grouped = {}
    tierOrder.forEach(tier => {
      grouped[tier] = filteredContent.filter(c => c.tier === tier)
    })
    return grouped
  }, [filteredContent])

  // Count by tier
  const tierCounts = useMemo(() => {
    return {
      all: content.length,
      gateway: content.filter(c => c.tier === 'gateway').length,
      bridge: content.filter(c => c.tier === 'bridge').length,
      native: content.filter(c => c.tier === 'native').length,
    }
  }, [content])

  const handleViewDetails = (item) => {
    setSelectedContent(item)
  }

  const handleCloseDetails = () => {
    setSelectedContent(null)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ukrainian-blue focus:border-transparent"
            />
          </div>

          {/* Tier filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {['all', ...tierOrder].map(tier => {
              const isRecommended = tier === recommendedTier && tier !== 'all'
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors relative ${
                    selectedTier === tier
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${isRecommended && selectedTier !== tier ? 'ring-2 ring-ukrainian-blue ring-offset-1' : ''}`}
                >
                  {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                  <span className="ml-1 text-gray-400">({tierCounts[tier]})</span>
                  {isRecommended && selectedTier !== tier && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-ukrainian-blue rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Type filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedType === 'all'
                ? 'bg-ukrainian-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Types
          </button>
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedType === type
                  ? 'bg-ukrainian-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {typeLabels[type] || type}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {filteredContent.length} item{filteredContent.length !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : ''
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'list' ? 'bg-white shadow-sm' : ''
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Content display */}
      {filteredContent.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No content matches your filters.</p>
          <button
            onClick={() => {
              setSelectedTier('all')
              setSelectedType('all')
              setSearchQuery('')
            }}
            className="mt-4 text-sm text-ukrainian-blue hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        // List view - grouped by tier
        <div className="space-y-8">
          {tierOrder.map(tier => {
            const tierContent = contentByTier[tier]
            if (tierContent.length === 0) return null

            return (
              <div key={tier}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {tier} Content
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({tierContent.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {tierContent.map(item => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      compact
                      onViewDetails={handleViewDetails}
                      onStartSession={onStartSession}
                      onPrepare={onPrepare}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Grid view
        <div className="grid gap-6 md:grid-cols-2">
          {filteredContent.map(item => (
            <ContentCard
              key={item.id}
              content={item}
              onStartSession={onStartSession}
              onPrepare={onPrepare}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedContent.title}</h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              <ContentCard
                content={selectedContent}
                onStartSession={(content) => {
                  handleCloseDetails()
                  onStartSession?.(content)
                }}
                onPrepare={(content) => {
                  handleCloseDetails()
                  onPrepare?.(content)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentBrowser
