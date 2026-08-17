import type { ReactNode } from 'react'

export default function ResultsLayout({ children }: { children: ReactNode }) {
  return <div className="hq-interview-typography min-w-0">{children}</div>
}
