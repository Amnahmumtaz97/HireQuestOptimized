import { Brain, Briefcase, GitFork, X } from 'lucide-react'
import Link from 'next/link'

const groups = [
  { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
  { title: 'Resources', links: ['Docs', 'Guides', 'Support', 'Community'] },
]

export function Footer() {
  return (
    <footer className="relative pt-16 pb-10">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 60%, transparent), transparent)',
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="glass rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary glow-ring">
                  <Brain className="h-5 w-5 text-foreground" />
                </span>
                <span className="text-base font-semibold tracking-tight text-foreground">
                  Hire<span className="text-gradient">Quest</span>
                </span>
              </Link>

              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                AI-powered interview preparation that helps you practice smarter, get sharper
                feedback, and land the role.
              </p>

              <div className="mt-5 flex items-center gap-2">
                {[X, GitFork, Briefcase].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="h-9 w-9 grid place-items-center rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-input/30 transition-colors"
                    aria-label="Social link"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link groups */}
            {groups.map((g) => (
              <div key={g.title}>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground">{g.title}</h4>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {g.links.map((l) => (
                    <li key={l}>
                      {l === 'Features' ? (
                        <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {l}
                        </Link>
                      ) : l === 'Pricing' ? (
                        <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {l}
                        </Link>
                      ) : l === 'Contact' ? (
                        <Link href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {l}
                        </Link>
                      ) : (
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {l}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} HireQuest. All rights reserved.</p>

            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
