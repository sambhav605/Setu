"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Info, Search, Upload, X, CheckCircle2, ShieldAlert, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface BiasedSentence {
  original: string
  category: string
  confidence: number
  suggestion: string | null
  explanation: string | null
  success: boolean
}

interface BiasAnalysisResult {
  success: boolean
  biasedCount: number
  unbiasedCount: number
  totalSentences: number
  biasedSentences: BiasedSentence[]
  filename?: string
}

// Category display names in Nepali/English
const categoryLabels: Record<string, string> = {
  neutral: "Neutral",
  gender: "Gender Bias",
  religional: "Religious Bias",
  caste: "Caste Bias",
  religion: "Religion Bias",
  appearence: "Appearance Bias",
  socialstatus: "Social Status Bias",
  amiguity: "Ambiguity",
  political: "Political Bias",
  Age: "Age Bias",
  Disablity: "Disability Bias",
}

export function BiasChecker() {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<BiasAnalysisResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0]
      if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf")) {
        setFile(selectedFile)
        setText("") // Clear text input when file is uploaded
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setText("") // Clear text input when file is uploaded
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const analyzeText = async () => {
    if (!text.trim() && !file) return
    setIsAnalyzing(true)
    setResult(null)

    try {
      const formData = new FormData()

      if (file) {
        formData.append("file", file)
      } else {
        formData.append("text", text)
      }

      formData.append("confidence_threshold", "0.7")

      const token = localStorage.getItem("access_token")
      const headers: Record<string, string> = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch("/api/bias-detection", {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze bias")
      }

      const data: BiasAnalysisResult = await response.json()
      setResult(data)
    } catch (error) {
      console.error("[Bias Detection Error]:", error)
      alert("Failed to analyze bias. Please ensure the backend server is running.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateScore = (result: BiasAnalysisResult) => {
    if (result.totalSentences === 0) return 100
    return Math.round((result.unbiasedCount / result.totalSentences) * 100)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Input Side */}
      <div className="space-y-6">
        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Nepali Bias Checker</CardTitle>
            <CardDescription>
              Paste Nepali text or upload a PDF document to check for linguistic biases.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Textarea
                placeholder="नेपाली पाठ यहाँ पेस्ट गर्नुहोस्... (Paste Nepali text here...)"
                className="min-h-[300px] resize-none border-primary/10 focus-visible:ring-primary font-[system-ui]"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  if (e.target.value.trim()) setFile(null) // Clear file when typing
                }}
                disabled={!!file}
              />
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* File Upload */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
                    dragActive
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-muted hover:border-primary/50 hover:bg-muted/30",
                    file ? "border-success/50 bg-success/5" : ""
                  )}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-10 w-10 text-success" />
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <p className="text-sm font-medium">{file.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          removeFile()
                        }}
                      >
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-semibold">Click or drag PDF to upload</p>
                      <p className="text-xs text-muted-foreground">Nepali PDF documents supported</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Button
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
              onClick={analyzeText}
              disabled={isAnalyzing || (!text.trim() && !file)}
            >
              {isAnalyzing ? (
                <>
                  <Search className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Document...
                </>
              ) : (
                <>
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  Analyze for Bias
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Side */}
      <div className="space-y-6 sticky top-24">
        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <Card className="border-primary/20 shadow-xl overflow-hidden">
              <div
                className={cn(
                  "h-2 w-full",
                  calculateScore(result) > 70
                    ? "bg-success"
                    : calculateScore(result) > 40
                      ? "bg-accent"
                      : "bg-destructive"
                )}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle>Analysis Results</CardTitle>
                  <Badge variant="outline" className="text-lg py-1 px-3">
                    Score: {calculateScore(result)}/100
                  </Badge>
                </div>
                <Progress value={calculateScore(result)} className="h-3" />
                <div className="flex justify-between text-[10px] text-muted-foreground font-bold pt-2 uppercase tracking-tighter">
                  <span>Critical Bias</span>
                  <span>Moderate</span>
                  <span>Inclusive</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-primary/5">
                  <h4 className="flex items-center gap-2 text-sm font-bold mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    Summary
                  </h4>
                  <div className="space-y-2">
                    <p className="text-base leading-relaxed font-semibold">
                      Biased sentences = <span className="text-destructive">{result.biasedCount}</span>
                    </p>
                    <p className="text-base leading-relaxed font-semibold">
                      Unbiased sentences = <span className="text-success">{result.unbiasedCount}</span>
                    </p>
                    {result.filename && (
                      <p className="text-xs text-muted-foreground mt-2">File: {result.filename}</p>
                    )}
                  </div>
                </div>

                {result.biasedSentences.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Biased Sentences with Suggestions
                    </h4>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {result.biasedSentences.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-background space-y-3 shadow-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="destructive" className="text-xs">
                                {categoryLabels[item.category] || item.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(item.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                Original (Biased):
                              </p>
                              <p className="text-sm font-medium leading-relaxed font-[system-ui] bg-destructive/5 p-2 rounded border border-destructive/20">
                                {item.original}
                              </p>
                            </div>
                            {item.explanation && (
                              <div>
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                                  Why is this biased?
                                </p>
                                <p className="text-xs leading-relaxed bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100">
                                  {item.explanation}
                                </p>
                              </div>
                            )}
                            {item.suggestion && item.success ? (
                              <div>
                                <p className="text-xs font-bold text-success uppercase tracking-wider mb-1">
                                  Suggested (Unbiased):
                                </p>
                                <p className="text-sm font-medium leading-relaxed font-[system-ui] bg-success/5 p-2 rounded border border-success/20">
                                  {item.suggestion}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                  Suggestion:
                                </p>
                                <p className="text-xs text-muted-foreground italic">
                                  Suggestion not available
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.biasedSentences.length === 0 && (
                  <div className="p-6 rounded-xl border border-success/20 bg-success/5 text-center">
                    <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
                    <p className="font-semibold text-success">No biases detected!</p>
                    <p className="text-xs text-muted-foreground mt-1">The text appears to be neutral and inclusive.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed bg-muted/10 opacity-60">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-muted-foreground">Waiting for analysis</h3>
            <p className="max-w-[300px] text-sm text-muted-foreground">
              Enter Nepali text or upload a PDF on the left and click "Analyze for Bias" to see linguistic insights.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
