export const CODING_EDITOR_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript', runnable: true },
  { id: 'typescript', label: 'TypeScript', monaco: 'typescript', runnable: false },
  { id: 'python', label: 'Python', monaco: 'python', runnable: false },
  { id: 'java', label: 'Java', monaco: 'java', runnable: false },
  { id: 'cpp', label: 'C++', monaco: 'cpp', runnable: false },
] as const

export type CodingEditorLanguageId = (typeof CODING_EDITOR_LANGUAGES)[number]['id']

export const CODING_EDITOR_LANG_SET = new Set<string>(
  CODING_EDITOR_LANGUAGES.map((l) => l.id),
)

export function isCodingEditorLanguage(value: string): value is CodingEditorLanguageId {
  return CODING_EDITOR_LANG_SET.has(value)
}

export function getCodingLanguageMeta(id: CodingEditorLanguageId) {
  return CODING_EDITOR_LANGUAGES.find((l) => l.id === id) ?? CODING_EDITOR_LANGUAGES[0]
}

/** Starter snippets keyed by language; uses the problem's function name. */
export function buildCodingStarter(
  language: CodingEditorLanguageId,
  functionName: string,
): string {
  const fn = functionName.replace(/[^\w$]/g, '') || 'solve'

  switch (language) {
    case 'typescript':
      return `function ${fn}(/* args */): unknown {\n  // your code\n}\n`
    case 'python':
      return `def ${fn}(*args):\n    # your code\n    pass\n`
    case 'java':
      return `class Solution {\n    public Object ${fn}(/* args */) {\n        // your code\n        return null;\n    }\n}\n`
    case 'cpp':
      return `// Implement ${fn}\nauto ${fn}(/* args */) {\n    // your code\n}\n`
    case 'javascript':
    default:
      return `function ${fn}(/* args */) {\n  // your code\n}\n`
  }
}

export const CODING_EDITOR_LANG_STORAGE_KEY = 'hq-coding-editor-lang'
export const CODING_EDITOR_THEME_STORAGE_KEY = 'hq-coding-editor-theme'
