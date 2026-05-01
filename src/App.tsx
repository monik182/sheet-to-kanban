import { useState, useMemo, useEffect, useCallback } from 'react'
import type { FilterState, SheetCard } from './types'
import { getConfig, hasRequiredConfig } from './utils/env'
import { saveSession, loadSession, clearSession, saveClaudeKey, loadClaudeKey, clearClaudeKey } from './utils/session'
import { buildCardPrompt } from './utils/claude'
import { useSheets } from './hooks/useSheets'
import { InstructionsModal } from './components/InstructionsModal'
import { LoginScreen } from './components/LoginScreen'
import { KanbanBoard } from './components/KanbanBoard'
import { FilterBar } from './components/FilterBar'
import { PixelLoadingBar } from './components/PixelLoadingBar'
import { NewItemModal } from './components/NewItemModal'
import { ResizableLayout } from './components/ResizableLayout'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Alert, AlertDescription } from '@/components/ui/pixelact-ui/alert'

const config = getConfig()
const configReady = hasRequiredConfig(config)

const EMPTY_FILTERS: FilterState = { search: '', priority: '', tag: '', saas: '' }

function App() {
  const [apiToken, setApiToken] = useState<string | null>(loadSession)
  const [claudeApiKey, setClaudeApiKey] = useState<string | null>(loadClaudeKey)
  const [showInstructions, setShowInstructions] = useState(!configReady)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [showNewItem, setShowNewItem] = useState(false)
  const [editingCard, setEditingCard] = useState<SheetCard | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState<string | null>(null)
  const [chatSessionId, setChatSessionId] = useState(0)

  const handleLogin = useCallback((token: string, claudeKey: string) => {
    saveSession(token)
    saveClaudeKey(claudeKey)
    setApiToken(token)
    setClaudeApiKey(claudeKey)
  }, [])

  const handleUnauthorized = useCallback(() => {
    clearSession()
    clearClaudeKey()
    setApiToken(null)
    setClaudeApiKey(null)
    setChatOpen(false)
  }, [])

  const { cards, loading, error, fetchCards, updateCardStatus, addCard, editCard } = useSheets(
    config.apiUrl,
    apiToken ?? '',
    handleUnauthorized
  )

  useEffect(() => {
    if (configReady && apiToken) {
      fetchCards()
    }
  }, [fetchCards, apiToken])

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (filters.search && !card.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.priority && card._priority !== parseInt(filters.priority, 10)) return false
      if (filters.tag && !card._tags.includes(filters.tag)) return false
      if (filters.saas && filters.saas !== 'all' && card.canBeSaas.toLowerCase() !== filters.saas) return false
      return true
    })
  }, [cards, filters])

  if (!configReady && showInstructions) {
    return <InstructionsModal dismissable={false} />
  }

  if (!apiToken) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (loading && cards.length === 0) {
    return <PixelLoadingBar />
  }

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      <header className="border-b-4 border-[var(--foreground)] bg-[var(--primary)] px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-sm font-pixel text-[var(--foreground)]">Sheet to Kanban</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setChatOpen(true)
              setChatPrompt(null)
              setChatSessionId(id => id + 1)
            }}
            variant="secondary"
            size="sm"
            title="Chat with AI"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 13 11" fill="currentColor">
              <rect x="2" y="0" width="9" height="1"/>
              <rect x="1" y="1" width="1" height="1"/>
              <rect x="11" y="1" width="1" height="1"/>
              <rect x="0" y="2" width="1" height="4"/>
              <rect x="12" y="2" width="1" height="4"/>
              <rect x="1" y="6" width="4" height="1"/>
              <rect x="8" y="6" width="4" height="1"/>
              <rect x="5" y="7" width="1" height="1"/>
              <rect x="7" y="7" width="1" height="1"/>
              <rect x="6" y="8" width="1" height="1"/>
              <rect x="4" y="3" width="1" height="1"/>
              <rect x="6" y="3" width="1" height="1"/>
              <rect x="8" y="3" width="1" height="1"/>
            </svg>
          </Button>
          <Button
            onClick={() => setShowInstructions(true)}
            variant="secondary"
            size="sm"
            title="Setup instructions"
          >
            ?
          </Button>
          <Button
            onClick={handleUnauthorized}
            variant="secondary"
            size="sm"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 11 11" fill="currentColor">
              <rect x="0" y="0" width="8" height="2"/>
              <rect x="0" y="0" width="2" height="11"/>
              <rect x="0" y="9" width="8" height="2"/>
              <rect x="3" y="4" width="5" height="2"/>
              <rect x="7" y="3" width="2" height="1"/>
              <rect x="7" y="6" width="2" height="1"/>
              <rect x="9" y="4" width="2" height="2"/>
            </svg>
          </Button>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-3">
          <Alert variant="destructive" font="normal">
            <AlertDescription className="font-body">
              {error} — check your environment variable configuration.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {cards.length > 0 && (
        <FilterBar
          filters={filters}
          onChange={setFilters}
          cards={cards}
          filteredCount={filteredCards.length}
          onNewItem={() => setShowNewItem(true)}
        />
      )}

      <div className="flex-1 overflow-hidden">
        <ResizableLayout
          chatOpen={chatOpen}
          initialPrompt={chatPrompt ?? undefined}
          claudeApiKey={claudeApiKey ?? ''}
          onCloseChat={() => { setChatOpen(false); setChatPrompt(null) }}
          chatSessionId={chatSessionId}
        >
          <KanbanBoard
            cards={filteredCards}
            onStatusChange={updateCardStatus}
            onEdit={(card) => setEditingCard(card)}
            onBuildWithAI={(card) => {
              setChatPrompt(buildCardPrompt(card))
              setChatOpen(true)
              setChatSessionId(id => id + 1)
            }}
          />
        </ResizableLayout>
      </div>

      <NewItemModal
        open={showNewItem || !!editingCard}
        onClose={() => { setShowNewItem(false); setEditingCard(null) }}
        onSave={editingCard
          ? (data) => editCard(editingCard._row, data)
          : addCard
        }
        editCard={editingCard ?? undefined}
      />

      {showInstructions && configReady && (
        <InstructionsModal
          dismissable={true}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  )
}

export default App
