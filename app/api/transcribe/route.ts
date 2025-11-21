import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }
    const mockTranscript =
      "This is a mock transcription of your audio. Connect your Spring Boot backend to get real transcriptions."

    return NextResponse.json({
      transcript: mockTranscript,
      success: true,
    })
  } catch (error) {
    console.error("", error)
    return NextResponse.json({ error: "Failed to process audio" }, { status: 500 })
  }
}
