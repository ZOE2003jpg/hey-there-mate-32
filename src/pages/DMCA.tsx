import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Link } from "react-router-dom"

export default function DMCA() {
  return (
    <div className="app-layout">
      <Navigation currentPanel="home" onPanelChange={() => {}} />
      <main className="app-main">
        <div className="container-system">
          <div className="content-container py-12">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">DMCA Policy</h1>
                <p className="text-lg text-muted-foreground">
                  VineNovel respects intellectual property rights
                </p>
              </div>

              <div className="vine-card p-8 space-y-6">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Copyright Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    VineNovel respects the intellectual property rights of others and expects our users 
                    to do the same. We will respond to valid notices of copyright infringement in 
                    accordance with the Digital Millennium Copyright Act (DMCA).
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Filing a DMCA Notice</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you believe that content on VineNovel infringes your copyright, please provide 
                    us with a written notice that includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Your physical or electronic signature</li>
                    <li>Identification of the copyrighted work</li>
                    <li>Location of the infringing material on our platform</li>
                    <li>Your contact information</li>
                    <li>A statement of good faith belief</li>
                    <li>A statement of accuracy under penalty of perjury</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Counter-Notification</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you believe your content was removed by mistake or misidentification, 
                    you may submit a counter-notification following DMCA procedures.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Contact for DMCA Notices</h2>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground">
                      Email: <a href="mailto:olaoluhephzibah3@gmail.com" className="text-primary hover:underline">
                        olaoluhephzibah3@gmail.com
                      </a>
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Subject Line: "DMCA Notice - VineNovel"
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Repeat Infringers</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    VineNovel will terminate the accounts of users who are repeat infringers 
                    of copyright in appropriate circumstances.
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