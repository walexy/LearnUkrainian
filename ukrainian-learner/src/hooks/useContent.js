import { useState, useEffect } from 'react'

const useContent = () => {
  const [contentLibrary, setContentLibrary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/data/content-library.json')
        if (!response.ok) {
          throw new Error('Failed to load content library')
        }
        const data = await response.json()
        setContentLibrary(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Get all content items
  const getContent = () => contentLibrary?.content || []

  // Get content by tier
  const getContentByTier = (tier) => {
    return getContent().filter(c => c.tier === tier)
  }

  // Get content by type
  const getContentByType = (type) => {
    return getContent().filter(c => c.type === type)
  }

  // Get recommended content
  const getRecommended = () => {
    return getContent().filter(c => c.recommended)
  }

  // Get a specific content item by ID
  const getContentById = (id) => {
    return getContent().find(c => c.id === id)
  }

  // Get unique content types
  const getContentTypes = () => {
    const types = new Set(getContent().map(c => c.type))
    return Array.from(types)
  }

  // Get unique tiers
  const getTiers = () => {
    return ['gateway', 'bridge', 'native']
  }

  // Get listening schedule for a phase
  const getSchedule = (phase) => {
    return contentLibrary?.listeningSchedule?.[phase] || null
  }

  // Get metadata
  const getMetadata = () => contentLibrary?.metadata || {}

  // Search content by title or topics
  const searchContent = (query) => {
    const lowerQuery = query.toLowerCase()
    return getContent().filter(c =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.topics?.some(t => t.toLowerCase().includes(lowerQuery)) ||
      c.description?.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    contentLibrary,
    loading,
    error,
    getContent,
    getContentByTier,
    getContentByType,
    getRecommended,
    getContentById,
    getContentTypes,
    getTiers,
    getSchedule,
    getMetadata,
    searchContent,
  }
}

export default useContent
