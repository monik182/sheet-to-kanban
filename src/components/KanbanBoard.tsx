import { useState, useMemo } from 'react'
import type { SheetCard } from '../types'
import { DEFAULT_COLUMNS } from '../utils/constants'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  cards: SheetCard[]
  onStatusChange: (card: SheetCard, newStatus: string) => void
  onEdit: (card: SheetCard) => void
  onBuildWithAI: (card: SheetCard) => void
}

export function KanbanBoard({ cards, onStatusChange, onEdit, onBuildWithAI }: KanbanBoardProps) {
  const [_draggedCardId, setDraggedCardId] = useState<string | null>(null)

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

  return (
    <div className="flex! gap-4 p-4 overflow-x-auto h-full items-stretch justify-between">
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
  )
}
