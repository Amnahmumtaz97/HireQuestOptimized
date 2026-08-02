'use client'

import { useCallback, useRef, useState } from 'react'
import { FileUp, Loader2, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { ResumeParseResult } from '@/lib/resume/schema'

const MAX_BYTES = 5 * 1024 * 1024

type ResumeUploadProps = {
  value: ResumeParseResult | null
  onParsed: (resume: ResumeParseResult) => void
  onClear: () => void
}

export function ResumeUpload({ value, onParsed, onClear }: ResumeUploadProps) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const upload = useCallback(
    async (file: File) => {
      const lower = file.name.toLowerCase()
      if (!lower.endsWith('.pdf') && !lower.endsWith('.docx')) {
        toast.error('Only PDF or DOCX resumes are supported')
        return
      }
      if (file.size > MAX_BYTES) {
        toast.error('File is too large (max 5MB)')
        return
      }

      setLoading(true)
      setFileName(file.name)
      try {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/resume/parse', {
          method: 'POST',
          body: form,
        })
        const data = await res.json()
        if (!res.ok || !data.resume) {
          toast.error(data.message || 'Could not parse resume')
          setFileName(null)
          return
        }
        onParsed(data.resume as ResumeParseResult)
        toast.success('Resume parsed — review the suggestions below')
      } catch {
        toast.error('Could not parse resume')
        setFileName(null)
      } finally {
        setLoading(false)
      }
    },
    [onParsed, toast],
  )

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) void upload(file)
        }}
        className={[
          'flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition',
          dragging
            ? 'border-primary bg-primary/10'
            : 'border-border bg-input/10 hover:bg-input/20',
        ].join(' ')}
      >
        {loading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Parsing resume…</p>
          </>
        ) : (
          <>
            <FileUp className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-foreground">
              Drop a resume (PDF/DOCX) or{' '}
              <button
                type="button"
                className="font-semibold text-primary underline-offset-2 hover:underline"
                onClick={() => inputRef.current?.click()}
              >
                browse
              </button>
            </p>
            <p className="text-xs text-muted-foreground">Max 5MB · PDF/DOCX · configure before generate</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
            e.target.value = ''
          }}
        />
      </div>

      {value ? (
        <div className="rounded-xl border border-border bg-primary/5 px-4 py-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">
                Auto-filled from your resume — please review and correct anything that looks off
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {fileName ? `${fileName} · ` : ''}
                {value.domain || 'Domain unknown'}
                {value.seniorityLevel ? ` · ${value.seniorityLevel}` : ''}
                {typeof value.yearsExperience === 'number'
                  ? ` · ${value.yearsExperience} yrs`
                  : ''}
              </p>
              {value.skills.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {value.skills.slice(0, 12).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-input/20 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              title="Clear resume suggestions"
              onClick={() => {
                onClear()
                setFileName(null)
              }}
              className="hq-action-btn shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
