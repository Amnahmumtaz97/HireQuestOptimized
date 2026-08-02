'use client'

import Link from 'next/link'
import { FileText, SlidersHorizontal, Route } from 'lucide-react'

type NewInterviewEntryChooserProps = {
  pathId?: string | null
  stageId?: string | null
}

export function NewInterviewEntryChooser({ pathId, stageId }: NewInterviewEntryChooserProps) {
  const pathQs =
    pathId && stageId
      ? `&pathId=${encodeURIComponent(pathId)}&stageId=${encodeURIComponent(stageId)}`
      : ''

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New Interview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how you want to set up this practice session.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/app/new-interview?mode=manual${pathQs}`}
          className="group flex flex-col gap-3 rounded-2xl border border-border bg-input/10 p-5 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground group-hover:text-primary">
              Manual setup
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Step through department, specialization, topics, and difficulty yourself.
            </p>
          </div>
        </Link>

        <Link
          href={`/app/new-interview?mode=resume${pathQs}`}
          className="group flex flex-col gap-3 rounded-2xl border border-border bg-input/10 p-5 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground group-hover:text-primary">
              From resume
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Upload a resume, review suggested topics, then create — no full wizard.
            </p>
          </div>
        </Link>
      </div>

      {pathId && stageId ? (
        <Link
          href={`/app/new-interview?mode=path&pathId=${encodeURIComponent(pathId)}&stageId=${encodeURIComponent(stageId)}`}
          className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-sm text-foreground hover:bg-primary/10"
        >
          <Route className="h-5 w-5 text-primary" />
          <span>
            Continue with <strong>path stage bindings</strong> (department & topics prefilled)
          </span>
        </Link>
      ) : null}
    </div>
  )
}
