'use client'

import Link from 'next/link'
import { Clock, MoreHorizontal, Play, RotateCcw, Trash2, BarChart2 } from 'lucide-react'
import type { InterviewConfig, InterviewSession } from '@/components/app/dashboard/types'
import {
  formatDifficultyLabel,
  formatInterviewSessionTitle,
  formatInterviewTypeLabel,
  formatTopicsDisplay,
} from '@/utils/dashboard/interview-labels'
import { getRoleIcon, getIndustryIcon } from '@/lib/icon-mapping'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TYPE_TINT: Record<string, string> = {
  technical: 'hq-ilist-icon--blue',
  coding: 'hq-ilist-icon--orange',
  behavioral: 'hq-ilist-icon--violet',
  hr: 'hq-ilist-icon--teal',
  system_design: 'hq-ilist-icon--indigo',
  mixed: 'hq-ilist-icon--sky',
  both: 'hq-ilist-icon--sky',
}

function topicLine(session: InterviewSession): string {
  const pool = [
    ...(session.topics ?? []),
    ...(session.codingCategories ?? []),
    ...(session.behavioralCompetencies ?? []),
    ...(session.systemDesignTopics ?? []),
    ...(session.hrSections ?? []),
  ].filter(Boolean)
  return formatTopicsDisplay([...new Set(pool)])
}

function progressPercent(session: InterviewSession): number {
  const total = Math.max(session.totalQuestions || session.questions?.length || 0, 1)
  const answered = (session.answers ?? []).filter((a) => (a.answer ?? '').trim()).length
  if (session.status === 'completed' && answered === 0) return 100
  return Math.round(Math.min(100, (answered / total) * 100))
}

function sessionHref(session: InterviewSession): string {
  return session.status === 'completed'
    ? `/app/interviews/${session._id}/results`
    : `/app/interviews/${session._id}`
}

function actionLabel(status: InterviewSession['status']): string {
  if (status === 'completed') return 'View results'
  if (status === 'in_progress') return 'Resume'
  return 'Start interview'
}

function difficultyBadgeClass(difficulty: string): string {
  if (difficulty === 'Easy') return 'hq-ilist-badge hq-ilist-badge--easy'
  if (difficulty === 'Medium') return 'hq-ilist-badge hq-ilist-badge--medium'
  if (difficulty === 'Adaptive') return 'hq-ilist-badge hq-ilist-badge--adaptive'
  return 'hq-ilist-badge hq-ilist-badge--hard'
}

function ScoreRing({ percent, size = 44 }: { percent: number; size?: number }) {
  const stroke = 3.25
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.max(0, Math.min(100, percent)) / 100)
  const tone =
    percent >= 75 ? 'var(--hq-green)' : percent >= 40 ? 'var(--hq-amber)' : 'var(--hq-display-blue)'

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      aria-label={`${percent}% complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={tone}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-foreground"
        style={{ fontSize: 10, fontWeight: 700 }}
      >
        {percent}%
      </text>
    </svg>
  )
}

type InterviewListRowProps = {
  session: InterviewSession
  configs: InterviewConfig[]
  onDelete: () => void
}

export function InterviewListRow({ session, configs, onDelete }: InterviewListRowProps) {
  const title = formatInterviewSessionTitle(session, configs)
  const topics = topicLine(session)
  const href = sessionHref(session)
  const typeLabel = formatInterviewTypeLabel(session.interviewType)
  const percent = progressPercent(session)
  const roleIcon = getRoleIcon(session.roleCategoryKey || '')
  const industryIcon = getIndustryIcon(session.industryKey || '')
  const Icon = session.roleCategoryKey ? roleIcon.icon : industryIcon.icon
  const tint = TYPE_TINT[session.interviewType] ?? 'hq-ilist-icon--blue'
  const dateLabel = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null
  const ActionIcon =
    session.status === 'completed' ? BarChart2 : session.status === 'in_progress' ? RotateCcw : Play

  return (
    <div className="hq-ilist-row">
      <Link href={href} className="hq-ilist-main">
        <span className={['hq-ilist-icon', tint].join(' ')}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>

        <span className="min-w-0 flex-1">
          <span className="hq-ilist-title">{title}</span>
          <span className="hq-ilist-sub">{topics === '—' ? typeLabel : topics}</span>
        </span>

        <span className="hq-ilist-badges">
          <span className="hq-ilist-badge hq-ilist-badge--type">{typeLabel}</span>
          <span className={difficultyBadgeClass(session.difficulty)}>
            {formatDifficultyLabel(session.difficulty)}
          </span>
        </span>

        <span className="hq-ilist-meta">
          {typeof session.durationMinutes === 'number' ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {session.durationMinutes} min
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {session.totalQuestions} Qs
            </span>
          )}
          {dateLabel ? <span>{dateLabel}</span> : null}
        </span>

        <ScoreRing percent={percent} />
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hq-ilist-more"
            aria-label="Interview actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[11.5rem]">
          <DropdownMenuItem asChild>
            <Link href={href} className="flex items-center gap-2">
              <ActionIcon className="h-4 w-4" />
              {actionLabel(session.status)}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
