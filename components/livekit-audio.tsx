"use client"

import React, { useRef, useState } from "react"
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

interface LiveKitAudioProps {
  onTranscript?: (text: string) => void
  roomName?: string
  isLoading?: boolean
}

export default function LiveKitAudio({ onTranscript, roomName = "default", isLoading = false }: LiveKitAudioProps) {
  const [room, setRoom] = useState<Room | null>(null)
  const [joined, setJoined] = useState(false)
  const [status, setStatus] = useState<string | null>("Waiting to join")
  const [isProcessing, setIsProcessing] = useState(false)
  const [agentConnected, setAgentConnected] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingCompleteRef = useRef<Promise<void> | null>(null)
  const localTracksRef = useRef<LocalTrack[]>([])
  const remoteAudioContainerRef = useRef<HTMLDivElement>(null)
  const remoteAudioElementRef = useRef<HTMLMediaElement | null>(null)

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

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
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
    setStatus("Transcribing audio...")
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "livekit-audio.webm")

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`)
      }

      const data = await response.json()
      if (data?.transcript) {
        onTranscript?.(data.transcript)
        setStatus("Transcription sent to chat")
      } else {
        setStatus("No transcript returned")
      }
    } catch (error) {
      console.error("Transcription error:", error)
      setStatus(error instanceof Error ? error.message : "Failed to transcribe audio")
    } finally {
      setIsProcessing(false)
    }
  }

  const attachRemoteTrack = (track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Audio) return
    const element = track.attach()
    element.autoplay = true
    element.controls = false
    if (element instanceof HTMLVideoElement) {
      element.playsInline = true
    }
    element.muted = false
    remoteAudioElementRef.current = element
    if (remoteAudioContainerRef.current) {
      remoteAudioContainerRef.current.innerHTML = ""
      remoteAudioContainerRef.current.appendChild(element)
    }
    setAgentConnected(true)
  }

  const detachRemoteAudio = () => {
    if (remoteAudioElementRef.current) {
      remoteAudioElementRef.current.pause()
      remoteAudioElementRef.current.srcObject = null
    }
    if (remoteAudioContainerRef.current) {
      remoteAudioContainerRef.current.innerHTML = ""
    }
    setAgentConnected(false)
  }

  const handleJoin = async () => {
    try {
      setStatus("Requesting token...")
      const res = await fetch(`/api/get-token?room=${encodeURIComponent(roomName)}`)
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || "Failed to get token")
        return
      }

      setStatus("Connecting to LiveKit...")
      // Use the LIVEKIT_URL from your environment on the server side. Here we derive the URL
      // from an env variable exposed via Next.js runtime if you prefer — for now use the public url
      const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || "wss://prod-cc-assignment-interview-bp81aadg.livekit.cloud"

      const _room = new Room()
      await _room.connect(LIVEKIT_URL, data.token)
      setRoom(_room)
      setJoined(true)
      setStatus("Connected — publishing audio...")

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
          setStatus(`Listening to ${participant.identity}`)
          attachRemoteTrack(track)
        }
      }

      const handleTrackUnsubscribed = (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          detachRemoteAudio()
          setStatus("Agent disconnected")
        }
      }

      _room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      _room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)

      setStatus("Waiting for agent to join...")
    } catch (err: any) {
      console.error("LiveKit join error:", err)
      setStatus(err?.message || "Failed to join")
    }
  }

  const handleLeave = async () => {
    if (!room) return

    try {
      setStatus("Leaving room...")
      room.removeAllListeners()
      room.disconnect()
      setRoom(null)
      setJoined(false)
      detachRemoteAudio()
      setStatus("Left room — processing audio")

      localTracksRef.current.forEach((track) => track.stop())
      localTracksRef.current = []

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }

      if (recordingCompleteRef.current) {
        await recordingCompleteRef.current
        recordingCompleteRef.current = null
      } else {
        setStatus("Left room")
      }
    } catch (error) {
      console.error("LiveKit leave error:", error)
      setStatus("Failed to leave room")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Live Conversation</p>
          <p className="text-xs text-muted-foreground">{status}</p>
        </div>
        <div
          className={`flex items-center gap-2 text-xs font-semibold ${
            agentConnected ? "text-emerald-400" : joined ? "text-yellow-400" : "text-muted-foreground"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${agentConnected ? "bg-emerald-400" : joined ? "bg-yellow-400" : "bg-muted-foreground"}`} />
          {agentConnected ? "Agent connected" : joined ? "Waiting for agent" : "Idle"}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleJoin}
          disabled={joined || isLoading || isProcessing}
          className="btn-primary flex-1 rounded-xl py-3 font-semibold"
        >
          {joined ? "Connected" : "Join Room"}
        </button>
        <button
          onClick={handleLeave}
          disabled={!joined}
          className="rounded-xl py-3 px-4 border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Leave
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-muted-foreground mb-3">Agent audio</p>
        <div
          ref={remoteAudioContainerRef}
          className={`h-24 flex items-center justify-center rounded-xl border ${
            agentConnected ? "border-emerald-400/50 bg-emerald-400/5" : "border-white/10 border-dashed"
          }`}
        >
          {agentConnected ? (
            <div className="text-sm text-emerald-200 font-medium">Listening to agent...</div>
          ) : (
            <div className="text-xs text-muted-foreground text-center">
              Agent audio will appear here once they join the room.
            </div>
          )}
        </div>
      </div>

      {isProcessing && <p className="text-xs text-muted-foreground">Uploading and transcribing your audio...</p>}
    </div>
  )
}
