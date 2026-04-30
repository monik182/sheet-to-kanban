import { useState, useCallback, useRef } from 'react'
import type { SheetCard } from '../types'
import { parseSheetData } from '../utils/parseSheet'

export function useSheets(apiUrl: string, apiToken: string, onUnauthorized: () => void) {
  const [cards, setCards] = useState<SheetCard[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingChanges = useRef<Map<string, { row: number; newStatus: string }>>(new Map())
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const originalCards = useRef<SheetCard[]>([])

  const fetchCards = useCallback(async () => {
    if (!apiUrl || !apiToken) return

    setLoading(true)
    setError(null)
    pendingChanges.current.clear()
    setHasPendingChanges(false)

    try {
      const res = await fetch(`${apiUrl}/getSheet`, {
        headers: { 'Authorization': `Bearer ${apiToken}` },
      })

      if (res.status === 401) {
        onUnauthorized()
        return
      }

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
  }, [apiUrl, apiToken, onUnauthorized])

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
    if (!apiUrl || pendingChanges.current.size === 0) return

    setSaving(true)
    try {
      const promises = Array.from(pendingChanges.current.values()).map((change) =>
        fetch(`${apiUrl}/updateCell`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            row: change.row,
            column: 'Status',
            value: change.newStatus,
          }),
        }).then(async (res) => {
          if (res.status === 401) {
            onUnauthorized()
            return
          }
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
  }, [apiUrl, apiToken, onUnauthorized])

  const addCard = useCallback(async (data: {
    name: string
    priority?: string
    status?: string
    observation?: string
    tags?: string
    canBeSaas?: string
  }) => {
    if (!apiUrl) return

    try {
      const res = await fetch(`${apiUrl}/addRow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify(data),
      })

      if (res.status === 401) {
        onUnauthorized()
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `HTTP ${res.status}`)
      }

      await fetchCards()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add new item')
    }
  }, [apiUrl, apiToken, onUnauthorized, fetchCards])

  const editCard = useCallback(async (row: number, fields: {
    name: string
    priority?: string
    status?: string
    observation?: string
    tags?: string
    canBeSaas?: string
  }) => {
    if (!apiUrl) return

    try {
      const res = await fetch(`${apiUrl}/updateRow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ row, fields }),
      })

      if (res.status === 401) {
        onUnauthorized()
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `HTTP ${res.status}`)
      }

      await fetchCards()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
    }
  }, [apiUrl, apiToken, onUnauthorized, fetchCards])

  const discardChanges = useCallback(() => {
    setCards(originalCards.current)
    pendingChanges.current.clear()
    setHasPendingChanges(false)
  }, [])

  return { cards, loading, saving, error, fetchCards, updateCardStatus, saveChanges, discardChanges, hasPendingChanges, addCard, editCard }
}
