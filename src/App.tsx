import { useState, useMemo, useEffect, useCallback } from 'react'
import type { FilterState } from './types'
import { getConfig, hasRequiredConfig } from './utils/env'
import { saveSession, loadSession, clearSession } from './utils/session'
import { useSheets } from './hooks/useSheets'
import { InstructionsModal } from './components/InstructionsModal'
import { LoginScreen } from './components/LoginScreen'
import { KanbanBoard } from './components/KanbanBoard'
import { FilterBar } from './components/FilterBar'
import { PixelLoadingBar } from './components/PixelLoadingBar'
import { NewItemModal } from './components/NewItemModal'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Alert, AlertDescription } from '@/components/ui/pixelact-ui/alert'

const config = getConfig()
const configReady = hasRequiredConfig(config)

const EMPTY_FILTERS: FilterState = { search: '', priority: '', tag: '', saas: '' }

function App() {
  const [apiToken, setApiToken] = useState<string | null>(loadSession)
  const [showInstructions, setShowInstructions] = useState(!configReady)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [showNewItem, setShowNewItem] = useState(false)

  const handleLogin = useCallback((token: string) => {
    saveSession(token)
    setApiToken(token)
  }, [])

  const handleUnauthorized = useCallback(() => {
    clearSession()
    setApiToken(null)
  }, [])

  const { cards, loading, saving, error, fetchCards, updateCardStatus, saveChanges, discardChanges, hasPendingChanges, addCard } = useSheets(
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
          {hasPendingChanges && (
            <>
              <Button
                onClick={discardChanges}
                disabled={saving}
                variant="secondary"
                size="sm"
              >
                Undo Changes
              </Button>
              <Button
                onClick={saveChanges}
                disabled={saving}
                size="sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
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
            ⏻
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
        <KanbanBoard
          cards={filteredCards}
          onStatusChange={updateCardStatus}
        />
      </div>

      <NewItemModal
        open={showNewItem}
        onClose={() => setShowNewItem(false)}
        onSave={addCard}
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
