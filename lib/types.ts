export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type UploadedDocument = {
  id: string
  name: string
  file?: File
}
