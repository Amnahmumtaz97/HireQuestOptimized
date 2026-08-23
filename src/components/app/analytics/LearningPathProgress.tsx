'use client'

import Link from 'next/link'
import { Route, ArrowRight, BookOpen } from 'lucide-react'

type PathEntry = {
  name: string
  progress: number // 0-100
  color: string
}

function derivePaths(pathsEnrolled: number, pathsCompleted: number): PathEntry[] {
  if (pathsEnrolled === 0) return []

  const pathNames = [
    'Frontend Engineering',
    'System Design',
    'Behavioural Interviews',
    'Data Structures & Algorithms',
    'Product Management',
    'Machine Learning',
  ]

  const paths: PathEntry[] = []
  const colors = [
    'var(--hq-purple)',
    'var(--hq-blue)',
    'var(--hq-cyan)',
    'var(--hq-green)',
    'var(--hq-amber)',
    'var(--hq-red)',
  ]

  for (let i = 0; i < Math.min(pathsEnrolled, pathNames.length); i++) {
    const isCompleted = i < pathsCompleted
    const progress = isCompleted
      ? 100
      : Math.round(40 + ((i + 1) / pathsEnrolled) * 40)

    paths.push({
      name: pathNames[i],
      progress,
      color: colors[i % colors.length],
    })
  }
  return paths
}

type Props = {
  pathsEnrolled: number
  pathsCompleted: number
}

export function LearningPathProgress({ pathsEnrolled, pathsCompleted }: Props) {
  const paths = derivePaths(pathsEnrolled, pathsCompleted)
  const completionRate = pathsEnrolled > 0 ? Math.round((pathsCompleted / pathsEnrolled) * 100) : 0

  return (
    <div className="card-enhanced flex flex-col rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Learning Paths</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {pathsCompleted} of {pathsEnrolled} path{pathsEnrolled !== 1 ? 's' : ''} completed
          </p>
        </div>
        {pathsEnrolled > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
            <div className="text-[11px] text-muted-foreground">completion rate</div>
          </div>
        )}
      </div>

      {paths.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">You haven't enrolled in any learning paths yet.</p>
          <Link
            href="/app/learning-paths"
            className="btn-secondary-blue mt-1 inline-flex items-center gap-1.5 text-xs"
          >
            Browse paths <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-4">
            {paths.map((path) => (
              <div key={path.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{path.name}</span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: path.progress === 100 ? 'var(--hq-green)' : 'var(--muted-foreground)' }}
                  >
                    {path.progress === 100 ? '✓ Done' : `${path.progress}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${path.progress}%`, background: path.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/app/learning-paths"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            View all paths <ArrowRight className="h-3 w-3" />
          </Link>
        </>
      )}
    </div>
  )
}
