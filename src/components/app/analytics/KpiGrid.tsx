'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  CheckCircle2,
  MessageSquareText,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'

type KpiCardProps = {
  icon: React.ReactNode
  iconWrap: string
  label: string
  value: number
  suffix?: string
  hint: string
  trend?: number | null
  delay?: number
  formatter?: (v: number) => string
}

function useCountUp(target: number, duration = 1200, started = false) {
  const [current, setCurrent] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setCurrent(Math.round(ease * target))
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration, started])

  return current
}

function KpiCard({ icon, iconWrap, label, value, suffix = '', hint, trend, delay = 0, formatter }: KpiCardProps) {
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const count = useCountUp(value, 1200, visible)
  const displayed = formatter ? formatter(count) : count.toString()

  const TrendIcon = trend == null ? Minus : trend > 0 ? TrendingUp : TrendingDown
  const trendColor = trend == null ? 'text-muted-foreground' : trend > 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="card-enhanced relative overflow-hidden rounded-2xl p-5"
    >
      {/* background glow blob */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 blur-2xl" style={{ background: 'var(--primary)' }} />

      <div className="flex items-start justify-between gap-3">
        <div className={`${iconWrap} h-10 w-10 shrink-0`}>{icon}</div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {trend != null ? `${Math.abs(trend)}%` : '—'}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {displayed}{suffix}
        </div>
        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </motion.div>
  )
}

type KpiGridProps = {
  interviewsCompleted: number
  questionsAnswered: number
  timeSpentMinutes: number
  currentStreak: number
  longestStreak: number
  xp: number
  confidenceScore: number | null
}

export function KpiGrid({
  interviewsCompleted,
  questionsAnswered,
  timeSpentMinutes,
  currentStreak,
  longestStreak,
  xp,
  confidenceScore,
}: KpiGridProps) {
  const hoursSpent = Math.round(timeSpentMinutes / 60)

  const cards: KpiCardProps[] = [
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      iconWrap: 'icon-wrap-blue',
      label: 'Interviews Completed',
      value: interviewsCompleted,
      hint: 'All time',
      trend: null,
      delay: 0,
    },
    {
      icon: <MessageSquareText className="h-5 w-5" />,
      iconWrap: 'icon-wrap-purple',
      label: 'Questions Answered',
      value: questionsAnswered,
      hint: `${xp.toLocaleString()} XP earned`,
      trend: null,
      delay: 0.07,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      iconWrap: 'icon-wrap-cyan',
      label: 'Hours Studied',
      value: hoursSpent,
      suffix: 'h',
      hint: `${timeSpentMinutes} minutes total`,
      trend: null,
      delay: 0.14,
    },
    {
      icon: <Flame className="h-5 w-5" />,
      iconWrap: 'icon-wrap-amber',
      label: 'Current Streak',
      value: currentStreak,
      suffix: 'd',
      hint: `Best: ${longestStreak}d`,
      trend: currentStreak >= longestStreak && longestStreak > 0 ? 0 : null,
      delay: 0.21,
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      iconWrap: 'icon-wrap-green',
      label: 'Confidence Score',
      value: confidenceScore ?? 0,
      suffix: '%',
      hint: confidenceScore === null ? 'Complete interviews to unlock' : confidenceScore >= 70 ? 'Strong performance' : 'Keep practising',
      trend: null,
      delay: 0.28,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  )
}
