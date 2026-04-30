import { useState, useCallback } from 'react'
import type { SheetCard } from '../types'
import { parseSheetData } from '../utils/parseSheet'

export function useSheets(apiUrl: string, apiToken: string, onUnauthorized: () => void) {
  const [cards, setCards] = useState<SheetCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCards = useCallback(async () => {
    if (!apiUrl || !apiToken) return

    setLoading(true)
    setError(null)
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sheet data')
    } finally {
      setLoading(false)
    }
  }, [apiUrl, apiToken, onUnauthorized])

  const updateCardStatus = useCallback(async (card: SheetCard, newStatus: string) => {
    setCards(prev => prev.map(c =>
      c._id === card._id
        ? { ...c, status: newStatus }
        : c
    ))

    try {
      const res = await fetch(`${apiUrl}/updateCell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          row: card._row,
          column: 'Status',
          value: newStatus,
        }),
      })

      if (res.status === 401) {
        onUnauthorized()
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `HTTP ${res.status}`)
      }
    } catch (err) {
      setCards(prev => prev.map(c =>
        c._id === card._id
          ? { ...c, status: card.status }
          : c
      ))
      setError(err instanceof Error ? err.message : 'Failed to save status change')
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

  return { cards, loading, error, fetchCards, updateCardStatus, addCard, editCard }
}
