'use client'

import { useCallback, useEffect, useState } from 'react'

function readIds(storageKey: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

export function useIdSetBookmark(storageKey: string) {
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIds(readIds(storageKey))
  }, [storageKey])

  const persist = useCallback(
    (next: Set<string>) => {
      setIds(next)
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]))
      } catch {
        // ignore quota / private mode
      }
    },
    [storageKey],
  )

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(ids)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      persist(next)
    },
    [ids, persist],
  )

  return {
    ids,
    isSaved: (id: string) => ids.has(id),
    toggle,
  }
}
