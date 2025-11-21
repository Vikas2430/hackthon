import { NextResponse } from "next/server"

import { AccessToken } from "livekit-server-sdk"
import type { VideoGrant } from "livekit-server-sdk"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const room = url.searchParams.get("room") || "default"
    const identity = `user_${Math.floor(Math.random() * 10000)}`

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "LiveKit API key/secret not configured" }, { status: 500 })
    }

    const at = new AccessToken(apiKey, apiSecret, { identity, ttl: "2h" })
    const grant: VideoGrant = {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    }
    at.addGrant(grant)

    // token lifetime is short by default; you can set ttlSeconds if needed
    const token = await at.toJwt()

    return NextResponse.json({ token, identity, room })
  } catch (err) {
    console.error("/api/get-token error:", err)
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 })
  }
}
