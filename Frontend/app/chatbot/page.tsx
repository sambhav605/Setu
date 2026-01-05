"use client"

import { LawChatbot } from "@/components/chatbot/law-chatbot"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function ChatbotPage() {
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 bg-muted/20">
        <div className="container mx-auto max-w-7xl h-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">Nepali Law Assistant</h1>
            <p className="text-sm text-muted-foreground">Ask questions about Nepali law, rights, and regulations.</p>
          </div>
          <LawChatbot />
        </div>
      </main>
      <Footer />
    </div>
  )
}
