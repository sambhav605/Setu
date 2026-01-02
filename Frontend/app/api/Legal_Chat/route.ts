import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages, type } = await req.json()

    // Example for a custom AI API call:
    // const response = await fetch("https://your-ai-api.com/v1/chat", {
    //   method: "POST",
    //   headers: { "Authorization": `Bearer ${process.env.MY_AI_KEY}` },
    //   body: JSON.stringify({ messages })
    // })
    // const data = await response.json()

    // For now, we'll simulate a real API response that you can easily swap
    const lastMessage = messages[messages.length - 1].content

    let aiContent = ""
    if (type === "legal") {
      aiContent = `Based on your query about "${lastMessage}", under Nepali Law, this is typically governed by specific statutes...`
    } else {
      aiContent = "Standard AI response for non-legal queries."
    }

    return NextResponse.json({ content: aiContent })
  } catch (error) {
    console.error("[v0] AI API Error:", error)
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 })
  }
}
