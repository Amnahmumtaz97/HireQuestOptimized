'use client'

import { useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useOnceGuidance } from '@/hooks/useOnceGuidance'
import { GUIDANCE_TIPS, type GuidanceKey } from '@/lib/guidance/tips'

const SKIP_SESSION = /^\/app\/interviews\/[^/]+$/
const RESULTS_SESSION = /^\/app\/interviews\/[^/]+\/results$/
const CERT_DETAIL = /^\/app\/learning-paths\/certifications\/[^/]+$/
const PATH_RESERVED = new Set(['categories', 'catalog', 'certifications'])

function matchGuidanceKey(pathname: string, search: URLSearchParams): GuidanceKey | null {
  if (pathname === '/app/new-interview') {
    if (search.get('mode') === 'path') return 'path-interview'
    if (search.get('mode') === 'resume' || search.get('focus') === 'resume') {
      return 'resume-interview'
    }
    return 'new-interview'
  }
  if (pathname === '/app/question-bank') return 'question-bank'
  if (pathname === '/app/bookmarks') return 'bookmarks'
  if (pathname === '/app/mocks') return 'mocks'
  if (pathname === '/app/interviews') return 'interviews'
  if (pathname === '/app/dashboard') return 'dashboard'
  if (pathname === '/app/results') return 'results'
  if (pathname === '/app/learning-paths') return 'learning-paths'
  if (pathname === '/app/learning-paths/certifications') return 'certifications'
  if (CERT_DETAIL.test(pathname)) return 'certification-detail'
  if (RESULTS_SESSION.test(pathname)) return 'interview-results'
  if (SKIP_SESSION.test(pathname)) return null
  if (pathname.startsWith('/app/learning-paths/')) {
    const slug = pathname.slice('/app/learning-paths/'.length).split('/')[0]
    if (slug && !PATH_RESERVED.has(slug)) return 'path-detail'
  }
  return null
}

export function PageGuidanceToasts() {
  const pathname = usePathname() ?? ''
  const search = useSearchParams()
  const mode = search.get('mode')
  const focus = search.get('focus')
  const key = useMemo(
    () => matchGuidanceKey(pathname, new URLSearchParams({
      ...(mode ? { mode } : {}),
      ...(focus ? { focus } : {}),
    })),
    [pathname, mode, focus],
  )
  const message = key ? GUIDANCE_TIPS[key] : ''
  useOnceGuidance(key, message)
  return null
}
