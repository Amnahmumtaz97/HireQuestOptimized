import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  DEFAULT_TEXT_MODEL_FALLBACKS,
  isGeminiModelUnavailableError,
  isGeminiRateLimitError,
  isGeminiTransientError,
  resolveTextModelChain,
  sleep,
} from '@/lib/gemini/model-fallback'
import { JudgeParseError, parseJudgeBatch, type JudgeObservation } from '@/lib/evaluation/parse'

export type JudgeResult = { observations: JudgeObservation[]; model: string }

/** The only thing the orchestrator knows about the judge: prompt in, verified-shape observations out. */
export type JudgeFn = (prompt: string, expectedIds: number[]) => Promise<JudgeResult>

const DEFAULT_MODEL = 'gemini-2.0-flash'
/**
 * Thinking models (2.5 / 3.5) spend reasoning tokens from this budget before
 * emitting any JSON; five items with quotes need headroom or they truncate.
 */
const MAX_OUTPUT_TOKENS = 32768
/** §19 — invalid JSON is retried up to three times per model before moving down the chain. */
const MAX_ATTEMPTS_PER_MODEL = 3

export function isJudgeConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

/**
 * Same key, same fallback chain and same JSON mode as question generation, but
 * `temperature: 0` (§21): the grader must be as repeatable as a model allows.
 */
export function createGeminiJudge(): JudgeFn | null {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) return null

  const genAI = new GoogleGenerativeAI(key)
  const chain = resolveTextModelChain(
    process.env.GEMINI_EVAL_MODEL?.trim() || DEFAULT_MODEL,
    process.env.GEMINI_MODEL,
    process.env.GEMINI_MODEL_FALLBACK || DEFAULT_TEXT_MODEL_FALLBACKS,
  )

  return async (prompt, expectedIds) => {
    let lastError: unknown = null
    for (let i = 0; i < chain.length; i++) {
      const modelId = chain[i]
      // Parse failures retry on the same model; quota, outage and dead-model errors move on.
      for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0,
              maxOutputTokens: MAX_OUTPUT_TOKENS,
            },
          })
          const result = await model.generateContent(prompt)
          const finishReason = result.response.candidates?.[0]?.finishReason
          // A blocked candidate (RECITATION / SAFETY) makes .text() throw; it is stochastic, so retry.
          if (finishReason === 'RECITATION' || finishReason === 'SAFETY') {
            throw new JudgeParseError(`Judge model "${modelId}" blocked the response (${finishReason}).`)
          }
          const text = result.response.text()
          if (finishReason === 'MAX_TOKENS') {
            throw new JudgeParseError(`Judge model "${modelId}" truncated its output.`)
          }
          if (!text.trim()) {
            throw new JudgeParseError(`Judge model "${modelId}" returned an empty response.`)
          }
          return { observations: parseJudgeBatch(text, expectedIds), model: modelId }
        } catch (e) {
          lastError = e
          if (isGeminiModelUnavailableError(e)) {
            console.warn(`[evaluate] model "${modelId}" is not available (retired or unknown id); trying next model.`)
            break
          }
          if (isGeminiRateLimitError(e)) {
            console.warn(`[evaluate] model "${modelId}" rate limited; trying next model.`)
            break
          }
          if (isGeminiTransientError(e)) {
            console.warn(`[evaluate] model "${modelId}" unavailable; backing off and trying next model.`)
            await sleep(1500)
            break
          }
          const blocked = e instanceof Error && /blocked due to|RECITATION|SAFETY/i.test(e.message)
          if (e instanceof JudgeParseError || blocked) {
            console.warn(`[evaluate] model "${modelId}" attempt ${attempt}: ${(e as Error).message}`)
            continue
          }
          throw e
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Judge produced no usable output.')
  }
}
