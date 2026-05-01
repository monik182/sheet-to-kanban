import { useState, useMemo, useRef, useEffect } from 'react'
import type { SheetCard } from '../types'
import { DEFAULT_COLUMNS, getColumnColor } from '../utils/constants'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  cards: SheetCard[]
  onStatusChange: (card: SheetCard, newStatus: string) => void
  onEdit: (card: SheetCard) => void
  onBuildWithAI: (card: SheetCard) => void
}

export function KanbanBoard({ cards, onStatusChange, onEdit, onBuildWithAI }: KanbanBoardProps) {
  const [_draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const tabBarRef = useRef<HTMLDivElement>(null)

  const columns = useMemo(() => {
    const extra = cards
      .map(c => c.status)
      .filter(s => !DEFAULT_COLUMNS.includes(s as typeof DEFAULT_COLUMNS[number]))
    const unique = [...new Set(extra)]
    return [...DEFAULT_COLUMNS, ...unique]
  }, [cards])

  const cardsByColumn = useMemo(() => {
    const grouped: Record<string, SheetCard[]> = {}
    for (const col of columns) {
      grouped[col] = []
    }
    for (const card of cards) {
      const status = card.status
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(card)
    }
    for (const col of Object.keys(grouped)) {
      grouped[col].sort((a, b) => a._priority - b._priority)
    }
    return grouped
  }, [cards, columns])

  const handleDrop = (cardId: string, newStatus: string) => {
    const card = cards.find(c => c._id === cardId)
    if (card && card.status !== newStatus) {
      onStatusChange(card, newStatus)
    }
    setDraggedCardId(null)
  }

  // Scroll active tab into view
  useEffect(() => {
    if (tabBarRef.current) {
      const activeBtn = tabBarRef.current.children[activeTab] as HTMLElement
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [activeTab])

  return (
    <>
      {/* Mobile tab bar */}
      <div
        ref={tabBarRef}
        className="md:hidden flex overflow-x-auto border-b-4 border-[var(--foreground)] bg-white shrink-0 scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {columns.map((status, i) => {
          const color = getColumnColor(status)
          const count = (cardsByColumn[status] ?? []).length
          return (
            <button
              key={status}
              onClick={() => setActiveTab(i)}
              className={`shrink-0 px-3 py-2 text-[9px] font-pixel flex items-center gap-1.5 border-b-3 transition-colors ${
                i === activeTab
                  ? `${color.header} border-[var(--foreground)]`
                  : 'border-transparent text-[var(--muted-foreground)]'
              }`}
            >
              <span className={`w-2 h-2 ${color.dot}`} />
              {status}
              <span className="text-[8px] bg-white/60 px-1 py-0.5">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Mobile: single column view */}
      <div className="md:hidden flex-1 overflow-y-auto p-3">
        {columns[activeTab] && (
          <KanbanColumn
            status={columns[activeTab]}
            cards={cardsByColumn[columns[activeTab]] ?? []}
            onDrop={handleDrop}
            onDragStart={setDraggedCardId}
            onDragEnd={() => setDraggedCardId(null)}
            onEdit={onEdit}
            onBuildWithAI={onBuildWithAI}
            onStatusChange={onStatusChange}
          />
        )}
      </div>

      {/* Desktop: all columns side by side */}
      <div className="hidden md:flex! gap-4 p-4 overflow-x-auto h-full items-stretch justify-between">
        {columns.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            cards={cardsByColumn[status] ?? []}
            onDrop={handleDrop}
            onDragStart={setDraggedCardId}
            onDragEnd={() => setDraggedCardId(null)}
            onEdit={onEdit}
            onBuildWithAI={onBuildWithAI}
          />
        ))}
      </div>
    </>
  )
}
