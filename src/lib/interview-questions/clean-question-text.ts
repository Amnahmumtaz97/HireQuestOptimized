function stripLeadingQuestionLabels(firstLine: string): string {
  let s = firstLine
  s = s.replace(/^\s*(technical|behavioral)\s*[\(:]\s*[^)]*\)?\s*:?\s*/i, '')
  s = s.replace(/^\s*(easy|medium|hard)\s*[\(:]\s*[^)]*\)?\s*:?\s*/i, '')
  s = s.replace(/^\s*(technical|behavioral)\s*:\s*/i, '')
  s = s.replace(/^\[[^\]]+\]\s*/, '')
  return s.trim()
}

function looksLikeStructuredMarkdown(raw: string): boolean {
  const t = raw.trim()
  if (!t) return false
  if (t.includes('\n')) return true
  if (/^\|.+\|$/m.test(t)) return true
  if (/\|[\s\-:]+\|/.test(t)) return true
  return false
}

/**
 * Use after Gemini (or any source) when the question may include markdown tables/lists.
 * Preserves newlines and tables; still cleans label prefixes on the first line.
 */
export function formatGeneratedQuestion(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  if (!looksLikeStructuredMarkdown(t)) {
    return cleanQuestionText(t)
  }
  const lines = t.split('\n')
  if (lines.length > 0) {
    lines[0] = stripLeadingQuestionLabels(lines[0] ?? '')
  }
  const joined = lines
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .trim()
  // Light sentence case on first line only if it's plain (no leading # or |)
  const first = joined.split('\n')[0] ?? ''
  if (first && !/^[#|]/.test(first)) {
    const m = first.match(/[a-zA-Z]/)
    if (m && m.index !== undefined) {
      const i = m.index
      const fl =
        first.slice(0, i) + first.charAt(i).toUpperCase() + first.slice(i + 1)
      const rest = joined.split('\n').slice(1)
      return [fl, ...rest].join('\n').trim()
    }
  }
  return joined
}

/**
 * Normalizes LLM/template question strings for display: trims filler prefixes,
 * fixes capitalization, removes stuttered duplicate words, keeps text concise.
 */
export function cleanQuestionText(raw: string): string {
  let s = raw.trim()
  if (!s) return s

  s = stripLeadingQuestionLabels(s)

  // Collapse consecutive duplicate words (e.g. "technical technical")
  const tokens = s.split(/\s+/)
  const out: string[] = []
  let prevNorm = ''
  for (const t of tokens) {
    const norm = t.toLowerCase().replace(/[^a-z0-9]/gi, '')
    if (norm && norm === prevNorm) continue
    out.push(t)
    prevNorm = norm || prevNorm
  }
  s = out.join(' ').trim()

  // Sentence case: first alphanumeric character uppercased
  const m = s.match(/[a-zA-Z]/)
  if (m && m.index !== undefined) {
    const i = m.index
    s = s.slice(0, i) + s.charAt(i).toUpperCase() + s.slice(i + 1)
  }

  // Trim trailing noise
  s = s.replace(/\s+/g, ' ').trim()
  if (s.length && !/[.?!]$/.test(s)) s += '?'
  return s
}
