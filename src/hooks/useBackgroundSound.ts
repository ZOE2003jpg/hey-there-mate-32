import { useState, useEffect, useRef } from 'react'

export interface BackgroundSound {
  id: string
  name: string
  url: string
  volume: number
}

export function useBackgroundSound() {
  const [currentSound, setCurrentSound] = useState<BackgroundSound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Default background sounds
  const defaultSounds: BackgroundSound[] = [
    {
      id: 'rain',
      name: 'Rain',
      url: 'https://www.soundjay.com/misc/sounds-1222.mp3', // Example URL
      volume: 0.3
    },
    {
      id: 'forest',
      name: 'Forest',
      url: 'https://www.soundjay.com/nature/sounds-1235.mp3', // Example URL
      volume: 0.3
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      url: 'https://www.soundjay.com/nature/sounds-1245.mp3', // Example URL
      volume: 0.3
    }
  ]

  useEffect(() => {
    if (currentSound && audioRef.current) {
      audioRef.current.src = currentSound.url
      audioRef.current.volume = volume
      audioRef.current.loop = true
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Failed to play background sound:', err)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [currentSound, isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio()
    audioRef.current.preload = 'auto'
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playSound = (sound: BackgroundSound) => {
    setCurrentSound(sound)
    setIsPlaying(true)
  }

  const pauseSound = () => {
    setIsPlaying(false)
  }

  const stopSound = () => {
    setIsPlaying(false)
    setCurrentSound(null)
  }

  const changeVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)))
  }

  return {
    currentSound,
    isPlaying,
    volume,
    defaultSounds,
    playSound,
    pauseSound,
    stopSound,
    changeVolume
  }
}