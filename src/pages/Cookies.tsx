import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <main className="app-main">
        <div className="container-system">
          <div className="content-container">
            {/* Back Button */}
            <div className="mb-8">
              <Link to="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="typography-display mb-4">Cookie Policy</h1>
              <p className="typography-body-lg text-muted-foreground max-w-3xl mx-auto">
                Learn about how VineNovel uses cookies to enhance your reading experience.
              </p>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">What Are Cookies</h2>
                  <p className="typography-body mb-4">
                    Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
                    They help us provide you with a better experience by remembering your preferences and improving our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">How We Use Cookies</h2>
                  <p className="typography-body mb-4">VineNovel uses cookies for:</p>
                  <ul className="typography-body space-y-2 mb-4 ml-6">
                    <li>• Remembering your login status and preferences</li>
                    <li>• Tracking your reading progress and library</li>
                    <li>• Personalizing story recommendations</li>
                    <li>• Analyzing website performance and usage</li>
                    <li>• Ensuring security and preventing fraud</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Types of Cookies We Use</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="typography-h3 mb-2">Essential Cookies</h3>
                      <p className="typography-body">
                        These cookies are necessary for the website to function properly. They enable core functionality 
                        such as security, network management, and accessibility.
                      </p>
                    </div>

                    <div>
                      <h3 className="typography-h3 mb-2">Performance Cookies</h3>
                      <p className="typography-body">
                        These cookies help us understand how visitors interact with our website by collecting and 
                        reporting information anonymously.
                      </p>
                    </div>

                    <div>
                      <h3 className="typography-h3 mb-2">Functional Cookies</h3>
                      <p className="typography-body">
                        These cookies enable the website to provide enhanced functionality and personalization, 
                        such as remembering your reading preferences.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Managing Cookies</h2>
                  <p className="typography-body mb-4">
                    You can control and manage cookies in various ways. Most web browsers automatically accept cookies, 
                    but you can modify your browser settings to decline cookies if you prefer.
                  </p>
                  <p className="typography-body mb-4">
                    Please note that disabling cookies may affect the functionality of VineNovel and may prevent you 
                    from using certain features of our service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Contact Us</h2>
                  <p className="typography-body">
                    If you have any questions about our Cookie Policy, please contact us at{" "}
                    <a href="mailto:olaoluhephzibah3@gmail.com" className="text-primary hover:underline">
                      olaoluhephzibah3@gmail.com
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}