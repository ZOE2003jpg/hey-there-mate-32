import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Slide {
  id: string
  chapter_id: string
  slide_number: number
  content: string
  background_image_url: string | null
  created_at: string
}

export function useSlides(chapterId?: string) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSlides = async () => {
    if (!chapterId) {
      setSlides([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('slide_number', { ascending: true })

      if (error) throw error
      setSlides(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch slides')
    } finally {
      setLoading(false)
    }
  }

  const getSlidesWithAds = async (chapterId: string, readerId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-slides-with-ads', {
        body: { chapterId, readerId }
      })
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Failed to get slides with ads:', err)
      return { slides: [], totalSlides: 0, adsInserted: 0 }
    }
  }

  const splitChapterToSlides = async (chapterId: string, text: string, wordLimit = 400) => {
    try {
      const { data, error } = await supabase.functions.invoke('split-chapter', {
        body: { chapterId, text, wordLimit }
      })
      
      if (error) throw error
      await fetchSlides()
      return data
    } catch (err) {
      console.error('Failed to split chapter:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [chapterId])

  return {
    slides,
    loading,
    error,
    fetchSlides,
    getSlidesWithAds,
    splitChapterToSlides
  }
}