import { useEffect, useState } from 'react'

/**
 * @summary Tracks whether the app is currently online.
 */
export function useOnlineStatus(): boolean {
  // Start "online" for SSR + first client render to avoid hydration mismatches.
  // We'll sync to the real browser state after mount.
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    function onOnline() {
      setIsOnline(true)
    }
    function onOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return isOnline
}

