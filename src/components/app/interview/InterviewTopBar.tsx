'use client'

import { useState, type ReactNode } from 'react'
import { LogOut, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from '@/components/ui/confirm-modal'

type InterviewTopBarProps = {
  title: string
  /** Short descriptors shown next to the title, e.g. "Technical" · "Medium". */
  tags?: string[]
  timer?: ReactNode
  exitHref?: string
  exitLabel?: string
  unansweredCount?: number
  flaggedCount?: number
  onConfirmExit?: () => void | Promise<void>
}

export function InterviewTopBar({
  title,
  tags = [],
  timer,
  exitHref = '/app/interviews',
  exitLabel = 'Save & exit',
  unansweredCount = 0,
  flaggedCount = 0,
  onConfirmExit,
}: InterviewTopBarProps) {
  const router = useRouter()
  const [confirmExitOpen, setConfirmExitOpen] = useState(false)
  const hasOpenItems = unansweredCount > 0 || flaggedCount > 0

  const exitDescription = hasOpenItems
    ? `You still have ${unansweredCount} unanswered question${unansweredCount === 1 ? '' : 's'}${flaggedCount > 0 ? ` and ${flaggedCount} flagged for review` : ''}. Your saved answers will be kept and this session will be completed.`
    : 'All questions have answers and none are flagged. This session will be completed and moved to your results.'

  return (
    <>
      <header className="hq-iv-topbar">
        <div className="hq-iv-topbar__identity">
          <span className="hq-iv-topbar__mark" aria-hidden="true">
            <Sparkles />
          </span>
          <div className="hq-iv-topbar__titles">
            <h1 className="hq-iv-topbar__title" title={title}>
              {title}
            </h1>
            {tags.length > 0 ? (
              <p className="hq-iv-topbar__tags">
                {tags.map((tag, i) => (
                  <span key={tag}>
                    {i > 0 ? <span className="hq-iv-topbar__dot" aria-hidden="true" /> : null}
                    {tag}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>

        <div className="hq-iv-topbar__aside">
          {timer}
          <button
            type="button"
            onClick={() => setConfirmExitOpen(true)}
            className="hq-iv-topbar__exit btn-micro"
          >
            <LogOut aria-hidden="true" />
            <span className="hq-iv-topbar__exit-label">{exitLabel}</span>
          </button>
        </div>
      </header>

      <ConfirmModal
        open={confirmExitOpen}
        onOpenChange={setConfirmExitOpen}
        title="Leave interview?"
        description={exitDescription}
        cancelLabel="Keep answering"
        confirmLabel="Save & exit"
        confirmVariant="primary"
        onConfirm={onConfirmExit ?? (() => router.push(exitHref))}
      />
    </>
  )
}
