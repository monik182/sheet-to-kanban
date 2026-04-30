import { useState, useCallback, useRef } from 'react'
import type { SheetCard, EnvConfig } from '../types'
import { parseSheetData } from '../utils/parseSheet'

export function useSheets(config: EnvConfig) {
  const [cards, setCards] = useState<SheetCard[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingChanges = useRef<Map<string, { row: number; newStatus: string }>>(new Map())
  const [hasPendingChanges, setHasPendingChanges] = useState(false)

  const fetchCards = useCallback(async () => {
    if (!config.googleApiKey || !config.sheetId) return

    setLoading(true)
    setError(null)
    pendingChanges.current.clear()
    setHasPendingChanges(false)

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

    pendingChanges.current.set(card._id, { row: card._row, newStatus })
    setHasPendingChanges(true)
  }, [])

  const saveChanges = useCallback(async () => {
    if (!config.appsScriptUrl || pendingChanges.current.size === 0) return

    setSaving(true)
    try {
      const promises = Array.from(pendingChanges.current.entries()).map(([_, change]) =>
        fetch(config.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            sheetId: config.sheetId,
            sheetName: config.tabName,
            range: `C${change.row}`,
            value: change.newStatus,
          }),
        })
      )
      await Promise.all(promises)
      pendingChanges.current.clear()
      setHasPendingChanges(false)
    } catch (err) {
      console.warn('Failed to save changes:', err)
      setError('Failed to save some changes to the sheet')
    } finally {
      setSaving(false)
    }
  }, [config.appsScriptUrl, config.sheetId, config.tabName])

  return { cards, loading, saving, error, fetchCards, updateCardStatus, saveChanges, hasPendingChanges }
}
