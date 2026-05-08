'use client'

import { useEffect, useMemo, useState, type FC } from 'react'
import {
  Bell,
  Brain,
  CreditCard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from '@/components/providers/ThemeProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export type DashboardNavbarProps = {
  sidebarCollapsed?: boolean
  onToggleSidebarCollapse?: () => void
  onMobileNavOpen?: () => void
  variant?: 'fixed' | 'in-shell'
}

export const DashboardNavbar: FC<DashboardNavbarProps> = ({
  sidebarCollapsed,
  onToggleSidebarCollapse,
  onMobileNavOpen,
  variant = 'fixed',
}) => {
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()

  const userName = session?.user?.name?.trim() || 'there'
  const isAdmin = session?.user?.role === 'admin'

  const initials = useMemo(() => {
    const safe = userName.trim()
    if (!safe) return 'HQ'
    const parts = safe.split(/\s+/).filter(Boolean)
    const letters = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : safe.slice(0, 2)
    return letters.toUpperCase()
  }, [userName])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isFixed = variant === 'fixed'

  return (
    <header className={isFixed ? ['fixed top-0 left-0 right-0 z-50 transition-all duration-300', scrolled ? 'py-2' : 'py-4'].join(' ') : undefined}>
      <div className={isFixed ? 'mx-auto max-w-[92rem] px-3 sm:px-6' : ''}>
        <nav
          className={[
            'flex items-center justify-between gap-3 rounded-2xl px-3 sm:px-5 py-2.5 transition-all duration-300',
            isFixed ? (scrolled ? 'glass-strong' : 'glass') : 'glass',
            'shadow-elegant',
          ].join(' ')}
        >
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onMobileNavOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-input/10 text-muted-foreground transition-colors hover:bg-input/30 hover:text-foreground md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary glow-ring">
                <Brain className="h-5 w-5 text-white" />
                <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
              </span>
              <span className="text-base font-semibold tracking-tight text-foreground">
                Hire<span className="text-gradient">Quest</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-glass bg-input/10 text-muted-foreground hover:text-foreground hover:bg-input/22 pressable ripple"
            >
              {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-glass bg-input/10 text-muted-foreground hover:bg-input/22 hover:text-foreground pressable ripple"
                  aria-label="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(92vw,320px)] p-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <div className="px-2 pb-1 text-xs text-muted-foreground">You’re all caught up.</div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-glass bg-input/12 pl-1 pr-3 h-10 text-sm font-semibold text-foreground hover:bg-input/18 pressable ripple"
                >
                  <span className="relative">
                    <span
                      className="pointer-events-none absolute -inset-1 rounded-full opacity-35 blur-md"
                      style={{ background: 'linear-gradient(90deg, rgba(79,110,247,0.9), rgba(124,58,237,0.9))' }}
                      aria-hidden
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </span>
                  <span className="hidden sm:block truncate max-w-[14rem]">
                    Hi {isAdmin ? 'Admin ' : ''}
                    {userName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/app/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/billing" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Account Settings
                  </Link>
                </DropdownMenuItem>
                {isAdmin ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/track-config" className="flex items-center gap-2">
                        <Brain className="h-4 w-4" /> Admin: Track Config
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut({ callbackUrl: '/' })} className="text-red-200 focus:text-red-100">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  )
}
