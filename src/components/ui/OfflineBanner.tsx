'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * @summary Small banner shown when the user is offline.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-2 text-center text-xs text-foreground backdrop-blur">
      You’re offline. Some actions may not work until you reconnect.
    </div>
  )
}

