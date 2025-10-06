import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FloatingEmojiProps {
  emoji: string
  id: string
  onComplete: (id: string) => void
}

export function FloatingEmoji({ emoji, id, onComplete }: FloatingEmojiProps) {
  const [xOffset] = useState(() => Math.random() * 60 - 30) // Random -30 to 30
  const [delay] = useState(() => Math.random() * 0.2) // Stagger start

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id)
    }, 3000 + delay * 1000)

    return () => clearTimeout(timer)
  }, [id, onComplete, delay])

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 0, 
        x: 0,
        scale: 0.5 
      }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: -150, 
        x: xOffset,
        scale: [0.5, 1.2, 1, 0.8],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ 
        duration: 3,
        delay,
        ease: "easeOut",
        opacity: {
          times: [0, 0.1, 0.8, 1],
          duration: 3
        }
      }}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none text-4xl"
      style={{ zIndex: 1000 }}
    >
      {emoji}
    </motion.div>
  )
}
