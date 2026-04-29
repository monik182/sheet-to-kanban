import type { SheetCard } from '../types'
import { getPriorityColor } from '../utils/constants'

interface KanbanCardProps {
  card: SheetCard
  onDragStart: (cardId: string) => void
  onDragEnd: () => void
}

export function KanbanCard({ card, onDragStart, onDragEnd }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', card._id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(card._id)
      }}
      onDragEnd={onDragEnd}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 active:opacity-60"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
          {card.name}
        </h3>
        <span className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${getPriorityColor(card._priority)}`}>
          P{card._priority}
        </span>
      </div>

      {card.observation && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
          {card.observation}
        </p>
      )}

      {(card._tags.length > 0 || card.canBeSaas.toLowerCase() === 'yes') && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card._tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {card.canBeSaas.toLowerCase() === 'yes' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium">
              SaaS
            </span>
          )}
        </div>
      )}
    </div>
  )
}
