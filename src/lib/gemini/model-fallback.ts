/**
 * Env-based model chains when Gemini returns 429 / quota / resource exhausted.
 *
 * Text: GEMINI_MODEL (primary) + GEMINI_MODEL_FALLBACK=comma,separated,ids
 * Image: GEMINI_IMAGE_MODEL + GEMINI_IMAGE_MODEL_FALLBACK=comma,separated,ids
 */

export function isGeminiRateLimitError(error: unknown): boolean {
  if (error == null) return false
  if (typeof error !== 'object') return false
  const any = error as Record<string, unknown>
  const nested = any.error as Record<string, unknown> | undefined

  const status = any.status ?? any.statusCode ?? nested?.code
  if (status === 429 || status === 'RESOURCE_EXHAUSTED') return true

  const code = any.code ?? nested?.status
  if (code === 429) return true

  const msg = String(any.message ?? (error instanceof Error ? error.message : ''))
  if (
    /429|rate\s*limit|quota|resource\s*exhausted|resource_exhausted|too\s+many\s+requests|generativelanguage\.googleapis\.com\/429/i.test(
      msg,
    )
  ) {
    return true
  }

  return false
}

/**
 * Upstream is temporarily unable to serve: 503 "high demand" / overloaded, 500,
 * 504, or the fetch itself failed. Worth a short wait and another model.
 */
export function isGeminiTransientError(error: unknown): boolean {
  if (error == null) return false
  if (typeof error !== 'object') return false
  const any = error as Record<string, unknown>
  const nested = any.error as Record<string, unknown> | undefined

  const status = any.status ?? any.statusCode ?? nested?.code
  if (status === 503 || status === 500 || status === 504 || status === 'UNAVAILABLE') return true

  const msg = String(any.message ?? (error instanceof Error ? error.message : ''))
  return /\b(503|500|504)\b|service unavailable|high demand|overloaded|unavailable|internal error|fetch failed|ECONNRESET|ETIMEDOUT|socket hang up/i.test(
    msg,
  )
}

/**
 * The model id itself is dead: retired ("no longer available to new users"),
 * misspelt, or not enabled for this key. Never retry it — skip to the next model.
 */
export function isGeminiModelUnavailableError(error: unknown): boolean {
  if (error == null || typeof error !== 'object') return false
  const any = error as Record<string, unknown>
  const nested = any.error as Record<string, unknown> | undefined
  const status = any.status ?? any.statusCode ?? nested?.code
  if (status === 404 || status === 'NOT_FOUND') return true
  const msg = String(any.message ?? (error instanceof Error ? error.message : ''))
  return /\b404\b|not found|no longer available|is not supported|not available to new users|unknown model/i.test(msg)
}

/** Quota, capacity or a dead model id — either way, the request should move to another model. */
export function isGeminiRetryableUpstreamError(error: unknown): boolean {
  return isGeminiRateLimitError(error) || isGeminiTransientError(error) || isGeminiModelUnavailableError(error)
}

/**
 * Backup models tried after GEMINI_MODEL, in order, unless GEMINI_MODEL_FALLBACK
 * overrides them. Google retires ids without notice (2.5-flash-lite died with a
 * 404 pointing at 3.5-flash-lite), so a dead entry just falls through to the next.
 */
export const DEFAULT_TEXT_MODEL_FALLBACKS = 'gemini-3.5-flash-lite,gemini-3.5-flash,gemini-2.0-flash'

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseFallbackList(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Ordered list: primary first, then fallbacks; duplicates removed. */
export function resolveTextModelChain(primaryDefault: string, envPrimary?: string, envFallbackCsv?: string): string[] {
  const primary = envPrimary?.trim() || primaryDefault
  const rest = parseFallbackList(envFallbackCsv)
  return [...new Set([primary, ...rest])]
}

export function resolveImageModelChain(primaryDefault: string, envPrimary?: string, envFallbackCsv?: string): string[] {
  const primary = envPrimary?.trim() || primaryDefault
  const rest = parseFallbackList(envFallbackCsv)
  return [...new Set([primary, ...rest])]
}
