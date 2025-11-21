"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Document {
  id: string
  name: string
}

interface DocumentTabsProps {
  documents: Document[]
  activeDocumentId: string | null
  onSwitchDocument: (id: string) => void
  onRemoveDocument: (id: string) => void
}

export default function DocumentTabs({
  documents,
  activeDocumentId,
  onSwitchDocument,
  onRemoveDocument,
}: DocumentTabsProps) {
  return (
    <div className="glass-effect rounded-2xl p-4 border-gradient">
      <p className="text-xs font-medium text-primary mb-3 uppercase tracking-wide">
        Active Documents ({documents.length}/5)
      </p>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSwitchDocument(doc.id)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
              activeDocumentId === doc.id
                ? "bg-primary/20 border border-primary/50 shadow-lg shadow-primary/10"
                : "bg-white/5 border border-white/10 hover:bg-white/10"
            }`}
          >
            <p className="text-xs font-medium text-foreground truncate flex-1">{doc.name}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveDocument(doc.id)
              }}
              className="h-5 w-5 p-0 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      {documents.length >= 5 && (
        <p className="text-xs text-yellow-600/70 mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
          Maximum 5 documents reached. Uploading a new one will clear the list.
        </p>
      )}
    </div>
  )
}
