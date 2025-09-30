// LocalStorage utility functions for VineNovel

export interface StoredProgress {
  storyId: string
  chapterId: string
  slideId?: string
  slideIndex: number
  lastReadAt: string
}

export interface StoredStory {
  id: string
  title: string
  cover_image_url?: string
  genre?: string
  cached_at: string
}

// Story list management
export const getStoredStories = (): StoredStory[] => {
  try {
    const stored = localStorage.getItem('vinenovel_stories')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load stories from localStorage:', error)
    return []
  }
}

export const setStoredStories = (stories: any[]): void => {
  try {
    const storiesData: StoredStory[] = stories.map(s => ({
      id: s.id,
      title: s.title,
      cover_image_url: s.cover_image_url,
      genre: s.genre,
      cached_at: new Date().toISOString()
    }))
    localStorage.setItem('vinenovel_stories', JSON.stringify(storiesData))
  } catch (error) {
    console.error('Failed to save stories to localStorage:', error)
  }
}

export const appendStoredStories = (newStories: any[]): void => {
  try {
    const existing = getStoredStories()
    const existingIds = new Set(existing.map(s => s.id))
    const toAdd = newStories.filter(s => !existingIds.has(s.id))
    
    if (toAdd.length > 0) {
      const updated = [...existing, ...toAdd.map(s => ({
        id: s.id,
        title: s.title,
        cover_image_url: s.cover_image_url,
        genre: s.genre,
        cached_at: new Date().toISOString()
      }))]
      localStorage.setItem('vinenovel_stories', JSON.stringify(updated))
    }
  } catch (error) {
    console.error('Failed to append stories to localStorage:', error)
  }
}

// Reading progress management
export const getReadingProgress = (storyId: string): StoredProgress | null => {
  try {
    const stored = localStorage.getItem(`vinenovel_progress_${storyId}`)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Failed to load progress from localStorage:', error)
    return null
  }
}

export const setReadingProgress = (progress: StoredProgress): void => {
  try {
    localStorage.setItem(
      `vinenovel_progress_${progress.storyId}`,
      JSON.stringify({ ...progress, lastReadAt: new Date().toISOString() })
    )
  } catch (error) {
    console.error('Failed to save progress to localStorage:', error)
  }
}

export const getAllReadingProgress = (): Record<string, StoredProgress> => {
  try {
    const progress: Record<string, StoredProgress> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('vinenovel_progress_')) {
        const storyId = key.replace('vinenovel_progress_', '')
        const stored = localStorage.getItem(key)
        if (stored) {
          progress[storyId] = JSON.parse(stored)
        }
      }
    }
    return progress
  } catch (error) {
    console.error('Failed to load all progress from localStorage:', error)
    return {}
  }
}

// Tutorial state management
export const getTutorialSeen = (): boolean => {
  try {
    return localStorage.getItem('vinenovel_tutorial_seen') === 'true'
  } catch (error) {
    console.error('Failed to load tutorial state from localStorage:', error)
    return false
  }
}

export const setTutorialSeen = (seen: boolean): void => {
  try {
    localStorage.setItem('vinenovel_tutorial_seen', seen.toString())
  } catch (error) {
    console.error('Failed to save tutorial state to localStorage:', error)
  }
}
