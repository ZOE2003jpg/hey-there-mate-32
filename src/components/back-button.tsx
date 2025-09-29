import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface BackButtonProps {
  className?: string
}

export function BackButton({ className = "" }: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleBack = () => {
    if (location.pathname === "/" || location.pathname === "/home") {
      return
    }
    navigate(-1)
  }

  // Don't show back button on home page
  if (location.pathname === "/" || location.pathname === "/home") {
    return null
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleBack}
      className={`mb-4 h-10 px-3 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  )
}