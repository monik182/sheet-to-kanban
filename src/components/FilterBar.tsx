import { useMemo, useState } from 'react'
import type { SheetCard, FilterState } from '../types'
import { Input } from '@/components/ui/pixelact-ui/input'
import { Button } from '@/components/ui/pixelact-ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/pixelact-ui/select'

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  cards: SheetCard[]
  filteredCount: number
  onNewItem: () => void
}

const EMPTY_FILTERS: FilterState = { search: '', priority: '', tag: '', saas: '' }

export function FilterBar({ filters, onChange, cards, filteredCount, onNewItem }: FilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)

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

  const filterControls = (
    <>
      <Select value={filters.priority || '_all'} onValueChange={v => update('priority', v === '_all' ? '' : v)}>
        <SelectTrigger font="pixel" className="w-full md:w-[160px] text-[9px]">
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent font="pixel" className="text-[9px] bg-white">
          <SelectItem value="_all">All priorities</SelectItem>
          {priorities.map(p => (
            <SelectItem key={p} value={String(p)}>P{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.tag || '_all'} onValueChange={v => update('tag', v === '_all' ? '' : v)}>
        <SelectTrigger font="pixel" className="w-full md:w-[140px] text-[9px]">
          <SelectValue placeholder="All tags" />
        </SelectTrigger>
        <SelectContent font="pixel" className="text-[9px] bg-white">
          <SelectItem value="_all">All tags</SelectItem>
          {tags.map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.saas || 'all'} onValueChange={v => update('saas', v)}>
        <SelectTrigger font="pixel" className="w-full md:w-[140px] text-[9px]">
          <SelectValue placeholder="SaaS: All" />
        </SelectTrigger>
        <SelectContent font="pixel" className="text-[9px] bg-white">
          <SelectItem value="all">SaaS: All</SelectItem>
          <SelectItem value="yes">SaaS: Yes</SelectItem>
          <SelectItem value="no">SaaS: No</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          onClick={() => onChange(EMPTY_FILTERS)}
          variant="link"
          size="sm"
          className="text-[9px]"
        >
          Clear
        </Button>
      )}
    </>
  )

  return (
    <div className="px-4 py-2.5 border-b-4 border-[var(--foreground)] bg-white shrink-0">
      {/* Top row: search + actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <Input
          type="text"
          placeholder="Search ideas..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="flex-1 md:flex-none md:w-100 text-xs font-body"
        />

        {/* Mobile: filter toggle */}
        <Button
          onClick={() => setFiltersOpen(!filtersOpen)}
          variant="secondary"
          size="sm"
          className="md:hidden text-[9px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          {hasFilters && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
        </Button>

        <Button
          onClick={onNewItem}
          size="sm"
          className="text-[9px]"
        >
          + New
        </Button>

        {/* Desktop: inline filters */}
        <div className="hidden md:flex items-center gap-3">
          {filterControls}
        </div>

        <span className="hidden md:inline ml-auto text-[9px] font-pixel text-[var(--muted-foreground)]">
          {filteredCount} of {cards.length} ideas{hasFilters ? ' (filtered)' : ''}
        </span>
      </div>

      {/* Mobile: expandable filter section */}
      {filtersOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-2 pt-2 border-t border-gray-200">
          {filterControls}
          <span className="text-[9px] font-pixel text-[var(--muted-foreground)]">
            {filteredCount} of {cards.length} ideas{hasFilters ? ' (filtered)' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
