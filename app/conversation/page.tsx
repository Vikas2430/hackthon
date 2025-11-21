"use client"

import React, { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Volume2, Mic, MicOff, FileText, Upload, X, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react"
import {
  Room,
  RoomEvent,
  RemoteTrack,
  LocalTrack,
  createLocalTracks,
  Track,
  LocalAudioTrack,
  TrackPublication,
  RemoteParticipant,
} from "livekit-client"
import Live2DAvatar from "@/components/live2d-avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ConversationPage() {
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [joined, setJoined] = useState(false)
  const [status, setStatus] = useState<string>("Ready to start conversation")
  const [isProcessing, setIsProcessing] = useState(false)
  const [agentConnected, setAgentConnected] = useState(false)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const [teachingMode, setTeachingMode] = useState<"beginner" | "advanced" | "expert">("beginner")
  const [conversationUnderstanding, setConversationUnderstanding] = useState<{
    understood: number
    confused: number
    needMoreDetail: number
  }>({ understood: 0, confused: 0, needMoreDetail: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingCompleteRef = useRef<Promise<void> | null>(null)
  const localTracksRef = useRef<LocalTrack[]>([])
  const remoteAudioElementRef = useRef<HTMLMediaElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const speakingCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkIfAgentIsSpeaking = () => {
    if (!analyserRef.current || !remoteAudioElementRef.current) {
      setIsAgentSpeaking(false)
      return
    }

    try {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      setIsAgentSpeaking(average > 20)
    } catch (error) {
      setIsAgentSpeaking(false)
    }
  }

  const startLocalRecording = (tracks: LocalTrack[]) => {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return

    const mediaStreamTracks = tracks
      .map((track) => (track as LocalAudioTrack).mediaStreamTrack)
      .filter((t): t is MediaStreamTrack => Boolean(t))

    if (mediaStreamTracks.length === 0) return

    const stream = new MediaStream(mediaStreamTracks)
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
    mediaRecorderRef.current = recorder
    audioChunksRef.current = []

    recordingCompleteRef.current = new Promise((resolve) => {
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onerror = () => {
        resolve()
      }

      recorder.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          audioChunksRef.current = []
          if (blob.size > 0) {
            await sendAudioToBackend(blob)
          }
        } catch (error) {
          console.error("Failed to process recorded audio:", error)
        } finally {
          stream.getTracks().forEach((track) => track.stop())
          resolve()
        }
      }
    })

    recorder.start()
  }

  const sendAudioToBackend = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setStatus("Transcribing your conversation...")
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "conversation.webm")

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`)
      }

      const data = await response.json()
      if (data?.transcript) {
        setStatus(`Transcribed: "${data.transcript.substring(0, 50)}..."`)
      } else {
        setStatus("Conversation ended")
      }
    } catch (error) {
      console.error("Transcription error:", error)
      setStatus("Failed to transcribe audio")
    } finally {
      setIsProcessing(false)
    }
  }

  const attachRemoteTrack = (track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Audio) return

    const element = track.attach() as HTMLAudioElement
    element.autoplay = true
    element.controls = false
    element.muted = false
    remoteAudioElementRef.current = element

    // Create audio context for speech detection
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaElementSource(element)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Check if agent is speaking periodically
      speakingCheckIntervalRef.current = setInterval(checkIfAgentIsSpeaking, 100)
    } catch (error) {
      console.error("Failed to create audio context:", error)
    }

    setAgentConnected(true)
    setStatus("AI Teacher connected and ready")
  }

  const detachRemoteAudio = () => {
    if (speakingCheckIntervalRef.current) {
      clearInterval(speakingCheckIntervalRef.current)
      speakingCheckIntervalRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
    }

    if (analyserRef.current) {
      analyserRef.current = null
    }

    if (remoteAudioElementRef.current) {
      remoteAudioElementRef.current.pause()
      remoteAudioElementRef.current.srcObject = null
    }

    setIsAgentSpeaking(false)
    setAgentConnected(false)
  }

  const handlePdfUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      setStatus("Please upload a PDF file")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setStatus("File size must be less than 50MB")
      return
    }

    setIsUploadingPdf(true)
    setStatus("Uploading PDF...")
    try {
      // Store PDF locally for now (in a real app, you'd upload to a server)
      setUploadedPdf(file)
      setPdfName(file.name)
      setStatus(`PDF "${file.name}" uploaded successfully`)
    } catch (error) {
      console.error("PDF upload error:", error)
      setStatus("Failed to upload PDF")
    } finally {
      setIsUploadingPdf(false)
    }
  }

  const handlePdfRemove = () => {
    setUploadedPdf(null)
    setPdfName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const sendUnderstandingFeedback = async (roomInstance: Room) => {
    if (!roomInstance) return

    try {
      const encoder = new TextEncoder()
      const feedback = encoder.encode(
        JSON.stringify({
          type: "understanding_feedback",
          understanding: conversationUnderstanding,
          currentMode: teachingMode,
        })
      )
      await roomInstance.localParticipant.publishData(feedback, { reliable: true })
    } catch (error) {
      console.error("Failed to send understanding feedback:", error)
    }
  }


  const sendRealTimeFeedback = (feedbackType: "understood" | "confused" | "needMoreDetail") => {
    if (!room || !joined) return

    setConversationUnderstanding((prev) => ({
      ...prev,
      [feedbackType]: prev[feedbackType] + 1,
    }))

    sendUnderstandingFeedback(room)
    
    // Show brief feedback message
    const messages = {
      understood: "✓ Marked as understood",
      confused: "⚠ Marked as confusing - agent will slow down",
      needMoreDetail: "📖 Requested more detail",
    }
    setStatus(messages[feedbackType])
    setTimeout(() => {
      if (agentConnected) {
        setStatus("AI Teacher connected and ready")
      }
    }, 2000)
  }

  const handleJoin = async () => {
    try {
      setStatus("Requesting access token...")
      // Include PDF name in room name or metadata if PDF is uploaded
      const roomName = uploadedPdf
        ? `conversation-${pdfName?.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}`
        : `conversation-${Date.now()}`
      const res = await fetch(`/api/get-token?room=${encodeURIComponent(roomName)}`)
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || "Failed to get token")
        return
      }

      setStatus("Connecting to room...")
      const LIVEKIT_URL =
        process.env.NEXT_PUBLIC_LIVEKIT_URL ||
        process.env.LIVEKIT_URL ||
        "wss://prod-cc-assignment-interview-bp81aadg.livekit.cloud"

      const _room = new Room()
      await _room.connect(LIVEKIT_URL, data.token)
      setRoom(_room)
      setJoined(true)
      setStatus("Connected — waiting for AI Teacher...")

      // Send PDF info and teaching mode via room metadata
      try {
        // Set participant metadata with session info
        const metadata = {
          pdfName: pdfName || null,
          hasPdf: !!uploadedPdf,
          teachingMode: teachingMode,
        }
        await _room.localParticipant.setMetadata(JSON.stringify(metadata))

        // Also send via data channel for real-time delivery
        const encoder = new TextEncoder()
        const data = encoder.encode(
          JSON.stringify({
            type: "session_config",
            ...metadata,
          })
        )
        await _room.localParticipant.publishData(data, { reliable: true })
      } catch (error) {
        console.error("Failed to send session config:", error)
      }

      // Listen for data messages from agent to adapt teaching
      _room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
        if (participant?.identity?.includes("agent") || participant?.identity?.includes("teacher")) {
          try {
            const decoder = new TextDecoder()
            const message = JSON.parse(decoder.decode(payload))
            
            // Handle agent requests for feedback
            if (message.type === "request_feedback") {
              // Agent is asking for understanding level
              sendUnderstandingFeedback(_room)
            }
            
            // Handle dynamic mode adjustment suggestions
            if (message.type === "mode_suggestion") {
              const suggestedMode = message.suggestedMode
              if (suggestedMode && suggestedMode !== teachingMode) {
                setStatus(`Agent suggests switching to ${suggestedMode} mode based on your responses`)
              }
            }
          } catch (error) {
            console.error("Failed to parse data message:", error)
          }
        }
      })

      const tracks = await createLocalTracks({ audio: true, video: false })
      localTracksRef.current = tracks
      for (const t of tracks) {
        if (t.kind === Track.Kind.Audio) {
          await _room.localParticipant.publishTrack(t)
        }
      }

      startLocalRecording(tracks)

      const handleTrackSubscribed = (
        track: RemoteTrack,
        _publication: TrackPublication,
        participant: RemoteParticipant
      ) => {
        if (track.kind === Track.Kind.Audio) {
          setStatus(`AI Teacher "${participant.identity}" joined`)
          attachRemoteTrack(track)
        }
      }

      const handleTrackUnsubscribed = (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          detachRemoteAudio()
          setStatus("AI Teacher disconnected")
        }
      }

      _room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      _room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)

      setStatus("Waiting for AI Teacher to join...")
    } catch (err: any) {
      console.error("LiveKit join error:", err)
      setStatus(err?.message || "Failed to join room")
    }
  }

  const handleLeave = async () => {
    if (!room) return

    try {
      setStatus("Ending conversation...")
      room.removeAllListeners()
      room.disconnect()
      setRoom(null)
      setJoined(false)
      detachRemoteAudio()
      setStatus("Processing conversation...")

      localTracksRef.current.forEach((track) => track.stop())
      localTracksRef.current = []

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }

      if (recordingCompleteRef.current) {
        await recordingCompleteRef.current
        recordingCompleteRef.current = null
      } else {
        setStatus("Conversation ended")
      }
    } catch (error) {
      console.error("LiveKit leave error:", error)
      setStatus("Failed to leave room")
    }
  }

  const toggleMute = () => {
    if (!room) return
    const audioTracks = localTracksRef.current.filter((t) => t.kind === Track.Kind.Audio)
    const newMutedState = !isMuted
    audioTracks.forEach((track) => {
      if (track instanceof LocalAudioTrack) {
        // Access the underlying MediaStreamTrack and toggle its enabled state
        const mediaStreamTrack = track.mediaStreamTrack
        if (mediaStreamTrack) {
          mediaStreamTrack.enabled = !newMutedState // enabled = false means muted
        }
      }
    })
    setIsMuted(newMutedState)
  }

  useEffect(() => {
    return () => {
      if (speakingCheckIntervalRef.current) {
        clearInterval(speakingCheckIntervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error)
      }
      if (room) {
        room.disconnect()
      }
    }
  }, [room])

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
            Back to Chat
          </Button>
          <h1 className="text-4xl font-bold text-gradient mb-2">Live Conversation</h1>
          <p className="text-muted-foreground">Talk with your AI Teacher in real-time</p>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Teaching Mode & PDF Upload */}
          {!joined && (
            <div className="lg:col-span-1 space-y-4">
              {/* Teaching Mode Selection - Compact */}
              <Card className="glass-effect border-gradient p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Teaching Mode</h3>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover:bg-white/5 ${
                      teachingMode === "beginner"
                        ? "border-primary/50 bg-primary/5"
                        : "border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="teachingMode"
                      value="beginner"
                      checked={teachingMode === "beginner"}
                      onChange={(e) => setTeachingMode(e.target.value as "beginner")}
                      className="w-3 h-3 text-primary border-white/20 focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-foreground">Beginner</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover:bg-white/5 ${
                      teachingMode === "advanced"
                        ? "border-primary/50 bg-primary/5"
                        : "border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="teachingMode"
                      value="advanced"
                      checked={teachingMode === "advanced"}
                      onChange={(e) => setTeachingMode(e.target.value as "advanced")}
                      className="w-3 h-3 text-primary border-white/20 focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-foreground">Advanced</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover:bg-white/5 ${
                      teachingMode === "expert"
                        ? "border-primary/50 bg-primary/5"
                        : "border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="teachingMode"
                      value="expert"
                      checked={teachingMode === "expert"}
                      onChange={(e) => setTeachingMode(e.target.value as "expert")}
                      className="w-3 h-3 text-primary border-white/20 focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-foreground">Expert</span>
                  </label>
                </div>
              </Card>

              {/* PDF Upload - Compact */}
              <Card className="glass-effect border-gradient p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      PDF
                    </h3>
                    {uploadedPdf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePdfRemove}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  {uploadedPdf ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{pdfName}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-3 text-center transition-all cursor-pointer ${
                        isUploadingPdf
                          ? "border-primary/50 bg-primary/5"
                          : "border-white/20 hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handlePdfUpload(file)
                        }}
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-foreground mb-0.5">Upload PDF</p>
                      <p className="text-[10px] text-muted-foreground">Max 50MB</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* How it works - Compact */}
              <Card className="glass-effect border-gradient p-4">
                <h3 className="font-semibold text-foreground  text-sm">How it works</h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>Select teaching mode</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>Upload PDF (optional)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>Start conversation</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>AI adapts to your mode</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>Use feedback buttons</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>Avatar animates when speaking</span>
                  </li>
                </ul>
              </Card>
            </div>
          )}

          {/* Sidebar when joined - Show only How it works */}
          {joined && (
            <div className="lg:col-span-1">
              <Card className="glass-effect border-gradient p-4">
                <h3 className="font-semibold text-foreground text-sm">How it works</h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>AI adapts to your mode</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>Use feedback buttons</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>Avatar animates when speaking</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[10px]">•</span>
                    <span>Use mute to disable mic</span>
                  </li>
                </ul>
              </Card>
            </div>
          )}

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Main Conversation Card */}
            <Card className="glass-effect border-gradient shadow-2xl shadow-primary/10 p-8">
          <div className="flex flex-col items-center space-y-8">
            {/* Live2D AI Teacher Avatar */}
            <div className="flex-1 flex items-center justify-center py-8 min-h-[400px]">
              <div className="w-full max-w-md h-[600px]">
                <Live2DAvatar isSpeaking={isAgentSpeaking} isConnected={agentConnected} />
              </div>
            </div>

            {/* Status */}
            <div className="text-center space-y-2">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  agentConnected
                    ? "bg-emerald-400/20 text-emerald-400"
                    : joined
                      ? "bg-yellow-400/20 text-yellow-400"
                      : "bg-muted/20 text-muted-foreground"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    agentConnected ? "bg-emerald-400" : joined ? "bg-yellow-400" : "bg-muted-foreground"
                  }`}
                />
                {agentConnected ? "AI Teacher Connected" : joined ? "Waiting for AI Teacher" : "Not Connected"}
              </div>
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>

            {/* Session Info when connected */}
            {joined && (
              <div className="w-full space-y-3">
                {uploadedPdf && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Teaching from: {pdfName}</p>
                        <p className="text-xs text-muted-foreground">AI Teacher is using this PDF to guide the conversation</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-secondary">M</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Teaching Mode:{" "}
                        <span className="capitalize text-secondary">{teachingMode}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {teachingMode === "beginner"
                          ? "Simple explanations with step-by-step guidance"
                          : teachingMode === "advanced"
                            ? "Deeper insights with technical details"
                            : "High-level analysis with complex reasoning"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Feedback Buttons */}
            {joined && agentConnected && (
              <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs font-medium text-muted-foreground mb-3">Give Feedback to Agent:</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendRealTimeFeedback("understood")}
                    className="flex-1 border-emerald-400/30 hover:bg-emerald-400/10 text-emerald-400"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Understood
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendRealTimeFeedback("confused")}
                    className="flex-1 border-yellow-400/30 hover:bg-yellow-400/10 text-yellow-400"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Confused
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendRealTimeFeedback("needMoreDetail")}
                    className="flex-1 border-blue-400/30 hover:bg-blue-400/10 text-blue-400"
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    More Detail
                  </Button>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="w-full space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={joined ? handleLeave : handleJoin}
                  disabled={isProcessing || isUploadingPdf}
                  className="btn-primary flex-1 rounded-xl py-6 text-lg font-semibold"
                >
                  {joined ? "End Conversation" : "Start Conversation"}
                </Button>
                {joined && (
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    className="rounded-xl px-6 border-white/10"
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                )}
              </div>

              {isProcessing && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    Processing conversation...
                  </p>
                </div>
              )}
            </div>
          </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}


