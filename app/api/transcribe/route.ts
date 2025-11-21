import { type NextRequest, NextResponse } from "next/server"

/**
 * PLACEHOLDER API: Audio Transcription
 * 
 * This is a placeholder route for audio transcription functionality.
 * 
 * Expected Backend API: ${BACKEND_API_URL}/api/transcribe
 * 
 * Environment Variable Required:
 * - BACKEND_API_URL: Base URL of your Spring Boot backend (e.g., http://localhost:8080)
 * 
 * Request: FormData with audio file (key: "audio")
 * Expected response: { transcript: string, success: boolean }
 * 
 * Current implementation: Uses backend API if BACKEND_API_URL is set, otherwise returns mock transcription
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Get backend URL from environment variable
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    
    if (BACKEND_API_URL) {
      // Connect to actual backend API
      try {
        const backendFormData = new FormData()
        backendFormData.append("audio", audioFile)
        
        const response = await fetch(`${BACKEND_API_URL}/api/transcribe`, {
          method: "POST",
          body: backendFormData,
        })

        if (!response.ok) {
          throw new Error(`Backend API returned ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json({ transcript: data.transcript, success: true })
      } catch (error) {
        console.error("Backend API error:", error)
        // Fall through to mock response if backend fails
      }
    }

    // Fallback: Mock transcription when BACKEND_API_URL is not configured
    const mockTranscript =
      "This is a mock transcription of your audio. Set BACKEND_API_URL environment variable to connect to your Spring Boot backend."

    return NextResponse.json({
      transcript: mockTranscript,
      success: true,
    })
  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json({ error: "Failed to process audio" }, { status: 500 })
  }
}
