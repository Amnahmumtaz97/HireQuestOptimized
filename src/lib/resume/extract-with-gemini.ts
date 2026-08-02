import { GoogleGenerativeAI } from '@google/generative-ai'
import { isGeminiRateLimitError, resolveTextModelChain } from '@/lib/gemini/model-fallback'
import {
  heuristicExtractResume,
  parseResumeJsonText,
  RESUME_EXTRACT_SYSTEM,
  type ResumeParseResult,
} from '@/lib/resume/schema'

const DEFAULT_MODEL = 'gemini-2.0-flash'

export async function extractResumeWithGemini(
  resumeText: string,
): Promise<ResumeParseResult> {
  const key = process.env.GEMINI_API_KEY
  if (!key?.trim()) {
    return heuristicExtractResume(resumeText)
  }

  const genAI = new GoogleGenerativeAI(key)
  const modelChain = resolveTextModelChain(
    DEFAULT_MODEL,
    process.env.GEMINI_MODEL,
    process.env.GEMINI_MODEL_FALLBACK,
  )

  const truncated =
    resumeText.length > 60000 ? resumeText.slice(0, 60000) : resumeText

  const prompt = `${RESUME_EXTRACT_SYSTEM}

Resume text:
"""
${truncated}
"""`

  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt++) {
    for (let i = 0; i < modelChain.length; i++) {
      const modelId = modelChain[i]
      try {
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        })
        const result = await model.generateContent(prompt)
        const raw = result.response.text()
        return parseResumeJsonText(raw)
      } catch (e) {
        lastError = e
        if (isGeminiRateLimitError(e) && i < modelChain.length - 1) {
          continue
        }
        // Try next model, or outer retry for parse/validation errors
        const isParseIssue =
          e instanceof SyntaxError ||
          (e instanceof Error &&
            (e.name === 'ZodError' ||
              /json|zod|unexpected|truncat/i.test(e.message)))
        if (isParseIssue) {
          break
        }
        if (i === modelChain.length - 1 && !isParseIssue) {
          // fall through to heuristic
        }
      }
    }
  }

  console.warn(
    '[resume] Gemini parse failed; using heuristic extractor',
    lastError instanceof Error ? lastError.message : lastError,
  )
  return heuristicExtractResume(resumeText)
}
