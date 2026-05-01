const STORAGE_KEY = '_stk_pref'
const CLAUDE_KEY = '_stk_claude'

export function saveSession(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, btoa(token))
  } catch { /* private browsing or quota */ }
}

export function loadSession(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return atob(stored)
  } catch {
    return null
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

export function saveClaudeKey(key: string): void {
  try {
    localStorage.setItem(CLAUDE_KEY, btoa(key))
  } catch { /* private browsing or quota */ }
}

export function loadClaudeKey(): string | null {
  try {
    const stored = localStorage.getItem(CLAUDE_KEY)
    if (!stored) return null
    return atob(stored)
  } catch {
    return null
  }
}

export function clearClaudeKey(): void {
  try {
    localStorage.removeItem(CLAUDE_KEY)
  } catch { /* ignore */ }
}
