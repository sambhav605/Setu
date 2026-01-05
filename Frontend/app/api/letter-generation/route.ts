import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, data } = body

    // Get Authorization header from incoming request
    const authHeader = req.headers.get("authorization")
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    let response: Response
    let result: any

    switch (action) {
      case "search-template":
        // Step 1: Search for template based on user requirement
        response = await fetch(`${BACKEND_URL}/api/v1/search-template`, {
          method: "POST",
          headers,
          body: JSON.stringify({ query: data.query }),
        })

        if (!response.ok) {
          throw new Error("Failed to search template")
        }

        result = await response.json()
        return NextResponse.json({
          success: result.success,
          templateName: result.template_name,
          score: result.score,
          content: result.content,
          error: result.error,
        })

      case "get-template-details":
        // Step 2: Get placeholder details for the template
        response = await fetch(`${BACKEND_URL}/api/v1/get-template-details`, {
          method: "POST",
          headers,
          body: JSON.stringify({ template_name: data.templateName }),
        })

        if (!response.ok) {
          throw new Error("Failed to get template details")
        }

        result = await response.json()
        return NextResponse.json({
          success: result.success,
          templateName: result.template_name,
          placeholders: result.placeholders,
          content: result.content,
          error: result.error,
        })

      case "fill-template":
        // Step 3: Fill template with provided placeholder values
        response = await fetch(`${BACKEND_URL}/api/v1/fill-template`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            template_name: data.templateName,
            placeholders: data.placeholders,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fill template")
        }

        result = await response.json()
        return NextResponse.json({
          success: result.success,
          letter: result.letter,
          error: result.error,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[Letter Generation API Error]:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process request. Please ensure the backend server is running.",
      },
      { status: 500 }
    )
  }
}
