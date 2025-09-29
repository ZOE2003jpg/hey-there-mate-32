import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function DMCA() {
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
              <h1 className="typography-display mb-4">DMCA Policy</h1>
              <p className="typography-body-lg text-muted-foreground max-w-3xl mx-auto">
                VineNovel respects intellectual property rights and responds to valid DMCA takedown notices.
              </p>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Copyright Infringement Claims</h2>
                  <p className="typography-body mb-4">
                    VineNovel respects the intellectual property rights of others and expects users to do the same. 
                    In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to valid notices 
                    of copyright infringement.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Filing a DMCA Notice</h2>
                  <p className="typography-body mb-4">
                    If you believe that content on VineNovel infringes your copyright, please provide our designated 
                    agent with a written communication that includes:
                  </p>
                  <ul className="typography-body space-y-2 mb-4 ml-6">
                    <li>• Your physical or electronic signature</li>
                    <li>• Identification of the copyrighted work you claim has been infringed</li>
                    <li>• Identification of the material that is claimed to be infringing</li>
                    <li>• Your contact information (address, phone number, email)</li>
                    <li>• A statement that you have a good faith belief that the use is not authorized</li>
                    <li>• A statement that the information is accurate and you are authorized to act</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Counter-Notification</h2>
                  <p className="typography-body mb-4">
                    If you believe your content was removed or disabled by mistake or misidentification, you may 
                    file a counter-notification. Your counter-notification must include:
                  </p>
                  <ul className="typography-body space-y-2 mb-4 ml-6">
                    <li>• Your physical or electronic signature</li>
                    <li>• Identification of the material that was removed</li>
                    <li>• A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                    <li>• Your name, address, phone number, and consent to jurisdiction</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Designated Agent</h2>
                  <p className="typography-body mb-4">
                    Please send all DMCA notices and counter-notifications to our designated agent:
                  </p>
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <p className="typography-body">
                      <strong>DMCA Agent</strong><br />
                      VineNovel<br />
                      Email: <a href="mailto:olaoluhephzibah3@gmail.com" className="text-primary hover:underline">
                        olaoluhephzibah3@gmail.com
                      </a>
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Repeat Infringers</h2>
                  <p className="typography-body">
                    VineNovel will terminate user accounts that are repeat infringers in appropriate circumstances.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="typography-h2 mb-4">Contact Information</h2>
                  <p className="typography-body">
                    For questions about this DMCA Policy, please contact us at{" "}
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