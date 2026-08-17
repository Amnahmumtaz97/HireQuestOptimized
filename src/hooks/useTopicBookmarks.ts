'use client'

import { useCallback, useEffect, useState } from 'react'
import type { QuestionBankItem } from '@/lib/interview-config/question-bank'

const STORAGE_KEY = 'hirequest.topic.bookmarks'

function readItems(): QuestionBankItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is QuestionBankItem =>
        Boolean(
          item &&
            typeof item === 'object' &&
            typeof (item as QuestionBankItem).id === 'string' &&
            typeof (item as QuestionBankItem).label === 'string' &&
            typeof (item as QuestionBankItem).value === 'string' &&
            typeof (item as QuestionBankItem).kind === 'string',
        ),
    )
  } catch {
    return []
  }
}

export function useTopicBookmarks() {
  const [items, setItems] = useState<QuestionBankItem[]>([])

  useEffect(() => {
    setItems(readItems())
  }, [])

  const persist = useCallback((next: QuestionBankItem[]) => {
    setItems(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }, [])

  const isSaved = useCallback((id: string) => items.some((item) => item.id === id), [items])

  const toggle = useCallback(
    (item: QuestionBankItem) => {
      const exists = items.some((row) => row.id === item.id)
      persist(exists ? items.filter((row) => row.id !== item.id) : [...items, item])
    },
    [items, persist],
  )

  return { items, isSaved, toggle }
}
