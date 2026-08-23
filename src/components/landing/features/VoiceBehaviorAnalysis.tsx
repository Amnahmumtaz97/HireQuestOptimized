'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  Award,
  Brain,
  CheckCircle2,
  Mic,
  Pause,
  Play,
  Radio,
  Sparkles,
  Target,
  Volume2,
} from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'

type StarStage = 'situation' | 'task' | 'action' | 'result'

type RolePreset = {
  id: string
  title: string
  tag: string
  question: string
  audioSample: {
    duration: string
    wpm: number
    fillers: number
    clarity: number
    pitchModulation: string
    feedback: string
    highlightTip: string
  }
  starData: Record<StarStage, { text: string; score: number; tip: string }> & {
    overallScore: number
  }
}

const ROLES: RolePreset[] = [
  {
    id: 'swe',
    title: 'Software Engineer',
    tag: 'Distributed Systems',
    question: 'Describe a situation where you diagnosed and resolved a high-severity production outage under pressure.',
    audioSample: {
      duration: '00:48 / 01:30',
      wpm: 144,
      fillers: 1,
      clarity: 98,
      pitchModulation: 'Optimal & Confident',
      feedback: 'Excellent cadence with clear stress on metrics and technical decisions.',
      highlightTip: 'Pacing stayed steady at 144 WPM with no rushed sections.',
    },
    starData: {
      overallScore: 96,
      situation: {
        text: 'A launch rush drove 450% checkout traffic and exhausted database thread pools.',
        score: 95,
        tip: 'Strong opening context with scale, urgency, and technical stakes.',
      },
      task: {
        text: 'I owned incident command and had 15 minutes to stabilize throughput.',
        score: 93,
        tip: 'Clear ownership and a measurable constraint.',
      },
      action: {
        text: 'I added Redis-backed rate limiting, shifted reads to replicas, and isolated write queues.',
        score: 98,
        tip: 'Specific action with confident technical sequencing.',
      },
      result: {
        text: 'P99 latency dropped from 4.2s to 180ms, with zero lost transactions.',
        score: 97,
        tip: 'Impact is quantified and easy to remember.',
      },
    },
  },
  {
    id: 'pm',
    title: 'Product Manager',
    tag: 'Product Strategy',
    question: 'How do you prioritize enterprise feature requests against long-term technical debt?',
    audioSample: {
      duration: '00:52 / 01:30',
      wpm: 138,
      fillers: 2,
      clarity: 97,
      pitchModulation: 'Persuasive & Empathic',
      feedback: 'Warm executive tone that balances customer urgency and roadmap discipline.',
      highlightTip: 'Intonation invites agreement without sounding rehearsed.',
    },
    starData: {
      overallScore: 94,
      situation: {
        text: 'Two enterprise accounts needed custom webhooks while API latency was rising.',
        score: 92,
        tip: 'Quickly frames the customer and platform tension.',
      },
      task: {
        text: 'I had to protect renewal risk without derailing infrastructure work.',
        score: 94,
        tip: 'Shows the trade-off behind the decision.',
      },
      action: {
        text: 'I scoped a shared async webhook architecture with engineering and client leads.',
        score: 96,
        tip: 'Good stakeholder alignment and product synthesis.',
      },
      result: {
        text: 'We retained the accounts, shipped early, and cut ingestion latency by 32%.',
        score: 95,
        tip: 'Connects execution to customer and platform outcomes.',
      },
    },
  },
  {
    id: 'arch',
    title: 'System Architect',
    tag: 'Cloud Scalability',
    question: 'How do you design for zero downtime during a multi-region data schema migration?',
    audioSample: {
      duration: '00:45 / 01:30',
      wpm: 140,
      fillers: 0,
      clarity: 99,
      pitchModulation: 'Analytical & Direct',
      feedback: 'Precise terminology and crisp delivery with no filler words.',
      highlightTip: 'Sequencing made the migration plan easy to follow.',
    },
    starData: {
      overallScore: 97,
      situation: {
        text: 'A 40M-row global user table needed normalization while preserving a 99.999% SLA.',
        score: 96,
        tip: 'Specific scale and reliability requirements.',
      },
      task: {
        text: 'I had to guarantee zero read/write disruption and instant rollback.',
        score: 95,
        tip: 'Defines the engineering bar cleanly.',
      },
      action: {
        text: 'I used expand-contract migration, CDC dual writes, checksums, and feature-flagged cutover.',
        score: 98,
        tip: 'Strong architecture pattern and risk control.',
      },
      result: {
        text: 'We migrated every record without downtime and reduced memory footprint by 28%.',
        score: 98,
        tip: 'Measurable outcome with reliability proof.',
      },
    },
  },
]

const waveformBars = [34, 62, 46, 78, 58, 86, 42, 70, 52, 92, 64, 76, 48, 68, 38, 60]
const starStages: StarStage[] = ['situation', 'task', 'action', 'result']

function VisualPanel({
  src,
  alt,
  accentClass,
  primaryBadge,
  secondaryBadge,
}: {
  src: string
  alt: string
  accentClass: string
  primaryBadge: { label: string; value: string; valueClass: string }
  secondaryBadge: { label: string; value: string; valueClass: string }
}) {
  return (
    <div className="group/visual relative overflow-hidden rounded-3xl border border-border/80 bg-card/85 p-3 shadow-2xl backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_42%)]" />
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-secondary/40 p-4 sm:p-6">
        <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-primary/25 opacity-70 group-hover/visual:animate-pulse" />
        <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-primary/20 opacity-60" />
        <Image
          src={src}
          alt={alt}
          width={560}
          height={420}
          priority
          className="relative z-10 h-auto w-full max-w-[440px] object-contain drop-shadow-2xl transition duration-500 group-hover/visual:scale-[1.035]"
        />

        <div
          className={[
            'absolute left-3 top-3 z-20 rounded-xl border border-border/80 border-l-4 bg-card/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md sm:left-4 sm:top-4',
            accentClass,
          ].join(' ')}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {primaryBadge.label}
          </div>
          <div className={['mt-0.5 text-xs font-extrabold sm:text-sm', primaryBadge.valueClass].join(' ')}>
            {primaryBadge.value}
          </div>
        </div>

        <div className="absolute bottom-3 right-3 z-20 rounded-xl border border-border/80 border-l-4 border-l-cyan-400 bg-card/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md sm:bottom-4 sm:right-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {secondaryBadge.label}
          </div>
          <div className={['mt-0.5 text-xs font-extrabold sm:text-sm', secondaryBadge.valueClass].join(' ')}>
            {secondaryBadge.value}
          </div>
        </div>
      </div>
    </div>
  )
}

export function VoiceBehaviorAnalysis() {
  const ref = useReveal<HTMLElement>()
  const [selectedRole, setSelectedRole] = useState<RolePreset>(ROLES[0])
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [voiceProgress, setVoiceProgress] = useState(38)
  const [starStage, setStarStage] = useState<StarStage>('action')
  const currentStarStageData = selectedRole.starData[starStage]

  useEffect(() => {
    if (!isPlayingVoice) return

    const interval = setInterval(() => {
      setVoiceProgress((prev) => {
        if (prev >= 98) {
          setIsPlayingVoice(false)
          return 0
        }
        return prev + 2
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isPlayingVoice])

  return (
    <section ref={ref} id="analysis" className="relative overflow-hidden py-20 sm:py-24 scroll-mt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-primary backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Multimodal Intelligence Core
          </div>
          <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            Two focused analysis engines, one clean feedback flow.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Voice analysis improves how you sound. Behavioral analysis improves how your story lands.
          </p>
        </div>

        <div className="reveal mt-8 grid gap-3 rounded-2xl border border-border/80 bg-card/70 p-3 backdrop-blur-xl lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Target track</div>
              <div className="text-sm font-semibold text-muted-foreground">Updates prompt, scoring, and coaching.</div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {ROLES.map((role) => {
              const isSelected = selectedRole.id === role.id
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role)
                    setVoiceProgress(30)
                  }}
                  className={[
                    'min-h-[3.25rem] rounded-xl px-3 py-2 text-left transition-all duration-300',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'border border-border/80 bg-secondary/35 text-foreground hover:bg-secondary',
                  ].join(' ')}
                >
                  <span className="block text-sm font-extrabold">{role.title}</span>
                  <span
                    className={[
                      'mt-0.5 block text-[11px] font-semibold',
                      isSelected ? 'text-primary-foreground/75' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    {role.tag}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="reveal mt-4 rounded-2xl border border-primary/25 bg-card/75 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Simulated prompt</span>
            <span className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              Senior interview loop
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground sm:text-base">
            {selectedRole.question}
          </p>
        </div>

        <section className="reveal mt-8 grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <VisualPanel
            src="/voice-analysis.png"
            alt="Voice analysis visualizer"
            accentClass="border-l-primary"
            primaryBadge={{
              label: 'Tone Modulation',
              value: selectedRole.audioSample.pitchModulation,
              valueClass: 'text-foreground',
            }}
            secondaryBadge={{
              label: 'Filler Rate',
              value: `${selectedRole.audioSample.fillers} detected`,
              valueClass: 'text-emerald-400',
            }}
          />

          <div className="rounded-3xl border border-primary/20 bg-card/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Mic className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                    Voice Analysis
                  </div>
                  <h3 className="mt-1 text-xl font-extrabold text-foreground">Delivery without guesswork.</h3>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: Activity, label: 'Pace', value: `${selectedRole.audioSample.wpm} WPM`, color: 'text-primary' },
                { icon: Radio, label: 'Clarity', value: `${selectedRole.audioSample.clarity}%`, color: 'text-cyan-400' },
                { icon: Award, label: 'Authority', value: '9.4/10', color: 'text-indigo-400' },
              ].map((metric) => {
                const Icon = metric.icon
                return (
                  <div key={metric.label} className="rounded-2xl border border-border/80 bg-secondary/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {metric.label}
                      </span>
                      <Icon className={['h-4 w-4 shrink-0', metric.color].join(' ')} />
                    </div>
                    <div className="mt-2 text-sm font-black text-foreground tabular-nums sm:text-base">
                      {metric.value}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-border/90 bg-secondary/40 p-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105"
                  aria-label={isPlayingVoice ? 'Pause voice simulation' : 'Play voice simulation'}
                >
                  {isPlayingVoice ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
                    <span>Sample playback</span>
                    <span className="font-mono">{selectedRole.audioSample.duration}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/80">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${voiceProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex h-14 items-end gap-1">
                {waveformBars.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="flex-1 rounded-full bg-primary/75 transition-all duration-200"
                    style={{ height: `${isPlayingVoice ? height : Math.max(18, height * 0.5)}%` }}
                  />
                ))}
              </div>
            </div>

            <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground">
              <strong className="text-primary">AI diagnosis:</strong> {selectedRole.audioSample.highlightTip}{' '}
              {selectedRole.audioSample.feedback}
            </p>
          </div>
        </section>

        <section className="reveal mt-6 grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="order-2 rounded-3xl border border-indigo-500/20 bg-card/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:order-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Brain className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Behavior Analysis
                  </div>
                  <h3 className="mt-1 text-xl font-extrabold text-foreground">Sharper STAR stories.</h3>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Award className="h-3.5 w-3.5" />
                {selectedRole.starData.overallScore}%
              </span>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
              {starStages.map((stage) => {
                const active = starStage === stage
                const stageScore = selectedRole.starData[stage].score
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setStarStage(stage)}
                    className={[
                      'min-h-[5rem] rounded-2xl border p-2 text-center transition-all duration-300',
                      active
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                        : 'border-border/80 bg-secondary/35 hover:bg-secondary',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black',
                        active ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground',
                      ].join(' ')}
                    >
                      {stage[0].toUpperCase()}
                    </span>
                    <span className="mt-2 block text-[11px] font-extrabold capitalize text-foreground sm:text-xs">
                      {stage}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] font-bold text-emerald-400">
                      {stageScore}%
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-primary/25 bg-card/80 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-base font-extrabold capitalize text-foreground">
                  {starStage} analysis
                </h4>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  {currentStarStageData.score}/100
                </span>
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">
                {currentStarStageData.text}
              </p>
              <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Coaching note
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {currentStarStageData.tip}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {starStages.map((stage) => (
                <div key={stage} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3">
                  <span className="text-xs font-semibold capitalize text-muted-foreground">{stage}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${selectedRole.starData[stage].score}%` }}
                    />
                  </div>
                  <span className="text-right font-mono text-xs font-bold text-foreground">
                    {selectedRole.starData[stage].score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <VisualPanel
              src="/behavior-analysis.png"
              alt="Behavioral analysis visualizer"
              accentClass="border-l-indigo-500"
              primaryBadge={{
                label: 'STAR Compliance',
                value: '96% High Structure',
                valueClass: 'text-indigo-400',
              }}
              secondaryBadge={{
                label: 'Metric Density',
                value: '2.4x Stronger',
                valueClass: 'text-cyan-400',
              }}
            />
          </div>
        </section>

        <div className="reveal mt-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span>Separate engines keep feedback focused while sharing the same interview context.</span>
          </div>
          <Link
            href="/app/new-interview"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-primary/80"
          >
            Start a practice session
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
