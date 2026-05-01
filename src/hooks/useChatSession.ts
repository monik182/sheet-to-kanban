import { useState, useCallback } from 'react'
import type { ChatMessage, ClaudeModel } from '../types'
import { sendChatMessage } from '../utils/claude'

export function useChatSession(claudeApiKey: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState<ClaudeModel>('claude-sonnet-4-20250514')

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: ChatMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const response = await sendChatMessage(claudeApiKey, updatedMessages, model)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Unknown error occurred'
      setMessages(prev => [...prev, { role: 'assistant', content: errorText, isError: true }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, claudeApiKey, model])

  const resetChat = useCallback(() => {
    setMessages([])
    setIsLoading(false)
  }, [])

  return { messages, isLoading, model, setModel, sendMessage, resetChat }
}
