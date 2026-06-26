import type { ReactNode } from 'react'

type PageHeroProps = {
  eyebrow: string
  title: ReactNode
  description: string
  children?: ReactNode
}

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="pt-28 sm:pt-32 pb-14 sm:pb-18">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="reveal rounded-3xl glass-strong p-8 sm:p-12 md:p-14 text-center overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-90 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 50% 0%, color-mix(in oklab, var(--primary) 28%, transparent), transparent 72%)',
            }}
            aria-hidden
          />
          <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />

          <div className="relative">
            <span className="inline-flex items-center rounded-full glass px-4 py-1.5 text-sm uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
              {description}
            </p>
            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}