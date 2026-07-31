/** Client helpers for user preference flags that affect the DOM immediately. */

export const HQ_REDUCE_MOTION_KEY = 'hq-reduce-motion'
export const HQ_PREFS_EVENT = 'hq-prefs-changed'

export function applyReduceMotionPreference(enabled: boolean) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HQ_REDUCE_MOTION_KEY, enabled ? '1' : '0')
  } catch {
    // ignore quota / private mode
  }
  document.documentElement.dataset.hqReduceMotion = enabled ? 'true' : 'false'
  if (enabled) {
    document.documentElement.dataset.motion = 'reduced'
  }
  window.dispatchEvent(new Event(HQ_PREFS_EVENT))
}

export function readReduceMotionPreference(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(HQ_REDUCE_MOTION_KEY) === '1'
  } catch {
    return false
  }
}
