'use client'

import { useEffect, useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/components/providers/ThemeProvider'

const links = [
  { label: 'Product', href: '/product' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { data: session, status } = useSession()

  const role = session?.user?.role
  const isAdmin = role === 'admin'
  const isAuthenticated = status === 'authenticated'
  const authedEntryHref = isAdmin ? '/dashboard' : '/app/new-interview'

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
            <span className="hq-marketing-logo-mark">HQ</span>
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

          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              suppressHydrationWarning
              className="hq-btn-icon hidden sm:inline-flex"
            >
              {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <Link href={authedEntryHref} className="hq-marketing-cta !rounded-[10px] !pr-4">
                <span>Get Started</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="hidden sm:inline-flex text-[15px] font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link href="/auth" className="hq-marketing-cta !rounded-[10px] !pr-4">
                  <span>Start Practicing Free</span>
                </Link>
              </>
            )}

            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((value) => !value)}
              className="hq-btn-icon inline-flex lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {open ? (
          <div className="mb-4 rounded-2xl border border-border bg-card p-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'text-primary'
                      : 'text-foreground hover:bg-[var(--secondary)]',
                  ].join(' ')}
                  style={
                    isActive(link.href)
                      ? { background: 'color-mix(in oklab, var(--primary) 12%, transparent)' }
                      : undefined
                  }
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Link
                  href={authedEntryHref}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-primary hover:bg-[var(--secondary)]"
                >
                  Get Started
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-[var(--secondary)]"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
