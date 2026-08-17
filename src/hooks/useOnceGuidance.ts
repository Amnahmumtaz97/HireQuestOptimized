'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/toast'
import { hasSeenGuidance, markGuidanceSeen } from '@/lib/guidance/storage'

const DEFAULT_DELAY_MS = 600
const DEFAULT_DURATION_MS = 8500

type Options = {
  enabled?: boolean
  delayMs?: number
  durationMs?: number
}

/** Shows an info toast once per signed-in user per key (localStorage). */
export function useOnceGuidance(key: string | null, message: string, options?: Options) {
  const { data: session, status } = useSession()
  const toast = useToast()
  const shownForKey = useRef<string | null>(null)
  const enabled = options?.enabled !== false
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS
  const durationMs = options?.durationMs ?? DEFAULT_DURATION_MS

  useEffect(() => {
    if (!enabled || !key || !message) return
    if (status !== 'authenticated') return
    const userId = session?.user?.id
    if (!userId) return
    if (shownForKey.current === key) return
    if (hasSeenGuidance(userId, key)) {
      shownForKey.current = key
      return
    }

    const timer = window.setTimeout(() => {
      if (shownForKey.current === key) return
      if (hasSeenGuidance(userId, key)) {
        shownForKey.current = key
        return
      }
      shownForKey.current = key
      markGuidanceSeen(userId, key)
      toast.info(message, durationMs)
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [enabled, key, message, status, session?.user?.id, delayMs, durationMs, toast])
}
