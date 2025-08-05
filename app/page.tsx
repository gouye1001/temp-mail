"use client"

import { useState } from "react"
import { TempMailProvider } from "@/lib/tempMailContext"
import { EmailGenerator } from "@/components/EmailGenerator"
import { Inbox } from "@/components/Inbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Mail, Shield, Clock, Zap, Github, Twitter, ExternalLink, CheckCircle, Globe } from "lucide-react"

export default function HomePage() {
  const [showFeatures, setShowFeatures] = useState(false)

  return (
    <TempMailProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">TempMail</h1>
                  <p className="text-sm text-muted-foreground">Temporary Email Service</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setShowFeatures(!showFeatures)}>
                  Features
                </Button>
                <ThemeToggle />
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Free & Anonymous
              </Badge>
              <Badge variant="outline">
                <Globe className="h-3 w-3 mr-1" />
                Powered by Mail.tm
              </Badge>
            </div>

            <h2 className="text-4xl font-semibold text-foreground mb-4">Temporary Email Made Simple</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Generate disposable email addresses instantly for testing, anonymous signups, or verification workflows.
              No registration required, completely free.
            </p>
          </div>

          {/* Features Section */}
          {showFeatures && (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    No registration required. Your privacy is protected with temporary addresses.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Auto-Refresh</h3>
                  <p className="text-sm text-muted-foreground">
                    Messages appear automatically with real-time polling and notifications.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant email generation with immediate message delivery and viewing.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Application */}
          <div className="space-y-8">
            <EmailGenerator />
            <Inbox />
          </div>

          {/* Usage Guidelines */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Usage Guidelines
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p>✅ Perfect for testing and development workflows</p>
                  <p>✅ Use for anonymous signups and verifications</p>
                  <p>✅ Avoid spam in your personal email</p>
                  <p>✅ No personal information required</p>
                </div>
                <div className="space-y-2">
                  <p>❌ Don't use for important communications</p>
                  <p>❌ Emails are temporary and will be deleted</p>
                  <p>❌ Not suitable for password recovery</p>
                  <p>❌ Respect Mail.tm's terms of service</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background/80 backdrop-blur-sm mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-muted-foreground space-y-2">
              <p className="flex items-center justify-center space-x-2">
                <span>Powered by</span>
                <a
                  href="https://mail.tm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-primary hover:text-primary/80 underline"
                >
                  <span>Mail.tm</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p className="text-sm">Built with ❤️ using Next.js and TypeScript. No data is stored permanently.</p>
            </div>
          </div>
        </footer>
      </div>
    </TempMailProvider>
  )
}
