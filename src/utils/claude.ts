import type { ChatMessage, ClaudeModel, SheetCard } from '../types'

const SYSTEM_PROMPT = `You are an expert product advisor, startup consultant, and technical architect. You help evaluate, refine, and plan software product ideas. Be concise, actionable, and honest. If an idea has weaknesses, say so constructively. When asking questions, ask one at a time. Respond in the same language the user writes in.`

export async function sendChatMessage(
  apiKey: string,
  messages: ChatMessage[],
  model: ClaudeModel
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-dangerous-direct-browser-access': 'true',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`API error (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  return data.content.map((c: { text: string }) => c.text).join('\n')
}

export function buildCardPrompt(card: SheetCard): string {
  return `I want to develop this app:

Name: ${card.name}
Tags: ${card._tags.join(', ') || 'None'}
Observations: ${card.observation || 'None'}
Can be SaaS: ${card.canBeSaas}

Ask me questions to help me refine and define the final product. Start with the most important questions first. Ask one question at a time. Ask no more than 10 questions.`
}
