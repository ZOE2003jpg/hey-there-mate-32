import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Link } from "react-router-dom"

export default function Cookies() {
  return (
    <div className="app-layout">
      <Navigation currentPanel="home" onPanelChange={() => {}} />
      <main className="app-main">
        <div className="container-system">
          <div className="content-container py-12">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Cookie Policy</h1>
                <p className="text-lg text-muted-foreground">
                  Learn how VineNovel uses cookies to enhance your reading experience
                </p>
              </div>

              <div className="vine-card p-8 space-y-6">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">What Are Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Cookies are small text files that are stored on your device when you visit VineNovel. 
                    They help us remember your preferences and provide a personalized reading experience.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">How We Use Cookies</h2>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">Essential Cookies</h3>
                      <p className="text-sm text-muted-foreground">
                        These cookies are necessary for the platform to function properly and cannot be disabled.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Performance Cookies</h3>
                      <p className="text-sm text-muted-foreground">
                        Help us understand how readers interact with our platform to improve performance.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Preference Cookies</h3>
                      <p className="text-sm text-muted-foreground">
                        Remember your reading preferences like font size, theme, and reading progress.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Managing Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You can control and manage cookies through your browser settings. However, 
                    disabling cookies may affect your experience on VineNovel.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about our cookie policy, please contact us at{" "}
                    <a href="mailto:olaoluhephzibah3@gmail.com" className="text-primary hover:underline">
                      olaoluhephzibah3@gmail.com
                    </a>
                  </p>
                </section>
              </div>

              <div className="text-center">
                <Link 
                  to="/" 
                  className="vine-button-hero inline-flex items-center space-x-2"
                >
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}