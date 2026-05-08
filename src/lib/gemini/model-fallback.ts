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
