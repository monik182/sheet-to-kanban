import type { SheetCard } from '../types'

const HEADER_MAP: Record<string, keyof Pick<SheetCard, 'priority' | 'name' | 'status' | 'observation' | 'tags' | 'canBeSaas'>> = {
  'priority': 'priority',
  'name': 'name',
  'status': 'status',
  'observation': 'observation',
  'tags': 'tags',
  'can be saas': 'canBeSaas',
}

export function parseSheetData(rows: string[][]): SheetCard[] {
  if (rows.length < 2) return []

  const headers = rows[0].map(h => h.toLowerCase().trim())
  const columnIndex: Partial<Record<string, number>> = {}

  for (let i = 0; i < headers.length; i++) {
    const mapped = HEADER_MAP[headers[i]]
    if (mapped) columnIndex[mapped] = i
  }

  const cards: SheetCard[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const get = (field: string) => {
      const idx = columnIndex[field]
      return idx !== undefined ? (row[idx] ?? '') : ''
    }

    const tagsRaw = get('tags')
    const priorityRaw = get('priority')

    cards.push({
      priority: priorityRaw,
      name: get('name'),
      status: get('status').toLowerCase().trim() || 'backlog',
      observation: get('observation'),
      tags: tagsRaw,
      canBeSaas: get('canBeSaas'),
      _tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      _priority: parseInt(priorityRaw, 10) || 99,
      _id: `card-${i}`,
      _row: i + 1,
    })
  }

  return cards
}
