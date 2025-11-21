export const LS_KEYS = {
  uploads: "hms_uploaded_documents_v1",
  messages: "hms_messages_by_doc_v1",
  active: "hms_active_doc_v1",
} as const

export type LSKeys = typeof LS_KEYS

// Message role constants
export const ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
