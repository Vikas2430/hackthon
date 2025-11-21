"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Copy, Check, Sparkles } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function ChatInterface({ messages, onSendMessage, isLoading = false }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue)
      setInputValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-96">
            <div className="text-center">
              <div className="p-4 w-fit mx-auto rounded-full bg-linear-to-br from-primary to-secondary mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">Ready to learn</p>
              <p className="text-sm text-muted-foreground">Ask a question or use voice input to get started</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-xl px-5 py-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-linear-to-br from-primary to-secondary text-primary-foreground rounded-br-none shadow-lg shadow-primary/20"
                    : "bg-white/5 text-foreground rounded-bl-none border border-white/10 backdrop-blur-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-3 ${
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground/70"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="mt-3 h-6 px-2 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  >
                    {copiedId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-4 justify-start animate-pulse">
            <div className="bg-white/5 p-4 rounded-2xl rounded-bl-none border border-white/10">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 bg-linear-to-t from-background to-transparent p-6 space-y-4">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your PDF..."
            disabled={isLoading}
            className="input-focus bg-white/5 border-white/10 rounded-full placeholder:text-muted-foreground/50"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            size="icon"
            className="btn-primary rounded-full"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
