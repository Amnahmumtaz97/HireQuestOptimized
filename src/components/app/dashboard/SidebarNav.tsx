'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  LineChart,
  User,
  CreditCard,
  Settings,
  Plus,
  ChevronsLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FC } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'

export type SidebarNavItem = {
  href: string
  label: string
  icon: LucideIcon
  primary?: boolean
}

export const sidebarNavItems: SidebarNavItem[] = [
  { href: '/app/new-interview', label: 'New Interview', icon: Plus, primary: true },
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/interviews', label: 'Interviews', icon: MessageSquare },
  { href: '/app/results', label: 'Results', icon: BarChart2 },
  { href: '/app/analytics', label: 'Analytics', icon: LineChart },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/billing', label: 'Billing', icon: CreditCard },
  { href: '/app/settings', label: 'Settings', icon: Settings },
]

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  if (href === '/app/interviews' && pathname.startsWith('/app/interviews')) return true
  if (href === '/app/results' && pathname.startsWith('/app/interviews/') && pathname.endsWith('/results')) return true
  if (href === '/app/billing' && (pathname.startsWith('/app/subscription') || pathname.startsWith('/app/invoices'))) return true
  return false
}

export type SidebarNavProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
  onNavigate?: () => void
  variant?: 'desktop' | 'mobile'
}

export const SidebarNav: FC<SidebarNavProps> = ({ collapsed, onToggleCollapsed, onNavigate, variant = 'desktop' }) => {
  const pathname = usePathname() ?? ''
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const linkActiveClass = isLight
    ? 'border-border/70 bg-[linear-gradient(135deg,rgba(79,110,247,0.12),rgba(37,99,235,0.08))] text-foreground shadow-[inset_0_0_0_1px_rgba(79,110,247,0.22),0_8px_22px_-14px_rgba(79,110,247,0.18)]'
    : 'border-white/15 bg-[linear-gradient(135deg,rgba(28,42,92,0.62),rgba(20,30,74,0.44))] text-foreground shadow-[inset_0_0_0_1px_rgba(79,110,247,0.35),0_8px_24px_-14px_rgba(79,110,247,0.5)]'

  const linkHoverClass = isLight
    ? 'hover:border-border/80 hover:bg-[linear-gradient(135deg,rgba(79,110,247,0.08),rgba(37,99,235,0.05))]'
    : 'hover:border-white/10 hover:bg-[linear-gradient(135deg,rgba(21,30,68,0.4),rgba(12,20,52,0.26))]'

  const iconFrameClass = isLight
    ? 'border-border/50 bg-input/50 group-hover:border-border group-hover:bg-input'
    : 'border-white/5 bg-white/3'

  const iconFrameActiveClass = isLight ? 'border-border/60 bg-input/60' : 'border-white/10 bg-white/5'

  return (
    <aside
      className={[
        'relative h-full overflow-hidden',
        variant === 'mobile'
          ? 'rounded-3xl glass border-glass-strong shadow-[0_24px_40px_-28px_rgba(45,76,220,0.75)]'
          : 'rounded-3xl glass border-glass-strong shadow-[0_26px_46px_-30px_rgba(45,76,220,0.82)]',
      ].join(' ')}
    >
      <TooltipProvider delayDuration={160}>
        <div className={['flex h-full flex-col p-3.5', collapsed ? 'items-center' : ''].join(' ')}>
          <div className={['flex w-full items-center justify-between gap-2 px-1.5 pb-2.5 pt-1', collapsed ? 'justify-center' : ''].join(' ')}>
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-sm">
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15" />
                  <span className="text-sm font-black tracking-tight text-white">HQ</span>
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-foreground">HireQuest</div>
                  <div className="text-[11px] text-muted-foreground">AI Interview Studio</div>
                </div>
              </div>
            ) : null}

            {variant === 'desktop' ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleCollapsed}
                    className={[
                      'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-glass bg-input/10 text-muted-foreground hover:bg-input/25 hover:text-foreground pressable ripple',
                      collapsed ? 'mt-1' : '',
                    ].join(' ')}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    <ChevronsLeft className={['h-4.5 w-4.5 transition-transform', collapsed ? 'rotate-180' : ''].join(' ')} aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{collapsed ? 'Expand' : 'Collapse'}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>

          <ScrollArea className={['w-full flex-1', collapsed ? 'pr-0' : 'pr-1'].join(' ')}>
            <div className="relative w-full space-y-1 pt-1">
              {sidebarNavItems.map((item) => {
                const isActive = isNavActive(pathname, item.href)
                const Icon = item.icon
                const baseClasses = [
                  'group relative flex w-full min-w-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold pressable ripple backdrop-blur-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  collapsed ? 'justify-center px-1.5' : '',
                ].join(' ')

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onNavigate?.()}
                    className={[
                      baseClasses,
                      item.primary
                        ? 'mb-2 border-transparent bg-gradient-primary text-white shadow-glow-sm hover:shadow-glow'
                        : isActive
                          ? linkActiveClass
                          : ['border-transparent text-muted-foreground hover:text-foreground', linkHoverClass].join(' '),
                    ].join(' ')}
                  >
                    {!item.primary && isActive ? (
                      <>
                        <motion.span
                          layoutId="hqSidebarActiveBg"
                          className="pointer-events-none absolute inset-0 rounded-2xl"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(79,110,247,0.14) 0%, rgba(37,99,235,0.1) 65%, rgba(34,211,238,0.06) 100%)',
                          }}
                          aria-hidden
                        />
                        <motion.span
                          layoutId="hqSidebarActiveIndicator"
                          className="pointer-events-none absolute inset-y-0 left-2 flex w-3 items-center justify-center"
                          aria-hidden
                        >
                          <span className="neon-indicator" />
                        </motion.span>
                      </>
                    ) : null}

                    <span
                      className={[
                        'relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors',
                        item.primary
                          ? 'border-white/10 bg-white/8'
                          : isActive
                            ? ['text-[var(--hq-display-blue)]', iconFrameActiveClass].join(' ')
                            : ['text-muted-foreground group-hover:text-foreground', iconFrameClass].join(' '),
                      ].join(' ')}
                      aria-hidden
                    >
                      <Icon className={['h-4.5 w-4.5 transition-transform', item.primary ? 'group-hover:rotate-[12deg]' : 'group-hover:scale-110'].join(' ')} />
                    </span>

                    {!collapsed ? <span className="relative min-w-0 truncate">{item.label}</span> : null}

                    {item.primary ? (
                      <span
                        className="pointer-events-none absolute -inset-1 rounded-[1.2rem] opacity-30 blur-lg transition-opacity group-hover:opacity-45"
                        style={{ background: 'linear-gradient(90deg, rgba(79,110,247,0.9), rgba(37,99,235,0.9))' }}
                        aria-hidden
                      />
                    ) : null}
                  </Link>
                )

                if (!collapsed) return link

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </ScrollArea>

          {variant === 'desktop' && !collapsed ? (
            <div className="mt-auto w-full pt-3">
              <div className="rounded-2xl border border-border bg-input/15 p-3">
                <div className="text-xs font-semibold text-foreground">Pro Tip</div>
                <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Be specific with your role and topics to get the most relevant questions.
                </div>
                <Link
                  href="/app/new-interview"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-border bg-input/20 px-3 py-2 text-xs font-semibold text-foreground hover:bg-input/35 btn-micro"
                >
                  View Best Practices
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </TooltipProvider>
    </aside>
  )
}
