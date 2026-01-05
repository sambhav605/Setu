"use client"

import { LetterGenerator } from "@/components/chatbot/letter-generator"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function LetterGeneratorPage() {
  const { isLoading, isAuthenticated } = useAuthGuard()

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <>
      {/* Load Nepali fonts for letter generation */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 bg-muted/20">
          <div className="container mx-auto max-w-7xl h-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-primary">Letter Generation Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Generate official letters for various purposes with AI assistance
              </p>
            </div>
            <LetterGenerator />
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
