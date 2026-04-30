import type { SheetCard } from '../types'

export function parseSheetData(rows: Record<string, string | number>[]): SheetCard[] {
  return rows.map((row, i) => {
    const tagsRaw = String(row['tags'] ?? '')
    const priorityRaw = String(row['priority'] ?? '')

    return {
      priority: priorityRaw,
      name: String(row['name'] ?? ''),
      status: String(row['status'] ?? '').trim() || 'To Do',
      observation: String(row['observation'] ?? ''),
      tags: tagsRaw,
      canBeSaas: String(row['can be saas'] ?? ''),
      _tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      _priority: parseInt(priorityRaw, 10) || 99,
      _id: `card-${i}`,
      _row: Number(row['_row']),
    }
  })
}
