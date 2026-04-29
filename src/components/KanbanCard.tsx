import type { SheetCard } from '../types'
import { getPriorityColor } from '../utils/constants'
import { Card, CardContent } from '@/components/ui/pixelact-ui/card'
import { Badge } from '@/components/ui/pixelact-ui/badge'

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
      className="cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all duration-150 active:opacity-60"
    >
      <Card font="normal" className="bg-white shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug">
              {card.name}
            </h3>
            <span className={`font-pixel shrink-0 text-[8px] px-1.5 py-0.5 ${getPriorityColor(card._priority)}`}>
              P{card._priority}
            </span>
          </div>

          {card.observation && (
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)] font-body leading-relaxed line-clamp-2">
              {card.observation}
            </p>
          )}

          {(card._tags.length > 0 || card.canBeSaas.toLowerCase() === 'yes') && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card._tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  font="pixel"
                  className="text-[7px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border-none"
                >
                  {tag}
                </Badge>
              ))}
              {card.canBeSaas.toLowerCase() === 'yes' && (
                <Badge
                  font="pixel"
                  className="text-[7px] px-1.5 py-0.5 bg-[var(--accent)] text-[var(--accent-foreground)]"
                >
                  SaaS
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
