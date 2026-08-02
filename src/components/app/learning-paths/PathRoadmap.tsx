'use client'

import { Check, Lock, BookOpen, MessageSquare, Sparkles, Target } from 'lucide-react'
import {
  getStageUiState,
  type LearningStage,
  type StageType,
  type UserPathProgress,
} from '@/components/app/learning-paths/types'
import { STAGE_LEVEL_LABELS, type StageLevel } from '@/lib/learning-paths/constants'
import { ListPagination } from '@/components/ui/list-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'

const STAGES_PER_PAGE = 6

function stageTypeIcon(type: StageType) {
  if (type === 'concept') return BookOpen
  if (type === 'ai_feedback') return Sparkles
  if (type === 'mock_interview') return Target
  return MessageSquare
}

type PathRoadmapProps = {
  stages: LearningStage[]
  progress: UserPathProgress | null
  activeStageId: string | null
  onSelectStage: (stageId: string) => void
}

function levelFor(stage: LearningStage): StageLevel | null {
  if (typeof stage.level === 'number' && stage.level >= 1 && stage.level <= 6) {
    return stage.level as StageLevel
  }
  return null
}

function StageGroup({
  label,
  stages,
  progress,
  activeStageId,
  onSelectStage,
}: {
  label: string
  stages: LearningStage[]
  progress: UserPathProgress | null
  activeStageId: string | null
  onSelectStage: (stageId: string) => void
}) {
  const { page, setPage, pageItems, totalPages } = useClientPagination(stages, STAGES_PER_PAGE)
  const startOffset = (page - 1) * STAGES_PER_PAGE

  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <ol className="relative space-y-0">
        {pageItems.map((stage, index) => {
          const state = getStageUiState(stage, progress)
          const isActive = activeStageId === stage.id
          const locked = state === 'locked'
          const completed = state === 'completed'
          const current = state === 'current'
          const score = progress?.stageScores?.[stage.id]
          const isLast = index === pageItems.length - 1

          return (
            <li key={stage.id} className="relative flex gap-4 pb-5 last:pb-0">
              {!isLast ? (
                <span
                  className="absolute left-[21px] top-12 h-[calc(100%-1.5rem)] w-px bg-border"
                  aria-hidden
                />
              ) : null}

              <button
                type="button"
                disabled={locked}
                onClick={() => {
                  if (!locked) onSelectStage(stage.id)
                }}
                className={[
                  'relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition',
                  completed
                    ? 'border-success/50 bg-success-muted text-success'
                    : current
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border bg-input/30 text-muted-foreground',
                  locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105',
                ].join(' ')}
                aria-current={isActive ? 'step' : undefined}
              >
                {completed ? (
                  <Check className="h-4 w-4" />
                ) : locked ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : typeof score === 'number' ? (
                  `${score}`
                ) : (
                  startOffset + index + 1
                )}
              </button>

              <button
                type="button"
                disabled={locked}
                onClick={() => {
                  if (!locked) onSelectStage(stage.id)
                }}
                className={[
                  'min-w-0 flex-1 rounded-2xl border px-4 py-3 text-left transition',
                  isActive
                    ? 'border-primary/50 bg-primary/10'
                    : completed
                      ? 'border-border bg-input/10'
                      : locked
                        ? 'border-border/60 bg-input/5 opacity-60'
                        : 'border-border bg-input/15 hover:bg-input/25',
                  locked ? 'cursor-not-allowed' : '',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {stage.title}
                    {typeof score === 'number' && !completed ? ` (${score}%)` : ''}
                    {typeof score === 'number' && completed && score < 70 ? ' ✖' : ''}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {(() => {
                      const TypeIcon = stageTypeIcon(stage.type)
                      return <TypeIcon className="h-3 w-3" />
                    })()}
                    {stage.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {stage.contentRef || 'Stage content'}
                </p>
              </button>
            </li>
          )
        })}
      </ol>
      <ListPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-3"
      />
    </div>
  )
}

export function PathRoadmap({
  stages,
  progress,
  activeStageId,
  onSelectStage,
}: PathRoadmapProps) {
  const ordered = [...stages].sort((a, b) => a.order - b.order)

  const groups = new Map<number | 'other', LearningStage[]>()
  for (const stage of ordered) {
    const lvl = levelFor(stage)
    const key = lvl ?? 'other'
    const list = groups.get(key) ?? []
    list.push(stage)
    groups.set(key, list)
  }

  const groupKeys = [...groups.keys()].sort((a, b) => {
    if (a === 'other') return 1
    if (b === 'other') return -1
    return a - b
  })

  return (
    <div className="space-y-5">
      {groupKeys.map((key) => {
        const list = groups.get(key) ?? []
        const label =
          key === 'other'
            ? 'Stages'
            : `Level ${key} · ${STAGE_LEVEL_LABELS[key as StageLevel]}`
        return (
          <StageGroup
            key={String(key)}
            label={label}
            stages={list}
            progress={progress}
            activeStageId={activeStageId}
            onSelectStage={onSelectStage}
          />
        )
      })}
    </div>
  )
}

