import { useState, useEffect, useRef } from 'react'
import type { ClaudeModel } from '../types'
import { useChatSession } from '../hooks/useChatSession'
import { Button } from '@/components/ui/pixelact-ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/pixelact-ui/select'

interface ChatPanelProps {
  claudeApiKey: string
  initialPrompt?: string
  onClose: () => void
}

export function ChatPanel({ claudeApiKey, initialPrompt, onClose }: ChatPanelProps) {
  const { messages, isLoading, model, setModel, sendMessage } = useChatSession(claudeApiKey)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (initialPrompt && !hasInitialized.current) {
      hasInitialized.current = true
      sendMessage(initialPrompt)
    }
  }, [initialPrompt, sendMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)] border-l-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b-4 border-[var(--foreground)] bg-[var(--primary)] shrink-0">
        <span className="text-[10px] font-pixel text-[var(--foreground)]">Chat with AI</span>
        <div className="flex items-center gap-2">
          <Select value={model} onValueChange={(v) => setModel(v as ClaudeModel)}>
            <SelectTrigger size="sm" font="pixel" className="h-7 text-[8px] w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent font="pixel">
              <SelectItem value="claude-sonnet-4-20250514">Sonnet 4</SelectItem>
              <SelectItem value="claude-opus-4-20250514">Opus 4</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            title="Close chat"
          >
            x
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 text-xs font-body whitespace-pre-wrap break-words border-2 ${
                msg.isError
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : msg.role === 'user'
                    ? 'bg-[var(--primary)]/20 border-[var(--foreground)] text-[var(--foreground)]'
                    : 'bg-white border-[var(--foreground)] text-[var(--foreground)]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-3 py-2 text-xs font-body border-2 border-[var(--foreground)] bg-white text-[var(--muted-foreground)]">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t-4 border-[var(--foreground)] p-3 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Type a message..."
            rows={2}
            className="pixel__input pixel-font max-w-full outline-none p-2 bg-background text-foreground shadow-(--pixel-box-shadow) box-shadow-margin flex-1 resize-none text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="sm"
            className="self-end"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
