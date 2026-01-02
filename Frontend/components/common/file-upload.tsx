"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (text: string) => void
  accept?: string
  className?: string
}

export function FileUpload({ onFileSelect, accept = ".txt,.pdf", className }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
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

  const processFile = async (file: File) => {
    setFileName(file.name)
    if (file.type === "text/plain") {
      const text = await file.text()
      onFileSelect(text)
    } else {
      // PDF processing would normally happen here via a library
      // For this demo, we'll simulate it
      onFileSelect(`Simulated text content from: ${file.name}\n\nThis legal notice contains various clauses...`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
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
          fileName ? "border-success/50 bg-success/5" : "",
        )}
      >
        {fileName ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <p className="text-sm font-medium">{fileName}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.preventDefault()
                setFileName(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            >
              <X className="h-3 w-3 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-semibold">Click or drag to upload document</p>
            <p className="text-xs text-muted-foreground">Supported formats: .txt, .pdf</p>
          </div>
        )}
      </label>
    </div>
  )
}
