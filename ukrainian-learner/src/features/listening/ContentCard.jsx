const tierColors = {
  gateway: 'bg-green-100 text-green-800 border-green-200',
  bridge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  native: 'bg-purple-100 text-purple-800 border-purple-200',
}

const tierLabels = {
  gateway: 'Gateway',
  bridge: 'Bridge',
  native: 'Native',
}

const typeIcons = {
  podcast: '🎙️',
  video: '📺',
  documentary: '🎬',
  news: '📰',
  tv_series: '📺',
  music: '🎵',
  audiobook: '📚',
  radio: '📻',
  shorts: '📱',
}

const difficultyColors = {
  slow: 'text-green-600',
  moderate: 'text-yellow-600',
  native: 'text-red-600',
  beginner: 'text-green-600',
  intermediate: 'text-yellow-600',
  advanced: 'text-red-600',
}

function ContentCard({ content, onStartSession, onViewDetails, onPrepare, compact = false }) {
  const formatDuration = (seconds) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }

  if (compact) {
    return (
      <div
        onClick={() => onViewDetails?.(content)}
        className="p-4 bg-white rounded-lg border border-gray-200 hover:border-ukrainian-blue hover:shadow-sm transition-all cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{typeIcons[content.type] || '📄'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{content.title}</h3>
              {content.recommended && <span className="text-yellow-500">⭐</span>}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{content.source}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${tierColors[content.tier]}`}>
                {tierLabels[content.tier]}
              </span>
              {content.difficulty?.speed && (
                <span className={`text-xs ${difficultyColors[content.difficulty.speed]}`}>
                  {content.difficulty.speed}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{typeIcons[content.type] || '📄'}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900">{content.title}</h3>
              {content.recommended && <span className="text-yellow-500" title="Recommended">⭐</span>}
            </div>
            <p className="text-sm text-gray-500">{content.source}</p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border ${tierColors[content.tier]}`}>
          {tierLabels[content.tier]}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 mt-4">{content.description}</p>

      {/* Why included */}
      {content.whyIncluded && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          💡 {content.whyIncluded}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
        {content.episodes && (
          <span>{content.episodes} episodes</span>
        )}
        {content.duration && (
          <span>{formatDuration(content.duration)}</span>
        )}
        {content.hasSubtitles && (
          <span className="text-green-600">✓ Subtitles</span>
        )}
        {content.hasTranscript && (
          <span className="text-green-600">✓ Transcript</span>
        )}
      </div>

      {/* Difficulty indicators */}
      {content.difficulty && (
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {content.difficulty.speed && (
            <span className={difficultyColors[content.difficulty.speed]}>
              Speed: {content.difficulty.speed}
            </span>
          )}
          {content.difficulty.vocabulary && (
            <span className={difficultyColors[content.difficulty.vocabulary]}>
              Vocab: {content.difficulty.vocabulary}
            </span>
          )}
          {content.difficulty.accent && (
            <span className="text-gray-500">
              Accent: {content.difficulty.accent}
            </span>
          )}
        </div>
      )}

      {/* Topics */}
      {content.topics && content.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {content.topics.map(topic => (
            <span key={topic} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Start here hint */}
      {content.startHere && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <span className="font-medium text-gray-700">Start here: </span>
          <span className="text-gray-600">{content.startHere}</span>
        </div>
      )}

      {/* Suggested artists (for music) */}
      {content.suggestedArtists && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Artists</h4>
          <div className="space-y-2">
            {content.suggestedArtists.slice(0, 3).map(artist => (
              <div key={artist.name} className="text-sm p-2 bg-gray-50 rounded">
                <span className="font-medium">{artist.name}</span>
                <span className="text-gray-500"> · {artist.genre}</span>
                {artist.startWith && (
                  <span className="text-gray-400"> · Start: "{artist.startWith}"</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {content.url && (
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-sm"
          >
            Open Source ↗
          </a>
        )}
        {onPrepare && (
          <button
            onClick={() => onPrepare(content)}
            className="btn btn-secondary text-sm"
          >
            🎯 Prepare
          </button>
        )}
        <button
          onClick={() => onStartSession?.(content)}
          className="btn btn-primary text-sm"
        >
          Log Session
        </button>
      </div>
    </div>
  )
}

export default ContentCard
