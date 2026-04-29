import { useMemo } from 'react'
import type { SheetCard, FilterState } from '../types'

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  cards: SheetCard[]
  filteredCount: number
}

const EMPTY_FILTERS: FilterState = { search: '', priority: '', tag: '', saas: '' }

export function FilterBar({ filters, onChange, cards, filteredCount }: FilterBarProps) {
  const priorities = useMemo(() => {
    const set = new Set(cards.map(c => c._priority))
    return [...set].sort((a, b) => a - b)
  }, [cards])

  const tags = useMemo(() => {
    const set = new Set(cards.flatMap(c => c._tags))
    return [...set].sort()
  }, [cards])

  const hasFilters = filters.search || filters.priority || filters.tag || (filters.saas && filters.saas !== 'all')

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const selectClass = "text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3 flex-wrap">
      <div className="relative">
        <input
          type="text"
          placeholder="Search ideas..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
      </div>

      <select
        value={filters.priority}
        onChange={e => update('priority', e.target.value)}
        className={selectClass}
      >
        <option value="">All priorities</option>
        {priorities.map(p => (
          <option key={p} value={p}>P{p}</option>
        ))}
      </select>

      <select
        value={filters.tag}
        onChange={e => update('tag', e.target.value)}
        className={selectClass}
      >
        <option value="">All tags</option>
        {tags.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        value={filters.saas || 'all'}
        onChange={e => update('saas', e.target.value)}
        className={selectClass}
      >
        <option value="all">SaaS: All</option>
        <option value="yes">SaaS: Yes</option>
        <option value="no">SaaS: No</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Clear
        </button>
      )}

      <span className="ml-auto text-xs text-gray-400">
        {filteredCount} of {cards.length} ideas{hasFilters ? ' (filtered)' : ''}
      </span>
    </div>
  )
}
