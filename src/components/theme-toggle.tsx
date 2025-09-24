import { Flame, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "fire" ? "azure" : "fire")}
      className="h-9 w-9 transition-all duration-300"
    >
      <Flame className="h-4 w-4 rotate-0 scale-100 transition-all azure:-rotate-90 azure:scale-0" />
      <Zap className="absolute h-4 w-4 rotate-90 scale-0 transition-all azure:rotate-0 azure:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}