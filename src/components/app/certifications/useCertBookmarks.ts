'use client'

import { useIdSetBookmark } from '@/hooks/useIdSetBookmark'

export function useCertBookmarks() {
  return useIdSetBookmark('hirequest.cert.bookmarks')
}

