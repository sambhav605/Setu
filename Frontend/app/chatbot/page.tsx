import { LawChatbot } from "@/components/chatbot/law-chatbot"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function ChatbotPage() {
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
