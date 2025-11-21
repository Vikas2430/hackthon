"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { Message, UploadedDocument } from "@/lib/types"
import { LS_KEYS, ROLES } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PDFUploader from "@/components/pdf-uploader"
import ChatInterface from "@/components/chat-interface"
import DocumentTabs from "@/components/document-tabs"
import Link from "next/link"
import { Sparkles, Zap, Brain, Volume2 } from "lucide-react"


export default function Home() {
  const [messagesByDoc, setMessagesByDoc] = useState<Record<string, Message[]>>({})
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)


  useEffect(() => {
    try {
      localStorage.removeItem(LS_KEYS.uploads)
      localStorage.removeItem(LS_KEYS.messages)
      localStorage.removeItem(LS_KEYS.active)
    } catch (e) {
      console.warn("Failed to clear persisted data on mount:", e)
    }
 
    setUploadedDocuments([])
    setMessagesByDoc({})
    setActiveDocumentId(null)
  }, [])
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
        pdfId: uploadResult.id || uploadResult.pdfId || uploadResult.pdf_id, // Store PDF ID from API
        sessionId: uploadResult.sessionId, // Store sessionId from API
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
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: ROLES.ASSISTANT,
        content: error instanceof Error ? `Failed to upload PDF: ${error.message}` : "Failed to upload PDF. Please try again.",
        timestamp: new Date(),
      }
      // Show error in chat if there's an active document, otherwise show alert
      if (activeDocumentId) {
        setMessagesByDoc((prev) => {
          const prevMsgs = prev[activeDocumentId] ?? []
          return { ...prev, [activeDocumentId]: [...prevMsgs, errorMessage] }
        })
      }
    } finally {
      setIsUploadingPdf(false)
    }
  }

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

  const handleVoiceInput = async (transcript: string) => {
    await handleSendMessage(transcript)
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

  const handleUploadAnotherClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      handlePdfUpload(file)
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
        {/* Premium Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in">
            <div className="p-3 rounded-full from-primary to-secondary shadow-lg shadow-primary/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gradient">HelpmeStudy</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-2">Your AI-Powered Learning Companion</p>
          <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto">
            Transform your learning with advanced AI analysis, voice interactions, and instant insights from any PDF.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Live Conversation Banner */}
            <Link href="/conversation">
              <div className="glass-effect rounded-2xl p-6 border-gradient cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group mb-4 from-primary/10 via-secondary/5 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl from-primary to-secondary group-hover:scale-110 transition-transform">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Live Conversation</h3>
                    <p className="text-xs text-muted-foreground mt-1">Talk with AI Teacher</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Have a real-time voice conversation with your AI Teacher. The avatar animates when speaking.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary group-hover:gap-3 transition-all">
                  Start Conversation
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Features Showcase */}
            <div className="glass-effect rounded-2xl p-6 border-gradient">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Capabilities
              </h3>
              <div className="space-y-3">
                <FeatureItem icon={Brain} label="Smart Analysis" desc="Instant PDF insights" />
                <FeatureItem icon={Volume2} label="Voice Input" desc="Speak your questions" />
                <FeatureItem icon={Sparkles} label="AI Responses" desc="Expert explanations" />
              </div>
            </div>

            {uploadedDocuments.length > 0 && (
              <DocumentTabs
                documents={uploadedDocuments}
                activeDocumentId={activeDocumentId}
                onSwitchDocument={handleSwitchDocument}
                onRemoveDocument={handleRemoveDocument}
              />
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {uploadedDocuments.length === 0 ? (
              <PDFUploader onUpload={handlePdfUpload} isUploading={isUploadingPdf} />
            ) : (
              <Card className="glass-effect border-gradient shadow-2xl shadow-primary/10 h-[700px] flex flex-col">
                <CardHeader className="border-b border-white/10  from-primary/5 to-secondary/5">
                  <CardTitle className="text-2xl text-gradient">Chat with Your PDF</CardTitle>
                  <CardDescription>
                    {activeDocument ? `Currently viewing: ${activeDocument.name}` : "Select a document to continue"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-full flex flex-col">
                    <ChatInterface messages={currentMessages} onSendMessage={handleSendMessage} isLoading={isLoading} />
                    <div className="p-4 border-t border-white/10 bg-white/5 flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                        aria-label="Upload another PDF"
                      />
                      <button
                        onClick={handleUploadAnotherClick}
                        className="px-4 py-2 text-sm font-medium rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                      >
                        + Upload another PDF
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Feature Grid */}
        {uploadedDocuments.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <PremiumFeatureCard
              icon={Brain}
              title="Deep Analysis"
              description="AI-powered analysis of your PDFs with comprehensive understanding"
            />
            <PremiumFeatureCard
              icon={Volume2}
              title="Voice Interaction"
              description="Ask questions naturally using voice-to-text technology"
            />
            <PremiumFeatureCard
              icon={Sparkles}
              title="Smart Responses"
              description="Get summaries, MCQs, explanations, and more instantly"
            />
          </div>
        )}
      </div>
    </main>
  )
}

function FeatureItem({ icon: Icon, label, desc }: { icon: any; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
      <Icon className="w-4 h-4 text-secondary mt-1 " />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function PremiumFeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="glass-effect rounded-2xl p-6 border-gradient card-hover group">
      <div className="p-3 w-fit rounded-lg  from-primary to-secondary mb-4 group-hover:shadow-lg group-hover:shadow-primary/30 smooth-transition">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
