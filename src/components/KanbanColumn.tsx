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
}

export function KanbanColumn({ status, cards, onDrop, onDragStart, onDragEnd }: KanbanColumnProps) {
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
      className={`flex flex-col min-w-[280px] w-[280px] rounded-xl border transition-colors duration-150 ${
        isDragOver
          ? `${color.dragOver} border-dashed ${color.border}`
          : `${color.bg} ${color.border}`
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="px-3 py-2.5 flex items-center gap-2 border-b border-inherit">
        <span className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{displayName}</span>
        <span className="ml-auto text-xs text-gray-400 bg-white/60 dark:bg-gray-800/60 px-1.5 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[120px]">
        {cards.map(card => (
          <KanbanCard
            key={card._id}
            card={card}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  )
}
