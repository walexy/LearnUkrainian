import { useState, useEffect } from 'react'

const useInterferencePatterns = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await fetch('/data/interference-patterns.json')
        if (!response.ok) {
          throw new Error('Failed to load interference patterns')
        }
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPatterns()
  }, [])

  // Get all patterns as an array with their keys
  const getPatterns = () => {
    if (!data?.patterns) return []
    return Object.entries(data.patterns).map(([key, pattern]) => ({
      id: key,
      ...pattern,
    }))
  }

  // Get a specific pattern by id
  const getPattern = (patternId) => {
    if (!data?.patterns) return null
    const pattern = data.patterns[patternId]
    return pattern ? { id: patternId, ...pattern } : null
  }

  // Get practical tips
  const getTips = () => data?.practicalTips || []

  // Get useful phrases
  const getPhrases = () => data?.usefulUkrainianPhrases?.phrases || []

  // Get metadata
  const getMetadata = () => data?.metadata || {}

  return {
    data,
    loading,
    error,
    getPatterns,
    getPattern,
    getTips,
    getPhrases,
    getMetadata,
  }
}

export default useInterferencePatterns
