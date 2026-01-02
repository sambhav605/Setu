"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/common/file-upload"
import { AlertCircle, Info, Search, History, ArrowRight, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface BiasResult {
  score: number
  problematicPhrases: { phrase: string; reason: string; recommendation: string }[]
  summary: string
}

export function BiasChecker() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<BiasResult | null>(null)

  const analyzeText = () => {
    if (!text.trim()) return
    setIsAnalyzing(true)

    // Simulate AI analysis delay
    setTimeout(() => {
      const mockResult: BiasResult = {
        score: 65,
        summary:
          "The document contains several instances of exclusionary language and ambiguous legal terminology that might favor certain socioeconomic groups.",
        problematicPhrases: [
          {
            phrase: "duly qualified applicants",
            reason: "Vague terminology that often serves as a gatekeeping mechanism without specific criteria.",
            recommendation: "Use 'applicants meeting the specific criteria listed below'.",
          },
          {
            phrase: "standard processing fees apply",
            reason: "Potentially exclusionary for lower-income individuals without stating exact amounts.",
            recommendation: "Clearly list the fee structure or mention available waivers.",
          },
          {
            phrase: "formal education only",
            reason: "Excludes qualified individuals with non-traditional or vocational backgrounds.",
            recommendation: "Consider 'equivalent experience' or specific skill-based testing.",
          },
        ],
      }
      setResult(mockResult)
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Input Side */}
      <div className="space-y-6">
        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Legal Notice Analyzer</CardTitle>
            <CardDescription>Paste legal content or upload a document to check for linguistic biases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Paste legal notice content here..."
                className="min-h-[300px] resize-none border-primary/10 focus-visible:ring-primary"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <FileUpload onFileSelect={(txt) => setText(txt)} />
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Button
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
              onClick={analyzeText}
              disabled={isAnalyzing || !text.trim()}
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

        <Card className="bg-muted/50 border-none">
          <CardHeader className="py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <History className="h-4 w-4 text-primary" />
              Recent Analyses
            </div>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border text-sm group cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <span className="truncate max-w-[200px] font-medium">Labor Notice Draft 0{i}.txt</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      Clean
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
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
                  result.score > 70 ? "bg-success" : result.score > 40 ? "bg-accent" : "bg-destructive",
                )}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle>Analysis Results</CardTitle>
                  <Badge variant="outline" className="text-lg py-1 px-3">
                    Score: {result.score}/100
                  </Badge>
                </div>
                <Progress value={result.score} className="h-3" />
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
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Detected Issues
                  </h4>
                  <div className="space-y-3">
                    {result.problematicPhrases.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border bg-background space-y-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <code className="text-destructive font-bold bg-destructive/5 px-2 py-0.5 rounded text-sm">
                            "{item.phrase}"
                          </code>
                        </div>
                        <div className="grid gap-2">
                          <p className="text-xs leading-relaxed">
                            <span className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] mr-2">
                              Reason:
                            </span>
                            {item.reason}
                          </p>
                          <div className="p-2 rounded bg-success/5 border border-success/10">
                            <p className="text-xs leading-relaxed font-medium text-success">
                              <span className="font-bold uppercase tracking-widest text-[9px] mr-2">Recommended:</span>
                              {item.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
              Enter text on the left and click "Analyze for Bias" to see linguistic insights and recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
