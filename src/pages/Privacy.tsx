import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"
import { Footer } from "@/components/footer"

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container-system flex-1">
        <div className="content-container py-16">
          <BackButton />
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="typography-display mb-4">Privacy Policy</h1>
              <p className="typography-body text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    We collect information you provide directly to us, such as when you create an account, 
                    publish content, or contact us for support.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>Account information (username, email address, profile information)</li>
                    <li>Content you create (stories, comments, likes, bookmarks)</li>
                    <li>Usage data (reading preferences, interaction patterns)</li>
                    <li>Device information (browser type, IP address, operating system)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    We use the information we collect to provide, maintain, and improve our services.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>Provide and maintain the VineNovel platform</li>
                    <li>Personalize your reading and writing experience</li>
                    <li>Communicate with you about updates and support</li>
                    <li>Analyze usage patterns to improve our services</li>
                    <li>Protect against spam, fraud, and abuse</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Information Sharing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    We do not sell, trade, or otherwise transfer your personal information to third parties 
                    without your consent, except as described in this policy.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>With your consent or at your direction</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and prevent fraud</li>
                    <li>With service providers who assist our operations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    We implement appropriate security measures to protect your information against unauthorized 
                    access, alteration, disclosure, or destruction.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>Encryption of sensitive data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication measures</li>
                    <li>Secure data centers and infrastructure</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    You have certain rights regarding your personal information, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>Access and review your personal information</li>
                    <li>Update or correct your information</li>
                    <li>Delete your account and associated data</li>
                    <li>Export your data in a portable format</li>
                    <li>Opt out of certain communications</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cookies and Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    We use cookies and similar technologies to enhance your experience and understand how 
                    you use our platform.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>Essential cookies for platform functionality</li>
                    <li>Analytics cookies to understand usage patterns</li>
                    <li>Preference cookies to remember your settings</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <ul className="list-none space-y-2 typography-body text-muted-foreground">
                    <li>Email: privacy@vinenovel.com</li>
                    <li>Address: [Your Business Address]</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}