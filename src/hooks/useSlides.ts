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
      // Split text into sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const slides = []
      let currentSlide = ''
      let slideOrder = 1

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim()
        if (!trimmedSentence) continue

        const testSlide = currentSlide + (currentSlide ? '. ' : '') + trimmedSentence + '.'
        const wordCount = testSlide.split(/\s+/).length

        if (wordCount <= wordLimit) {
          currentSlide = testSlide
        } else {
          // Save current slide if it has content
          if (currentSlide) {
            slides.push({
              chapter_id: chapterId,
              order_number: slideOrder++,
              content: currentSlide
            })
          }
          // Start new slide with current sentence
          currentSlide = trimmedSentence + '.'
        }
      }

      // Add the last slide if it has content
      if (currentSlide) {
        slides.push({
          chapter_id: chapterId,
          order_number: slideOrder,
          content: currentSlide
        })
      }

      // Delete existing slides for this chapter
      await supabase
        .from('slides')
        .delete()
        .eq('chapter_id', chapterId)

      // Insert new slides
      const { error: insertError } = await supabase
        .from('slides')
        .insert(slides)

      if (insertError) throw insertError

      // Update chapter slide count
      await supabase
        .from('chapters')
        .update({ 
          slide_count: slides.length,
          word_count: text.split(/\s+/).length
        })
        .eq('id', chapterId)

      await fetchSlides()
      return { success: true, slideCount: slides.length, slides }
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