import { Sparkles, Brain, Target } from 'lucide-react'

interface Props {
  mode: 'signin' | 'signup'
}

export function BrandingPanel({ mode }: Props) {
  const isSignIn = mode === 'signin'
  const round = (n: number) => Math.round(n * 1000) / 1000

  return (
    <div className="relative flex h-full w-full flex-col items-center px-6 py-6 lg:px-10 lg:py-8">
      {/* Logo — centered at top */}
      <div className="flex w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-xl font-semibold tracking-tight text-white"
            style={{ textShadow: '0 0 12px oklch(0.78 0.20 215 / 0.6)' }}
          >
            HireQuest
          </span>
        </div>
      </div>

      {/* AI Brain visual */}
      <div className="relative mt-1 mb-0 flex flex-1 items-center justify-center">
        <div className="absolute h-56 w-56 rounded-full bg-gradient-glow blur-2xl animate-pulse-glow" />
        <div className="relative">
          <svg
            viewBox="0 0 300 300"
            className="h-44 w-44 lg:h-52 lg:w-52"
            fill="none"
            stroke="oklch(0.62 0.21 262)"
            strokeWidth="0.6"
          >
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i / 40) * Math.PI * 2
              const r = 60 + (i % 4) * 25
              const x = round(150 + Math.cos(angle) * r)
              const y = round(150 + Math.sin(angle) * r)
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={1.5 + (i % 3) * 0.6}
                  fill="oklch(0.78 0.20 215)"
                  opacity={0.6 + (i % 4) * 0.1}
                />
              )
            })}
            {Array.from({ length: 60 }).map((_, i) => {
              const a1 = (i / 60) * Math.PI * 2
              const a2 = ((i + 7) / 60) * Math.PI * 2
              const x1 = round(150 + Math.cos(a1) * 80)
              const y1 = round(150 + Math.sin(a1) * 80)
              const x2 = round(150 + Math.cos(a2) * 110)
              const y2 = round(150 + Math.sin(a2) * 110)
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="oklch(0.72 0.18 230)"
                  strokeOpacity="0.3"
                />
              )
            })}
            <circle cx="150" cy="150" r="20" fill="oklch(0.78 0.20 215 / 0.3)" />
            <circle cx="150" cy="150" r="10" fill="oklch(0.85 0.20 215)" />
          </svg>
        </div>
      </div>

      {/* Headline + CTA */}
      <div className="-mt-3 w-full space-y-2.5 text-center">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-white lg:text-3xl">
          {isSignIn ? (
            <>
              Level Up with{' '}
              <span className="text-gradient-primary">AI Interviews</span>
            </>
          ) : (
            <>
              Join the Future of{' '}
              <span className="text-gradient-primary">Smart Hiring</span>
            </>
          )}
        </h1>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground lg:text-sm">
          {isSignIn
            ? 'Practice smarter, get instant feedback, land your dream role.'
            : 'Personalized interview prep, AI feedback, curated opportunities.'}
        </p>

        <div className="flex flex-wrap justify-center gap-2.5 pt-1">
          {[
            { icon: Brain, label: 'AI Coaching' },
            { icon: Target, label: 'Real Interviews' },
            { icon: Sparkles, label: 'Instant Feedback' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-sm text-white/90"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </div>
          ))}
        </div>

        <div className="pt-1">
          <button className="inline-flex items-center justify-center rounded-full h-9 px-5 text-sm font-semibold bg-gradient-primary text-white shadow-glow-sm transition-smooth hover:shadow-glow hover:scale-[1.02]">
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}
