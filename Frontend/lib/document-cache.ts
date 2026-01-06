/**
 * Document Cache Utility
 * Stores analyzed documents in browser localStorage for dashboard statistics
 */

export interface AnalyzedDocument {
  id: string
  filename: string
  analyzedAt: string
  type: "bias-detection" | "letter-generation"
  result: {
    totalSentences?: number
    biasedCount?: number
    neutralCount?: number
    success: boolean
  }
  sessionId?: string
}

const CACHE_KEY = "setu_analyzed_documents"
const MAX_CACHE_SIZE = 100 // Maximum number of documents to store

/**
 * Get all analyzed documents from cache
 */
export function getCachedDocuments(): AnalyzedDocument[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return []
    return JSON.parse(cached)
  } catch (error) {
    console.error("Error reading document cache:", error)
    return []
  }
}

/**
 * Add a new analyzed document to cache
 */
export function addDocumentToCache(document: Omit<AnalyzedDocument, "id" | "analyzedAt">): void {
  try {
    const documents = getCachedDocuments()

    const newDocument: AnalyzedDocument = {
      ...document,
      id: generateDocumentId(),
      analyzedAt: new Date().toISOString(),
    }

    // Add to beginning of array (most recent first)
    documents.unshift(newDocument)

    // Limit cache size
    if (documents.length > MAX_CACHE_SIZE) {
      documents.splice(MAX_CACHE_SIZE)
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(documents))
  } catch (error) {
    console.error("Error adding document to cache:", error)
  }
}

/**
 * Get statistics about cached documents
 */
export function getDocumentStats() {
  const documents = getCachedDocuments()

  const biasDocuments = documents.filter(d => d.type === "bias-detection")
  const totalAnalyzed = biasDocuments.length

  let totalInclusive = 0
  let totalFlagged = 0

  biasDocuments.forEach(doc => {
    if (doc.result.biasedCount === 0) {
      totalInclusive++
    } else if (doc.result.biasedCount && doc.result.biasedCount > 0) {
      totalFlagged++
    }
  })

  const letterDocuments = documents.filter(d => d.type === "letter-generation")
  const totalLetters = letterDocuments.length

  return {
    totalAnalyzed,
    totalInclusive,
    totalFlagged,
    totalLetters,
    allDocuments: documents,
  }
}

/**
 * Clear all cached documents
 */
export function clearDocumentCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error("Error clearing document cache:", error)
  }
}

/**
 * Remove a specific document from cache
 */
export function removeDocumentFromCache(documentId: string): void {
  try {
    const documents = getCachedDocuments()
    const filtered = documents.filter(d => d.id !== documentId)
    localStorage.setItem(CACHE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error removing document from cache:", error)
  }
}

/**
 * Generate a unique document ID
 */
function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
