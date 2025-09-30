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
  const [isFading, setIsFading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      audioRef.current.loop = true
      
      if (isPlaying) {
        // Start only if not already playing (avoids double-start when playSound handles it)
        if (audioRef.current.paused) {
          audioRef.current.play().then(() => {
            if (audioRef.current) {
              fadeIn(audioRef.current, volume)
            }
          }).catch(err => {
            console.error('Failed to play background sound:', err)
            setIsPlaying(false)
          })
        }
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

  const fadeIn = async (audio: HTMLAudioElement, targetVolume: number) => {
    setIsFading(true)
    const startVol = Math.max(0, Math.min(1, audio.volume))
    const steps = 8
    const diff = Math.max(0, Math.min(1, targetVolume)) - startVol
    for (let i = 0; i <= steps; i++) {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
      fadeTimeoutRef.current = setTimeout(() => {
        audio.volume = Math.max(0, Math.min(1, startVol + (diff * i) / steps))
        if (i === steps) setIsFading(false)
      }, i * 20)
    }
  }

  const fadeOut = async (audio: HTMLAudioElement) => {
    setIsFading(true)
    const currentVol = audio.volume
    const fadeStep = currentVol / 20
    
    for (let i = 20; i >= 0; i--) {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
      fadeTimeoutRef.current = setTimeout(() => {
        audio.volume = Math.max(fadeStep * i, 0)
        if (i === 0) {
          audio.pause()
          setIsFading(false)
        }
      }, (20 - i) * 50)
    }
  }

  const playSound = (sound: BackgroundSound) => {
    const audio = audioRef.current
    setCurrentSound(sound)
    setIsPlaying(true)

    if (audio) {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
      audio.src = sound.url
      audio.loop = true
      // Ensure immediate audibility across devices, then gently ramp to target
      audio.volume = Math.max(0.01, Math.min(1, volume))
      audio.play().then(() => {
        fadeIn(audio, volume)
      }).catch(err => {
        console.error('Failed to play background sound:', err)
        setIsPlaying(false)
      })
    }
  }

  const pauseSound = () => {
    if (audioRef.current && isPlaying) {
      fadeOut(audioRef.current).then(() => {
        setIsPlaying(false)
      })
    } else {
      setIsPlaying(false)
    }
  }

  const stopSound = () => {
    if (audioRef.current && isPlaying) {
      fadeOut(audioRef.current).then(() => {
        setIsPlaying(false)
        setCurrentSound(null)
      })
    } else {
      setIsPlaying(false)
      setCurrentSound(null)
    }
  }

  const changeVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)))
  }

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
  }, [])

  return {
    currentSound,
    isPlaying,
    volume,
    isFading,
    defaultSounds,
    playSound,
    pauseSound,
    stopSound,
    changeVolume
  }
}