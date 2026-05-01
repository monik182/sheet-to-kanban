import { useState } from 'react'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Input } from '@/components/ui/pixelact-ui/input'
import { Label } from '@/components/ui/pixelact-ui/label'

interface LoginScreenProps {
  onLogin: (token: string, claudeApiKey: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [token, setToken] = useState('')
  const [claudeApiKey, setClaudeApiKey] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim() && claudeApiKey.trim()) {
      onLogin(token.trim(), claudeApiKey.trim())
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--background)] p-2">
      <div className="bg-white border-4 border-[var(--foreground)] shadow-[8px_8px_0_rgba(0,0,0,0.2)] max-w-lg w-full p-6">
        <h1 className="text-sm font-pixel text-[var(--foreground)] mb-6 text-center">
          Sheet to Kanban
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="api-token">Santo y Seña</Label>
            <Input
              id="api-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your Santo y Seña"
              className="w-full"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="claude-api-key">Claude API Key</Label>
            <Input
              id="claude-api-key"
              type="password"
              value={claudeApiKey}
              onChange={(e) => setClaudeApiKey(e.target.value)}
              placeholder="Enter your Claude API Key"
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!token.trim() || !claudeApiKey.trim()}>
            Login
          </Button>
        </form>
      </div>
    </div>
  )
}
