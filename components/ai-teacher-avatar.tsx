"use client"

import React, { useEffect, useState } from "react"
import { Brain, Sparkles } from "lucide-react"

interface AITeacherAvatarProps {
  isSpeaking?: boolean
  isConnected?: boolean
  size?: "sm" | "md" | "lg"
}

export default function AITeacherAvatar({ isSpeaking = false, isConnected = false, size = "lg" }: AITeacherAvatarProps) {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    if (!isSpeaking) {
      setAnimationPhase(0)
      return
    }

    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4)
    }, 200)

    return () => clearInterval(interval)
  }, [isSpeaking])

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  }

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const pulseSizes = {
    sm: "w-28 h-28",
    md: "w-40 h-40",
    lg: "w-56 h-56",
  }

  const getMouthShape = () => {
    if (!isSpeaking) return "h-1"
    const shapes = ["h-2", "h-3", "h-2", "h-1"]
    return shapes[animationPhase]
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow when speaking */}
      {isSpeaking && (
        <div
          className={`absolute ${pulseSizes[size]} rounded-full bg-primary/20 animate-pulse`}
          style={{
            animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      )}

      {/* Middle ring */}
      {isSpeaking && (
        <div
          className={`absolute ${pulseSizes[size]} rounded-full border-2 border-primary/40`}
          style={{
            animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
          }}
        />
      )}

      {/* Main avatar container */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full from-primary via-primary/90 to-secondary flex items-center justify-center shadow-2xl shadow-primary/30 transition-all duration-300 ${
          isSpeaking ? "scale-105" : "scale-100"
        } ${isConnected ? "ring-4 ring-emerald-400/50" : "ring-2 ring-white/20"}`}
      >
        {/* Face background */}
        <div className="absolute inset-2 rounded-full from-white/10 to-white/5 backdrop-blur-sm" />

        {/* Eyes */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-3 -translate-y-1/2">
          <div
            className={`w-3 h-3 rounded-full bg-primary transition-all duration-200 ${
              isSpeaking ? "animate-blink" : ""
            }`}
            style={{
              animation: isSpeaking ? "blink 0.3s ease-in-out infinite" : "none",
            }}
          />
          <div
            className={`w-3 h-3 rounded-full bg-primary transition-all duration-200 ${
              isSpeaking ? "animate-blink" : ""
            }`}
            style={{
              animation: isSpeaking ? "blink 0.3s ease-in-out infinite" : "none",
            }}
          />
        </div>

        {/* Mouth - animated when speaking */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div
            className={`w-8 ${getMouthShape()} rounded-full bg-primary transition-all duration-200 ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          />
        </div>

        {/* Icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Brain className={`${iconSizes[size]} text-white`} />
        </div>

        {/* Sparkles when speaking */}
        {isSpeaking && (
          <>
            <Sparkles
              className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse"
              style={{ animationDelay: "0s" }}
            />
            <Sparkles
              className="absolute -bottom-2 -left-2 w-5 h-5 text-secondary animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <Sparkles
              className="absolute top-1/2 -left-3 w-4 h-4 text-primary animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </>
        )}

        {/* Connection indicator */}
        <div
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-background ${
            isConnected ? "bg-emerald-400" : "bg-gray-400"
          } transition-colors`}
        />
      </div>

      {/* Status text */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <p className="text-xs font-medium text-foreground">
          {isSpeaking ? "Speaking..." : isConnected ? "AI Teacher" : "Waiting..."}
        </p>
      </div>

    </div>
  )
}

