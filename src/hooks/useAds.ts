import { useState, useEffect } from 'react'

// Mock ads since ads table doesn't exist in database
export interface Ad {
  id: string
  video_url: string
  start_date: string
  end_date: string
  impressions: number
  clicks: number
  created_at: string
  status?: string
}

const mockAds: Ad[] = [
  {
    id: '1',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    impressions: 1000,
    clicks: 50,
    created_at: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '2',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    impressions: 800,
    clicks: 40,
    created_at: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '3',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    impressions: 1200,
    clicks: 60,
    created_at: new Date().toISOString(),
    status: 'active'
  }
]

export function useAds() {
  const [ads, setAds] = useState<Ad[]>(mockAds)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAds = async () => {
    // Mock fetch
    setLoading(true)
    setTimeout(() => {
      setAds(mockAds)
      setLoading(false)
    }, 500)
  }

  const createAd = async (adData: {
    video_url: string
    start_date: string
    end_date: string
  }) => {
    try {
      // Mock create
      const newAd: Ad = {
        id: Date.now().toString(),
        ...adData,
        impressions: 0,
        clicks: 0,
        created_at: new Date().toISOString(),
        status: 'active'
      }
      setAds(prev => [newAd, ...prev])
      return newAd
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ad')
      throw err
    }
  }

  const updateAd = async (id: string, updates: Partial<Ad>) => {
    try {
      // Mock update
      setAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updates } : ad))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ad')
      throw err
    }
  }

  const deleteAd = async (id: string) => {
    try {
      // Mock delete
      setAds(prev => prev.filter(ad => ad.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ad')
      throw err
    }
  }

  const incrementImpressions = async (id: string) => {
    try {
      // Mock increment
      setAds(prev => prev.map(ad => 
        ad.id === id ? { ...ad, impressions: ad.impressions + 1 } : ad
      ))
    } catch (err) {
      console.error('Failed to increment impressions:', err)
    }
  }

  const incrementClicks = async (id: string) => {
    try {
      // Mock increment
      setAds(prev => prev.map(ad => 
        ad.id === id ? { ...ad, clicks: ad.clicks + 1 } : ad
      ))
    } catch (err) {
      console.error('Failed to increment clicks:', err)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  return {
    ads,
    loading,
    error,
    fetchAds,
    createAd,
    updateAd,
    deleteAd,
    incrementImpressions,
    incrementClicks
  }
}