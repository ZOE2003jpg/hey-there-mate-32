import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-system">
        <div className="content-container py-16">
          <BackButton />
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="typography-display mb-4">Terms & Conditions</h1>
              <p className="typography-body text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Acceptance of Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    By accessing and using VineNovel, you accept and agree to be bound by the terms and 
                    provision of this agreement. If you do not agree to abide by the above, please do not 
                    use this service.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Use License</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    Permission is granted to temporarily download one copy of VineNovel's materials for 
                    personal, non-commercial transitory viewing only.
                  </p>
                  <p className="typography-body text-muted-foreground font-semibold">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on the platform</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    When you create an account with us, you must provide information that is accurate, 
                    complete, and current at all times.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>You are responsible for safeguarding your account password</li>
                    <li>You must not share your account with others</li>
                    <li>You must notify us immediately of any unauthorized use</li>
                    <li>We reserve the right to terminate accounts that violate our terms</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    Users are responsible for the content they publish on VineNovel. By posting content, 
                    you agree that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>You own or have the right to use the content you post</li>
                    <li>Your content does not infringe on others' rights</li>
                    <li>Your content complies with applicable laws and regulations</li>
                    <li>You will not post harmful, offensive, or inappropriate content</li>
                    <li>You grant VineNovel a license to display and distribute your content</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prohibited Uses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    You may not use VineNovel for any unlawful purpose or to solicit others to perform 
                    unlawful acts. You may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>Violate any international, federal, provincial, or state regulations or laws</li>
                    <li>Transmit or procure the sending of any advertising or promotional material</li>
                    <li>Impersonate or attempt to impersonate another person or entity</li>
                    <li>Engage in any activity that disrupts or interferes with the platform</li>
                    <li>Use automated systems to access the platform without permission</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intellectual Property</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    The platform and its original content, features, and functionality are and will remain 
                    the exclusive property of VineNovel and its licensors.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>The platform is protected by copyright, trademark, and other laws</li>
                    <li>Users retain rights to their original content</li>
                    <li>VineNovel respects intellectual property rights of others</li>
                    <li>We respond to valid DMCA takedown notices</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Termination</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    We may terminate or suspend your account immediately, without prior notice or liability, 
                    for any reason whatsoever, including without limitation if you breach the Terms.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 typography-body text-muted-foreground">
                    <li>Upon termination, your right to use the platform ceases immediately</li>
                    <li>You may delete your account at any time</li>
                    <li>Certain provisions of these terms survive termination</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    In no event shall VineNovel, nor its directors, employees, partners, agents, suppliers, 
                    or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
                    damages, including without limitation, loss of profits, data, use, goodwill, or other 
                    intangible losses.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="typography-body text-muted-foreground">
                    If you have any questions about these Terms & Conditions, please contact us at:
                  </p>
                  <ul className="list-none space-y-2 typography-body text-muted-foreground">
                    <li>Email: legal@vinenovel.com</li>
                    <li>Address: [Your Business Address]</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}