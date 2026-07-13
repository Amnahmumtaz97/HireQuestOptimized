'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Brain, Menu, Moon, Sun, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/components/providers/ThemeProvider'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
]

function NavCta({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link href={href} className="hq-marketing-cta">
      <span>{label}</span>
      <span className="hq-marketing-cta-icon" aria-hidden>
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
      </span>
    </Link>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { data: session, status } = useSession()

  const role = session?.user?.role
  const isAdmin = role === 'admin'
  const isAuthenticated = status === 'authenticated'
  const destination = isAdmin ? '/dashboard' : '/app/new-interview'

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="hq-marketing-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="hq-marketing-nav">
          <Link href="/" className="hq-marketing-logo group">
            <span className="hq-marketing-logo-mark">
              <Brain className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
            <span className="hq-marketing-logo-text">HireQuest</span>
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <div className="hq-marketing-nav-pill">
              {links.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'hq-marketing-nav-link',
                      active ? 'hq-marketing-nav-link--active' : '',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              suppressHydrationWarning
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-transparent text-muted-foreground transition-colors hover:text-foreground hover:bg-card/30"
            >
              {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <NavCta href={destination} label={isAdmin ? 'View Dashboard' : 'Get Started'} />
            ) : (
              <NavCta href="/auth" label="Get Started" />
            )}

            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-transparent text-foreground lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {open ? (
          <div className="mb-4 rounded-3xl border border-border bg-card p-3 shadow-elegant lg:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-input/40',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
