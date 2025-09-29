import { BookOpen, Twitter, Github, Mail } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container-system">
        <div className="content-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* VineNovel Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">VineNovel</span>
              </div>
              <p className="typography-body text-muted-foreground">
                Where stories come alive through immersive, visual storytelling.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h3 className="typography-body font-semibold">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="typography-body text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-reader', { detail: 'discover' }))}
                    className="typography-body text-muted-foreground hover:text-primary transition-colors"
                  >
                    Discover
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-reader', { detail: 'featured' }))}
                    className="typography-body text-muted-foreground hover:text-primary transition-colors"
                  >
                    Featured
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-reader', { detail: 'trending' }))}
                    className="typography-body text-muted-foreground hover:text-primary transition-colors"
                  >
                    Trending
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="typography-body font-semibold">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="typography-body text-muted-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <a href="mailto:olaoluhephzibah3@gmail.com" className="typography-body text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="typography-body font-semibold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="typography-body text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="typography-body text-muted-foreground hover:text-primary transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="typography-body text-muted-foreground hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/dmca" className="typography-body text-muted-foreground hover:text-primary transition-colors">
                    DMCA
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="typography-caption text-muted-foreground">
                © {new Date().getFullYear()} VineNovel. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="/privacy" className="typography-caption text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="typography-caption text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}