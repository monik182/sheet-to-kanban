import { useState, useMemo, useEffect } from 'react'
import type { FilterState } from './types'
import { getConfig, hasRequiredConfig } from './utils/env'
import { useSheets } from './hooks/useSheets'
import { InstructionsModal } from './components/InstructionsModal'
import { KanbanBoard } from './components/KanbanBoard'
import { FilterBar } from './components/FilterBar'
import './App.scss'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Sheet to Kanban</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCards}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Setup instructions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error} — check your environment variable configuration.
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
