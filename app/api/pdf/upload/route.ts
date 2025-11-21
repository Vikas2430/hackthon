import { NextResponse } from "next/server"

/**
 * PLACEHOLDER API: PDF Upload
 * 
 * This is a placeholder route that proxies PDF uploads to the external Spring Boot backend.
 * 
 * Expected Backend API: ${BACKEND_API_URL}/api/pdf/upload
 * 
 * Environment Variable Required:
 * - BACKEND_API_URL: Base URL of your Spring Boot backend (e.g., http://localhost:8080)
 * 
 * Expected response format: { message: string, sessionId: string, id?: string, pdfId?: string, pdf_id?: string }
 * 
 * Current implementation: Proxies the request to the external API
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get backend URL from environment variable
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      return NextResponse.json(
        { error: "BACKEND_API_URL environment variable is not configured" },
        { status: 500 }
      )
    }
    
    // Proxy the request to the backend
    const backendFormData = new FormData()
    backendFormData.append("file", file)

    const response = await fetch(`${BACKEND_API_URL}/api/pdf/upload`, {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Upload failed" }))
      return NextResponse.json(
        { error: errorData.error || `Upload failed: ${response.status}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("PDF upload proxy error:", error)
    return NextResponse.json(
      { error: "Failed to upload PDF. Please check if the backend is running." },
      { status: 500 }
    )
  }
}

