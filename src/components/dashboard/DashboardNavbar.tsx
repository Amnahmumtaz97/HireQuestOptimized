'use client'

import { useEffect, useMemo, useState, type FC } from 'react'
import {
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
import { NotificationsMenu } from '@/components/dashboard/NotificationsMenu'

export type DashboardNavbarProps = {
  sidebarCollapsed?: boolean
  onToggleSidebarCollapse?: () => void
  onMobileNavOpen?: () => void
  variant?: 'fixed' | 'in-shell'
}

export const DashboardNavbar: FC<DashboardNavbarProps> = ({
  onMobileNavOpen,
  variant = 'fixed',
}) => {
  const [scrolled, setScrolled] = useState(false)
  const [themeReady, setThemeReady] = useState(false)
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

  useEffect(() => {
    setThemeReady(true)
  }, [])

  const isFixed = variant === 'fixed'

  return (
    <header
      className={
        isFixed
          ? [
              'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
              scrolled ? 'py-2' : 'py-4',
            ].join(' ')
          : undefined
      }
    >
      <div className={isFixed ? 'mx-auto max-w-[92rem] px-3 sm:px-6' : ''}>
        <nav
          className={
            isFixed
              ? 'hq-dashboard-nav'
              : 'flex items-center justify-between gap-3 py-1'
          }
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onMobileNavOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-input/30 hover:text-foreground md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <Link
              href="/"
              className={['hq-marketing-logo group min-w-0', isFixed ? '' : 'md:hidden'].join(' ')}
            >
              <span className="hq-marketing-logo-mark">HQ</span>
              <span className="hq-marketing-logo-text truncate">HireQuest</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              suppressHydrationWarning
              className="hq-btn-icon hidden sm:inline-flex rounded-full"
            >
              {!themeReady ? (
                <Moon className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <NotificationsMenu />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  suppressHydrationWarning
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 h-10 text-sm font-semibold text-foreground transition-colors hover:bg-input/30"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
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
                  <Link href="/app/settings?tab=account" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Settings
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
