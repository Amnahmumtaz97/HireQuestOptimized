'use client'

import { useIdSetBookmark } from '@/hooks/useIdSetBookmark'

export function usePathBookmarks() {
  return useIdSetBookmark('hirequest.path.bookmarks')
}
