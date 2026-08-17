'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { CheckCircle2, CircleX, Moon, Play, Sun, Terminal } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { useTheme } from '@/components/providers/ThemeProvider'
import {
  buildCodingStarter,
  CODING_EDITOR_LANGUAGES,
  CODING_EDITOR_LANG_STORAGE_KEY,
  CODING_EDITOR_THEME_STORAGE_KEY,
  getCodingLanguageMeta,
  isCodingEditorLanguage,
  type CodingEditorLanguageId,
} from '@/lib/interview/coding-editor'

const Monaco = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[240px] items-center justify-center text-xs text-muted-foreground">
      Loading editor…
    </div>
  ),
})

type CodingEditorProps = {
  interviewId: string
  questionIndex: number
  starterCode: string
  functionName?: string
  /** Preferred language from the question (defaults to JavaScript). */
  language?: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  /** Stretch to fill parent pane (side-by-side workspace). */
  fillHeight?: boolean
}

type EditorThemeMode = 'light' | 'dark'

type RunReport = {
  passed: number
  total: number
  results: Array<{
    input: string
    expected: string
    passed: boolean
    actual?: string
    error?: string
    hidden?: boolean
  }>
}

function readStoredLanguage(fallback: CodingEditorLanguageId): CodingEditorLanguageId {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(CODING_EDITOR_LANG_STORAGE_KEY)
    if (raw && isCodingEditorLanguage(raw)) return raw
  } catch {
    /* ignore */
  }
  return fallback
}

function readStoredTheme(fallback: EditorThemeMode): EditorThemeMode {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(CODING_EDITOR_THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  return fallback
}

function normalizeQuestionLanguage(language?: string): CodingEditorLanguageId {
  if (language && isCodingEditorLanguage(language)) return language
  return 'javascript'
}

function starterFor(
  language: CodingEditorLanguageId,
  functionName: string,
  jsStarter: string,
): string {
  if (language === 'javascript' && jsStarter.trim()) return jsStarter
  return buildCodingStarter(language, functionName)
}

function isUnmodifiedStarter(
  value: string,
  functionName: string,
  jsStarter: string,
): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  if (trimmed === jsStarter.trim()) return true
  return CODING_EDITOR_LANGUAGES.some(
    (l) => trimmed === starterFor(l.id, functionName, jsStarter).trim(),
  )
}

export function CodingAnswerEditor({
  interviewId,
  questionIndex,
  starterCode,
  functionName = 'solve',
  language: questionLanguage = 'javascript',
  value,
  onChange,
  disabled,
  fillHeight = false,
}: CodingEditorProps) {
  const { theme: appTheme } = useTheme()
  const questionLang = normalizeQuestionLanguage(questionLanguage)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [editorLanguage, setEditorLanguage] = useState<CodingEditorLanguageId>(questionLang)
  const [editorTheme, setEditorTheme] = useState<EditorThemeMode>('dark')
  const [hydrated, setHydrated] = useState(false)
  const [running, setRunning] = useState(false)
  const [report, setReport] = useState<RunReport | null>(null)
  const [error, setError] = useState('')

  const langMeta = getCodingLanguageMeta(editorLanguage)
  const monacoTheme = editorTheme === 'light' ? 'vs' : 'vs-dark'
  const canRun = langMeta.runnable

  const starterForLanguage = useMemo(
    () => starterFor(editorLanguage, functionName, starterCode),
    [editorLanguage, functionName, starterCode],
  )

  useEffect(() => {
    setEditorLanguage(readStoredLanguage(questionLang))
    setEditorTheme(readStoredTheme(appTheme === 'light' ? 'light' : 'dark'))
    setHydrated(true)
    // hydrate once from storage + app theme default
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setReport(null)
    setError('')
  }, [questionIndex, interviewId])

  useEffect(() => {
    if (!hydrated) return
    if (!value.trim()) {
      onChangeRef.current(starterFor(editorLanguage, functionName, starterCode))
    }
    // seed empty answers when the question changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, interviewId, hydrated])

  function persistLanguage(next: CodingEditorLanguageId) {
    try {
      window.localStorage.setItem(CODING_EDITOR_LANG_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  function persistTheme(next: EditorThemeMode) {
    try {
      window.localStorage.setItem(CODING_EDITOR_THEME_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  function handleLanguageChange(next: CodingEditorLanguageId) {
    if (next === editorLanguage) return
    const shouldReplace = isUnmodifiedStarter(value, functionName, starterCode)
    setEditorLanguage(next)
    persistLanguage(next)
    setReport(null)
    setError('')
    if (shouldReplace) onChange(starterFor(next, functionName, starterCode))
  }

  function toggleEditorTheme() {
    const next: EditorThemeMode = editorTheme === 'dark' ? 'light' : 'dark'
    setEditorTheme(next)
    persistTheme(next)
  }

  async function runTests() {
    if (!canRun) {
      setError('The judge currently runs JavaScript only. Switch language to JavaScript to run tests.')
      return
    }
    setRunning(true)
    setError('')
    try {
      const res = await fetch(`/api/interviews/${interviewId}/run-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIndex,
          code: value || starterForLanguage,
          language: editorLanguage,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Run failed')
      setReport(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed')
    } finally {
      setRunning(false)
    }
  }

  const runtimeNote = canRun
    ? 'Node sandbox · 800ms · no network/fs'
    : 'Editor only — switch to JavaScript to run tests'

  return (
    <div
      className={[
        fillHeight ? 'hq-coding-editor flex h-full min-h-0 flex-col' : 'hq-coding-editor space-y-3',
        editorTheme === 'light' ? 'hq-coding-editor--light' : 'hq-coding-editor--dark',
      ].join(' ')}
      data-editor-theme={editorTheme}
    >
      <div className="hq-coding-editor-toolbar flex shrink-0 flex-wrap items-center gap-2 border-b border-border/70 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5">
            <Terminal className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            <span className="sr-only">Language</span>
            <select
              className="hq-coding-lang-select h-10 min-h-10 rounded-md border border-border/80 bg-input/25 px-2.5 pr-7 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              value={editorLanguage}
              disabled={disabled || !hydrated}
              onChange={(e) => {
                const next = e.target.value
                if (isCodingEditorLanguage(next)) handleLanguageChange(next)
              }}
            >
              {CODING_EDITOR_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                  {l.runnable ? '' : ' · editor'}
                </option>
              ))}
            </select>
          </label>
          <span className="hidden min-w-0 truncate text-[11px] text-muted-foreground sm:inline">
            Implement <code className="font-mono text-foreground">{functionName}</code>
            <span className="mx-1.5 text-border">·</span>
            {runtimeNote}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="hq-coding-theme-toggle inline-flex h-10 min-h-10 items-center gap-1.5 rounded-md border border-border/80 bg-input/25 px-2.5 text-xs font-semibold text-foreground transition hover:bg-input/40 disabled:opacity-50"
            onClick={toggleEditorTheme}
            disabled={!hydrated}
            aria-label={
              editorTheme === 'dark' ? 'Switch editor to light mode' : 'Switch editor to dark mode'
            }
            title={editorTheme === 'dark' ? 'Light editor' : 'Dark editor'}
          >
            {editorTheme === 'dark' ? (
              <Sun className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Moon className="h-3.5 w-3.5" aria-hidden />
            )}
            <span className="hidden sm:inline">{editorTheme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <LoadingButton
            type="button"
            loading={running}
            loadingLabel="Running…"
            disabled={disabled || !canRun}
            onClick={() => void runTests()}
            className="hq-btn-primary h-10 min-h-10 gap-1.5 px-3 text-xs"
            title={canRun ? 'Run all tests (hidden tests are judged server-side)' : 'JavaScript only'}
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            Run tests
          </LoadingButton>
        </div>
      </div>

      <div
        className={
          fillHeight
            ? 'hq-coding-monaco relative min-h-[240px] flex-1 overflow-hidden'
            : 'overflow-hidden rounded-xl border border-border'
        }
      >
        <div className={fillHeight ? 'absolute inset-0' : undefined}>
          <Monaco
            height={fillHeight ? '100%' : '320px'}
            language={langMeta.monaco}
            theme={monacoTheme}
            value={value || starterForLanguage}
            onChange={(v) => onChange(v ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              tabSize: 2,
              automaticLayout: true,
              readOnly: Boolean(disabled),
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 14, bottom: 14 },
              lineNumbersMinChars: 3,
              renderLineHighlight: 'line',
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
            }}
          />
        </div>
      </div>

      {(error || report) && (
        <div className="hq-coding-console shrink-0 border-t border-border/70">
          {error ? (
            <p className="px-4 py-2.5 text-sm text-destructive">{error}</p>
          ) : null}
          {report ? (
            <div className="max-h-[28vh] overflow-y-auto px-4 py-3 text-xs">
              <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                {report.passed === report.total ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                ) : (
                  <CircleX className="h-3.5 w-3.5 text-red-500" aria-hidden />
                )}
                {report.passed}/{report.total} tests passed
              </div>
              <ul className="space-y-1.5">
                {report.results.map((r, i) => (
                  <li
                    key={i}
                    className={[
                      'rounded-md border px-2.5 py-1.5 font-mono text-[11px] leading-snug',
                      r.passed
                        ? 'border-success/30 bg-success-muted text-success'
                        : 'border-destructive/30 bg-destructive-muted text-destructive',
                    ].join(' ')}
                  >
                    <span className="font-sans font-semibold">#{i + 1}</span>{' '}
                    {r.passed ? 'Accepted' : 'Wrong Answer'}
                    {r.hidden ? (
                      <span className="mt-0.5 block opacity-90">hidden test</span>
                    ) : (
                      <span className="mt-0.5 block opacity-90">
                        in {r.input} → expect {r.expected}
                        {r.actual ? ` · got ${r.actual}` : ''}
                        {r.error && !r.passed ? ` · ${r.error}` : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
