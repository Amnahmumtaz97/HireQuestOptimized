import type { ReactNode } from 'react'

type FeatureGridProps = {
  items: Array<{
    title: string
    description: string
    icon: ReactNode
  }>
}

export function FeatureGrid({ items }: FeatureGridProps) {
  return (
    <section className="pb-16 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="glass rounded-3xl p-6 sm:p-7 border border-white/10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary glow-ring text-primary-foreground">
                {item.icon}
              </div>
              <h2 className="mt-5 text-xl font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-6">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}