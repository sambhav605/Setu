import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const text = formData.get("text") as string | null
    const confidenceThreshold = parseFloat(formData.get("confidence_threshold") as string || "0.7")

    let sentences: string[] = []
    let filename: string | undefined

    if (file) {
      // Step 1: Process PDF to extract sentences with LLM refinement
      console.log("Step 1: Processing PDF to extract sentences...")
      const pdfFormData = new FormData()
      pdfFormData.append("file", file)
      pdfFormData.append("refine_with_llm", "true")

      const pdfResponse = await fetch(`${BACKEND_URL}/api/v1/process-pdf`, {
        method: "POST",
        body: pdfFormData,
      })

      if (!pdfResponse.ok) {
        throw new Error("Failed to process PDF")
      }

      const pdfData = await pdfResponse.json()
      sentences = pdfData.sentences
      filename = pdfData.filename
      console.log(`Extracted ${sentences.length} sentences from PDF`)
    } else if (text) {
      // For text input, use single sentence as array
      sentences = [text]
    } else {
      return NextResponse.json({ error: "Either file or text must be provided" }, { status: 400 })
    }

    // Step 2: Detect bias using batch endpoint
    console.log("Step 2: Detecting bias in sentences...")
    const batchBiasResponse = await fetch(`${BACKEND_URL}/api/v1/detect-bias/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: sentences,
        confidence_threshold: confidenceThreshold,
      }),
    })

    if (!batchBiasResponse.ok) {
      throw new Error("Failed to detect bias")
    }

    const batchBiasData = await batchBiasResponse.json()

    // Count biased and unbiased sentences
    let biasedCount = 0
    let unbiasedCount = 0
    const biasedSentencesData: Array<{
      sentence: string
      category: string
      confidence: number
    }> = []

    // Process batch results
    for (const item of batchBiasData.items) {
      const result = item.result
      if (result.success && result.results) {
        for (const sentenceResult of result.results) {
          if (sentenceResult.is_biased) {
            biasedCount++
            biasedSentencesData.push({
              sentence: sentenceResult.sentence,
              category: sentenceResult.category,
              confidence: sentenceResult.confidence,
            })
          } else {
            unbiasedCount++
          }
        }
      }
    }

    console.log(`Found ${biasedCount} biased sentences and ${unbiasedCount} unbiased sentences`)

    // Step 3: Get debiasing suggestions for biased sentences
    console.log("Step 3: Getting debiasing suggestions...")
    const suggestionsData: Array<{
      original: string
      category: string
      confidence: number
      suggestion: string | null
      success: boolean
    }> = []

    if (biasedSentencesData.length > 0) {
      // Prepare batch debias request
      const debiasItems = biasedSentencesData.map((item) => ({
        sentence: item.sentence,
        category: item.category,
        context: null,
      }))

      const debiasResponse = await fetch(`${BACKEND_URL}/api/v1/debias-sentence/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: debiasItems,
        }),
      })

      if (debiasResponse.ok) {
        const debiasData = await debiasResponse.json()

        for (let i = 0; i < biasedSentencesData.length; i++) {
          const original = biasedSentencesData[i]
          const debiasResult = debiasData.items?.[i]?.result

          suggestionsData.push({
            original: original.sentence,
            category: original.category,
            confidence: original.confidence,
            suggestion: debiasResult?.suggestion || null,
            success: debiasResult?.success || false,
          })
        }
      } else {
        // If debias fails, still return results without suggestions
        console.warn("Debiasing failed, returning results without suggestions")
        for (const item of biasedSentencesData) {
          suggestionsData.push({
            original: item.sentence,
            category: item.category,
            confidence: item.confidence,
            suggestion: null,
            success: false,
          })
        }
      }
    }

    console.log("Analysis complete!")

    // Return formatted response
    return NextResponse.json({
      success: true,
      biasedCount,
      unbiasedCount,
      totalSentences: biasedCount + unbiasedCount,
      biasedSentences: suggestionsData,
      filename,
    })
  } catch (error) {
    console.error("[Bias Detection API Error]:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze bias. Please ensure the backend server is running.",
      },
      { status: 500 }
    )
  }
}
