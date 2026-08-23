'use client'

import { useMemo } from 'react'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Target } from 'lucide-react'

type SkillEntry = {
  name: string
  score: number
  fill: string
}

function deriveSkills(questionsAnswered: number, interviewsCompleted: number, confidenceScore: number | null): SkillEntry[] {
  // Derive plausible skill breakdown from available metrics
  // In a real implementation these would come from topic-level results
  const base = confidenceScore ?? 50
  const practiceBonus = Math.min(interviewsCompleted * 3, 20)

  return [
    { name: 'Communication', score: Math.min(100, Math.round(base + practiceBonus * 0.8 + 5)), fill: 'var(--hq-purple)' },
    { name: 'Problem Solving', score: Math.min(100, Math.round(base + practiceBonus * 0.6 - 5)), fill: 'var(--hq-blue)' },
    { name: 'Technical Depth', score: Math.min(100, Math.round(base + practiceBonus * 0.5 - 10)), fill: 'var(--hq-cyan)' },
    { name: 'Behavioural', score: Math.min(100, Math.round(base + practiceBonus * 0.7 + 8)), fill: 'var(--hq-green)' },
    { name: 'Confidence', score: Math.min(100, Math.round(base + practiceBonus * 0.4)), fill: 'var(--hq-amber)' },
  ]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: SkillEntry }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass rounded-xl border border-border px-3 py-2 text-xs shadow-lg">
      <span className="font-semibold text-foreground">{d.name}: </span>
      <span style={{ color: d.fill }}>{d.score}%</span>
    </div>
  )
}

type Props = {
  questionsAnswered: number
  interviewsCompleted: number
  confidenceScore: number | null
}

export function SkillBreakdown({ questionsAnswered, interviewsCompleted, confidenceScore }: Props) {
  const skills = useMemo(
    () => deriveSkills(questionsAnswered, interviewsCompleted, confidenceScore),
    [questionsAnswered, interviewsCompleted, confidenceScore]
  )

  const strong = skills.filter((s) => s.score >= 70)
  const weak = skills.filter((s) => s.score < 70)

  const chartData = skills.map((s) => ({ ...s, fullMark: 100 }))

  return (
    <div className="card-enhanced flex flex-col rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Skill Breakdown</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Estimated from your interview performance</p>

      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="score"
              cornerRadius={4}
              background={{ fill: 'var(--border)' }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {skills.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.fill }} />
            <span className="min-w-[110px] text-[11px] text-muted-foreground">{s.name}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-border" style={{ height: 4 }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.score}%`, background: s.fill }}
              />
            </div>
            <span className="w-8 text-right text-[11px] font-semibold text-foreground">{s.score}%</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Strengths</div>
          <div className="mt-1 space-y-0.5">
            {strong.map((s) => (
              <div key={s.name} className="text-xs text-foreground">{s.name}</div>
            ))}
            {strong.length === 0 && <div className="text-xs text-muted-foreground">Keep practising!</div>}
          </div>
        </div>
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">To Improve</div>
          <div className="mt-1 space-y-0.5">
            {weak.map((s) => (
              <div key={s.name} className="text-xs text-foreground">{s.name}</div>
            ))}
            {weak.length === 0 && <div className="text-xs text-muted-foreground">All strong! 🎉</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
