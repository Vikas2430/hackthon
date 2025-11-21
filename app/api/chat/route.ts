export async function POST(request: Request) {
  try {
    const { message, pdfId, history } = await request.json()

    // Validate input
    if (!message || message.trim() === "") {
      return Response.json({ error: "Message cannot be empty" }, { status: 400 })
    }

    // This simulates an AI response. Connect to your Spring Boot backend here.
    const mockResponses = [
      "That's an excellent question! Let me analyze the content for you...",
      "Based on the PDF, I can explain that concept in detail...",
      "Great question! Here's what the document says about that...",
      "I found relevant information about your query in the PDF...",
    ]

    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]

    // Add a small delay to simulate API processing
    await new Promise((resolve) => setTimeout(resolve, 800))

    return Response.json({ response })
  } catch (error) {
    console.error("[v0] API error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
