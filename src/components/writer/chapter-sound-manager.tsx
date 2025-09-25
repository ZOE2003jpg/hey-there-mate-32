import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, Plus, Trash2 } from "lucide-react"
import { useSoundsLibrary, SoundLibrary, ChapterSound } from "@/hooks/useSoundsLibrary"
import { toast } from "sonner"

interface ChapterSoundManagerProps {
  chapterId: string
  chapterTitle: string
}

export function ChapterSoundManager({ chapterId, chapterTitle }: ChapterSoundManagerProps) {
  const { sounds, getChapterSounds, assignSoundToChapter, removeSoundFromChapter } = useSoundsLibrary()
  const [chapterSounds, setChapterSounds] = useState<ChapterSound[]>([])
  const [showSoundLibrary, setShowSoundLibrary] = useState(false)
  const [playingSound, setPlayingSound] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    loadChapterSounds()
  }, [chapterId])

  const loadChapterSounds = async () => {
    try {
      const sounds = await getChapterSounds(chapterId)
      setChapterSounds(sounds)
    } catch (error) {
      toast.error('Failed to load chapter sounds')
    }
  }

  const handleAddSound = async (sound: SoundLibrary) => {
    try {
      await assignSoundToChapter(chapterId, sound.id)
      await loadChapterSounds()
      toast.success(`Added "${sound.name}" to chapter`)
      setShowSoundLibrary(false)
    } catch (error) {
      toast.error('Failed to add sound to chapter')
    }
  }

  const handleRemoveSound = async (soundId: string) => {
    try {
      await removeSoundFromChapter(chapterId, soundId)
      await loadChapterSounds()
      toast.success('Sound removed from chapter')
    } catch (error) {
      toast.error('Failed to remove sound')
    }
  }

  const handleVolumeChange = async (chapterSoundId: string, volume: number) => {
    // Update locally first for immediate feedback
    setChapterSounds(prev =>
      prev.map(cs =>
        cs.id === chapterSoundId ? { ...cs, volume } : cs
      )
    )
    // Note: In a real implementation, you'd want to debounce this API call
  }

  const playPreview = (soundUrl: string, soundId: string) => {
    // Stop currently playing sound
    if (playingSound && audioElements[playingSound]) {
      audioElements[playingSound].pause()
      audioElements[playingSound].currentTime = 0
    }

    if (playingSound === soundId) {
      setPlayingSound(null)
      return
    }

    // Create or get audio element
    let audio = audioElements[soundId]
    if (!audio) {
      audio = new Audio(soundUrl)
      audio.volume = 0.3
      audio.onended = () => setPlayingSound(null)
      setAudioElements(prev => ({ ...prev, [soundId]: audio }))
    }

    audio.play()
    setPlayingSound(soundId)
  }

  const groupedSounds = sounds.reduce((acc, sound) => {
    if (!acc[sound.category]) acc[sound.category] = []
    acc[sound.category].push(sound)
    return acc
  }, {} as { [key: string]: SoundLibrary[] })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Chapter Audio</h3>
          <p className="text-sm text-muted-foreground">{chapterTitle}</p>
        </div>
        <Button onClick={() => setShowSoundLibrary(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Sound
        </Button>
      </div>

      {/* Assigned Sounds */}
      <div className="space-y-4">
        {chapterSounds.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No sounds assigned to this chapter
            </CardContent>
          </Card>
        ) : (
          chapterSounds.map((chapterSound) => (
            <Card key={chapterSound.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{chapterSound.sound?.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{chapterSound.sound?.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => playPreview(chapterSound.sound?.file_url || '', chapterSound.sound?.id || '')}
                    >
                      {playingSound === chapterSound.sound?.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSound(chapterSound.sound_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <Label className="text-sm">Volume: {Math.round(chapterSound.volume * 100)}%</Label>
                  </div>
                  <Slider
                    value={[chapterSound.volume]}
                    onValueChange={([value]) => handleVolumeChange(chapterSound.id, value)}
                    max={1}
                    min={0}
                    step={0.1}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`loop-${chapterSound.id}`}
                    checked={chapterSound.loop_sound}
                  />
                  <Label htmlFor={`loop-${chapterSound.id}`}>Loop sound</Label>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sound Library Modal */}
      {showSoundLibrary && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sound Library</CardTitle>
                <Button variant="ghost" onClick={() => setShowSoundLibrary(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto max-h-[60vh]">
              {Object.entries(groupedSounds).map(([category, categorySounds]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium capitalize flex items-center gap-2">
                    {category}
                    <Badge variant="secondary">{categorySounds.length}</Badge>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorySounds.map((sound) => (
                      <Card key={sound.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{sound.name}</h5>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => playPreview(sound.file_url, sound.id)}
                              >
                                {playingSound === sound.id ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAddSound(sound)}
                                disabled={chapterSounds.some(cs => cs.sound_id === sound.id)}
                              >
                                {chapterSounds.some(cs => cs.sound_id === sound.id) ? 'Added' : 'Add'}
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{sound.description}</p>
                          {sound.duration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Duration: {Math.floor(sound.duration / 60)}:{(sound.duration % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}