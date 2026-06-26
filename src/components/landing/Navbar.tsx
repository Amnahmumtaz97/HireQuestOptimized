'use client'

import { useEffect, useState } from 'react'
import { Brain, Moon, Sun, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/components/providers/ThemeProvider'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { data: session, status } = useSession()

  const role = session?.user?.role
  const isAdmin = role === 'admin'
  const isAuthenticated = status === 'authenticated'
  const destination = isAdmin ? '/dashboard' : '/app/new-interview'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'py-2' : 'py-4',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className={[
            'flex items-center justify-between gap-4 rounded-2xl px-4 sm:px-5 py-2.5 transition-all duration-300',
            scrolled
              ? 'glass-strong'
              : 'glass',
          ].join(' ')}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary glow-ring">
              <Brain className="h-5 w-5 text-foreground" />
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Hire<span className="text-gradient">Quest</span>
            </span>
          </Link>

          {/* Center links */}
          <ul className="hidden md:flex items-center gap-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="px-4 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-input/30 transition-all"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-input/30 transition-colors"
            >
              {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={destination}>
                  <span className="inline-flex items-center justify-center rounded-full bg-gradient-primary text-foreground border-0 px-5 h-9 text-sm font-semibold cursor-pointer shadow-[0_0_24px_-6px_var(--primary)] hover:shadow-[0_0_36px_-4px_var(--primary)] hover:scale-[1.03] transition-all">
                    {isAdmin ? 'View Dashboard' : 'Get Started'}
                  </span>
                </Link>
              </div>
            ) : (
              <Link href="/auth">
                <span className="inline-flex items-center justify-center rounded-full bg-gradient-primary text-foreground border-0 px-5 h-9 text-sm font-semibold cursor-pointer shadow-[0_0_24px_-6px_var(--primary)] hover:shadow-[0_0_36px_-4px_var(--primary)] hover:scale-[1.03] transition-all">
                  Login
                </span>
              </Link>
            )}

            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border text-foreground"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-3 animate-fade-up">
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-input/30"
                    >
                      {l.label}
                    </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
