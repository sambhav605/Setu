import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const { messages, type } = await req.json()

    if (type !== "legal") {
      return NextResponse.json({ content: "Standard AI response for non-legal queries." })
    }

    const lastMessage = messages[messages.length - 1].content

    // Get Authorization header from incoming request
    const authHeader = req.headers.get("authorization")
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/explain`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: lastMessage,
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`)
    }

    const data = await response.json()

    // Format sources properly from backend response
    let sourcesText = ""
    if (data.sources && data.sources.length > 0) {
      const formattedSources = data.sources
        .map((s: any, i: number) => {
          // Extract and clean filename
          let fileName = "Legal Document"
          if (s.file) {
            fileName = s.file
              .replace(/_en\.pdf$/i, "") // Remove _en.pdf extension
              .replace(/\.pdf$/i, "") // Remove .pdf extension
              .replace(/_/g, " ") // Replace underscores with spaces
          }

          // Format: **filename** (section)
          const section = s.section || "Reference"
          return `${i + 1}. **${fileName}** (${section})`
        })
        .join("\n")
      sourcesText = `\n\n**📚 Sources:**\n${formattedSources}`
    }

    // Return the data as-is since backend already returns markdown format
    // Format it nicely for the frontend
    const formattedContent = `**${data.summary}**

${data.explanation}

**🔑 Key Point:** ${data.key_point}

**📋 Next Steps:** ${data.next_steps}${sourcesText}`.trim()

    return NextResponse.json({ content: formattedContent })
  } catch (error) {
    console.error("[Legal Chat API Error]:", error)
    return NextResponse.json(
      { error: "Failed to fetch response from legal AI backend. Please ensure the backend server is running." },
      { status: 500 }
    )
  }
}
