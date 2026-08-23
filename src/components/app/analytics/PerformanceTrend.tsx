'use client'

import { useMemo } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, AlertCircle } from 'lucide-react'

type Props = {
  feedbackTrend: number[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl border border-border px-3 py-2 text-xs shadow-lg">
      <span className="font-semibold text-foreground">Score: </span>
      <span className="text-primary">{payload[0].value}%</span>
    </div>
  )
}

export function PerformanceTrend({ feedbackTrend }: Props) {
  const data = useMemo(() => {
    if (!feedbackTrend?.length) return []
    return feedbackTrend.map((score, i) => ({
      session: `#${i + 1}`,
      score: Math.round(score),
    }))
  }, [feedbackTrend])

  const avg = useMemo(() => {
    if (!data.length) return 0
    return Math.round(data.reduce((s, d) => s + d.score, 0) / data.length)
  }, [data])

  const trend = useMemo(() => {
    if (data.length < 2) return null
    const diff = data[data.length - 1].score - data[0].score
    return diff
  }, [data])

  if (data.length < 2) {
    return (
      <div className="card-enhanced flex min-h-[280px] flex-col rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Performance Trend</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Complete at least 2 interviews to see your performance trend.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-enhanced flex flex-col rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Performance Trend</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Feedback scores across your last {data.length} sessions</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{avg}%</div>
          <div className="text-[11px] text-muted-foreground">avg score</div>
          {trend !== null && (
            <div className={`mt-0.5 text-[11px] font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}pts overall
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="session"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeDasharray: '4 2' }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#trend-gradient)"
              dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--background)', r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
