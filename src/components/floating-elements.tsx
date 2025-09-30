import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface FloatingElement {
  id: number
  type: "sparkle" | "petal" | "dragon" | "phoenix"
  x: number
  delay: number
  duration: number
}

export function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    // Generate floating elements
    const newElements: FloatingElement[] = []
    
    // Sparkles (more frequent)
    for (let i = 0; i < 8; i++) {
      newElements.push({
        id: i,
        type: "sparkle",
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 10
      })
    }
    
    // Sakura petals
    for (let i = 0; i < 12; i++) {
      newElements.push({
        id: i + 20,
        type: "petal",
        x: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 20 + Math.random() * 15
      })
    }
    
    // Occasional dragon
    newElements.push({
      id: 100,
      type: "dragon",
      x: -10,
      delay: 5,
      duration: 40
    })
    
    // Occasional phoenix
    newElements.push({
      id: 101,
      type: "phoenix",
      x: -10,
      delay: 25,
      duration: 45
    })
    
    setElements(newElements)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {elements.map((element) => {
        if (element.type === "sparkle") {
          return (
            <motion.div
              key={element.id}
              className="absolute"
              initial={{ 
                x: `${element.x}vw`, 
                y: "110vh",
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                x: `${element.x + (Math.random() - 0.5) * 20}vw`,
                y: "-10vh",
                opacity: [0, 0.8, 0.8, 0],
                scale: [0, 1, 1, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: element.duration,
                delay: element.delay,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="h-4 w-4 text-primary/40" />
            </motion.div>
          )
        }
        
        if (element.type === "petal") {
          return (
            <motion.div
              key={element.id}
              className="absolute"
              initial={{ 
                x: `${element.x}vw`, 
                y: "-5vh",
                rotate: 0,
                opacity: 0
              }}
              animate={{ 
                x: [`${element.x}vw`, `${element.x + 10}vw`, `${element.x - 5}vw`],
                y: "110vh",
                rotate: [0, 180, 360, 540],
                opacity: [0, 0.6, 0.6, 0]
              }}
              transition={{
                duration: element.duration,
                delay: element.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-3 h-3 bg-primary/20 rounded-full blur-[1px]" 
                   style={{ 
                     clipPath: "ellipse(50% 70% at 50% 50%)",
                     background: "radial-gradient(ellipse, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.1))"
                   }} 
              />
            </motion.div>
          )
        }
        
        if (element.type === "dragon") {
          return (
            <motion.div
              key={element.id}
              className="absolute top-[20vh]"
              initial={{ 
                x: "-10vw",
                y: 0
              }}
              animate={{ 
                x: "110vw",
                y: ["0vh", "-10vh", "5vh", "-5vh", "0vh"]
              }}
              transition={{
                duration: element.duration,
                delay: element.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="text-6xl opacity-20 filter blur-[1px]">🐉</div>
            </motion.div>
          )
        }
        
        if (element.type === "phoenix") {
          return (
            <motion.div
              key={element.id}
              className="absolute top-[60vh]"
              initial={{ 
                x: "110vw",
                y: 0,
                scale: 1
              }}
              animate={{ 
                x: "-10vw",
                y: ["0vh", "10vh", "-5vh", "8vh", "0vh"],
                scale: [1, 1.2, 0.9, 1.1, 1]
              }}
              transition={{
                duration: element.duration,
                delay: element.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="text-6xl opacity-15 filter blur-[1px]">🔥</div>
            </motion.div>
          )
        }
        
        return null
      })}
    </div>
  )
}
