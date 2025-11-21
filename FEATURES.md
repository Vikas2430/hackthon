# HelpmeStudy - Complete Feature Documentation

## Overview
HelpmeStudy is an AI-powered learning companion platform built with Next.js that enables users to interact with PDF documents through text chat and real-time voice conversations with an animated AI teacher avatar.

---

## 🎯 Core Features

### 1. **PDF Document Management**

#### 1.1 PDF Upload System
- **Location**: `app/page.tsx`, `components/pdf-uploader.tsx`
- **Features**:
  - **Drag & Drop Upload**: Users can drag and drop PDF files directly onto the upload area
  - **File Browser**: Traditional file picker for selecting PDFs
  - **File Validation**: 
    - Only accepts PDF files (`.pdf` extension)
    - Maximum file size: 50MB
    - Real-time validation with error messages
  - **Upload Progress**: Visual progress bar during upload
  - **Single Document Limit**: Only one PDF can be active at a time (replaces previous upload)
  - **Backend Integration**: Uploads to `/api/pdf/upload` which proxies to `BACKEND_API_URL/api/pdf/upload`
  - **PDF ID Storage**: Stores PDF ID returned from backend API for use in chat

#### 1.2 Document Management
- **Location**: `components/document-tabs.tsx`
- **Features**:
  - **Active Document Display**: Shows currently uploaded PDF in sidebar
  - **Document Switching**: Click to switch between documents (if multiple exist)
  - **Document Removal**: Remove documents with X button
  - **Visual Indicators**: Active document highlighted with primary color
  - **Document Count**: Shows "Active Documents" (count removed per user request)

---

### 2. **Text-Based Chat Interface**

#### 2.1 Chat Functionality
- **Location**: `app/page.tsx`, `components/chat-interface.tsx`
- **Features**:
  - **Message Display**: 
    - User messages: Right-aligned with gradient background
    - Assistant messages: Left-aligned with glass effect
    - Timestamps for each message
    - Smooth scrolling to latest message
  - **Message Input**:
    - Text input field with placeholder
    - Send button (disabled when loading or empty)
    - Enter key to send (Shift+Enter for new line)
    - Loading state during API calls
  - **Copy to Clipboard**: Copy assistant responses with one click
  - **Empty State**: Friendly message when no conversation started
  - **Error Handling**: Displays error messages in chat interface

#### 2.2 Chat API Integration
- **Location**: `app/api/chat/route.ts`
- **Features**:
  - **Backend Integration**: Connects to `${BACKEND_API_URL}/api/chat` if configured
  - **Request Format**:
    ```json
    {
      "message": "string",
      "pdfId": "string",
      "history": [
        { "role": "user|assistant", "content": "string" }
      ]
    }
    ```
  - **Response Format**:
    ```json
    {
      "response": "string"
    }
    ```
  - **Fallback**: Returns mock responses if `BACKEND_API_URL` not configured
  - **Conversation History**: Maintains full conversation context per document

---

### 3. **LiveKit Real-Time Voice Conversation**

#### 3.1 LiveKit Integration
- **Location**: `app/conversation/page.tsx`
- **Features**:
  - **Room Connection**: 
    - Generates unique room names (with PDF name if uploaded)
    - Connects to LiveKit server via WebSocket
    - Token-based authentication (2-hour token lifetime)
  - **Audio Publishing**: 
    - Captures user microphone audio
    - Publishes audio track to LiveKit room
    - Real-time audio streaming
  - **Audio Subscription**: 
    - Subscribes to AI teacher's audio track
    - Plays remote audio automatically
    - Detects when agent connects/disconnects
  - **Connection Status**: 
    - Visual indicators (Not Connected / Waiting / Connected)
    - Real-time status updates
    - Color-coded status badges

#### 3.2 Audio Recording & Transcription
- **Location**: `app/conversation/page.tsx`
- **Features**:
  - **Local Recording**: 
    - Records user audio using MediaRecorder API
    - Records in WebM format
    - Automatic recording when joining room
  - **Audio Transcription**: 
    - Sends recorded audio to `/api/transcribe` on room leave
    - Transcribes conversation for chat integration
    - Shows transcription status
  - **Transcription API**: 
    - Location: `app/api/transcribe/route.ts`
    - Connects to `${BACKEND_API_URL}/api/transcribe` if configured
    - Falls back to mock transcription if not configured

#### 3.3 Microphone Controls
- **Features**:
  - **Mute/Unmute**: Toggle microphone on/off
  - **Visual Feedback**: Mic icon changes (Mic/MicOff)
  - **Real-time Control**: Instant mute/unmute without disconnecting
  - **MediaStreamTrack Control**: Uses `enabled` property for muting

---

### 4. **AI Teaching Modes**

#### 4.1 Teaching Mode Selection
- **Location**: `app/conversation/page.tsx`
- **Features**:
  - **Three Modes**:
    - **Beginner Mode**: Simple explanations, slower pacing, real-life examples, step-by-step guidance
    - **Advanced Mode**: Deeper insights, technical detail, assumption of prior knowledge
    - **Expert Mode**: High-level analysis, complex reasoning, research-level breakdowns
  - **Radio Button Selection**: Visual radio buttons with hover effects
  - **Mode Persistence**: Selected mode sent to agent via metadata and data channel
  - **Visual Indicators**: Active mode highlighted with primary color

#### 4.2 Dynamic Mode Adaptation
- **Features**:
  - **Session Configuration**: Teaching mode sent to agent on room join
  - **Metadata Transmission**: Sent via participant metadata and LiveKit data channel
  - **Agent Adaptation**: Agent receives mode and adjusts teaching style
  - **Mode Suggestions**: Agent can suggest mode changes based on user responses
  - **Real-time Updates**: Mode changes reflected in UI immediately

---

### 5. **PDF Context in LiveKit**

#### 5.1 PDF Upload for LiveKit
- **Location**: `app/conversation/page.tsx`
- **Features**:
  - **Optional PDF Upload**: Users can upload PDF before starting conversation
  - **File Validation**: Same validation as main chat (PDF only, 50MB max)
  - **PDF Name Display**: Shows uploaded PDF name in session info
  - **PDF Context Transmission**: 
    - PDF name sent to agent via metadata
    - Sent via LiveKit data channel for real-time delivery
    - Agent uses PDF for teaching context

#### 5.2 Session Information
- **Features**:
  - **PDF Display**: Shows "Teaching from: [PDF name]" when PDF uploaded
  - **Mode Display**: Shows current teaching mode with description
  - **Visual Cards**: Styled cards with icons for session info
  - **Real-time Updates**: Updates when PDF or mode changes

---

### 6. **Live2D Animated Avatar**

#### 6.1 Avatar Component
- **Location**: `components/live2d-avatar.tsx`
- **Features**:
  - **Canvas-Based Animation**: Custom-drawn avatar using HTML5 Canvas
  - **60 FPS Animation**: Smooth animation using requestAnimationFrame
  - **Visual Design**:
    - **Head**: Beige/tan colored circular head
    - **Hair**: Dark hair on top
    - **Eyes**: Animated blinking eyes with highlights
    - **Spectacles**: Dark-rimmed glasses with:
      - Circular lenses
      - Bridge connecting lenses
      - Temples (arms) extending outward
      - Glass reflection effects
      - Semi-transparent blue fill for glass effect
    - **Mouth**: Red animated mouth (smile)
      - Expands when speaking
      - Curved upward for smile
    - **Bow Tie**: Red bow tie positioned below neck
      - Two bow loops
      - Center knot
      - Highlights and shadow edges
    - **Black Suit**: Professional black suit jacket
      - Lapels
      - Buttons
      - Highlights for depth
    - **Body**: Gradient background (purple when connected, gray when disconnected)

#### 6.2 Avatar Animations
- **Features**:
  - **Breathing Animation**: Subtle breathing effect (sinusoidal movement)
  - **Blinking Eyes**: Random blinking animation
  - **Speaking Animation**: 
    - Mouth expands and contracts when `isSpeaking` is true
    - Cheeks blush (pink) when speaking
    - Glow effect around avatar when speaking
    - Pulse effect on speaking indicator
  - **Connection Indicator**: 
    - Green pulsing dot when connected
    - Positioned in top-right corner
  - **Status Text**: "Speaking..." text appears below avatar when speaking

#### 6.3 Speech Detection
- **Location**: `app/conversation/page.tsx`
- **Features**:
  - **Audio Analysis**: Uses Web Audio API (AudioContext, AnalyserNode)
  - **Frequency Analysis**: Analyzes audio frequency data
  - **Speaking Detection**: Detects when agent is speaking (threshold: average > 20)
  - **Real-time Updates**: Checks every 100ms for speech detection
  - **Avatar Sync**: Avatar animates based on speech detection

---

### 7. **Real-Time Feedback System**

#### 7.1 Understanding Feedback
- **Location**: `app/conversation/page.tsx`
- **Features**:
  - **Three Feedback Types**:
    - **Understood** (✓): User understands the explanation
    - **Confused** (⚠): User is confused, agent should slow down
    - **More Detail** (📖): User wants more detailed explanation
  - **Visual Buttons**: Color-coded buttons (green, yellow, blue)
  - **Feedback Counter**: Tracks feedback counts per type
  - **Data Channel Transmission**: Sends feedback to agent via LiveKit data channel
  - **Status Updates**: Shows brief confirmation message after feedback

#### 7.2 Agent Communication
- **Features**:
  - **Bidirectional Data Channel**: 
    - User → Agent: Understanding feedback, session config
    - Agent → User: Mode suggestions, feedback requests
  - **Message Types**:
    - `session_config`: Initial session configuration
    - `understanding_feedback`: User feedback on understanding
    - `request_feedback`: Agent requests feedback
    - `mode_suggestion`: Agent suggests mode change
  - **Real-time Delivery**: Uses reliable data channel for guaranteed delivery

---

### 8. **User Interface & Design**

#### 8.1 Home Page (`app/page.tsx`)
- **Features**:
  - **Premium Header**: 
    - Gradient title with icon
    - Subtitle and description
    - Animated fade-in effects
  - **Layout**:
    - Left sidebar with:
      - Live Conversation banner (links to `/conversation`)
      - Capabilities showcase
      - Document tabs (when documents uploaded)
    - Main content area:
      - PDF uploader (when no documents)
      - Chat interface (when documents uploaded)
  - **Feature Cards**: Three feature cards at bottom (when no documents)
  - **Background Effects**: Gradient blurs for visual depth
  - **Responsive Design**: Grid layout adapts to screen size

#### 8.2 Conversation Page (`app/conversation/page.tsx`)
- **Features**:
  - **Layout**:
    - Left sidebar (when not joined):
      - Teaching mode selection
      - PDF upload
      - "How it works" guide
    - Left sidebar (when joined):
      - "How it works" guide (condensed)
    - Main content:
      - Large avatar display (600px height)
      - Status indicators
      - Session information
      - Feedback buttons
      - Control buttons
  - **Navigation**: Back button to return to home page
  - **Status Display**: Color-coded status badges
  - **Responsive Design**: Adapts to different screen sizes

#### 8.3 Design System
- **Features**:
  - **Glass Effect**: Frosted glass effect on cards
  - **Gradient Backgrounds**: Primary to secondary gradients
  - **Border Gradients**: Animated border gradients
  - **Color Scheme**: 
    - Primary: Purple/Indigo
    - Secondary: Purple/Violet
    - Success: Emerald/Green
    - Warning: Yellow
    - Error: Red
  - **Animations**: 
    - Fade-in effects
    - Hover transitions
    - Pulse effects
    - Smooth transitions
  - **Typography**: 
    - Gradient text for headings
    - Clear hierarchy
    - Readable font sizes

---

### 9. **API Architecture**

#### 9.1 Next.js API Routes
- **Location**: `app/api/`

##### 9.1.1 PDF Upload API
- **Route**: `/api/pdf/upload`
- **Method**: POST
- **Purpose**: Proxies PDF uploads to backend
- **Environment Variable**: `BACKEND_API_URL`
- **Request**: FormData with `file` field
- **Response**: `{ id: string, pdfId?: string, pdf_id?: string }`
- **Status**: ⚠️ Requires `BACKEND_API_URL` (returns error if not set)

##### 9.1.2 Chat API
- **Route**: `/api/chat`
- **Method**: POST
- **Purpose**: Handles chat messages with PDF context
- **Environment Variable**: `BACKEND_API_URL` (optional)
- **Request**: `{ message: string, pdfId: string, history: Array }`
- **Response**: `{ response: string }`
- **Status**: ⚠️ Uses backend if configured, otherwise mock responses

##### 9.1.3 Transcription API
- **Route**: `/api/transcribe`
- **Method**: POST
- **Purpose**: Transcribes audio files
- **Environment Variable**: `BACKEND_API_URL` (optional)
- **Request**: FormData with `audio` field
- **Response**: `{ transcript: string, success: boolean }`
- **Status**: ⚠️ Uses backend if configured, otherwise mock transcription

##### 9.1.4 LiveKit Token API
- **Route**: `/api/get-token`
- **Method**: GET
- **Purpose**: Generates LiveKit access tokens
- **Environment Variables**: 
  - `LIVEKIT_API_KEY` (required)
  - `LIVEKIT_API_SECRET` (required)
  - `LIVEKIT_URL` (optional)
- **Query Parameters**: `room` (optional, defaults to "default")
- **Response**: `{ token: string, identity: string, room: string }`
- **Status**: ✅ Fully implemented

#### 9.2 Environment Variables
- **Required**:
  - `LIVEKIT_API_KEY`: LiveKit API key
  - `LIVEKIT_API_SECRET`: LiveKit API secret
- **Optional**:
  - `LIVEKIT_URL`: LiveKit server URL (has default fallback)
  - `BACKEND_API_URL`: Spring Boot backend base URL

---

### 10. **State Management**

#### 10.1 React State
- **Location**: Various components
- **Features**:
  - **useState**: Local component state
  - **useRef**: Refs for DOM elements, MediaRecorder, audio context
  - **useEffect**: Side effects, cleanup, lifecycle management
  - **State Persistence**: No localStorage (cleared on mount per user request)

#### 10.2 State Structure
- **Home Page**:
  - `messagesByDoc`: Record of messages per document ID
  - `uploadedDocuments`: Array of uploaded documents
  - `activeDocumentId`: Currently active document ID
  - `isLoading`: Chat loading state
  - `isUploadingPdf`: PDF upload state
- **Conversation Page**:
  - `room`: LiveKit room instance
  - `joined`: Room join status
  - `status`: Connection status message
  - `isProcessing`: Audio processing state
  - `agentConnected`: Agent connection status
  - `isAgentSpeaking`: Agent speech detection
  - `isMuted`: Microphone mute state
  - `uploadedPdf`: Uploaded PDF file
  - `pdfName`: PDF file name
  - `teachingMode`: Selected teaching mode
  - `conversationUnderstanding`: Feedback counts

---

### 11. **Error Handling**

#### 11.1 Error Types
- **PDF Upload Errors**:
  - Invalid file type
  - File size exceeded
  - Upload API failures
  - Network errors
- **Chat Errors**:
  - API failures
  - Invalid responses
  - Network errors
- **LiveKit Errors**:
  - Connection failures
  - Token generation errors
  - Room join failures
  - Track subscription errors
- **Transcription Errors**:
  - Audio processing failures
  - API failures

#### 11.2 Error Display
- **Features**:
  - Error messages in chat interface
  - Status messages in conversation page
  - Alert components for critical errors
  - Console logging for debugging
  - User-friendly error messages
  - Graceful fallbacks (mock responses when backend unavailable)

---

### 12. **Accessibility & UX**

#### 12.1 Accessibility Features
- **Features**:
  - ARIA labels on file inputs
  - Keyboard navigation support
  - Focus states on interactive elements
  - Semantic HTML structure
  - Screen reader friendly text

#### 12.2 User Experience
- **Features**:
  - Loading states for all async operations
  - Visual feedback for user actions
  - Smooth animations and transitions
  - Responsive design for mobile/tablet/desktop
  - Clear visual hierarchy
  - Intuitive navigation
  - Helpful tooltips and descriptions
  - Empty states with guidance

---

### 13. **Technical Stack**

#### 13.1 Frontend
- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Real-time**: LiveKit Client SDK
- **Audio**: Web Audio API, MediaRecorder API

#### 13.2 Backend Integration
- **API Routes**: Next.js API routes
- **Backend**: Spring Boot (external, optional)
- **Real-time**: LiveKit Server SDK
- **Authentication**: LiveKit token-based

#### 13.3 Development Tools
- **Build Tool**: Turbopack (Next.js)
- **Package Manager**: npm/yarn/pnpm/bun
- **Type Checking**: TypeScript
- **Linting**: ESLint (implied)

---

### 14. **File Structure**

```
aiself/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Chat API (placeholder)
│   │   ├── get-token/route.ts     # LiveKit token generation
│   │   ├── pdf/upload/route.ts    # PDF upload proxy
│   │   └── transcribe/route.ts    # Audio transcription (placeholder)
│   ├── conversation/page.tsx     # LiveKit conversation page
│   └── page.tsx                    # Main chat page
├── components/
│   ├── chat-interface.tsx          # Chat UI component
│   ├── document-tabs.tsx           # Document management
│   ├── live2d-avatar.tsx           # Animated avatar
│   ├── pdf-uploader.tsx            # PDF upload component
│   └── ui/                         # UI components (Button, Card, Input, etc.)
├── lib/
│   ├── types.ts                    # TypeScript type definitions
│   └── constants.ts                # Constants (LS_KEYS, ROLES)
└── README.md                       # Project documentation
```

---

### 15. **Future Enhancements (Potential)**

Based on the codebase structure, potential enhancements could include:
- Multiple PDF support (currently limited to 1)
- Voice input in main chat interface
- Conversation history persistence
- User authentication
- Multiple language support
- Advanced avatar customization
- Screen sharing capabilities
- Video support in LiveKit
- Analytics and usage tracking
- Export conversation transcripts
- PDF annotation features

---

## Summary

HelpmeStudy is a comprehensive AI-powered learning platform with:
- ✅ PDF document management and chat
- ✅ Real-time voice conversations with LiveKit
- ✅ Animated AI teacher avatar with Live2D-style animations
- ✅ Multiple teaching modes (Beginner, Advanced, Expert)
- ✅ Real-time feedback system
- ✅ Beautiful, modern UI with glass effects and gradients
- ✅ Comprehensive error handling
- ✅ Backend API integration (optional, with fallbacks)
- ✅ Responsive design
- ✅ Accessibility features

The platform seamlessly combines text-based chat and real-time voice interactions, providing users with multiple ways to learn from their PDF documents with an engaging, animated AI teacher.

