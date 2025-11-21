"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PDFUploaderProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
}

export default function PDFUploader({ onUpload, isUploading = false }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_FILE_SIZE = 50 * 1024 * 1024

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 50MB")
      return false
    }
    setError(null)
    return true
  }

  const handleFileSelect = async (file: File) => {
    if (validateFile(file)) {
      setUploadProgress(0)
      // Show initial progress
      setUploadProgress(10)
      
      try {
        await onUpload(file)
        setUploadProgress(100)
        // Reset progress after a moment
        setTimeout(() => setUploadProgress(0), 1000)
      } catch (error) {
        setUploadProgress(0)
        setError(error instanceof Error ? error.message : "Failed to upload PDF")
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <Card className="glass-effect border-gradient shadow-2xl shadow-primary/10 col-span-full lg:col-span-3">
      <CardHeader className=" from-primary/5 to-secondary/5 border-b border-white/10">
        <CardTitle className="text-gradient flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Upload Your PDF
        </CardTitle>
        <CardDescription>Drag and drop or browse to get started with AI analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-16 text-center smooth-transition ${
            isDragging
              ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
              : "border-white/20 bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${isDragging ? "bg-primary text-white" : "bg-primary/20 text-primary"}`}>
              <Upload className="w-8 h-8" />
            </div>
          </div>
          <p className="text-xl font-semibold mb-2">{isDragging ? "Drop your PDF here" : "Drag and drop your PDF"}</p>
          <p className="text-muted-foreground mb-6">or click the button below to browse your files</p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Upload PDF file"
          />

          <Button 
            onClick={() => fileInputRef.current?.click()} 
            size="lg" 
            className="btn-primary rounded-full px-8"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Browse Files"}
          </Button>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-8">
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="from-primary to-secondary h-full smooth-transition"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">{Math.round(uploadProgress)}% uploaded</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File Info */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Format</p>
            <p className="font-semibold text-foreground">PDF</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Max Size</p>
            <p className="font-semibold text-foreground">50 MB</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Security</p>
            <p className="font-semibold text-foreground">Secure</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
