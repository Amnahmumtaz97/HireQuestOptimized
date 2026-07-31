import { Sparkles, Brain, Target } from 'lucide-react'

interface Props {
  mode: 'signin' | 'signup'
}

export function BrandingPanel({ mode }: Props) {
  const isSignIn = mode === 'signin'
  const round = (n: number) => Math.round(n * 1000) / 1000

  return (
    <div className="relative flex h-full w-full flex-col items-center px-6 py-10 lg:px-10 lg:py-14 overflow-hidden">
      {/* Soft radial background — always dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 22%, rgba(79,110,247,0.22) 0%, transparent 70%), radial-gradient(60% 60% at 80% 100%, rgba(56,189,248,0.14) 0%, transparent 70%)',
        }}
      />

      {/* Doodles: diagonal wedges, arcs, hexagons */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -left-6 top-[12%] h-[200px] w-[70%] opacity-[0.14]"
          style={{
            background: 'linear-gradient(165deg, #1e40af 0%, #2563eb 50%, transparent 100%)',
            clipPath: 'polygon(0 24%, 100% 0, 100% 76%, 0 100%)',
          }}
        />
        <div className="absolute -right-14 top-[28%] h-52 w-52 rounded-full border border-white/15" />
        <div className="absolute -right-4 top-[34%] h-32 w-32 rounded-full border border-white/10" />
        <div className="absolute -left-10 bottom-[18%] h-44 w-44 rounded-full border border-white/10" />
        <svg
          className="absolute left-[10%] top-[20%] h-16 w-16 opacity-30"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M50 8 L86 29 V71 L50 92 L14 71 V29 Z"
            stroke="rgba(191,219,254,0.85)"
            strokeWidth="1.4"
          />
        </svg>
        <svg
          className="absolute right-[12%] bottom-[22%] h-20 w-20 opacity-25"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M50 6 L88 28 V72 L50 94 L12 72 V28 Z"
            stroke="rgba(147,197,253,0.9)"
            strokeWidth="1.3"
          />
          <path
            d="M50 24 L70 36 V60 L50 72 L30 60 V36 Z"
            stroke="rgba(147,197,253,0.6)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Logo */}
      <div className="relative flex w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="hq-marketing-logo-mark">
            HQ
          </div>
          <span className="text-xl font-extrabold tracking-[-0.02em] text-white">HireQuest</span>
        </div>
      </div>

      {/* AI Brain visual */}
      <div className="relative mt-6 mb-2 flex flex-1 items-center justify-center">
        <div className="absolute h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,110,247,0.35)_0%,transparent_70%)] blur-2xl" />
        <div className="relative">
          <svg
            viewBox="0 0 300 300"
            className="h-44 w-44 lg:h-52 lg:w-52"
            fill="none"
            stroke="rgba(148,180,255,0.8)"
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
                  fill="rgba(168,196,255,0.9)"
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
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(120,170,255,0.4)"
                />
              )
            })}
            <circle cx="150" cy="150" r="20" fill="rgba(96,140,255,0.32)" />
            <circle cx="150" cy="150" r="10" fill="rgba(150,190,255,0.95)" />
          </svg>
        </div>
      </div>

      {/* Headline + CTA */}
      <div className="relative w-full space-y-3 text-center">
        <h1
          className="text-2xl font-extrabold leading-tight tracking-[-0.02em] lg:text-3xl"
          style={{ color: '#ffffff' }}
        >
          {isSignIn ? (
            <>
              Level Up with <span className="text-[#8fb0ff]">AI Interviews</span>
            </>
          ) : (
            <>
              Join the Future of <span className="text-[#8fb0ff]">Smart Hiring</span>
            </>
          )}
        </h1>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-white/70 lg:text-sm">
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
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-sm text-white/90"
            >
              <Icon className="h-3.5 w-3.5 text-[#8fb0ff]" strokeWidth={1.8} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
