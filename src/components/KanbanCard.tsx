import { useState } from 'react'
import type { SheetCard } from '../types'
import { DEFAULT_COLUMNS, getPriorityColor } from '../utils/constants'
import { Card, CardContent } from '@/components/ui/pixelact-ui/card'
import { Badge } from '@/components/ui/pixelact-ui/badge'

interface KanbanCardProps {
  card: SheetCard
  onDragStart: (cardId: string) => void
  onDragEnd: () => void
  onEdit: (card: SheetCard) => void
  onBuildWithAI: (card: SheetCard) => void
  onStatusChange?: (card: SheetCard, newStatus: string) => void
}

export function KanbanCard({ card, onDragStart, onDragEnd, onEdit, onBuildWithAI, onStatusChange }: KanbanCardProps) {
  const [copied, setCopied] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', card._id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(card._id)
      }}
      onDragEnd={onDragEnd}
      className="group cursor-grab active:cursor-grabbing md:hover:-translate-y-0.5 transition-all duration-150 active:opacity-60 relative"
    >
      {/* Action buttons — hover on desktop, always visible on mobile */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onBuildWithAI(card)
        }}
        className="absolute top-2 right-14 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 p-1.5 md:p-1 bg-white/80 hover:bg-gray-100 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        title="Build with AI"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-3 md:h-3">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </button>
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
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 p-1.5 md:p-1 bg-white/80 hover:bg-gray-100 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          title="Copy to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-3 md:h-3">
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
        className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 p-1.5 md:p-1 bg-white/80 hover:bg-gray-100 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        title="Edit item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-3 md:h-3">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
      </button>
      <Card font="normal" className="bg-white shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-sm font-semibold text-[var(--foreground)] leading-snug cursor-pointer md:cursor-default"
              onClick={() => onEdit(card)}
            >
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

          {/* Mobile status changer */}
          {onStatusChange && (
            <div className="mt-2 md:hidden relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowStatusMenu(!showStatusMenu)
                }}
                className="w-full text-left text-[9px] font-pixel px-2 py-1.5 bg-gray-50 border-2 border-gray-200 text-[var(--muted-foreground)] flex items-center justify-between"
              >
                <span>Move to...</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showStatusMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowStatusMenu(false)} />
                  <div className="absolute left-0 right-0 bottom-full mb-1 z-30 bg-white border-2 border-[var(--foreground)] shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                    {DEFAULT_COLUMNS.map(col => (
                      <button
                        key={col}
                        disabled={card.status === col}
                        onClick={(e) => {
                          e.stopPropagation()
                          onStatusChange(card, col)
                          setShowStatusMenu(false)
                        }}
                        className={`w-full text-left text-[9px] font-pixel px-2 py-2 border-b border-gray-100 last:border-b-0 ${
                          card.status === col
                            ? 'bg-gray-100 text-gray-400'
                            : 'hover:bg-gray-50 text-[var(--foreground)]'
                        }`}
                      >
                        {col} {card.status === col ? '(current)' : ''}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
