import { BiasChecker } from "@/components/chatbot/bias-checker"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function BiasCheckerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight">Legal Notice Analyzer</h1>
            <p className="text-muted-foreground">
              Empowering fair communication by detecting socioeconomic and linguistic biases in legal documents.
            </p>
          </div>
          <BiasChecker />
        </div>
      </main>
      <Footer />
    </div>
  )
}
