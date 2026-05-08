/**
 * @summary Returns true when running inside Capacitor (iOS/Android).
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  // Capacitor injects a global `Capacitor` object in native builds.
  // We avoid importing from '@capacitor/core' here to keep it tree-shakeable and SSR-safe.
  return Boolean((window as unknown as { Capacitor?: unknown }).Capacitor)
}

