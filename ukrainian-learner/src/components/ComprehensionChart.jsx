import { useMemo } from 'react'

const tierColors = {
  gateway: '#22c55e', // green-500
  bridge: '#eab308',  // yellow-500
  native: '#a855f7',  // purple-500
}

function ComprehensionChart({ sessions, height = 200 }) {
  // Process sessions into chart data
  const chartData = useMemo(() => {
    if (!sessions || sessions.length === 0) return null

    // Get last 30 sessions with comprehension data
    const validSessions = sessions
      .filter(s => s.comprehension != null)
      .slice(-30)
      .map((s, index) => ({
        ...s,
        index,
        date: new Date(s.date),
      }))

    if (validSessions.length < 2) return null

    // Calculate chart dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = 100 // percentage-based

    // Calculate scales
    const minComp = Math.min(...validSessions.map(s => s.comprehension))
    const maxComp = Math.max(...validSessions.map(s => s.comprehension))
    const yMin = Math.max(0, Math.floor(minComp / 10) * 10 - 10)
    const yMax = Math.min(100, Math.ceil(maxComp / 10) * 10 + 10)

    // Create points for the chart
    const points = validSessions.map((session, i) => {
      const x = padding.left + (i / (validSessions.length - 1)) * (width - padding.left - padding.right)
      const y = padding.top + ((yMax - session.comprehension) / (yMax - yMin)) * (height - padding.top - padding.bottom)
      return { ...session, x, y }
    })

    // Calculate trend line (simple linear regression)
    const n = validSessions.length
    const sumX = validSessions.reduce((sum, _, i) => sum + i, 0)
    const sumY = validSessions.reduce((sum, s) => sum + s.comprehension, 0)
    const sumXY = validSessions.reduce((sum, s, i) => sum + i * s.comprehension, 0)
    const sumX2 = validSessions.reduce((sum, _, i) => sum + i * i, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const trendStart = intercept
    const trendEnd = slope * (n - 1) + intercept

    return {
      points,
      padding,
      yMin,
      yMax,
      trend: { start: trendStart, end: trendEnd, improving: slope > 0.5 },
      sessions: validSessions,
    }
  }, [sessions, height])

  if (!chartData) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Need at least 2 sessions with comprehension data to show chart.
      </div>
    )
  }

  const { points, padding, yMin, yMax, trend } = chartData
  const gridLines = [yMin, Math.round((yMin + yMax) / 2), yMax]

  // Create path string for the line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  // Create area path (for gradient fill)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`

  // Trend line coordinates
  const trendY1 = padding.top + ((yMax - trend.start) / (yMax - yMin)) * (height - padding.top - padding.bottom)
  const trendY2 = padding.top + ((yMax - trend.end) / (yMax - yMin)) * (height - padding.top - padding.bottom)

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="comprehensionGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map(value => {
          const y = padding.top + ((yMax - value) / (yMax - yMin)) * (height - padding.top - padding.bottom)
          return (
            <g key={value}>
              <line
                x1={padding.left}
                y1={y}
                x2={100 - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
              <text
                x={padding.left - 3}
                y={y + 1}
                textAnchor="end"
                className="fill-gray-400"
                style={{ fontSize: '6px' }}
              >
                {value}%
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#comprehensionGradient)" />

        {/* Main line */}
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Trend line */}
        <line
          x1={padding.left}
          y1={trendY1}
          x2={100 - padding.right}
          y2={trendY2}
          stroke={trend.improving ? '#22c55e' : '#f97316'}
          strokeWidth="0.8"
          strokeDasharray="3,2"
          opacity="0.7"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2"
            fill={tierColors[point.contentTier] || '#3b82f6'}
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Gateway</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Bridge</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Native</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 ${trend.improving ? 'text-green-600' : 'text-orange-600'}`}>
          <span>{trend.improving ? '↗' : '↘'}</span>
          <span>Trend</span>
        </div>
      </div>
    </div>
  )
}

export default ComprehensionChart
