import { useState, useMemo, useEffect } from 'react'
import type { FilterState } from './types'
import { getConfig, hasRequiredConfig } from './utils/env'
import { useSheets } from './hooks/useSheets'
import { InstructionsModal } from './components/InstructionsModal'
import { KanbanBoard } from './components/KanbanBoard'
import { FilterBar } from './components/FilterBar'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Alert, AlertDescription } from '@/components/ui/pixelact-ui/alert'

const config = getConfig()
const configReady = hasRequiredConfig(config)

const EMPTY_FILTERS: FilterState = { search: '', priority: '', tag: '', saas: '' }

function App() {
  const [showInstructions, setShowInstructions] = useState(!configReady)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const { cards, loading, error, fetchCards, updateCardStatus } = useSheets(config)

  useEffect(() => {
    if (configReady) {
      fetchCards()
    }
  }, [fetchCards])

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

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      <header className="border-b-4 border-[var(--foreground)] bg-[var(--primary)] px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-sm font-pixel text-[var(--foreground)]">Sheet to Kanban</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchCards}
            disabled={loading}
            size="sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => setShowInstructions(true)}
            variant="secondary"
            size="sm"
            title="Setup instructions"
          >
            ?
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
        />
      )}

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          cards={filteredCards}
          onStatusChange={updateCardStatus}
        />
      </div>

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
