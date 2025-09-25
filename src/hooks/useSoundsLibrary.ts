import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface SoundLibrary {
  id: string
  name: string
  description: string | null
  file_url: string
  category: string
  duration: number | null
  created_at: string
  updated_at: string
}

export interface ChapterSound {
  id: string
  chapter_id: string
  sound_id: string
  volume: number
  loop_sound: boolean
  created_at: string
  sound?: SoundLibrary
}

export function useSoundsLibrary() {
  const [sounds, setSounds] = useState<SoundLibrary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSounds = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sounds_library')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setSounds(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sounds')
    } finally {
      setLoading(false)
    }
  }

  const getChapterSounds = async (chapterId: string) => {
    try {
      const { data, error } = await supabase
        .from('chapter_sounds')
        .select(`
          *,
          sounds_library!inner(*)
        `)
        .eq('chapter_id', chapterId)

      if (error) throw error
      
      // Transform the data to match our interface
      return (data || []).map((item: any) => ({
        ...item,
        sound: item.sounds_library
      }))
    } catch (err) {
      console.error('Failed to fetch chapter sounds:', err)
      return []
    }
  }

  const assignSoundToChapter = async (chapterId: string, soundId: string, volume = 0.5, loopSound = true) => {
    try {
      const { data, error } = await supabase
        .from('chapter_sounds')
        .upsert({
          chapter_id: chapterId,
          sound_id: soundId,
          volume,
          loop_sound: loopSound
        })
        .select()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Failed to assign sound to chapter:', err)
      throw err
    }
  }

  const removeSoundFromChapter = async (chapterId: string, soundId: string) => {
    try {
      const { error } = await supabase
        .from('chapter_sounds')
        .delete()
        .eq('chapter_id', chapterId)
        .eq('sound_id', soundId)

      if (error) throw error
    } catch (err) {
      console.error('Failed to remove sound from chapter:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchSounds()
  }, [])

  return {
    sounds,
    loading,
    error,
    fetchSounds,
    getChapterSounds,
    assignSoundToChapter,
    removeSoundFromChapter
  }
}