"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Scale, User, Download, Plus, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function LawChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Namaste! I am your Nepali Law Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const suggestedQuestions = [
    "What are my property rights?",
    "Labor law basics",
    "Consumer rights",
    "Women's rights in Nepal",
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  const handleSend = async (content: string) => {
    if (!content.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/python/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content }],
          type: "legal",
        }),
      })

      const data = await response.json()

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I am having trouble connecting to my legal database.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (error) {
      console.error("[v0] Chat error:", error)
    } finally {
      setIsTyping(false)
    }
  }

  const exportChat = () => {
    const chatContent = messages
      .map((m) => `[${m.role.toUpperCase()} - ${m.timestamp.toLocaleTimeString()}]: ${m.content}`)
      .join("\n\n")
    const blob = new Blob([chatContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "legal-chat-history.txt"
    a.click()
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Sidebar - Chat History */}
      <div className="hidden lg:flex w-64 flex-col gap-4 border-r pr-4">
        <Button className="w-full justify-start gap-2 bg-primary" onClick={() => setMessages([messages[0]])}>
          <Plus className="h-4 w-4" /> New Conversation
        </Button>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 uppercase tracking-wider">Recent Chats</p>
            {[1, 2, 3].map((i) => (
              <button
                key={i}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium truncate">Legal Query #{i}</span>
                </div>
                <span className="text-xs text-muted-foreground">Yesterday</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Interface */}
      <Card className="flex-1 flex flex-col shadow-lg border-primary/10 overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Nepali Law Assistant</CardTitle>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">AI Powered & Ready</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={exportChat} title="Export conversation">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea ref={scrollAreaRef} className="h-full p-4 md:p-6">
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                    m.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <Avatar className={cn("h-8 w-8 border", m.role === "assistant" ? "bg-primary/10" : "bg-muted")}>
                    <AvatarFallback className={m.role === "assistant" ? "text-primary" : "text-muted-foreground"}>
                      {m.role === "assistant" ? <Scale className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn("flex flex-col gap-1 max-w-[80%]", m.role === "user" ? "items-end" : "items-start")}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm shadow-sm",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted/80 backdrop-blur-sm rounded-tl-none border",
                      )}
                    >
                      {m.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 animate-in fade-in">
                  <Avatar className="h-8 w-8 border bg-primary/10">
                    <AvatarFallback className="text-primary">
                      <Scale className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted/80 border rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t bg-muted/20 backdrop-blur-md">
          <div className="w-full space-y-4 max-w-4xl mx-auto">
            {messages.length < 3 && (
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <Badge
                    key={q}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors px-3 py-1 bg-background"
                    onClick={() => handleSend(q)}
                  >
                    {q}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2 relative">
              <Input
                placeholder="Type your legal question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                className="pr-12 h-12 bg-background border-primary/20 focus-visible:ring-primary shadow-inner"
              />
              <Button
                size="icon"
                onClick={() => handleSend(input)}
                className="absolute right-1 top-1 h-10 w-10 bg-primary hover:bg-primary/90 transition-transform active:scale-95"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              AI responses are for information only and not professional legal advice.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
