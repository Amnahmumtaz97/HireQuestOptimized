import { App } from '@capacitor/app'
import { isNativeApp } from '@/lib/native/isNativeApp'

/**
 * @summary Wires native-only listeners (deep links, etc.).
 * Safe to call on web; it becomes a no-op.
 */
export function registerNativeAppListeners(options: {
  /**
   * @summary Called when a deep link is opened (hirequest://... or https app links).
   */
  onUrlOpen: (url: string) => void
}): void {
  if (!isNativeApp()) {
    return
  }

  App.addListener('appUrlOpen', (event) => {
    const url = event.url
    if (!url) {
      return
    }
    options.onUrlOpen(url)
  })
}

