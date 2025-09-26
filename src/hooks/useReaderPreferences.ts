import { useState, useEffect } from 'react'

export interface ReaderPreferences {
  fontSize: number
  fontFamily: 'serif' | 'sans-serif'
  volume: number
  darkMode: boolean
}

const defaultPreferences: ReaderPreferences = {
  fontSize: 16,
  fontFamily: 'serif',
  volume: 0.5,
  darkMode: false
}

export function useReaderPreferences() {
  const [preferences, setPreferences] = useState<ReaderPreferences>(defaultPreferences)

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('readerPreferences')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setPreferences({ ...defaultPreferences, ...parsed })
        } catch (error) {
          console.error('Failed to parse reader preferences:', error)
        }
      }
    }
  }, [])

  // Save preferences to localStorage whenever they change
  const updatePreferences = (updates: Partial<ReaderPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('readerPreferences', JSON.stringify(newPreferences))
    }
  }

  return {
    preferences,
    updatePreferences
  }
}