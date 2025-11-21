"use client"

import React, { useEffect, useRef, useState } from "react"

interface Live2DAvatarProps {
  isSpeaking?: boolean
  isConnected?: boolean
  modelPath?: string
}

export default function Live2DAvatar({
  isSpeaking = false,
  isConnected = false,
  modelPath,
}: Live2DAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    const init = async () => {
      try {
        // If modelPath is provided, load actual Live2D model
        // Otherwise use animated canvas avatar
        setIsLoaded(true)
      } catch (err) {
        console.error("Failed to initialize avatar:", err)
        setError("Failed to load avatar")
      }
    }

    init()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [modelPath])

  useEffect(() => {
    if (!canvasRef.current || !isLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 600

    const drawAvatar = () => {
      timeRef.current += 0.016 // ~60fps
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = 150

      // Breathing animation
      const breathe = Math.sin(timeRef.current * 2) * 3

      // Outer glow when speaking
      if (isSpeaking) {
        const glowRadius = baseRadius + 30 + Math.sin(timeRef.current * 8) * 10
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius)
        gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)")
        gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.2)")
        gradient.addColorStop(1, "rgba(99, 102, 241, 0)")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Body/Background
      const bodyGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bodyGradient.addColorStop(0, isConnected ? "#6366f1" : "#6b7280")
      bodyGradient.addColorStop(1, isConnected ? "#8b5cf6" : "#9ca3af")
      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY + 80, baseRadius + breathe, 0, Math.PI * 2)
      ctx.fill()

      // Head
      const headY = centerY - 60 + breathe
      ctx.fillStyle = "#fef3c7"
      ctx.beginPath()
      ctx.arc(centerX, headY, baseRadius * 0.7 + breathe, 0, Math.PI * 2)
      ctx.fill()

      // Hair
      ctx.fillStyle = "#1e293b"
      ctx.beginPath()
      ctx.arc(centerX, headY - 30, baseRadius * 0.75, 0, Math.PI, true)
      ctx.fill()

      // Eyes
      const eyeY = headY - 20
      const eyeSpacing = 35
      const blink = Math.sin(timeRef.current * 0.5) > 0.9 ? 0.3 : 1
      const eyeSize = 12 * blink

      ctx.fillStyle = "#1e293b"
      // Left eye
      ctx.beginPath()
      ctx.ellipse(centerX - eyeSpacing, eyeY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2)
      ctx.fill()
      // Right eye
      ctx.beginPath()
      ctx.ellipse(centerX + eyeSpacing, eyeY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Eye highlights
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(centerX - eyeSpacing - 3, eyeY - 3, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(centerX + eyeSpacing - 3, eyeY - 3, 4, 0, Math.PI * 2)
      ctx.fill()

      // Spectacles (Glasses) - More visible
      const glassesY = eyeY
      const lensRadius = 32
      
      // Draw glasses frame with thicker, darker lines
      ctx.strokeStyle = "#0f172a" // Very dark, almost black
      ctx.lineWidth = 5
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      
      // Left lens frame (thick circle)
      ctx.beginPath()
      ctx.arc(centerX - eyeSpacing, glassesY, lensRadius, 0, Math.PI * 2)
      ctx.stroke()
      
      // Right lens frame (thick circle)
      ctx.beginPath()
      ctx.arc(centerX + eyeSpacing, glassesY, lensRadius, 0, Math.PI * 2)
      ctx.stroke()
      
      // Bridge (connecting the two lenses) - thicker
      ctx.beginPath()
      ctx.moveTo(centerX - eyeSpacing + lensRadius - 2, glassesY)
      ctx.lineTo(centerX + eyeSpacing - lensRadius + 2, glassesY)
      ctx.stroke()
      
      // Temples (arms of the glasses) - more visible
      const templeLength = 30
      const templeY = glassesY + 8
      
      // Left temple
      ctx.beginPath()
      ctx.moveTo(centerX - eyeSpacing - lensRadius, glassesY + 2)
      ctx.lineTo(centerX - eyeSpacing - lensRadius - templeLength, templeY)
      ctx.stroke()
      
      // Right temple
      ctx.beginPath()
      ctx.moveTo(centerX + eyeSpacing + lensRadius, glassesY + 2)
      ctx.lineTo(centerX + eyeSpacing + lensRadius + templeLength, templeY)
      ctx.stroke()
      
      // Glass lens fill (semi-transparent to show it's glass)
      ctx.fillStyle = "rgba(200, 200, 255, 0.15)"
      ctx.beginPath()
      ctx.arc(centerX - eyeSpacing, glassesY, lensRadius - 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(centerX + eyeSpacing, glassesY, lensRadius - 3, 0, Math.PI * 2)
      ctx.fill()
      
      // Glass reflection effect (more visible highlight)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX - eyeSpacing - 10, glassesY - 10, 15, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(centerX + eyeSpacing - 10, glassesY - 10, 15, 0, Math.PI * 2)
      ctx.stroke()
      
      // Additional frame thickness for visibility
      ctx.strokeStyle = "#1e293b"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX - eyeSpacing, glassesY, lensRadius - 1, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(centerX + eyeSpacing, glassesY, lensRadius - 1, 0, Math.PI * 2)
      ctx.stroke()

      // Mouth - animated when speaking
      const mouthY = headY + 30
      let mouthWidth = 25
      let mouthHeight = 6

      if (isSpeaking) {
        const speakPhase = Math.sin(timeRef.current * 12)
        mouthWidth = 30 + speakPhase * 8
        mouthHeight = 8 + Math.abs(speakPhase) * 6
      }

      ctx.fillStyle = "#dc2626"
      ctx.beginPath()
      ctx.ellipse(centerX, mouthY, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Cheeks (blush when speaking)
      if (isSpeaking) {
        ctx.fillStyle = "rgba(255, 182, 193, 0.4)"
        ctx.beginPath()
        ctx.arc(centerX - 50, headY + 15, 15, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(centerX + 50, headY + 15, 15, 0, Math.PI * 2)
        ctx.fill()
      }

      // Bow Tie (red) - positioned below neck
      const bowTieY = headY + 120 + breathe
      const bowTieWidth = 50
      const bowTieHeight = 25
      
      // Left bow loop
      ctx.fillStyle = "#dc2626"
      ctx.beginPath()
      ctx.ellipse(centerX - 20, bowTieY, bowTieWidth / 2, bowTieHeight / 2, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Right bow loop
      ctx.beginPath()
      ctx.ellipse(centerX + 20, bowTieY, bowTieWidth / 2, bowTieHeight / 2, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Center knot
      ctx.fillStyle = "#991b1b"
      ctx.beginPath()
      ctx.ellipse(centerX, bowTieY, 8, 12, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Bow tie center highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.beginPath()
      ctx.ellipse(centerX - 20, bowTieY - 3, 12, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(centerX + 20, bowTieY - 3, 12, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Bow tie edges/shadow for depth
      ctx.strokeStyle = "#991b1b"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(centerX - 20, bowTieY, bowTieWidth / 2, bowTieHeight / 2, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(centerX + 20, bowTieY, bowTieWidth / 2, bowTieHeight / 2, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Connection indicator
      if (isConnected) {
        ctx.fillStyle = "#10b981"
        ctx.beginPath()
        ctx.arc(canvas.width - 25, 25, 12, 0, Math.PI * 2)
        ctx.fill()
        // Pulse effect
        ctx.strokeStyle = "rgba(16, 185, 129, 0.5)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(canvas.width - 25, 25, 12 + Math.sin(timeRef.current * 5) * 3, 0, Math.PI * 2)
        ctx.stroke()
      }

      animationFrameRef.current = requestAnimationFrame(drawAvatar)
    }

    drawAvatar()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isLoaded, isSpeaking, isConnected])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">{error}</p>
          <p className="text-xs text-muted-foreground">Using fallback avatar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{
          imageRendering: "auto",
        }}
      />
      {isSpeaking && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-xs font-medium text-primary animate-pulse">Speaking...</p>
        </div>
      )}
    </div>
  )
}

