import { useRef, useState } from 'react'
import type { SheetCard } from '../types'
import { getColumnColor } from '../utils/constants'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  status: string
  cards: SheetCard[]
  onDrop: (cardId: string, newStatus: string) => void
  onDragStart: (cardId: string) => void
  onDragEnd: () => void
  onEdit: (card: SheetCard) => void
  onBuildWithAI: (card: SheetCard) => void
  onStatusChange?: (card: SheetCard, newStatus: string) => void
}

export function KanbanColumn({ status, cards, onDrop, onDragStart, onDragEnd, onEdit, onBuildWithAI, onStatusChange }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)
  const color = getColumnColor(status)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragOver(false)
    const cardId = e.dataTransfer.getData('text/plain')
    if (cardId) {
      onDrop(cardId, status)
    }
  }

  const displayName = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <div
      className={`flex flex-col w-full md:min-w-[280px] md:w-[280px] border-4 transition-colors duration-150 ${
        isDragOver
          ? `${color.dragOver} border-dashed border-[var(--foreground)]`
          : `${color.bg} ${color.border}`
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="px-3 py-2.5 flex items-center gap-2 border-b-4 border-inherit">
        <span className={`w-3 h-3 ${color.dot}`} />
        <span className="text-[10px] font-pixel text-[var(--foreground)]">{displayName}</span>
        <span className="ml-auto text-[9px] font-pixel text-[var(--muted-foreground)] bg-white/60 px-1.5 py-0.5">
          {cards.length}
        </span>
      </div>
      <div className="flex-1 p-2 space-y-4 overflow-y-auto min-h-[120px]">
        {cards.map(card => (
          <KanbanCard
            key={card._id}
            card={card}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEdit={onEdit}
            onBuildWithAI={onBuildWithAI}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  )
}
