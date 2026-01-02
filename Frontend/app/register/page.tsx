import { RegisterForm } from "@/components/auth/register-form"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/20">
        <div className="w-full max-w-2xl">
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
