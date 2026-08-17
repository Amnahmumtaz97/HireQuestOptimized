type LegalSealProps = {
  variant: 'privacy' | 'terms' | 'security'
  className?: string
}

export function LegalSeal({ variant, className = '' }: LegalSealProps) {
  return (
    <div
      className={['hq-legal-seal pointer-events-none select-none', className].filter(Boolean).join(' ')}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" className="h-28 w-28 sm:h-32 sm:w-32" fill="none">
        <defs>
          <linearGradient id="hqLegalSealGrad" x1="20" y1="12" x2="100" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="color-mix(in oklab, var(--primary) 88%, white)" />
            <stop offset="1" stopColor="color-mix(in oklab, var(--primary) 42%, #0f172a)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="url(#hqLegalSealGrad)" opacity="0.18" />
        <circle
          cx="60"
          cy="60"
          r="44"
          stroke="color-mix(in oklab, var(--primary) 55%, var(--border))"
          strokeWidth="1.5"
        />
        {variant === 'privacy' ? (
          <>
            <path
              d="M60 28 L84 40 V58 C84 72 74 84 60 90 C46 84 36 72 36 58 V40 Z"
              fill="color-mix(in oklab, var(--primary) 22%, transparent)"
              stroke="color-mix(in oklab, var(--primary) 70%, white)"
              strokeWidth="2"
            />
            <path
              d="M52 58 L58 64 L70 50"
              stroke="var(--primary-foreground)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : variant === 'terms' ? (
          <>
            <path
              d="M38 78 H82"
              stroke="color-mix(in oklab, var(--primary) 70%, white)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M60 30 V78"
              stroke="color-mix(in oklab, var(--primary) 70%, white)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M44 42 H76"
              stroke="color-mix(in oklab, var(--primary) 55%, white)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="44"
              cy="42"
              r="10"
              fill="color-mix(in oklab, var(--primary) 18%, transparent)"
              stroke="color-mix(in oklab, var(--primary) 60%, white)"
              strokeWidth="1.5"
            />
            <circle
              cx="76"
              cy="42"
              r="10"
              fill="color-mix(in oklab, var(--primary) 18%, transparent)"
              stroke="color-mix(in oklab, var(--primary) 60%, white)"
              strokeWidth="1.5"
            />
          </>
        ) : (
          <>
            <rect
              x="36"
              y="48"
              width="48"
              height="36"
              rx="6"
              fill="color-mix(in oklab, var(--primary) 20%, transparent)"
              stroke="color-mix(in oklab, var(--primary) 70%, white)"
              strokeWidth="2"
            />
            <path
              d="M46 48 V40 C46 32 52 28 60 28 C68 28 74 32 74 40 V48"
              stroke="color-mix(in oklab, var(--primary) 70%, white)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="60" cy="64" r="4" fill="color-mix(in oklab, var(--primary) 75%, white)" />
            <path
              d="M60 68 V76"
              stroke="color-mix(in oklab, var(--primary) 75%, white)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  )
}
