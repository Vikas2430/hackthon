# HelpmeStudy - AI-Powered Learning Companion

This is a [Next.js](https://nextjs.org) project that provides an AI-powered learning platform with PDF analysis, voice interactions, and real-time LiveKit conversations.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Environment Variables

```env
# LiveKit Configuration (Required for real-time conversations)
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### Optional Environment Variables

```env
# Backend API Configuration (Required for PDF upload, chat, and transcription)
# If not set, the app will use mock responses
BACKEND_API_URL=http://localhost:8080
```

### Environment Variable Reference

| Variable Name | Required | Purpose | Used By |
|--------------|----------|---------|---------|
| `LIVEKIT_URL` | ✅ Yes | LiveKit server WebSocket URL | `/api/get-token`, `app/conversation/page.tsx` |
| `LIVEKIT_API_KEY` | ✅ Yes | LiveKit API key for token generation | `/api/get-token` |
| `LIVEKIT_API_SECRET` | ✅ Yes | LiveKit API secret for token generation | `/api/get-token` |
| `BACKEND_API_URL` | ⚠️ Optional | Base URL of Spring Boot backend | `/api/pdf/upload`, `/api/chat`, `/api/transcribe` |

**Note:** If `BACKEND_API_URL` is not set, the chat and transcription APIs will return mock responses. The PDF upload API will return an error if `BACKEND_API_URL` is not configured.

## API Placeholders

This project includes placeholder API routes that need to be connected to your backend services. Below is a list of all API placeholders and their locations:

### 1. PDF Upload API
**Location:** `app/api/pdf/upload/route.ts`

**Status:** ⚠️ PLACEHOLDER - Proxies to external API

**Purpose:** Handles PDF file uploads to the backend

**Environment Variable:** `BACKEND_API_URL` (Required)

**Expected Backend:** `${BACKEND_API_URL}/api/pdf/upload`

**Request Format:**
- Method: POST
- Body: FormData with `file` field (PDF file)

**Expected Response:**
```json
{
  "id": "string",
  "pdfId": "string" // or "pdf_id"
}
```

**Configuration:**
- Set `BACKEND_API_URL` environment variable (e.g., `http://localhost:8080`)
- Ensure backend CORS is configured to allow requests from frontend
- The API will return an error if `BACKEND_API_URL` is not set

---

### 2. Chat API
**Location:** `app/api/chat/route.ts`

**Status:** ⚠️ PLACEHOLDER - Uses backend if configured, otherwise returns mock responses

**Purpose:** Handles chat messages with PDF context

**Environment Variable:** `BACKEND_API_URL` (Optional)

**Expected Backend:** `${BACKEND_API_URL}/api/chat`

**Request Format:**
```json
{
  "message": "string",
  "pdfId": "string",
  "history": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ]
}
```

**Expected Response:**
```json
{
  "response": "string"
}
```

**Configuration:**
- Set `BACKEND_API_URL` environment variable to enable backend integration
- If `BACKEND_API_URL` is not set, the API returns mock responses
- Automatically falls back to mock responses if backend API call fails

---

### 3. Audio Transcription API
**Location:** `app/api/transcribe/route.ts`

**Status:** ⚠️ PLACEHOLDER - Uses backend if configured, otherwise returns mock transcription

**Purpose:** Transcribes audio files to text

**Environment Variable:** `BACKEND_API_URL` (Optional)

**Expected Backend:** `${BACKEND_API_URL}/api/transcribe`

**Request Format:**
- Method: POST
- Body: FormData with `audio` field (audio file blob)

**Expected Response:**
```json
{
  "transcript": "string",
  "success": true
}
```

**Configuration:**
- Set `BACKEND_API_URL` environment variable to enable backend integration
- If `BACKEND_API_URL` is not set, the API returns mock transcription
- Automatically falls back to mock transcription if backend API call fails

---

### 4. LiveKit Token Generation API
**Location:** `app/api/get-token/route.ts`

**Status:** ✅ IMPLEMENTED - Fully functional

**Purpose:** Generates LiveKit access tokens for real-time audio/video connections

**Environment Variables Required:**
- `LIVEKIT_API_KEY` (Required)
- `LIVEKIT_API_SECRET` (Required)
- `LIVEKIT_URL` (Optional, has default fallback)

**Query Parameters:**
- `room`: Room name (optional, defaults to "default")

**Response:**
```json
{
  "token": "string",
  "identity": "string",
  "room": "string"
}
```

**No action needed** - This API is fully implemented and working.

---

## External API Integration

### Spring Boot Backend
The application expects a Spring Boot backend running at `http://localhost:8080` with the following endpoints:

1. **POST /api/pdf/upload**
   - Uploads PDF files
   - Returns PDF ID for use in chat

2. **POST /api/chat** (or similar)
   - Handles chat messages with PDF context
   - Returns AI-generated responses

3. **POST /api/transcribe** (or similar)
   - Transcribes audio files
   - Returns text transcript

**CORS Configuration:**
Ensure your Spring Boot backend allows CORS requests from `http://localhost:3000` (or your frontend URL).

---

## Project Structure

```
aiself/
├── app/
│   ├── api/                    # API routes
│   │   ├── chat/               # ⚠️ PLACEHOLDER - Chat API
│   │   ├── get-token/          # ✅ IMPLEMENTED - LiveKit tokens
│   │   ├── pdf/
│   │   │   └── upload/         # ⚠️ PLACEHOLDER - PDF upload proxy
│   │   └── transcribe/         # ⚠️ PLACEHOLDER - Audio transcription
│   ├── conversation/           # LiveKit conversation page
│   └── page.tsx                # Main chat page
├── components/
│   ├── chat-interface.tsx     # Chat UI component
│   ├── live2d-avatar.tsx      # Animated avatar component
│   ├── pdf-uploader.tsx        # PDF upload component
│   └── ...
└── lib/
    └── types.ts                # TypeScript type definitions
```

---

## Features

- **PDF Analysis**: Upload and chat with PDF documents
- **Voice Input**: Record and transcribe audio
- **LiveKit Integration**: Real-time voice conversations with AI teacher
- **Teaching Modes**: Beginner, Advanced, and Expert modes
- **Animated Avatar**: Live2D-style animated teacher avatar with spectacles and bow tie

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
