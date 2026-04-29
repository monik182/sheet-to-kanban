import { useState, useCallback } from 'react'
import type { SheetCard, EnvConfig } from '../types'
import { parseSheetData } from '../utils/parseSheet'

export function useSheets(config: EnvConfig) {
  const [cards, setCards] = useState<SheetCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCards = useCallback(async () => {
    if (!config.googleApiKey || !config.sheetId) return

    setLoading(true)
    setError(null)

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.sheetId)}/values/${encodeURIComponent(config.tabName)}?key=${encodeURIComponent(config.googleApiKey)}`
      const res = await fetch(url)

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
      }

      const data = await res.json()
      setCards(parseSheetData(data.values ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sheet data')
    } finally {
      setLoading(false)
    }
  }, [config.googleApiKey, config.sheetId, config.tabName])

  const updateCardStatus = useCallback((card: SheetCard, newStatus: string) => {
    setCards(prev => prev.map(c =>
      c._id === card._id
        ? { ...c, status: newStatus }
        : c
    ))

    if (config.appsScriptUrl) {
      fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          sheetId: config.sheetId,
          sheetName: config.tabName,
          range: `C${card._row}`,
          value: newStatus,
        }),
      }).catch(err => {
        console.warn('Failed to write status to sheet:', err)
      })
    }
  }, [config.appsScriptUrl, config.sheetId, config.tabName])

  return { cards, loading, error, fetchCards, updateCardStatus }
}
