"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Message, UploadedDocument } from "@/lib/types"
import { ROLES } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ChatInterface from "@/components/chat-interface"
import DocumentTabs from "@/components/document-tabs"
import PDFUploader from "@/components/pdf-uploader"
import { Button } from "@/components/ui/button"
import { ArrowLeft, GraduationCap, FileText } from "lucide-react"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messagesByDoc, setMessagesByDoc] = useState<Record<string, Message[]>>({})
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load document from query params if provided
  useEffect(() => {
    const docId = searchParams.get("docId")
    const docName = searchParams.get("docName")
    const sessionId = searchParams.get("sessionId")
    const pdfId = searchParams.get("pdfId")

    if (docId && docName && sessionId) {
      const doc: UploadedDocument = {
        id: docId,
        name: docName,
        sessionId: sessionId,
        pdfId: pdfId || undefined,
      }
      setUploadedDocuments([doc])
      setActiveDocumentId(docId)
      setMessagesByDoc({
        [docId]: [
          {
            id: Date.now().toString(),
            role: ROLES.ASSISTANT,
            content: `I've received your PDF: "${docName}". Ask me anything about its content - I can provide summaries, generate MCQs, explain concepts, and more.`,
            timestamp: new Date(),
          },
        ],
      })
    }
  }, [searchParams])

  const handleSendMessage = async (text: string) => {
    if (!activeDocumentId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: ROLES.USER,
      content: text,
      timestamp: new Date(),
    }

    setMessagesByDoc((prev) => {
      const prevMsgs = prev[activeDocumentId] ?? []
      return { ...prev, [activeDocumentId]: [...prevMsgs, userMessage] }
    })

    setIsLoading(true)

    try {
      const activeDoc = uploadedDocuments.find((doc) => doc.id === activeDocumentId)

      if (!activeDoc?.sessionId) {
        throw new Error("Session ID is missing. Please upload a PDF first.")
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: activeDoc.sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.response) {
        throw new Error("Invalid response format from API")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: ROLES.ASSISTANT,
        content: data.response,
        timestamp: new Date(),
      }

      setMessagesByDoc((prev) => {
        const prevMsgs = prev[activeDocumentId] ?? []
        return { ...prev, [activeDocumentId]: [...prevMsgs, assistantMessage] }
      })
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: ROLES.ASSISTANT,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessagesByDoc((prev) => {
        const prevMsgs = prev[activeDocumentId] ?? []
        return { ...prev, [activeDocumentId]: [...prevMsgs, errorMessage] }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDocument = (id: string) => {
    const remaining = uploadedDocuments.filter((doc) => doc.id !== id)
    setUploadedDocuments(remaining)
    setMessagesByDoc((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })

    if (activeDocumentId === id) {
      setActiveDocumentId(remaining[0]?.id || null)
    }
  }

  const handleSwitchDocument = (id: string) => {
    setActiveDocumentId(id)
  }

  const handlePdfUpload = async (file: File) => {
    setIsUploadingPdf(true)
    
    try {
      // Upload PDF to the API
      const formData = new FormData()
      formData.append("file", file)

      // Use Next.js API route as proxy to backend
      const response = await fetch("/api/pdf/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to upload PDF" }))
        throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`)
      }

      const uploadResult = await response.json()
      
      // Create document with API response data
      const newDoc: UploadedDocument = {
        id: uploadResult.id || Date.now().toString(),
        name: file.name,
        file: file,
        pdfId: uploadResult.id || uploadResult.pdfId || uploadResult.pdf_id,
        sessionId: uploadResult.sessionId,
      }

      // Only allow 1 PDF at a time - replace existing one if present
      setUploadedDocuments([newDoc])
      setMessagesByDoc({ [newDoc.id]: [] })
      setActiveDocumentId(newDoc.id)

      const systemMessage: Message = {
        id: Date.now().toString(),
        role: ROLES.ASSISTANT,
        content: `I've received your PDF: "${file.name}". Ask me anything about its content - I can provide summaries, generate MCQs, explain concepts, and more.`,
        timestamp: new Date(),
      }
      setMessagesByDoc((prev) => ({ ...prev, [newDoc.id]: [systemMessage] }))
    } catch (error) {
      console.error("PDF upload error:", error)
      alert(error instanceof Error ? `Failed to upload PDF: ${error.message}` : "Failed to upload PDF. Please try again.")
    } finally {
      setIsUploadingPdf(false)
    }
  }

  const activeDocument = uploadedDocuments.find((doc) => doc.id === activeDocumentId)
  const currentMessages = (activeDocumentId && messagesByDoc[activeDocumentId]) || []

  return (
    <main className="min-h-screen from-background via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Chat with Brofessor
          </h1>
          <p className="text-muted-foreground">Ask questions about your PDF and get instant answers</p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {uploadedDocuments.length > 0 && (
              <DocumentTabs
                documents={uploadedDocuments}
                activeDocumentId={activeDocumentId}
                onSwitchDocument={handleSwitchDocument}
                onRemoveDocument={handleRemoveDocument}
              />
            )}

            {/* How it works */}
            <Card className="glass-effect border-gradient p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">How it works</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[10px]">•</span>
                  <span>Upload your PDF document</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[10px]">•</span>
                  <span>Ask questions about the content</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[10px]">•</span>
                  <span>Get instant text responses</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[10px]">•</span>
                  <span>Copy responses to clipboard</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[10px]">•</span>
                  <span>Ask follow-up questions</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[10px]">•</span>
                  <span>Chat history is maintained</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {uploadedDocuments.length === 0 ? (
              <PDFUploader onUpload={handlePdfUpload} isUploading={isUploadingPdf} />
            ) : (
              <Card className="glass-effect border-gradient shadow-2xl shadow-primary/10 h-[700px] flex flex-col">
                <CardHeader className="border-b border-white/10 from-primary/5 to-secondary/5">
                  <CardTitle className="text-2xl text-gradient flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    Chat with Brofessor
                  </CardTitle>
                  <CardDescription>
                    {activeDocument ? `Learning from: ${activeDocument.name}` : "Select a document to continue"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-full flex flex-col">
                    <ChatInterface messages={currentMessages} onSendMessage={handleSendMessage} isLoading={isLoading} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

