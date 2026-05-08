'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { registerNativeAppListeners } from '@/lib/native/registerNativeAppListeners'

/**
 * @summary Client-only bridge for native app events (deep links, etc.).
 */
export function NativeAppBridge() {
  const router = useRouter()

  useEffect(() => {
    registerNativeAppListeners({
      onUrlOpen: (url) => {
        try {
          const parsed = new URL(url)

          // Custom scheme: hirequest://app/interviews/123 -> treat pathname as route
          // App links: https://app.hirequest.com/app/interviews/123 -> treat pathname as route
          const path = parsed.pathname || '/'
          const search = parsed.search || ''
          router.push(`${path}${search}`)
        } catch {
          // ignore malformed URLs
        }
      },
    })
  }, [router])

  return null
}

