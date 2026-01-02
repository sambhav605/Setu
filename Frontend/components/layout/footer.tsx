import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Scale, Facebook, Twitter, Instagram, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Scale className="h-6 w-6" />
              <span className="font-bold text-lg">Know Your Rights</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering citizens of Nepal through legal literacy and digital assistance.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/chatbot" className="text-muted-foreground hover:text-primary">
                  Law Chatbot
                </Link>
              </li>
              <li>
                <Link href="/bias-checker" className="text-muted-foreground hover:text-primary">
                  Bias Checker
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-primary">
                  Legal Resources
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <h3 className="font-semibold mb-2">Need Urgent Help?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Contact our 24/7 legal helpline for immediate assistance.
            </p>
            <Button size="sm" className="w-full">
              Call Hotline
            </Button>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Know Your Rights Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
