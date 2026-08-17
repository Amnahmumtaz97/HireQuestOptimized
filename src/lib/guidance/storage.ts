const STORAGE_KEY = 'hirequest.guidance.v1'

type GuidanceStore = Record<string, { seen: Record<string, boolean> }>

function readStore(): GuidanceStore {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as GuidanceStore
  } catch {
    return {}
  }
}

function writeStore(store: GuidanceStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore quota / private mode
  }
}

export function hasSeenGuidance(userId: string, key: string): boolean {
  return Boolean(readStore()[userId]?.seen?.[key])
}

export function markGuidanceSeen(userId: string, key: string) {
  const store = readStore()
  const user = store[userId] ?? { seen: {} }
  user.seen = { ...user.seen, [key]: true }
  store[userId] = user
  writeStore(store)
}
