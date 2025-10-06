import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Palette, Sparkles, Moon, Sun, Heart, Zap } from 'lucide-react'

export type StoryMood = 'romantic' | 'dark' | 'adventure' | 'mystery' | 'fantasy' | 'dramatic' | 'default'

interface StoryMoodSelectorProps {
  value: StoryMood
  onChange: (mood: StoryMood) => void
}

const moodPresets = [
  {
    id: 'romantic' as StoryMood,
    name: 'Romantic',
    icon: Heart,
    description: 'Soft pinks and warm tones',
    gradient: 'from-pink-500 to-rose-500',
    textColor: 'text-pink-600'
  },
  {
    id: 'dark' as StoryMood,
    name: 'Dark',
    icon: Moon,
    description: 'Deep purples and blacks',
    gradient: 'from-purple-900 to-black',
    textColor: 'text-purple-400'
  },
  {
    id: 'adventure' as StoryMood,
    name: 'Adventure',
    icon: Zap,
    description: 'Vibrant oranges and yellows',
    gradient: 'from-orange-500 to-yellow-500',
    textColor: 'text-orange-600'
  },
  {
    id: 'mystery' as StoryMood,
    name: 'Mystery',
    icon: Sparkles,
    description: 'Cool blues and grays',
    gradient: 'from-blue-600 to-slate-700',
    textColor: 'text-blue-600'
  },
  {
    id: 'fantasy' as StoryMood,
    name: 'Fantasy',
    icon: Palette,
    description: 'Magical purples and teals',
    gradient: 'from-purple-500 to-teal-500',
    textColor: 'text-purple-600'
  },
  {
    id: 'dramatic' as StoryMood,
    name: 'Dramatic',
    icon: Sun,
    description: 'Bold reds and golds',
    gradient: 'from-red-600 to-amber-600',
    textColor: 'text-red-600'
  },
  {
    id: 'default' as StoryMood,
    name: 'Default',
    icon: Sparkles,
    description: 'Classic theme',
    gradient: 'from-primary to-primary-foreground',
    textColor: 'text-primary'
  }
]

export function StoryMoodSelector({ value, onChange }: StoryMoodSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Story Mood Theme</Label>
        <p className="text-sm text-muted-foreground">
          Choose a visual theme that matches your story's vibe
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {moodPresets.map((mood) => {
          const Icon = mood.icon
          const isSelected = value === mood.id

          return (
            <Card
              key={mood.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              onClick={() => onChange(mood.id)}
            >
              <div className="p-4 space-y-2">
                <div className={`h-12 rounded-md bg-gradient-to-r ${mood.gradient} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className={`font-medium ${mood.textColor}`}>{mood.name}</p>
                  <p className="text-xs text-muted-foreground">{mood.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
