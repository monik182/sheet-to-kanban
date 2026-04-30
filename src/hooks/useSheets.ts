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
  const originalCards = useRef<SheetCard[]>([])

  const fetchCards = useCallback(async () => {
    if (!config.apiUrl || !config.apiToken) return

    setLoading(true)
    setError(null)
    pendingChanges.current.clear()
    setHasPendingChanges(false)

    try {
      const res = await fetch(`${config.apiUrl}/getSheet`, {
        headers: { 'Authorization': `Bearer ${config.apiToken}` },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `HTTP ${res.status}`)
      }

      const data = await res.json()
      const parsed = parseSheetData(data.rows ?? [])
      setCards(parsed)
      originalCards.current = parsed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sheet data')
    } finally {
      setLoading(false)
    }
  }, [config.apiUrl, config.apiToken])

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
    if (!config.apiUrl || pendingChanges.current.size === 0) return

    setSaving(true)
    try {
      const promises = Array.from(pendingChanges.current.values()).map((change) =>
        fetch(`${config.apiUrl}/updateCell`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiToken}`,
          },
          body: JSON.stringify({
            row: change.row,
            column: 'Status',
            value: change.newStatus,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => null)
            throw new Error(body?.error ?? `HTTP ${res.status}`)
          }
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
  }, [config.apiUrl, config.apiToken])

  const discardChanges = useCallback(() => {
    setCards(originalCards.current)
    pendingChanges.current.clear()
    setHasPendingChanges(false)
  }, [])

  return { cards, loading, saving, error, fetchCards, updateCardStatus, saveChanges, discardChanges, hasPendingChanges }
}
