import { useState } from 'react'
import type { SheetCard } from '../types'
import { getPriorityColor } from '../utils/constants'
import { Card, CardContent } from '@/components/ui/pixelact-ui/card'
import { Badge } from '@/components/ui/pixelact-ui/badge'

interface KanbanCardProps {
  card: SheetCard
  onDragStart: (cardId: string) => void
  onDragEnd: () => void
  onEdit: (card: SheetCard) => void
}

export function KanbanCard({ card, onDragStart, onDragEnd, onEdit }: KanbanCardProps) {
  const [copied, setCopied] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', card._id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(card._id)
      }}
      onDragEnd={onDragEnd}
      className="group cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all duration-150 active:opacity-60 relative"
    >
      <div className="absolute top-2 right-8 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            const parts: string[] = [card.name]
            if (card._tags.length > 0) parts.push(`Tags: ${card._tags.join(', ')}`)
            if (card.observation) parts.push(`Observations: ${card.observation}`)
            navigator.clipboard.writeText(parts.join('\n'))
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 bg-white/80 hover:bg-gray-100 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          title="Copy to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        </button>
        {copied && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-[8px] bg-black text-white px-1.5 py-0.5 rounded shadow">
            Copied!
          </span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit(card)
        }}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 bg-white/80 hover:bg-gray-100 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        title="Edit item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
      </button>
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
